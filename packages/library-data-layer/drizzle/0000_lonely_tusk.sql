CREATE TABLE `book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(500) NOT NULL,
	`author` text(300),
	`isbn` text(20),
	`barcode` text(50),
	`price` real,
	`language` text(50),
	`publisher_id` integer,
	FOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_isbn_idx` ON `book` (`isbn`);--> statement-breakpoint
CREATE UNIQUE INDEX `book_unique_idx` ON `book` (`title`,`author`,`isbn`);--> statement-breakpoint
CREATE TABLE `book_genre` (
	`book_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`book_id`, `genre_id`),
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `book_stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`bookshelf` text(100),
	`number_of_copies` integer DEFAULT 0 NOT NULL,
	`number_of_copies_sold` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_stock_book_id_unique` ON `book_stock` (`book_id`);--> statement-breakpoint
CREATE TABLE `export_job` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0,
	`url` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `genre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genre_name_unique` ON `genre` (`name`);--> statement-breakpoint
CREATE TABLE `publisher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(200) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publisher_name_unique` ON `publisher` (`name`);--> statement-breakpoint
CREATE TABLE `upload_status` (
	`key` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`filename` text,
	`books_count` integer DEFAULT 0,
	`processed_count` integer DEFAULT 0,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
