/**
 * Backup / restore abstraction — REAL when BACKUP_WEBHOOK_URL or storage configured.
 * Never reports HEALTHY without evidence.
 */
import { ENV } from "./_core/env";
import { createHash } from "node:crypto";

export type BackupResult = {
  status: "CREATED" | "NOT_CONFIGURED" | "ERROR";
  backupId?: string;
  checksum?: string;
  createdAt?: string;
  error?: string;
};

export function getBackupStatus(): { configured: boolean; detail: string } {
  if (ENV.backupWebhookUrl) return { configured: true, detail: "BACKUP_WEBHOOK_URL set" };
  if (ENV.storageProvider === "s3" && ENV.s3Bucket && ENV.s3AccessKeyId) {
    return { configured: true, detail: "S3 storage configured for backups" };
  }
  return { configured: false, detail: "Set BACKUP_WEBHOOK_URL or S3 storage for backups" };
}

export async function createMetadataBackup(payload: Record<string, unknown>): Promise<BackupResult> {
  const st = getBackupStatus();
  if (!st.configured) {
    return { status: "NOT_CONFIGURED", error: st.detail };
  }
  const body = JSON.stringify({ type: "numi.metadata_backup", at: new Date().toISOString(), payload });
  const checksum = createHash("sha256").update(body).digest("hex");
  try {
    if (ENV.backupWebhookUrl) {
      const res = await fetch(ENV.backupWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) return { status: "ERROR", error: `Backup webhook HTTP ${res.status}` };
      return { status: "CREATED", backupId: checksum.slice(0, 16), checksum, createdAt: new Date().toISOString() };
    }
    return { status: "NOT_CONFIGURED", error: "No backup transport available" };
  } catch (e) {
    return { status: "ERROR", error: e instanceof Error ? e.message : "backup failed" };
  }
}
