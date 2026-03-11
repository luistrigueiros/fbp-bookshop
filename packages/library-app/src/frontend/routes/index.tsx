import { createResource } from 'solid-js';
import { trpc } from '@/frontend/trpc';

const Dashboard = () => {
  const [books] = createResource(async () => await trpc.books.list.query());
  const [publishers] = createResource(async () => await trpc.publishers.list.query());
  const [genres] = createResource(async () => await trpc.genres.list.query());

  return (
    <div>
      <h2>Library Dashboard</h2>
      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', 'margin-top': '2rem' }}>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Total Books</h3>
          <h1 style={{ 'font-size': 'clamp(2rem, 8vw, 4rem)', margin: '1rem 0', color: 'var(--accent-color)' }}>{books()?.total || 0}</h1>
        </div>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Publishers</h3>
          <h1 style={{ 'font-size': 'clamp(2rem, 8vw, 4rem)', margin: '1rem 0', color: 'var(--accent-color)' }}>{publishers()?.length || 0}</h1>
        </div>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Genres</h3>
          <h1 style={{ 'font-size': 'clamp(2rem, 8vw, 4rem)', margin: '1rem 0', color: 'var(--accent-color)' }}>{genres()?.length || 0}</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
