CREATE TABLE IF NOT EXISTS customer_instances (
  id SERIAL PRIMARY KEY,
  "purchaseId" INTEGER NOT NULL REFERENCES customer_purchases(id) ON DELETE CASCADE,
  "productId" INTEGER NOT NULL REFERENCES products(id),
  "productVersionId" INTEGER REFERENCES product_versions(id),
  "customerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "githubRepository" VARCHAR(320),
  "githubCommit" VARCHAR(80),
  "sourceChecksum" VARCHAR(120),
  "vercelProjectId" VARCHAR(120),
  "vercelDeploymentId" VARCHAR(120),
  "databaseProvider" VARCHAR(40),
  "databaseId" VARCHAR(120),
  "domain" VARCHAR(320),
  "instanceUrl" TEXT,
  "adminUrl" TEXT,
  "environment" TEXT NOT NULL DEFAULT 'production',
  "status" TEXT NOT NULL DEFAULT 'creating',
  "healthStatus" TEXT NOT NULL DEFAULT 'unknown',
  "lastError" TEXT,
  "sagaStep" VARCHAR(80),
  "metadata" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT customer_instances_purchase_unique UNIQUE ("purchaseId")
);
CREATE INDEX IF NOT EXISTS customer_instances_customer_idx ON customer_instances ("customerId");
CREATE INDEX IF NOT EXISTS customer_instances_status_idx ON customer_instances ("status");
