import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import App from '@/frontend/App';
import '@/frontend/styles/index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

import { Route } from '@solidjs/router';
import Dashboard from '@/frontend/routes/index';
import BooksList from '@/frontend/routes/books';
import BookDetail from '@/frontend/routes/book-detail';
import PublishersList from '@/frontend/routes/publishers';
import GenresList from '@/frontend/routes/genres';

render(() => (
  <Router root={App}>
    <Route path="/" component={Dashboard} />
    <Route path="/books" component={BooksList} />
    <Route path="/books/new" component={BookDetail} />
    <Route path="/books/:id" component={BookDetail} />
    <Route path="/publishers" component={PublishersList} />
    <Route path="/genres" component={GenresList} />
  </Router>
), root!);
