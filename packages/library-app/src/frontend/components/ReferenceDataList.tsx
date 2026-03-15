import { createSignal, createMemo, Show, For } from 'solid-js';
import DataPagination from './DataPagination';

interface ReferenceDataListProps {
  itemName: string;
  listResource: any;
  deleteMutation: any;
  updateMutation: any;
  createMutation: any;
  refetchList: () => void;
  refetchDrill: () => void;
}

const ReferenceDataList = (props: ReferenceDataListProps) => {
  const [listFilter, setListFilter] = createSignal('');
  const [isAdding, setIsAdding] = createSignal(false);
  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [name, setName] = createSignal('');
  const [page, setPage] = createSignal(0);
  const pageSize = 10;

  const filteredList = createMemo(() => {
    const list = props.listResource();
    if (!list) return [];
    if (!listFilter()) return list;
    return list.filter((item: any) => 
      item.name.toLowerCase().includes(listFilter().toLowerCase())
    );
  });

  const paginatedList = createMemo(() => {
    const start = page() * pageSize;
    return filteredList().slice(start, start + pageSize);
  });

  const totalPages = createMemo(() => Math.ceil(filteredList().length / pageSize) || 1);

  const handleSave = async (e: Event) => {
    e.preventDefault();
    if (editingId()) {
      await props.updateMutation.mutate({ id: editingId()!, data: { name: name() } });
    } else {
      await props.createMutation.mutate({ name: name() });
    }
    props.refetchList();
    props.refetchDrill();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm(`Are you sure you want to delete this ${props.itemName.toLowerCase()}?`)) {
      await props.deleteMutation.mutate(id);
      props.refetchList();
      props.refetchDrill();
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
  };

  return (
    <div>
      <div style={{ display: 'flex', 'justify-content': 'flex-end', 'margin-bottom': '1rem' }}>
        <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => setIsAdding(true)}>
          Add {props.itemName}
        </button>
      </div>

      <Show when={isAdding()}>
        <form class="glass-panel" style={{ padding: '2rem', 'margin-bottom': '2rem' }} onSubmit={handleSave}>
          <div style={{ 'margin-bottom': '1rem' }}>
            <label>{props.itemName} Name</label>
            <input style={{ width: '100%', padding: '0.5rem', 'margin-top': '0.5rem' }} value={name()} onInput={(e) => setName(e.currentTarget.value)} required />
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

      <div class="glass-panel" style={{ 'margin-bottom': '1rem', padding: '1rem' }}>
         <input 
          type="text" 
          placeholder={`Filter ${props.itemName.toLowerCase()}s...`} 
          style={{ width: '100%', padding: '0.5rem' }} 
          value={listFilter()} 
          onInput={(e) => {
            setListFilter(e.currentTarget.value);
            setPage(0);
          }}
        />
      </div>

      <div class="glass-panel" style={{ overflow: 'hidden' }}>
        <div class="table-responsive">
          <table style={{ width: '100%', 'border-collapse': 'collapse', 'min-width': '600px' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', 'text-align': 'left' }}>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>ID</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>Name</th>
                <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)', 'text-align': 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <Show when={props.listResource.loading}>
                <tr>
                  <td colspan="3" style={{ padding: '2rem', 'text-align': 'center' }}>Loading {props.itemName.toLowerCase()}s...</td>
                </tr>
              </Show>
              <For each={paginatedList()}>
                {(item) => (
                  <tr style={{ 'border-bottom': '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{item.id}</td>
                    <td style={{ padding: '1rem' }}>{item.name}</td>
                    <td style={{ padding: '1rem', 'text-align': 'right' }}>
                      <button style={{ 'margin-right': '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', 'border-radius': '4px' }} onClick={() => openEdit(item)}>Edit</button>
                      <button style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', 'border-radius': '4px' }} onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                )}
              </For>
              <Show when={!props.listResource.loading && filteredList().length === 0}>
                <tr>
                  <td colspan="3" style={{ padding: '2rem', 'text-align': 'center' }}>No {props.itemName.toLowerCase()}s found.</td>
                </tr>
              </Show>
            </tbody>
          </table>
        </div>

        <DataPagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
          showing={() => paginatedList().length}
          total={() => filteredList().length}
          itemLabel={props.itemName.toLowerCase() + 's'}
        />
      </div>
    </div>
  );
};

export default ReferenceDataList;
