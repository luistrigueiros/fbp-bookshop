import { createSignal, createResource, For, Show, onMount, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { trpc } from '../trpc';

const BookDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = () => params.id ? parseInt(params.id) : null;

  // Data fetching
  const [publishers] = createResource(async () => trpc.publishers.list.query());
  const [genders] = createResource(async () => trpc.genders.list.query());
  
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
  const [pubId, setPubId] = createSignal(0);
  const [selectedGenderIds, setSelectedGenderIds] = createSignal<number[]>([]);
  const [isbn, setIsbn] = createSignal('');
  const [language, setLanguage] = createSignal('');

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
    setPubId(book.publisherId || 0);
    const genderIds = book.bookGenders?.map((bg: any) => bg.genderId) || [];
    setSelectedGenderIds(genderIds);
    setIsbn(book.isbn || '');
    setLanguage(book.language || '');
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
      genderIds: selectedGenderIds(),
      isbn: isbn() || null,
      language: language() || null,
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
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', 'margin-top': '1rem' }}>
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
              <select style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={pubId()} onChange={(e) => setPubId(parseInt(e.target.value))}>
                <option value={0}>No Publisher</option>
                <For each={publishers()}>
                  {(pub) => <option value={pub.id} selected={pub.id === pubId()}>{pub.name}</option>}
                </For>
              </select>
            </div>
            <div style={{ 'grid-column': '1 / -1' }}>
              <label>Genders</label>
              <select 
                multiple 
                style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem', 'min-height': '120px' }} 
                value={selectedGenderIds().map(String)} 
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedGenderIds(options.map(o => parseInt(o.value)));
                }}
              >
                <For each={genders()}>
                  {(gen) => (
                    <option value={gen.id} selected={selectedGenderIds().includes(gen.id)}>
                      {gen.name}
                    </option>
                  )}
                </For>
              </select>
              <small style={{ color: 'var(--text-secondary)' }}>Hold Ctrl/Cmd to select multiple</small>
            </div>
          </div>
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
