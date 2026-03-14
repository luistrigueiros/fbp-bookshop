import { createSignal, createResource, For, Show } from 'solid-js';
import { trpc } from '@/frontend/trpc';

export interface BookFilterValues {
  title: string;
  author: string;
  publisherId: number;
  genreId: number;
  language: string;
}

interface BookFiltersProps {
  initialFilters: BookFilterValues;
  onApply: (filters: BookFilterValues) => void;
  onClear: () => void;
}

const BookFilters = (props: BookFiltersProps) => {
  const [filterTitle, setFilterTitle] = createSignal(props.initialFilters.title);
  const [filterAuthor, setFilterAuthor] = createSignal(props.initialFilters.author);
  const [filterPubId, setFilterPubId] = createSignal(props.initialFilters.publisherId);
  const [filterGenreId, setFilterGenreId] = createSignal(props.initialFilters.genreId);
  const [filterLanguage, setFilterLanguage] = createSignal(props.initialFilters.language);
  const [showFilters, setShowFilters] = createSignal(false);

  const isFiltered = () => 
    filterTitle() !== '' || 
    filterAuthor() !== '' || 
    filterPubId() !== 0 || 
    filterGenreId() !== 0 || 
    filterLanguage() !== '';

  const [publishers] = createResource(async () => trpc.publishers.list.query());
  const [genres] = createResource(async () => trpc.genres.list.query());
  const [languages] = createResource(async () => trpc.books.getLanguages.query());

  const handleFilter = (e: Event) => {
    e.preventDefault();
    props.onApply({
      title: filterTitle(),
      author: filterAuthor(),
      publisherId: filterPubId(),
      genreId: filterGenreId(),
      language: filterLanguage(),
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterTitle('');
    setFilterAuthor('');
    setFilterPubId(0);
    setFilterGenreId(0);
    setFilterLanguage('');
    props.onClear();
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        class="glass-panel" 
        style={{ 
          padding: '0.5rem 1rem', 
          cursor: 'pointer',
          background: isFiltered() ? 'var(--accent-color)' : 'var(--glass-bg)',
          color: isFiltered() ? 'white' : 'var(--text-primary)',
          border: isFiltered() ? 'none' : '1px solid var(--glass-border)',
          display: 'flex',
          'align-items': 'center',
          gap: '0.5rem'
        }} 
        onClick={() => setShowFilters(!showFilters())}
      >
        <span>{isFiltered() ? 'Filter Applied' : 'Filter/Search'}</span>
        <Show when={isFiltered()}>
          <span 
            onClick={(e) => { e.stopPropagation(); clearFilters(); }}
            style={{ 
              'margin-left': '0.5rem', 
              background: 'rgba(255,255,255,0.2)', 
              'border-radius': '50%', 
              width: '18px', 
              height: '18px', 
              display: 'inline-flex', 
              'align-items': 'center', 
              'justify-content': 'center',
              'font-size': '12px'
            }}
          >
            ✕
          </span>
        </Show>
      </button>

      <Show when={showFilters()}>
        <div 
          style={{ 
            position: 'absolute', 
            top: '4rem', 
            right: '0', 
            'z-index': 100, 
            width: '100%', 
            'max-width': '400px',
            background: 'var(--secondary-bg)',
            'box-shadow': '0 10px 25px rgba(0,0,0,0.1)',
            'border-radius': '8px',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}
          class="glass-panel"
        >
          <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '1rem' }}>
            <h4 style={{ margin: 0 }}>Search & Filters</h4>
            <button 
              onClick={() => setShowFilters(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', 'font-size': '1.2rem' }}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleFilter} style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
            <div>
              <label style={{ 'font-size': '0.85rem' }}>Title</label>
              <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.25rem', border: '1px solid var(--border-color)', 'border-radius': '4px' }} value={filterTitle()} onInput={(e) => setFilterTitle(e.currentTarget.value)} placeholder="Search title..." />
            </div>
            <div>
              <label style={{ 'font-size': '0.85rem' }}>Author</label>
              <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.25rem', border: '1px solid var(--border-color)', 'border-radius': '4px' }} value={filterAuthor()} onInput={(e) => setFilterAuthor(e.currentTarget.value)} placeholder="Search author..." />
            </div>
            <div>
              <label style={{ 'font-size': '0.85rem' }}>Publisher</label>
              <select style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.25rem', border: '1px solid var(--border-color)', 'border-radius': '4px', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }} value={filterPubId()} onChange={(e) => setFilterPubId(parseInt(e.currentTarget.value))}>
                <option value={0}>All Publishers</option>
                <For each={publishers()}>
                  {(pub) => <option value={pub.id}>{pub.name}</option>}
                </For>
              </select>
            </div>
            <div>
              <label style={{ 'font-size': '0.85rem' }}>Genre</label>
              <select style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.25rem', border: '1px solid var(--border-color)', 'border-radius': '4px', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }} value={filterGenreId()} onChange={(e) => setFilterGenreId(parseInt(e.currentTarget.value))}>
                <option value={0}>All Genres</option>
                <For each={genres()}>
                  {(gen) => <option value={gen.id}>{gen.name}</option>}
                </For>
              </select>
            </div>
            <div>
              <label style={{ 'font-size': '0.85rem' }}>Language</label>
              <select style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.25rem', border: '1px solid var(--border-color)', 'border-radius': '4px', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }} value={filterLanguage()} onChange={(e) => setFilterLanguage(e.currentTarget.value)}>
                <option value="">All Languages</option>
                <For each={languages()}>
                  {(lang) => <option value={lang}>{lang}</option>}
                </For>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', 'margin-top': '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.5rem 1rem', background: 'var(--accent-color)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>Apply Filters</button>
              <button type="button" onClick={clearFilters} style={{ flex: 1, padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: 'pointer' }}>Clear All</button>
            </div>
          </form>
        </div>
      </Show>
    </div>
  );
};

export default BookFilters;
