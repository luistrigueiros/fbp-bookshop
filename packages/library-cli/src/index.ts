#!/usr/bin/env bun
import {Command} from 'commander';
import {processExcelFile} from "./processExcelFile";

const program = new Command();

program
  .name('library-load')
  .description('CLI to load books data from Excel and upload to library-app via tRPC')
  .version('1.0.0')
  .argument('<file>', 'Path to the Excel file')
  .option('-u, --url <url>', 'tRPC server URL', 'http://localhost:8787/api')
  .action(processExcelFile);

program.parse();
