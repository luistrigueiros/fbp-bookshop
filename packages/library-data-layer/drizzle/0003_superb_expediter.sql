CREATE TABLE `book_stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`bookshelf` text(100),
	`number_of_copies` integer DEFAULT 0 NOT NULL,
	`number_of_copies_sold` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_stock_book_id_unique` ON `book_stock` (`book_id`);