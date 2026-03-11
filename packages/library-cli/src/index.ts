#!/usr/bin/env bun
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { 
  createClient, 
  extractDataFromExcel, 
  uploadGenres, 
  uploadPublishers, 
  uploadBooks 
} from './utils';

async function processExcelFile(file :string, options :{ url: string })  {
  try {
    console.log(`Reading file: ${file}`);
    const buffer = readFileSync(file);

    // 1. Extract data from Excel
    console.log('Extracting data from Excel...');
    const { books, genres, publishers } = extractDataFromExcel(buffer);

    console.log(`Extracted ${books.length} books, ${genres.length} genres, ${publishers.length} publishers.`);

    // 2. Setup tRPC client
    const client = createClient(options.url);

    // 3. Upload data
    console.log('Uploading to server...');

    // Upload Genres
    const genreMap = await uploadGenres(client, genres);

    // Upload Publishers
    const publisherMap = await uploadPublishers(client, publishers);

    // Upload Books
    const bookCount = await uploadBooks(client, books, genreMap, publisherMap);

    console.log(`Successfully uploaded ${bookCount} books.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const program = new Command();

program
  .name('library-load')
  .description('CLI to load books data from Excel and upload to library-app via tRPC')
  .version('1.0.0')
  .argument('<file>', 'Path to the Excel file')
  .option('-u, --url <url>', 'tRPC server URL', 'http://localhost:8787/trpc')
  .action(processExcelFile);

program.parse();
