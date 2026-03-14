-- Migration to add error_message column to export_job table
ALTER TABLE `export_job` ADD COLUMN `error_message` text;
