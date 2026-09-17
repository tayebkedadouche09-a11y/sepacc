/**
 * Refund lifecycle — server-side only. Idempotent by providerPaymentId + event.
 */
import { ENV } from "./_core/env";

export type RefundResult = {
  status: "REFUNDED" | "NOT_CONFIGURED" | "ERROR" | "IDEMPOTENT";
  provider?: string;
  providerRefundId?: string;
  error?: string;
};

export async function refundStripePayment(paymentIntentId: string): Promise<RefundResult> {
  if (!ENV.stripeSecretKey) return { status: "NOT_CONFIGURED", error: "STRIPE_SECRET_KEY missing", provider: "stripe" };
  try {
    const res = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ payment_intent: paymentIntentId }),
    });
    const data = (await res.json()) as { id?: string; error?: { message?: string }; status?: string };
    if (!res.ok) return { status: "ERROR", provider: "stripe", error: data.error?.message || `HTTP ${res.status}` };
    return { status: "REFUNDED", provider: "stripe", providerRefundId: data.id };
  } catch (e) {
    return { status: "ERROR", provider: "stripe", error: e instanceof Error ? e.message : "refund failed" };
  }
}

export async function refundPayPalCapture(captureId: string): Promise<RefundResult> {
  if (!ENV.paypalClientId || !ENV.paypalClientSecret) {
    return { status: "NOT_CONFIGURED", error: "PayPal credentials missing", provider: "paypal" };
  }
  try {
    const basic = Buffer.from(`${ENV.paypalClientId}:${ENV.paypalClientSecret}`).toString("base64");
    const tokenRes = await fetch(`${ENV.paypalApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return { status: "ERROR", provider: "paypal", error: "token failed" };
    const res = await fetch(`${ENV.paypalApiUrl}/v2/payments/captures/${captureId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { status: "ERROR", provider: "paypal", error: data.message || `HTTP ${res.status}` };
    return { status: "REFUNDED", provider: "paypal", providerRefundId: data.id };
  } catch (e) {
    return { status: "ERROR", provider: "paypal", error: e instanceof Error ? e.message : "refund failed" };
  }
}
