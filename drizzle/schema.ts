import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  avatarUrl: text("avatarUrl"),
  company: varchar("company", { length: 180 }),
  website: varchar("website", { length: 320 }),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userIdx: uniqueIndex("profiles_user_unique").on(table.userId) }));

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ slugIdx: uniqueIndex("categories_slug_unique").on(table.slug), statusIdx: index("categories_status_idx").on(table.status), orderIdx: index("categories_order_idx").on(table.sortOrder) }));

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  tagline: varchar("tagline", { length: 240 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  categoryId: int("categoryId").references(() => categories.id, { onDelete: "set null" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  heroImage: text("heroImage").notNull(),
  demoUrl: text("demoUrl"),
  sourceRepoUrl: text("sourceRepoUrl"),
  sourceRepoBranch: varchar("sourceRepoBranch", { length: 120 }).default("main"),
  provisioningMode: mysqlEnum("provisioningMode", ["manual", "external", "native"]).default("manual").notNull(),
  demoStatus: mysqlEnum("demoStatus", ["unknown", "healthy", "degraded", "offline"]).default("unknown").notNull(),
  lastDemoCheckAt: timestamp("lastDemoCheckAt"),
  demoHttpStatus: int("demoHttpStatus"),
  demoLatencyMs: int("demoLatencyMs"),
  requirements: text("requirements"),
  license: text("license"),
  included: text("included"),
  faq: text("faq"),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: text("seoDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ slugIdx: uniqueIndex("products_slug_unique").on(table.slug), statusIdx: index("products_status_idx").on(table.status) }));

export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 240 }).notNull(),
  kind: mysqlEnum("kind", ["hero", "screenshot", "preview"]).default("screenshot").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
}, (table) => ({ productIdx: index("product_images_product_idx").on(table.productId) }));

export const productFeatures = mysqlTable("product_features", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 140 }).notNull(),
  description: text("description").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
}, (table) => ({ productIdx: index("product_features_product_idx").on(table.productId) }));

export const productTechStack = mysqlTable("product_tech_stack", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  category: varchar("category", { length: 80 }),
  sortOrder: int("sortOrder").default(0).notNull(),
}, (table) => ({ productIdx: index("product_tech_product_idx").on(table.productId) }));

export const productVersions = mysqlTable("product_versions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 40 }).notNull(),
  changelog: text("changelog"),
  releaseDate: timestamp("releaseDate").defaultNow().notNull(),
  isCurrent: boolean("isCurrent").default(false).notNull(),
}, (table) => ({ productIdx: index("product_versions_product_idx").on(table.productId) }));

export const productMedia = mysqlTable("product_media", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  kind: mysqlEnum("kind", ["video", "motion", "embed"]).notNull(),
  url: text("url").notNull(),
  posterUrl: text("posterUrl"),
  metadata: text("metadata"),
}, (table) => ({ productIdx: index("product_media_product_idx").on(table.productId) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "payment_verified", "paid", "fulfilled", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
  provider: varchar("provider", { length: 80 }),
  providerReference: varchar("providerReference", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userIdx: index("orders_user_idx").on(table.userId), statusIdx: index("orders_status_idx").on(table.status) }));

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id),
  productName: varchar("productName", { length: 160 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  licenseType: varchar("licenseType", { length: 80 }).default("single-project").notNull(),
}, (table) => ({ orderIdx: index("order_items_order_idx").on(table.orderId) }));

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["pending", "verified", "failed", "refunded"]).default("pending").notNull(),
  provider: varchar("provider", { length: 80 }),
  providerPaymentId: varchar("providerPaymentId", { length: 180 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ orderIdx: uniqueIndex("payments_order_unique").on(table.orderId) }));

export const customerPurchases = mysqlTable("customer_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id),
  orderItemId: int("orderItemId").notNull().references(() => orderItems.id),
  licenseKey: varchar("licenseKey", { length: 120 }).notNull().unique(),
  accessGranted: boolean("accessGranted").default(false).notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
}, (table) => ({ userIdx: index("purchases_user_idx").on(table.userId), productIdx: index("purchases_product_idx").on(table.productId) }));

export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").notNull().references(() => customerPurchases.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["queued", "provisioning", "ready", "blocked"]).default("queued").notNull(),
  instanceUrl: text("instanceUrl"),
  adminUrl: text("adminUrl"),
  sourceReady: boolean("sourceReady").default(false).notNull(),
  documentationReady: boolean("documentationReady").default(false).notNull(),
  licenseReady: boolean("licenseReady").default(false).notNull(),
  sourceRepoUrl: text("sourceRepoUrl"),
  deploymentId: varchar("deploymentId", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ purchaseIdx: uniqueIndex("deliveries_purchase_unique").on(table.purchaseId) }));

