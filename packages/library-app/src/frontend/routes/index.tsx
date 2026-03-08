import { createResource, For } from 'solid-js';
import { trpc } from '../trpc';

const Dashboard = () => {
  const [books] = createResource(async () => await trpc.books.list.query());
  const [publishers] = createResource(async () => await trpc.publishers.list.query());
  const [genders] = createResource(async () => await trpc.genders.list.query());

  return (
    <div>
      <h2>Library Dashboard</h2>
      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '2rem', 'margin-top': '2rem' }}>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Total Books</h3>
          <h1 style={{ 'font-size': '4rem', margin: '1rem 0', color: 'var(--accent-color)' }}>{books()?.length || 0}</h1>
        </div>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Publishers</h3>
          <h1 style={{ 'font-size': '4rem', margin: '1rem 0', color: 'var(--accent-color)' }}>{publishers()?.length || 0}</h1>
        </div>
        <div class="glass-panel" style={{ padding: '2rem', 'text-align': 'center' }}>
          <h3>Genders</h3>
          <h1 style={{ 'font-size': '4rem', margin: '1rem 0', color: 'var(--accent-color)' }}>{genders()?.length || 0}</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
