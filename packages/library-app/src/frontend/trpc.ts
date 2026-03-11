import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'library-trpc';

// The URL will be the current origin + /api
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api',
    }),
  ],
});
