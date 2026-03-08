import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

import { Route } from '@solidjs/router';
import Dashboard from './routes/index';
import BooksList from './routes/books';

render(() => (
  <Router root={App}>
    <Route path="/" component={Dashboard} />
    <Route path="/books" component={BooksList} />
  </Router>
), root!);
