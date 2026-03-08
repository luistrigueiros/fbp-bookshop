import { createSignal, createResource, For, Show } from 'solid-js';
import { trpc } from '../trpc';

const BooksList = () => {
  const [books, { refetch }] = createResource(async () => {
    return await trpc.books.list.query();
  });

  const [publishers] = createResource(async () => trpc.publishers.list.query());
  const [genders] = createResource(async () => trpc.genders.list.query());

  const [isAdding, setIsAdding] = createSignal(false);
  const [title, setTitle] = createSignal('');
  const [author, setAuthor] = createSignal('');
  const [price, setPrice] = createSignal(0);
  const [pubId, setPubId] = createSignal(0);
  const [genId, setGenId] = createSignal(0);

  const handleAdd = async (e: Event) => {
    e.preventDefault();
    await trpc.books.create.mutate({
      title: title(),
      author: author() || null,
      price: price() || null,
      publisherId: pubId() || null,
      genderId: genId() || null,
    });
    refetch();
    setIsAdding(false);
    setTitle('');
    setAuthor('');
    setPrice(0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await trpc.books.delete.mutate(id);
      refetch();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '2rem' }}>
        <h2>Books Directory</h2>
        <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => setIsAdding(!isAdding())}>
          {isAdding() ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      <Show when={isAdding()}>
        <form class="glass-panel" style={{ padding: '2rem', 'margin-bottom': '2rem' }} onSubmit={handleAdd}>
          <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Title</label>
              <input style={{ width: '100%', padding: '0.5rem' }} value={title()} onInput={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label>Author</label>
              <input style={{ width: '100%', padding: '0.5rem' }} value={author()} onInput={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label>Price</label>
              <input style={{ width: '100%', padding: '0.5rem' }} type="number" step="0.01" value={price()} onInput={(e) => setPrice(parseFloat(e.target.value))} />
            </div>
            <div>
              <label>Publisher</label>
              <select style={{ width: '100%', padding: '0.5rem' }} onChange={(e) => setPubId(parseInt(e.target.value))}>
                <option value={0}>Select Publisher</option>
                <For each={publishers()}>
                  {(pub) => <option value={pub.id}>{pub.name}</option>}
                </For>
              </select>
            </div>
            <div>
              <label>Gender</label>
              <select style={{ width: '100%', padding: '0.5rem' }} onChange={(e) => setGenId(parseInt(e.target.value))}>
                <option value={0}>Select Gender</option>
                <For each={genders()}>
                  {(gen) => <option value={gen.id}>{gen.name}</option>}
                </For>
              </select>
            </div>
          </div>
          <button style={{ 'margin-top': '1rem', padding: '0.5rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
            Save Book
          </button>
        </form>
      </Show>

      <Show when={books.loading}>
        <p>Loading books...</p>
      </Show>

      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <For each={books()}>
          {(book) => (
            <div class="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{book.title}</h3>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>{book.author}</p>
              
              <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
                <span style={{ 'font-weight': 'bold', color: 'var(--accent-color)' }}>
                  {book.price ? `$${book.price}` : 'Free'}
                </span>
                <button 
                  style={{ background: 'transparent', border: '1px solid currentColor', padding: '0.25rem 0.5rem', 'border-radius': '4px', cursor: 'pointer', color: '#ef4444' }}
                  onClick={() => handleDelete(book.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

    </div>
  );
};

export default BooksList;
