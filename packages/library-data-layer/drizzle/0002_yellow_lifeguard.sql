DROP INDEX `book_isbn_unique`;--> statement-breakpoint
DROP INDEX `book_dedupe_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `book_isbn_idx` ON `book` (`isbn`);--> statement-breakpoint
CREATE UNIQUE INDEX `book_unique_idx` ON `book` (`title`,`author`,`isbn`);