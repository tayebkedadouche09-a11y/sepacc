CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(60) NOT NULL,
	`discountType` enum('percent','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customer_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`orderItemId` int NOT NULL,
	`licenseKey` varchar(120) NOT NULL,
	`accessGranted` boolean NOT NULL DEFAULT false,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_purchases_licenseKey_unique` UNIQUE(`licenseKey`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`status` enum('queued','provisioning','ready','blocked') NOT NULL DEFAULT 'queued',
	`instanceUrl` text,
	`adminUrl` text,
	`sourceReady` boolean NOT NULL DEFAULT false,
	`documentationReady` boolean NOT NULL DEFAULT false,
	`licenseReady` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_purchase_unique` UNIQUE(`purchaseId`)
);
--> statement-breakpoint
CREATE TABLE `download_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`kind` enum('source','documentation','license') NOT NULL,
	`fileKey` text NOT NULL,
	`checksum` varchar(128),
	`expiresAt` timestamp,
	CONSTRAINT `download_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`licenseKey` varchar(120) NOT NULL,
	`type` varchar(80) NOT NULL DEFAULT 'single-project',
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `licenses_licenseKey_unique` UNIQUE(`licenseKey`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(160) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`licenseType` varchar(80) NOT NULL DEFAULT 'single-project',
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','payment_verified','paid','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`provider` varchar(80),
	`providerReference` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` enum('pending','verified','failed','refunded') NOT NULL DEFAULT 'pending',
	`provider` varchar(80),
	`providerPaymentId` varchar(180),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_order_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `product_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`url` text NOT NULL,
	`alt` varchar(240) NOT NULL,
	`kind` enum('hero','screenshot','preview') NOT NULL DEFAULT 'screenshot',
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`kind` enum('video','motion','embed') NOT NULL,
	`url` text NOT NULL,
	`posterUrl` text,
	`metadata` text,
	CONSTRAINT `product_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_tech_stack` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`category` varchar(80),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_tech_stack_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`version` varchar(40) NOT NULL,
	`changelog` text,
	`releaseDate` timestamp NOT NULL DEFAULT (now()),
	`isCurrent` boolean NOT NULL DEFAULT false,
	CONSTRAINT `product_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(160) NOT NULL,
	`tagline` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`heroImage` text NOT NULL,
	`demoUrl` text,
	`requirements` text,
	`license` text,
	`included` text,
	`seoTitle` varchar(180),
	`seoDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avatarUrl` text,
	`company` varchar(180),
	`website` varchar(320),
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(180),
	`body` text,
	`status` enum('pending','published','hidden') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(180) NOT NULL,
	`status` enum('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('normal','high','urgent') NOT NULL DEFAULT 'normal',
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_purchases` ADD CONSTRAINT `customer_purchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_purchases` ADD CONSTRAINT `customer_purchases_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_purchases` ADD CONSTRAINT `customer_purchases_orderItemId_order_items_id_fk` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_purchaseId_customer_purchases_id_fk` FOREIGN KEY (`purchaseId`) REFERENCES `customer_purchases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `download_assets` ADD CONSTRAINT `download_assets_purchaseId_customer_purchases_id_fk` FOREIGN KEY (`purchaseId`) REFERENCES `customer_purchases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `licenses` ADD CONSTRAINT `licenses_purchaseId_customer_purchases_id_fk` FOREIGN KEY (`purchaseId`) REFERENCES `customer_purchases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_features` ADD CONSTRAINT `product_features_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tech_stack` ADD CONSTRAINT `product_tech_stack_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_versions` ADD CONSTRAINT `product_versions_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `purchases_user_idx` ON `customer_purchases` (`userId`);--> statement-breakpoint
CREATE INDEX `purchases_product_idx` ON `customer_purchases` (`productId`);--> statement-breakpoint
CREATE INDEX `download_assets_purchase_idx` ON `download_assets` (`purchaseId`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `product_features_product_idx` ON `product_features` (`productId`);--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`productId`);--> statement-breakpoint
CREATE INDEX `product_media_product_idx` ON `product_media` (`productId`);--> statement-breakpoint
CREATE INDEX `product_tech_product_idx` ON `product_tech_stack` (`productId`);--> statement-breakpoint
CREATE INDEX `product_versions_product_idx` ON `product_versions` (`productId`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `support_tickets_user_idx` ON `support_tickets` (`userId`);