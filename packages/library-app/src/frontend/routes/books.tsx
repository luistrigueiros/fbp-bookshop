import { createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { trpc } from '@/frontend/trpc';

const BooksList = () => {
  const navigate = useNavigate();

  // Pagination & Filters State
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  const [filterTitle, setFilterTitle] = createSignal('');
  const [filterAuthor, setFilterAuthor] = createSignal('');
  const [filterPubId, setFilterPubId] = createSignal(0);
  const [filterGenreId, setFilterGenreId] = createSignal(0);
  const [showFilters, setShowFilters] = createSignal(false);

  const isFiltered = () => filterTitle() !== '' || filterAuthor() !== '' || filterPubId() !== 0 || filterGenreId() !== 0;

  // Data fetching
  const [publishers] = createResource(async () => trpc.publishers.list.query());
  const [genres] = createResource(async () => trpc.genres.list.query());
  
  const [booksData, { refetch }] = createResource(
    () => ({
      limit: limit(),
      offset: (page() - 1) * limit(),
      title: filterTitle() || undefined,
      author: filterAuthor() || undefined,
      publisherId: filterPubId() || undefined,
      genreId: filterGenreId() || undefined,
    }),
    async (params) => {
      return await trpc.books.list.query(params);
    }
  );

  const openAdd = () => {
    navigate('/books/new');
  };

  const openEdit = (id: number) => {
    navigate(`/books/${id}`);
  };

  const handleDelete = async (id: number, e: Event) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      await trpc.books.delete.mutate(id);
      refetch();
    }
  };

  const handleFilter = (e: Event) => {
    e.preventDefault();
    setPage(1);
    refetch();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterTitle('');
    setFilterAuthor('');
    setFilterPubId(0);
    setFilterGenreId(0);
    setPage(1);
    refetch();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '2rem', gap: '1rem', 'flex-wrap': 'wrap' }}>
        <h2>Books Directory</h2>
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
          <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={openAdd}>
            Add New Book
          </button>
        </div>
      </div>

      {/* FILTERING SECTION (Popup) */}
      <Show when={showFilters()}>
        <div 
          style={{ 
            position: 'absolute', 
            top: '4rem', 
            right: 0, 
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
            <div style={{ display: 'flex', gap: '0.5rem', 'margin-top': '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.5rem 1rem', background: 'var(--accent-color)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>Apply Filters</button>
              <button type="button" onClick={clearFilters} style={{ flex: 1, padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: 'pointer' }}>Clear All</button>
            </div>
          </form>
        </div>
      </Show>

      {/* DATA TABLE SECTION */}
      <div class="glass-panel" style={{ overflow: 'hidden' }}>
        <div class="table-responsive">
          <table style={{ width: '100%', 'border-collapse': 'collapse', 'min-width': '800px' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', 'text-align': 'left' }}>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>ID</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Title</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Author</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Publisher</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Genre</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Price</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)', 'text-align': 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <Show when={booksData.loading}>
                <tr>
                  <td colspan="7" style={{ padding: '2rem', 'text-align': 'center' }}>Loading books...</td>
                </tr>
              </Show>
              <For each={booksData()?.data}>
                {(book) => (
                  <tr style={{ 'border-bottom': '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => openEdit(book.id)} class="table-row-hover">
                    <td style={{ padding: '1rem' }}>{book.id}</td>
                    <td style={{ padding: '1rem', 'font-weight': '500' }}>{book.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{book.author || '-'}</td>
                    <td style={{ padding: '1rem' }}>{book.publisher?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {book.bookGenres?.map((bg: any) => bg.genre.name).join(', ') || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>{book.price ? `$${book.price.toFixed(2)}` : '-'}</td>
                    <td style={{ padding: '1rem', 'text-align': 'right' }}>
                      <button style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', 'border-radius': '4px' }} onClick={(e) => handleDelete(book.id, e)}>Delete</button>
                    </td>
                  </tr>
                )}
              </For>
              <Show when={!booksData.loading && booksData()?.data.length === 0}>
                <tr>
                  <td colspan="7" style={{ padding: '2rem', 'text-align': 'center' }}>No books found matching the filters.</td>
                </tr>
              </Show>
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div style={{ padding: '1rem', display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'border-top': '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', 'font-size': '0.9rem' }}>
            Showing {booksData()?.data.length || 0} of {booksData()?.total || 0} books
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', 'align-items': 'center' }}>
            <button 
              disabled={page() === 1}
              onClick={() => setPage(page() - 1)}
              style={{ padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: page() === 1 ? 'not-allowed' : 'pointer', opacity: page() === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ padding: '0 0.5rem', 'font-weight': 'bold' }}>Page {page()}</span>
            <button 
              disabled={!booksData() || booksData()!.data.length < limit()}
              onClick={() => setPage(page() + 1)}
              style={{ padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: (!booksData() || booksData()!.data.length < limit()) ? 'not-allowed' : 'pointer', opacity: (!booksData() || booksData()!.data.length < limit()) ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BooksList;
