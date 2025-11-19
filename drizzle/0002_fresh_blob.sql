CREATE TABLE `reward_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rewardId` int NOT NULL,
	`creditsCost` int NOT NULL,
	`status` enum('pending','approved','completed','cancelled') NOT NULL DEFAULT 'pending',
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	CONSTRAINT `reward_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards_catalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('parking','exam_seating','facilities_booking','quiz_time','participation_points','skillsfuture','culturepass','cdc_voucher') NOT NULL,
	`creditCost` int NOT NULL,
	`icon` varchar(50),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewards_catalog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_userId_simple_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `simple_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_rewardId_rewards_catalog_id_fk` FOREIGN KEY (`rewardId`) REFERENCES `rewards_catalog`(`id`) ON DELETE no action ON UPDATE no action;