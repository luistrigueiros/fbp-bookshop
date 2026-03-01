// Auto-generated file. Do not edit manually.
export const migrations = [
  {
    "file": "0000_tired_rafael_vega.sql",
    "content": "CREATE TABLE `book` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`title` text(500) NOT NULL,\n\t`author` text(300),\n\t`isbn` text(20),\n\t`barcode` text(50),\n\t`price` real,\n\t`language` text(50),\n\t`gender_id` integer,\n\t`publisher_id` integer,\n\tFOREIGN KEY (`gender_id`) REFERENCES `gender`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON UPDATE no action ON DELETE set null\n);\n--> statement-breakpoint\nCREATE TABLE `gender` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`name` text(100) NOT NULL\n);\n--> statement-breakpoint\nCREATE UNIQUE INDEX `gender_name_unique` ON `gender` (`name`);--> statement-breakpoint\nCREATE TABLE `publisher` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`name` text(200) NOT NULL\n);\n--> statement-breakpoint\nCREATE UNIQUE INDEX `publisher_name_unique` ON `publisher` (`name`);"
  }
];
