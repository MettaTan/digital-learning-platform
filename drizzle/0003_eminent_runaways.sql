CREATE TABLE `ai_case_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenario` text NOT NULL,
	`category` varchar(100),
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`targetWeakArea` varchar(255),
	`completed` int NOT NULL DEFAULT 0,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_case_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_weak_areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`incorrectCount` int NOT NULL DEFAULT 0,
	`totalAttempts` int NOT NULL DEFAULT 0,
	`lastPracticedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_weak_areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`duration` int,
	`category` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`currentTime` int NOT NULL DEFAULT 0,
	`completed` int NOT NULL DEFAULT 0,
	`quizScore` int DEFAULT 0,
	`totalQuizQuestions` int DEFAULT 0,
	`lastWatchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_quiz_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`questionId` int NOT NULL,
	`userAnswer` enum('A','B','C','D') NOT NULL,
	`isCorrect` int NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 1,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_quiz_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`pauseTime` int NOT NULL,
	`question` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text,
	`optionD` text,
	`correctAnswer` enum('A','B','C','D') NOT NULL,
	`incorrectFeedback` text NOT NULL,
	`correctFeedback` text,
	`hintText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reward_redemptions` MODIFY COLUMN `status` enum('pending','approved','completed','cancelled','expired') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `reward_redemptions` ADD `expiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `ai_case_scenarios` ADD CONSTRAINT `ai_case_scenarios_userId_simple_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `simple_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_scenarioId_ai_case_scenarios_id_fk` FOREIGN KEY (`scenarioId`) REFERENCES `ai_case_scenarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_weak_areas` ADD CONSTRAINT `user_weak_areas_userId_simple_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `simple_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_progress` ADD CONSTRAINT `video_progress_userId_simple_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `simple_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_progress` ADD CONSTRAINT `video_progress_videoId_video_modules_id_fk` FOREIGN KEY (`videoId`) REFERENCES `video_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_quiz_answers` ADD CONSTRAINT `video_quiz_answers_userId_simple_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `simple_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_quiz_answers` ADD CONSTRAINT `video_quiz_answers_videoId_video_modules_id_fk` FOREIGN KEY (`videoId`) REFERENCES `video_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_quiz_answers` ADD CONSTRAINT `video_quiz_answers_questionId_video_quiz_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `video_quiz_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_quiz_questions` ADD CONSTRAINT `video_quiz_questions_videoId_video_modules_id_fk` FOREIGN KEY (`videoId`) REFERENCES `video_modules`(`id`) ON DELETE no action ON UPDATE no action;