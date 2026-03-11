CREATE UNIQUE INDEX `book_isbn_unique` ON `book` (`isbn`);--> statement-breakpoint
CREATE UNIQUE INDEX `book_dedupe_unique` ON `book` (`title`,`author`,`isbn`);