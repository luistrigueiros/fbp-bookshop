import { createSignal, createResource, For, Show } from 'solid-js';
import { trpc } from '../trpc';

const GendersList = () => {
  const [genders, { refetch }] = createResource(async () => await trpc.genders.list.query());

  const [isAdding, setIsAdding] = createSignal(false);
  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [name, setName] = createSignal('');

  const handleSave = async (e: Event) => {
    e.preventDefault();
    if (editingId()) {
      await trpc.genders.update.mutate({ id: editingId()!, data: { name: name() } });
    } else {
      await trpc.genders.create.mutate({ name: name() });
    }
    refetch();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this gender?')) {
      await trpc.genders.delete.mutate(id);
      refetch();
    }
  };

  const openEdit = (gen: any) => {
    setEditingId(gen.id);
    setName(gen.name);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
  };

  return (
    <div>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '2rem' }}>
        <h2>Genders Directory</h2>
        <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => setIsAdding(true)}>
          Add Gender
        </button>
      </div>

      <Show when={isAdding()}>
        <form class="glass-panel" style={{ padding: '2rem', 'margin-bottom': '2rem' }} onSubmit={handleSave}>
          <div style={{ 'margin-bottom': '1rem' }}>
            <label>Gender Name</label>
            <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={name()} onInput={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
              {editingId() ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={closeModal} style={{ padding: '0.5rem 2rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </Show>

      <div class="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--secondary-bg)', 'text-align': 'left' }}>
              <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>ID</th>
              <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Name</th>
              <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)', 'text-align': 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <Show when={genders.loading}>
              <tr>
                <td colspan="3" style={{ padding: '2rem', 'text-align': 'center' }}>Loading genders...</td>
              </tr>
            </Show>
            <For each={genders()}>
              {(gen) => (
                <tr style={{ 'border-bottom': '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{gen.id}</td>
                  <td style={{ padding: '1rem' }}>{gen.name}</td>
                  <td style={{ padding: '1rem', 'text-align': 'right' }}>
                    <button style={{ 'margin-right': '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', 'border-radius': '4px' }} onClick={() => openEdit(gen)}>Edit</button>
                    <button style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', 'border-radius': '4px' }} onClick={() => handleDelete(gen.id)}>Delete</button>
                  </td>
                </tr>
              )}
            </For>
            <Show when={!genders.loading && genders()?.length === 0}>
              <tr>
                <td colspan="3" style={{ padding: '2rem', 'text-align': 'center' }}>No genders found.</td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GendersList;
