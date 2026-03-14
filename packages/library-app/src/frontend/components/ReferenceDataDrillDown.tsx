import { createSignal, createResource, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';

interface ReferenceDataDrillDownProps {
  itemName: string;
  listWithCountsResource: any;
  filterKey: 'genreId' | 'publisherId';
}

const ReferenceDataDrillDown = (props: ReferenceDataDrillDownProps) => {
  const navigate = useNavigate();
  const [drillFilter, setDrillFilter] = createSignal('');
  const [page, setPage] = createSignal(0);
  const pageSize = 10;

  const [drillData] = createResource(
    () => ({ name: drillFilter(), limit: pageSize, offset: page() * pageSize }),
    async (params) => await props.listWithCountsResource.query(params)
  );

  const handleRowClick = (item: any) => {
    navigate(`/books?${props.filterKey}=${item.id}`);
  };

  return (
    <div>
      <div class="glass-panel" style={{ 'margin-bottom': '1rem', padding: '1rem' }}>
         <input 
          type="text" 
          placeholder={`Filter ${props.itemName.toLowerCase()}s...`} 
          style={{ width: '100%', padding: '0.5rem' }} 
          value={drillFilter()} 
          onInput={(e) => { setDrillFilter(e.currentTarget.value); setPage(0); }}
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
    </div>
  );
};

export default ReferenceDataDrillDown;
