#!/usr/bin/env bun
import { Command } from 'commander';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'library-trpc';
import { extractBook, extractGenre, extractPublisher } from 'library-excel-extractor';
import { readFileSync } from 'fs';

const program = new Command();

program
  .name('library-load')
  .description('CLI to load books data from Excel and upload to library-app via tRPC')
  .version('1.0.0')
  .argument('<file>', 'Path to the Excel file')
  .option('-u, --url <url>', 'tRPC server URL', 'http://localhost:8787/trpc')
  .action(async (file, options) => {
    try {
      console.log(`Reading file: ${file}`);
      const buffer = readFileSync(file);
      
      // 1. Extract data from Excel
      console.log('Extracting data from Excel...');
      const { items: books } = extractBook(buffer);
      const { items: genres } = extractGenre(buffer);
      const { items: publishers } = extractPublisher(buffer);

      console.log(`Extracted ${books.length} books, ${genres.length} genres, ${publishers.length} publishers.`);

      // 2. Setup tRPC client
      const client = createTRPCProxyClient<AppRouter>({
        links: [
          httpBatchLink({
            url: options.url,
          }),
        ],
      });

      // 3. Upload data
      console.log('Uploading to server...');

      // Map to store server-side IDs
      const genreMap = new Map<string, number>();
      const publisherMap = new Map<string, number>();

      // Upload Genres
      console.log('Uploading genres...');
      for (const genre of genres) {
        try {
          // We assume 'create' or similar exists. Based on library-app/src/routers/genres.ts
          // genres.list, genres.create
          const existingGenres = await client.genres.list.query();
          const existing = existingGenres.find(g => g.name.toLowerCase() === genre.name.toLowerCase());
          
          if (existing) {
            genreMap.set(genre.name.toLowerCase(), existing.id);
          } else {
            const created = await client.genres.create.mutate({ name: genre.name });
            genreMap.set(genre.name.toLowerCase(), created.id);
          }
        } catch (err) {
          console.error(`Failed to upload genre ${genre.name}:`, err);
        }
      }

      // Upload Publishers
      console.log('Uploading publishers...');
      for (const publisher of publishers) {
        try {
          const existingPublishers = await client.publishers.list.query();
          const existing = existingPublishers.find(p => p.name.toLowerCase() === publisher.name.toLowerCase());
          
          if (existing) {
            publisherMap.set(publisher.name.toLowerCase(), existing.id);
          } else {
            const created = await client.publishers.create.mutate({ name: publisher.name });
            publisherMap.set(publisher.name.toLowerCase(), created.id);
          }
        } catch (err) {
          console.error(`Failed to upload publisher ${publisher.name}:`, err);
        }
      }

      // Upload Books
      console.log('Uploading books...');
      let bookCount = 0;
      for (const book of books) {
        try {
          const genreIds = book.genres
            .map(g => genreMap.get(g.name.toLowerCase()))
            .filter((id): id is number => id !== undefined);
          
          const publisherId = book.publisher 
            ? publisherMap.get(book.publisher.name.toLowerCase()) 
            : undefined;

          await client.books.create.mutate({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            barcode: book.barcode,
            price: book.price,
            language: book.language,
            genreIds,
            publisherId: publisherId ?? null,
          });
          bookCount++;
          if (bookCount % 10 === 0) {
            console.log(`Uploaded ${bookCount}/${books.length} books...`);
          }
        } catch (err) {
          console.error(`Failed to upload book ${book.title}:`, err);
        }
      }

      console.log(`Successfully uploaded ${bookCount} books.`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();
