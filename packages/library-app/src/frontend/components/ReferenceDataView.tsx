import { createSignal, createResource, For, Show, createMemo } from 'solid-js';
import { trpc } from '@/frontend/trpc';
import { A, useNavigate } from '@solidjs/router';

interface ReferenceDataViewProps {
  title: string;
  itemName: string;
  listResource: any; // tRPC list query
  listWithCountsResource: any; // tRPC listWithCounts query
  deleteMutation: any; // tRPC delete mutation
  createMutation: any; // tRPC create mutation
  updateMutation: any; // tRPC update mutation
  refetchList: () => void;
  filterKey: 'genreId' | 'publisherId';
}

const ReferenceDataView = (props: ReferenceDataViewProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal(0);
  
  // Tab 1 state
  const [listFilter, setListFilter] = createSignal('');
  const [isAdding, setIsAdding] = createSignal(false);
  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [name, setName] = createSignal('');

  // Tab 2 state
  const [drillFilter, setDrillFilter] = createSignal('');
  const [page, setPage] = createSignal(0);
  const pageSize = 10;

  // Resources
  const filteredList = createMemo(() => {
    const list = props.listResource();
    if (!list) return [];
    if (!listFilter()) return list;
    return list.filter((item: any) => 
      item.name.toLowerCase().includes(listFilter().toLowerCase())
    );
  });

  const [drillData, { refetch: refetchDrill }] = createResource(
    () => ({ name: drillFilter(), limit: pageSize, offset: page() * pageSize }),
    async (params) => await props.listWithCountsResource.query(params)
  );


  const handleSave = async (e: Event) => {
    e.preventDefault();
    if (editingId()) {
      await props.updateMutation.mutate({ id: editingId()!, data: { name: name() } });
    } else {
      await props.createMutation.mutate({ name: name() });
    }
    props.refetchList();
    refetchDrill();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm(`Are you sure you want to delete this ${props.itemName.toLowerCase()}?`)) {
      await props.deleteMutation.mutate(id);
      props.refetchList();
      refetchDrill();
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

  const handleRowClick = (item: any) => {
    navigate(`/books?${props.filterKey}=${item.id}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '1rem' }}>
        <h2 style={{ margin: 0 }}>{props.title}</h2>
        <Show when={activeTab() === 0}>
          <button class="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => setIsAdding(true)}>
            Add {props.itemName}
          </button>
        </Show>
      </div>

      <div style={{ display: 'flex', 'margin-bottom': '1.5rem', 'border-bottom': '1px solid var(--border-color)' }}>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            cursor: 'pointer', 
            background: 'none', 
            border: 'none', 
            'border-bottom': activeTab() === 0 ? '2px solid var(--accent-color)' : 'none',
            color: activeTab() === 0 ? 'var(--accent-color)' : 'inherit',
            'font-weight': activeTab() === 0 ? 'bold' : 'normal'
          }}
          onClick={() => setActiveTab(0)}
        >
          List View
        </button>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            cursor: 'pointer', 
            background: 'none', 
            border: 'none', 
            'border-bottom': activeTab() === 1 ? '2px solid var(--accent-color)' : 'none',
            color: activeTab() === 1 ? 'var(--accent-color)' : 'inherit',
            'font-weight': activeTab() === 1 ? 'bold' : 'normal'
          }}
          onClick={() => setActiveTab(1)}
        >
          Drill Down
        </button>
      </div>

      <Show when={activeTab() === 0}>
        <Show when={isAdding()}>
          <form class="glass-panel" style={{ padding: '2rem', 'margin-bottom': '2rem' }} onSubmit={handleSave}>
            <div style={{ 'margin-bottom': '1rem' }}>
              <label>{props.itemName} Name</label>
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

        <div class="glass-panel" style={{ 'margin-bottom': '1rem', padding: '1rem' }}>
           <input 
            type="text" 
            placeholder={`Filter ${props.itemName.toLowerCase()}s...`} 
            style={{ width: '100%', padding: '0.5rem' }} 
            value={listFilter()} 
            onInput={(e) => setListFilter(e.target.value)}
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
                <For each={filteredList()}>
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
        </div>
      </Show>

      <Show when={activeTab() === 1}>
        <div class="glass-panel" style={{ 'margin-bottom': '1rem', padding: '1rem' }}>
           <input 
            type="text" 
            placeholder={`Filter ${props.itemName.toLowerCase()}s...`} 
            style={{ width: '100%', padding: '0.5rem' }} 
            value={drillFilter()} 
            onInput={(e) => { setDrillFilter(e.target.value); setPage(0); }}
          />
        </div>

        <div class="glass-panel" style={{ overflow: 'hidden', 'margin-bottom': '2rem' }}>
          <div class="table-responsive">
            <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--secondary-bg)', 'text-align': 'left' }}>
                  <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)' }}>{props.itemName}</th>
                  <th style={{ padding: '1rem', 'border-bottom': '1px solid var(--border-color)', 'text-align': 'right' }}>Books Count</th>
                </tr>
              </thead>
              <tbody>
                <Show when={drillData.loading}>
                  <tr>
                    <td colspan="2" style={{ padding: '2rem', 'text-align': 'center' }}>Loading...</td>
                  </tr>
                </Show>
                <For each={drillData()?.items}>
                  {(item) => (
                    <tr 
                      style={{ 
                        'border-bottom': '1px solid var(--border-color)', 
                        cursor: 'pointer'
                      }} 
                      onClick={() => handleRowClick(item)}
                    >
                      <td style={{ padding: '1rem' }}>{item.name}</td>
                      <td style={{ padding: '1rem', 'text-align': 'right' }}>{item.bookCount}</td>
                    </tr>
                  )}
                </For>
                <Show when={!drillData.loading && drillData()?.items.length === 0}>
                  <tr>
                    <td colspan="2" style={{ padding: '2rem', 'text-align': 'center' }}>No records found.</td>
                  </tr>
                </Show>
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', padding: '1rem', background: 'var(--secondary-bg)' }}>
            <button 
              disabled={page() === 0} 
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '0.5rem 1rem', cursor: page() === 0 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span>Page {page() + 1} of {Math.ceil((drillData()?.total || 0) / pageSize) || 1}</span>
            <button 
              disabled={(page() + 1) * pageSize >= (drillData()?.total || 0)} 
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '0.5rem 1rem', cursor: (page() + 1) * pageSize >= (drillData()?.total || 0) ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

      </Show>
    </div>
  );
};

export default ReferenceDataView;
