ALTER TABLE `products` ADD `sourceRepoUrl` text;
ALTER TABLE `products` ADD `sourceRepoBranch` varchar(120) DEFAULT 'main';
ALTER TABLE `products` ADD `provisioningMode` enum('manual','external','native') NOT NULL DEFAULT 'manual';
ALTER TABLE `products` ADD `demoStatus` enum('unknown','healthy','degraded','offline') NOT NULL DEFAULT 'unknown';
ALTER TABLE `products` ADD `lastDemoCheckAt` timestamp NULL;
ALTER TABLE `products` ADD `demoHttpStatus` int NULL;
ALTER TABLE `products` ADD `demoLatencyMs` int NULL;
ALTER TABLE `deliveries` ADD `sourceRepoUrl` text;
ALTER TABLE `deliveries` ADD `deploymentId` varchar(180);
CREATE TABLE `deployments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `purchaseId` int,
  `productId` int,
  `provider` varchar(80) NOT NULL,
  `externalId` varchar(180),
  `repositoryUrl` text,
  `environment` enum('staging','production') NOT NULL DEFAULT 'production',
  `status` enum('queued','running','succeeded','failed','rolled_back') NOT NULL DEFAULT 'queued',
  `commitSha` varchar(80),
  `url` text,
  `errorMessage` text,
  `startedAt` timestamp NULL,
  `finishedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `deployments_id` PRIMARY KEY(`id`),
  CONSTRAINT `deployments_purchase_fk` FOREIGN KEY (`purchaseId`) REFERENCES `customer_purchases`(`id`) ON DELETE set null,
  CONSTRAINT `deployments_product_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null
);
CREATE INDEX `deployments_purchase_idx` ON `deployments` (`purchaseId`);
CREATE INDEX `deployments_status_idx` ON `deployments` (`status`);
CREATE TABLE `automation_jobs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `type` varchar(100) NOT NULL,
  `status` enum('queued','running','succeeded','failed','dead_letter') NOT NULL DEFAULT 'queued',
  `correlationId` varchar(100) NOT NULL,
  `payload` text NOT NULL,
  `attempts` int NOT NULL DEFAULT 0,
  `maxAttempts` int NOT NULL DEFAULT 5,
  `lastError` text,
  `runAfter` timestamp NOT NULL DEFAULT (now()),
  `lockedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `automation_jobs_id` PRIMARY KEY(`id`)
);
CREATE INDEX `automation_jobs_status_idx` ON `automation_jobs` (`status`);
CREATE INDEX `automation_jobs_correlation_idx` ON `automation_jobs` (`correlationId`);

UPDATE `products` SET `status` = 'draft' WHERE `demoUrl` IS NULL OR `sourceRepoUrl` IS NULL;
