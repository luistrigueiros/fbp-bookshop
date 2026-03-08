import { router } from '../trpc';
import { booksRouter } from './books';
import { gendersRouter } from './genders';
import { publishersRouter } from './publishers';

export const appRouter = router({
  books: booksRouter,
  genders: gendersRouter,
  publishers: publishersRouter,
});

export type AppRouter = typeof appRouter;
