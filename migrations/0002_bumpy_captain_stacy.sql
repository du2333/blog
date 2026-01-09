DROP INDEX `comments_post_id_idx`;--> statement-breakpoint
DROP INDEX `comments_user_id_idx`;--> statement-breakpoint
DROP INDEX `comments_status_idx`;--> statement-breakpoint
ALTER TABLE `comments` ADD `root_id` integer REFERENCES comments(id);--> statement-breakpoint
ALTER TABLE `comments` ADD `reply_to_comment_id` integer REFERENCES comments(id);--> statement-breakpoint
CREATE INDEX `comments_post_root_created_idx` ON `comments` (`post_id`,`root_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_created_idx` ON `comments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_status_created_idx` ON `comments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_global_created_idx` ON `comments` (`created_at`);--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `parent_id`;