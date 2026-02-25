ALTER TABLE `quote_submissions` ADD COLUMN `product_slug` text;
--> statement-breakpoint
ALTER TABLE `quote_submissions` ADD COLUMN `series_slug` text;
--> statement-breakpoint
ALTER TABLE `quote_submissions` ADD COLUMN `chat_session_id` text;
--> statement-breakpoint
ALTER TABLE `quote_submissions` ADD COLUMN `source` text;
