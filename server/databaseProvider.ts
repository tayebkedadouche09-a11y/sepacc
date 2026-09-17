/** Customer database provider abstraction. No fake success. */
import { ENV } from "./_core/env";

export type CustomerDbResult = { status: "CREATED" | "NOT_CONFIGURED" | "ERROR"; provider: string; databaseId?: string; connectionUrl?: string; error?: string };

export function getCustomerDbProviderStatus() {
  const p = ENV.customerDbProvider || "none";
  if (p === "none") return { provider: "none", configured: false, detail: "CUSTOMER_DB_PROVIDER=none" };
  if (p === "neon") return { provider: "neon", configured: Boolean(ENV.neonApiKey && ENV.neonProjectId), detail: ENV.neonApiKey && ENV.neonProjectId ? "Neon configured" : "Set NEON_API_KEY + NEON_PROJECT_ID" };
  if (p === "supabase") {
    const ok = Boolean(ENV.supabaseAccessToken && ENV.supabaseProjectRef);
    return { provider: "supabase", configured: ok, detail: ok ? "Supabase Management API configured" : "Set SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF" };
  }
  if (p === "planetscale") return { provider: "planetscale", configured: Boolean(ENV.planetscaleServiceToken && ENV.planetscaleOrg), detail: "Set PlanetScale credentials" };
  return { provider: p, configured: false, detail: `Unknown provider: ${p}` };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  if (!ENV.supabaseAccessToken) throw new Error("SUPABASE_ACCESS_TOKEN is required");
  const response = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${ENV.supabaseAccessToken}`, "Content-Type": "application/json", Accept: "application/json", ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((body as any)?.message || (body as any)?.error || `Supabase Management API ${response.status}`);
  return body as any;
}

function encodeDbUrl(host: string, port: number, user: string, password: string) {
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres?sslmode=require`;
}

export async function createCustomerDatabase(opts: { instanceKey: string; productSlug: string }): Promise<CustomerDbResult> {
  const status = getCustomerDbProviderStatus();
  if (!status.configured) return { status: "NOT_CONFIGURED", provider: status.provider, error: status.detail };
  const safe = `${opts.productSlug}_${opts.instanceKey}`.replace(/[^a-z0-9_]/gi, "_").toLowerCase().slice(0, 45);

  try {
    if (status.provider === "supabase" && ENV.supabaseProjectRef) {
      const branchName = `customer_${safe}_${Date.now().toString(36)}`.slice(0, 63);
      const created = await supabaseRequest(`/v1/projects/${encodeURIComponent(ENV.supabaseProjectRef)}/branches`, {
        method: "POST",
        body: JSON.stringify({ branch_name: branchName, persistent: true, with_data: false, ...(ENV.supabaseRegion ? { region: ENV.supabaseRegion } : {}) }),
      });
      const branchId = String(created.id || "");
      if (!branchId) return { status: "ERROR", provider: "supabase", error: "Supabase created the branch without returning an id" };

      for (let attempt = 0; attempt < 12; attempt++) {
        const cfg = await supabaseRequest(`/v1/branches/${encodeURIComponent(branchId)}`);
        if (cfg.status === "ACTIVE" && cfg.db_host && cfg.db_port && cfg.db_user && cfg.db_pass) {
          return { status: "CREATED", provider: "supabase", databaseId: branchId, connectionUrl: encodeDbUrl(cfg.db_host, Number(cfg.db_port), cfg.db_user, cfg.db_pass) };
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(5000, 1000 + attempt * 400)));
      }
      return { status: "ERROR", provider: "supabase", databaseId: branchId, error: "Supabase branch was created but did not become ACTIVE within the provisioning window" };
    }

    if (status.provider === "neon" && ENV.neonApiKey && ENV.neonProjectId) {
      const res = await fetch(`https://console.neon.tech/api/v2/projects/${ENV.neonProjectId}/branches`, { method: "POST", headers: { Authorization: `Bearer ${ENV.neonApiKey}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ branch: { name: safe }, endpoints: [{ type: "read_write" }] }) });
      const body = await res.json().catch(() => ({})) as any;
      if (!res.ok) return { status: "ERROR", provider: "neon", error: body.message || `Neon API ${res.status}` };
      const connectionUrl = body.connection_uris?.[0]?.connection_uri;
      return { status: connectionUrl ? "CREATED" : "ERROR", provider: "neon", databaseId: body.branch?.id, connectionUrl, error: connectionUrl ? undefined : "Neon returned no connection URI" };
    }

    return { status: "NOT_CONFIGURED", provider: status.provider, error: `Provider ${status.provider} is recognized but not wired for live provisioning.` };
  } catch (e) {
    return { status: "ERROR", provider: status.provider, error: e instanceof Error ? e.message : "Customer DB create failed" };
  }
}
