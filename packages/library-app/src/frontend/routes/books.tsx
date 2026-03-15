import { createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { trpc } from '@/frontend/trpc';
import BookFilters, { BookFilterValues } from '@/frontend/components/BookFilters';
import DataPagination from '@/frontend/components/DataPagination';

const BooksList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pagination & Filters State
  const [page, setPage] = createSignal(1);
  const [limit] = createSignal(10);
  
  const [filters, setFilters] = createSignal<BookFilterValues>({
    title: (Array.isArray(searchParams.title) ? searchParams.title[0] : searchParams.title) || '',
    author: (Array.isArray(searchParams.author) ? searchParams.author[0] : searchParams.author) || '',
    publisherId: searchParams.publisherId ? parseInt(Array.isArray(searchParams.publisherId) ? searchParams.publisherId[0] : searchParams.publisherId) : 0,
    genreId: searchParams.genreId ? parseInt(Array.isArray(searchParams.genreId) ? searchParams.genreId[0] : searchParams.genreId) : 0,
    language: (Array.isArray(searchParams.language) ? searchParams.language[0] : searchParams.language) || '',
  });

  // Data fetching
  const [booksData, { refetch }] = createResource(
    () => ({
      limit: limit(),
      offset: (page() - 1) * limit(),
      title: filters().title || undefined,
      author: filters().author || undefined,
      publisherId: filters().publisherId || undefined,
      genreId: filters().genreId || undefined,
      language: filters().language || undefined,
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

  const handleApplyFilters = (newFilters: BookFilterValues) => {
    setFilters(newFilters);
    setPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      title: '',
      author: '',
      publisherId: 0,
      genreId: 0,
      language: '',
    });
    setPage(1);
    refetch();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '2rem', gap: '1rem', 'flex-wrap': 'wrap' }}>
        <h2>Books Directory</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <BookFilters 
            initialFilters={filters()} 
            onApply={handleApplyFilters} 
            onClear={handleClearFilters} 
          />
          <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={openAdd}>
            Add New Book
          </button>
        </div>
      </div>

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
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Stock</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Price</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)', 'text-align': 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <Show when={booksData.loading}>
                <tr>
                  <td colspan="8" style={{ padding: '2rem', 'text-align': 'center' }}>Loading books...</td>
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
                    <td style={{ padding: '1rem' }}>
                      <Show when={book.stock} fallback={<span style={{ color: 'var(--text-secondary)' }}>No stock</span>}>
                        {(stock) => (
                          <div style={{ 'font-size': '0.9rem' }}>
                            <span style={{ 'font-weight': '600' }}>{stock().numberOfCopies - stock().numberOfCopiesSold}</span> in stock
                            <Show when={stock().bookshelf}>
                              <div style={{ 'font-size': '0.8rem', color: 'var(--text-secondary)' }}>{stock().bookshelf}</div>
                            </Show>
                          </div>
                        )}
                      </Show>
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
        <DataPagination
          page={page}
          pageBase={1}
          onPrevious={() => setPage(page() - 1)}
          onNext={() => setPage(page() + 1)}
          showing={() => booksData()?.data.length || 0}
          total={() => booksData()?.total || 0}
          totalPages={() => Math.ceil((booksData()?.total || 0) / limit()) || 1}
          itemLabel="books"
        />
      </div>

    </div>
  );
};

export default BooksList;
