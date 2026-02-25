CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_sessions_session_id_unique` ON `chat_sessions` (`session_id`);--> statement-breakpoint
CREATE TABLE `quote_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`message` text,
	`product_interest` text,
	`created_at` integer NOT NULL
);
