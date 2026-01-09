CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text,
	`parent_id` integer,
	`status` text DEFAULT 'verifying' NOT NULL,
	`ai_reason` text,
	`post_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `comments_post_id_idx` ON `comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `comments_status_idx` ON `comments` (`status`);