import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'library-trpc';
import { extractBook, extractGenre, extractPublisher } from 'library-excel-extractor';

export function createClient(url: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
}

export function extractDataFromExcel(buffer: Buffer) {
  const { items: books } = extractBook(buffer);
  const { items: genres } = extractGenre(buffer);
  const { items: publishers } = extractPublisher(buffer);
  return { books, genres, publishers };
}

export type TRPCClient = ReturnType<typeof createClient>;

export async function checkServerConnection(client: TRPCClient) {
  try {
    const result = await client.ping.query();
    return result === 'pong';
  } catch (err) {
    return false;
  }
}

export async function uploadGenres(client: TRPCClient, genres: any[]) {
  const genreMap = new Map<string, number>();
  console.log('Uploading genres...');
  for (const genre of genres) {
    try {
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
  return genreMap;
}

export async function uploadPublishers(client: TRPCClient, publishers: any[]) {
  const publisherMap = new Map<string, number>();
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
  return publisherMap;
}

export async function uploadBooks(
  client: TRPCClient, 
  books: any[], 
  genreMap: Map<string, number>, 
  publisherMap: Map<string, number>
) {
  console.log('Uploading books...');
  let bookCount = 0;
  for (const book of books) {
    try {
      const genreIds = book.genres
        .map((g: any) => genreMap.get(g.name.toLowerCase()))
        .filter((id: any): id is number => id !== undefined);
      
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
  return bookCount;
}
