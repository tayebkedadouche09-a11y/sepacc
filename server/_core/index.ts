import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe";
import { verifyChargilyCheckout } from "../chargily";
import { markOrderPaid, markOrderPaymentFailed, processAutomationJobs, checkPublishedDemos } from "../db";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export async function createApp(options: { development?: boolean } = {}) {
  const development = options.development ?? process.env.NODE_ENV === "development";
  const app = express();
  const server = createServer(app);

  app.get("/api/health", async (_req, res) => {
    res.json({
      ok: true,
      service: "numi",
      version: "4.1.0",
      integrations: {
        database: Boolean(ENV.databaseUrl),
        stripe: Boolean(ENV.stripeSecretKey && ENV.stripeWebhookSecret && ENV.appOrigin),
        chargily: Boolean(ENV.chargilySecretKey && ENV.appOrigin),
        paypal: Boolean(ENV.paypalClientId && ENV.paypalClientSecret && ENV.appOrigin),
        github: Boolean(ENV.githubToken && ENV.githubOwner),
        vercel: Boolean(ENV.vercelToken),
        externalProvisioning: Boolean(ENV.provisioningApiUrl && ENV.provisioningApiKey),
        automationWorker: Boolean(ENV.automationWorkerSecret),
      },
    });
  });

  app.post("/api/monitor/demos", async (req, res) => {
    try {
      if (!ENV.automationWorkerSecret || req.header("x-numi-worker-secret") !== ENV.automationWorkerSecret) return res.status(401).json({ error: "Unauthorized" });
      const result = await checkPublishedDemos();
      res.json({ checked: result.length, results: result });
    } catch (error) {
      console.error("[Monitoring] Demo monitor failed:", error);
      res.status(500).json({ error: "Demo monitor failed" });
    }
  });

  app.post("/api/automation/worker", async (req, res) => {
    try {
      if (!ENV.automationWorkerSecret || req.header("x-numi-worker-secret") !== ENV.automationWorkerSecret) return res.status(401).json({ error: "Unauthorized" });
      const result = await processAutomationJobs(5);
      res.json({ processed: result.length, jobs: result });
    } catch (error) {
      console.error("[Automation] Worker failed:", error);
      res.status(500).json({ error: "Worker failed" });
    }
  });

  app.post("/api/chargily/webhook", express.json(), async (req, res) => {
    try {
      const body = req.body as Record<string, any>;
      const checkoutId = String(body.id ?? body.data?.id ?? body.checkout_id ?? "");
      if (!checkoutId) return res.status(400).json({ error: "Missing checkout id" });
      const checkout = await verifyChargilyCheckout(checkoutId);
      const orderId = Number(checkout.metadata?.order_id);
      if (!Number.isInteger(orderId) || orderId <= 0) return res.status(400).json({ error: "Missing order metadata" });
      if (checkout.status === "paid") await markOrderPaid(orderId, checkout.id, `chargily:${checkout.id}`, "chargily", checkout.amount, checkout.currency);
      if (["failed", "canceled"].includes(checkout.status)) await markOrderPaymentFailed(orderId, checkout.id, `chargily:${checkout.id}`, "chargily");
      res.json({ received: true, checkoutId: checkout.id, status: checkout.status });
    } catch (error) {
      console.error("[Chargily] Webhook rejected:", error);
      res.status(400).json({ error: "Webhook rejected" });
    }
  });

  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const result = await handleStripeWebhook(req.body as Buffer, req.header("stripe-signature"));
      res.json(result);
    } catch (error) {
      console.error("[Stripe] Webhook rejected:", error);
      res.status(400).json({ error: "Webhook rejected" });
    }
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (development) await setupVite(app, server);
  else serveStatic(app);

  return { app, server };
}

async function startServer() {
  const { server } = await createApp({ development: true });
  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

if (!process.env.VERCEL) startServer().catch(console.error);
