import {createTRPCProxyClient, httpBatchLink} from '@trpc/client';
import type {AppRouter} from 'library-trpc';
import {
  extractBook,
  extractGenre,
  extractPublisher,
  type Book,
  type Genre,
  type Publisher
} from 'library-excel-extractor';

export function createClient(url: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
}

export function extractDataFromExcel(buffer: Buffer): {
  books: Book[];
  genres: Genre[];
  publishers: Publisher[];
} {
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

