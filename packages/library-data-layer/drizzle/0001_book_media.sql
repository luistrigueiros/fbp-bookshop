CREATE TABLE `book_media` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `book_id` integer NOT NULL,
  `media_type` text(20) NOT NULL,
  `media_category` text(30) NOT NULL,
  `r2_key` text(255) NOT NULL,
  `file_name` text(255) NOT NULL,
  `file_size` integer,
  `mime_type` text(100),
  `width` integer,
  `height` integer,
  `thumbnail_key` text(255),
  `display_order` integer DEFAULT 0,
  `is_primary` integer DEFAULT false,
  `description` text,
  `uploaded_at` integer NOT NULL,
  `duration` integer,
  FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `book_media_book_idx` ON `book_media` (`book_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_media_r2key_idx` ON `book_media` (`r2_key`);
--> statement-breakpoint
CREATE INDEX `book_media_primary_idx` ON `book_media` (`book_id`, `is_primary`);
