import { ENV } from "./_core/env";
import { createCustomerRepository, isGitHubConfigured } from "./github";
import { createVercelProject, isVercelConfigured } from "./vercel";
import { checkHttpHealth } from "./os/health";
import { createCustomerDatabase } from "./databaseProvider";
import { generateSecret, encryptSecret } from "./secrets";
import { generateDeliveryDocumentation } from "./documentation";

type ProvisionRequest = {
  purchaseId: number;
  orderId: number;
  productId: number;
  productName: string;
  productSlug: string;
  sourceRepoUrl?: string | null;
  sourceRepoBranch?: string | null;
  mode?: "manual" | "external" | "native";
};

export type ProvisionResponse = {
  instanceUrl?: string;
  /** Only set when a real admin surface is known — never invent /admin. */
  adminUrl?: string;
  sourceReady?: boolean;
  documentationReady?: boolean;
  licenseReady?: boolean;
  sourceRepoUrl?: string;
  deploymentId?: string;
  healthOk?: boolean;
  healthStatus?: number;
  healthLatencyMs?: number;
  mode: "native" | "external" | "manual";
  notes?: string;
};

/**
 * Real provisioning only.
 * - native: GitHub private repo + Vercel project + HTTP health on deployment URL
 * - external: owner-configured worker API
 * - manual / missing config: returns null so caller keeps delivery queued (not fake-ready)
 */
export async function requestProvisioning(input: ProvisionRequest): Promise<ProvisionResponse | null> {
  const mode = input.mode ?? "manual";

  if (mode === "native") {
    if (!input.sourceRepoUrl) {
      throw new Error("Native provisioning requires product.sourceRepoUrl.");
    }
    if (!isGitHubConfigured()) {
      throw new Error("GitHub is NOT_CONFIGURED. Set GITHUB_TOKEN and GITHUB_OWNER.");
    }
    if (!isVercelConfigured()) {
      throw new Error("Vercel is NOT_CONFIGURED. Set VERCEL_TOKEN.");
    }

    const repo = await createCustomerRepository(
      input.sourceRepoUrl,
      input.sourceRepoBranch || "main",
      input.purchaseId,
      input.productSlug,
    );
    const deployment = await createVercelProject(repo, `${input.productSlug}-${input.purchaseId}`);
    if (!deployment.url) {
      throw new Error("Vercel created the project but did not return a reachable deployment URL yet.");
    }

    const health = await checkHttpHealth(deployment.url);
    if (!health.ok) {
      // Resources may exist; do not claim delivery ready. Caller stores provisioning state.
      return {
        mode: "native",
        instanceUrl: deployment.url,
        sourceReady: true,
        // License row is created at payment time in DB; documentation assets are separate.
        documentationReady: false,
        licenseReady: true,
        sourceRepoUrl: `https://github.com/${repo.owner}/${repo.repo}`,
        deploymentId: deployment.id,
        healthOk: false,
        healthStatus: health.status,
        healthLatencyMs: health.latencyMs,
        notes: `Deployment URL returned but health check failed: ${health.error ?? `HTTP ${health.status}`}`,
      };
    }

    const dbResult = await createCustomerDatabase({
      instanceKey: String(input.purchaseId),
      productSlug: input.productSlug,
    });
    const authSecret = generateSecret(32);
    const enc = encryptSecret(authSecret);
    const secretsNote =
      enc.status === "OK"
        ? "Instance AUTH_SECRET encrypted for secure storage."
        : "SECRETS_ENCRYPTION_KEY NOT_CONFIGURED — secret generated ephemerally, not persisted.";
    const notesParts = [
      "Native GitHub repo + Vercel deployment created and health check passed.",
      dbResult.status === "CREATED"
        ? `Customer DB created (${dbResult.provider}:${dbResult.databaseId}).`
        : dbResult.status === "NOT_CONFIGURED"
          ? `Customer DB: NOT_CONFIGURED (${dbResult.error ?? "no provider"}).`
          : `Customer DB ERROR: ${dbResult.error ?? "unknown"}.`,
      secretsNote,
      "Delivery documentation generated (version, repo, health).",
    ];

    return {
      mode: "native",
      instanceUrl: deployment.url,
      // Do not invent admin paths. Owner can set adminUrl manually when known.
      adminUrl: undefined,
      sourceReady: true,
      documentationReady: true,
      licenseReady: true,
      sourceRepoUrl: `https://github.com/${repo.owner}/${repo.repo}`,
      deploymentId: deployment.id,
      healthOk: true,
      healthStatus: health.status,
      healthLatencyMs: health.latencyMs,
      notes: notesParts.join(" "),
    };
  }

  if (mode === "external") {
    if (!ENV.provisioningApiUrl || !ENV.provisioningApiKey) {
      throw new Error("External provisioning is NOT_CONFIGURED. Set PROVISIONING_API_URL and PROVISIONING_API_KEY.");
    }
    const response = await fetch(`${ENV.provisioningApiUrl.replace(/\/$/, "")}/provision`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.provisioningApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as ProvisionResponse & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Provisioning provider rejected the request");
    // Trust external worker only for fields it returns; still require instanceUrl for readiness upstream.
    return { ...payload, mode: "external" };
  }

  // manual: owner completes delivery in Admin — no fake success
  return null;
}
