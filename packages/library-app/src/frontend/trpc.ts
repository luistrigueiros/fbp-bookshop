import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../routers/_app';

// The URL will be the current origin + /api
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api',
    }),
  ],
});