export const downloadAssets = mysqlTable("download_assets", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").notNull().references(() => customerPurchases.id, { onDelete: "cascade" }),
  kind: mysqlEnum("kind", ["source", "documentation", "license"]).notNull(),
  fileKey: text("fileKey").notNull(),
  checksum: varchar("checksum", { length: 128 }),
  expiresAt: timestamp("expiresAt"),
}, (table) => ({ purchaseIdx: index("download_assets_purchase_idx").on(table.purchaseId) }));

export const licenses = mysqlTable("licenses", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").notNull().references(() => customerPurchases.id, { onDelete: "cascade" }),
  licenseKey: varchar("licenseKey", { length: 120 }).notNull().unique(),
  type: varchar("type", { length: 80 }).default("single-project").notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 180 }),
  body: text("body"),
  status: mysqlEnum("status", ["pending", "published", "hidden"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ productIdx: index("reviews_product_idx").on(table.productId) }));

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percent", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0).notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ userIdx: index("notifications_user_idx").on(table.userId) }));

export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["open", "pending", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["normal", "high", "urgent"]).default("normal").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userIdx: index("support_tickets_user_idx").on(table.userId) }));

export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").references(() => customerPurchases.id, { onDelete: "set null" }),
  productId: int("productId").references(() => products.id, { onDelete: "set null" }),
  provider: varchar("provider", { length: 80 }).notNull(),
  externalId: varchar("externalId", { length: 180 }),
  repositoryUrl: text("repositoryUrl"),
  environment: mysqlEnum("environment", ["staging", "production"]).default("production").notNull(),
  status: mysqlEnum("status", ["queued", "running", "succeeded", "failed", "rolled_back"]).default("queued").notNull(),
  commitSha: varchar("commitSha", { length: 80 }),
  url: text("url"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ purchaseIdx: index("deployments_purchase_idx").on(table.purchaseId), statusIdx: index("deployments_status_idx").on(table.status) }));

export const automationJobs = mysqlTable("automation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["queued", "running", "succeeded", "failed", "dead_letter"]).default("queued").notNull(),
  correlationId: varchar("correlationId", { length: 100 }).notNull(),
  payload: text("payload").notNull(),
  attempts: int("attempts").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(5).notNull(),
  lastError: text("lastError"),
  runAfter: timestamp("runAfter").defaultNow().notNull(),
  lockedAt: timestamp("lockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ statusIdx: index("automation_jobs_status_idx").on(table.status), correlationIdx: index("automation_jobs_correlation_idx").on(table.correlationId) }));


export const customerInstances = mysqlTable("customer_instances", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").notNull().references(() => customerPurchases.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id),
  productVersionId: int("productVersionId").references(() => productVersions.id),
  customerId: int("customerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  githubRepository: varchar("githubRepository", { length: 320 }),
  githubCommit: varchar("githubCommit", { length: 80 }),
  sourceChecksum: varchar("sourceChecksum", { length: 120 }),
  vercelProjectId: varchar("vercelProjectId", { length: 120 }),
  vercelDeploymentId: varchar("vercelDeploymentId", { length: 120 }),
  databaseProvider: varchar("databaseProvider", { length: 40 }),
  databaseId: varchar("databaseId", { length: 120 }),
  domain: varchar("domain", { length: 320 }),
  instanceUrl: text("instanceUrl"),
  adminUrl: text("adminUrl"),
  environment: mysqlEnum("environment", ["development", "staging", "production"]).default("production").notNull(),
  status: mysqlEnum("status", [
    "creating", "provisioning", "deploying", "health_checking",
    "ready", "degraded", "failed", "rolling_back", "suspended", "archived"
  ]).default("creating").notNull(),
  healthStatus: mysqlEnum("healthStatus", ["unknown", "healthy", "unhealthy"]).default("unknown").notNull(),
  lastError: text("lastError"),
  sagaStep: varchar("sagaStep", { length: 80 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  purchaseIdx: uniqueIndex("customer_instances_purchase_unique").on(table.purchaseId),
  customerIdx: index("customer_instances_customer_idx").on(table.customerId),
  statusIdx: index("customer_instances_status_idx").on(table.status),
}));

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId").references(() => users.id),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ actorIdx: index("audit_actor_idx").on(table.actorUserId), actionIdx: index("audit_action_idx").on(table.action) }));

export const adminSettings = mysqlTable("admin_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type CustomerPurchase = typeof customerPurchases.$inferSelect;
