import { createSignal, createResource, For, Show, onMount, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { trpc } from '@/frontend/trpc';
import GenreSelector from '@/frontend/components/GenreSelector';
import PublisherSelector from '@/frontend/components/PublisherSelector';
import BookMediaGallery from '@/frontend/components/BookMediaGallery';
import BookMediaUpload from '@/frontend/components/BookMediaUpload';

const BookDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = () => params.id ? parseInt(params.id) : null;

  // Data fetching
  const [publishers] = createResource(async () => trpc.publishers.list.query());
  const [genres] = createResource(async () => trpc.genres.list.query());
  
  const [bookData] = createResource(
    () => id(),
    async (bookId) => {
      if (!bookId) return null;
      return await trpc.books.getById.query(bookId);
    }
  );

  const [title, setTitle] = createSignal('');
  const [author, setAuthor] = createSignal('');
  const [price, setPrice] = createSignal(0);
  const [pubId, setPubId] = createSignal<number | null>(null);
  const [selectedGenreIds, setSelectedGenreIds] = createSignal<number[]>([]);
  const [isbn, setIsbn] = createSignal('');
  const [language, setLanguage] = createSignal('');
  const [bookshelf, setBookshelf] = createSignal('');
  const [numberOfCopies, setNumberOfCopies] = createSignal(0);
  const [numberOfCopiesSold, setNumberOfCopiesSold] = createSignal(0);
  const [activeTab, setActiveTab] = createSignal<'info' | 'stock' | 'media'>('info');
  const [refreshCounter, setRefreshCounter] = createSignal(0);

  const refreshGallery = () => setRefreshCounter((c) => c + 1);
  const handleDeleted = () => setRefreshCounter((c) => c + 1);

  // Update signals when bookData is loaded
  onMount(() => {
    // If we're editing, we need to wait for bookData to be ready or react to it.
    // In Solid, using a resource's state might be better than onMount for data that loads asynchronously.
  });

  // Effect-like behavior to sync signals with bookData
  const syncBookData = (book: any) => {
    if (!book) return;
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setPrice(book.price || 0);
    setPubId(book.publisherId || null);
    const genreIds = book.bookGenres?.map((bg: any) => bg.genreId) || [];
    setSelectedGenreIds(genreIds);
    setIsbn(book.isbn || '');
    setLanguage(book.language || '');
    setBookshelf(book.stock?.bookshelf || '');
    setNumberOfCopies(book.stock?.numberOfCopies || 0);
    setNumberOfCopiesSold(book.stock?.numberOfCopiesSold || 0);
  };

  // Using a resource property or createEffect to sync
  const book = () => bookData();
  onMount(() => {
    // This will run only once, but bookData() might be loading.
    // Let's use an effect instead or a derived signal.
  });

  // Solid's createEffect can be used for syncing
  createEffect(() => {
    const data = bookData();
    if (data) {
      syncBookData(data);
    }
  });

  const handleSave = async (e: Event) => {
    e.preventDefault();
    const data = {
      title: title(),
      author: author() || null,
      price: price() || null,
      publisherId: pubId() || null,
      genreIds: selectedGenreIds(),
      isbn: isbn() || null,
      language: language() || null,
      stock: {
        bookshelf: bookshelf() || null,
        numberOfCopies: numberOfCopies(),
        numberOfCopiesSold: numberOfCopiesSold(),
      },
    };

    const bookId = id();
    if (bookId) {
      await trpc.books.update.mutate({ id: bookId, data });
    } else {
      await trpc.books.create.mutate(data);
    }
    
    navigate('/books');
  };

  const handleCancel = () => {
    navigate('/books');
  };

  return (
    <div class="glass-panel" style={{ padding: '2rem', 'margin-top': '2rem' }}>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '1.5rem' }}>
        <h2 style={{ margin: 0 }}>{id() ? 'Edit Book' : 'Add New Book'}</h2>
        <button onClick={handleCancel} style={{ padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: 'pointer' }}>
            Back to List
        </button>
      </div>

      <Show when={!bookData.loading || !id()} fallback={<p>Loading book details...</p>}>
        {/* TAB NAVIGATION */}
        <div style={{ display: 'flex', 'border-bottom': '1px solid var(--border-color)', 'margin-bottom': '1.5rem', gap: '2rem' }}>
          <button 
            onClick={() => setActiveTab('info')} 
            type="button"
            style={{ 
              padding: '0.75rem 0.5rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: activeTab() === 'info' ? 'var(--accent-color)' : 'var(--text-secondary)',
              'border-bottom': activeTab() === 'info' ? '2px solid var(--accent-color)' : '2px solid transparent',
              'font-weight': activeTab() === 'info' ? '600' : '400',
              'transition': 'all 0.2s ease'
            }}
          >
            Book Information
          </button>
          <button 
            onClick={() => setActiveTab('stock')} 
            type="button"
            style={{ 
              padding: '0.75rem 0.5rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: activeTab() === 'stock' ? 'var(--accent-color)' : 'var(--text-secondary)',
              'border-bottom': activeTab() === 'stock' ? '2px solid var(--accent-color)' : '2px solid transparent',
              'font-weight': activeTab() === 'stock' ? '600' : '400',
              'transition': 'all 0.2s ease'
            }}
          >
            Stock Information
          </button>
          <Show when={id() !== null}>
            <button 
              onClick={() => setActiveTab('media')} 
              type="button"
              style={{ 
                padding: '0.75rem 0.5rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: activeTab() === 'media' ? 'var(--accent-color)' : 'var(--text-secondary)',
                'border-bottom': activeTab() === 'media' ? '2px solid var(--accent-color)' : '2px solid transparent',
                'font-weight': activeTab() === 'media' ? '600' : '400',
                'transition': 'all 0.2s ease'
              }}
            >
              Media
            </button>
          </Show>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', 'margin-top': '1rem' }}>
            <Show when={activeTab() === 'info'}>
              <div>
                <label>Title</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={title()} onInput={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label>Author</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={author()} onInput={(e) => setAuthor(e.target.value)} />
              </div>
              <div>
                <label>Price</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} type="number" step="0.01" value={price()} onInput={(e) => setPrice(parseFloat(e.target.value))} />
              </div>
              <div>
                <label>ISBN</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={isbn()} onInput={(e) => setIsbn(e.target.value)} />
              </div>
              <div>
                <label>Language</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={language()} onInput={(e) => setLanguage(e.target.value)} />
              </div>
              <div>
                <label>Publisher</label>
                <PublisherSelector
                  allPublishers={publishers()}
                  selectedId={pubId()}
                  onChange={(id) => setPubId(id)}
                />
              </div>
              <div style={{ 'grid-column': '1 / -1' }}>
                <label>Genres</label>
                <GenreSelector
                  allGenres={genres()}
                  selectedIds={selectedGenreIds()}
                  onChange={(ids: number[]) => setSelectedGenreIds(ids)}
                />
              </div>
            </Show>

            <Show when={activeTab() === 'stock'}>
              <div>
                <label>Bookshelf</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={bookshelf()} onInput={(e) => setBookshelf(e.target.value)} />
              </div>
              <div>
                <label>Total Copies</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} type="number" min="0" value={numberOfCopies()} onInput={(e) => setNumberOfCopies(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label>Copies Sold</label>
                <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} type="number" min="0" value={numberOfCopiesSold()} onInput={(e) => setNumberOfCopiesSold(parseInt(e.target.value) || 0)} />
              </div>
            </Show>
          </div>

          <Show when={activeTab() === 'media' && id() !== null}>
            <div style={{ 'margin-top': '1rem' }}>
              <BookMediaGallery
                refreshKey={refreshCounter()}
                bookId={id()!}
                editMode={true}
                onDeleted={handleDeleted}
              />
              <div style={{ 'margin-top': '1.5rem', 'padding-top': '1.5rem', 'border-top': '1px solid var(--border-color)' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Upload Media</h3>
                <BookMediaUpload bookId={id()!} onUploaded={refreshGallery} />
              </div>
            </div>
          </Show>

          <div style={{ 'margin-top': '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
              Save
            </button>
            <button type="button" onClick={handleCancel} style={{ padding: '0.5rem 2rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
};

export default BookDetail;
