import { createSignal, createResource, Show } from 'solid-js';
import ReferenceDataList from './ReferenceDataList';
import ReferenceDataDrillDown from './ReferenceDataDrillDown';

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
  const [activeTab, setActiveTab] = createSignal(0);

  // For refetching drill down when list changes
  const [, { refetch: refetchDrill }] = createResource(
    () => ({ name: '', limit: 1, offset: 0 }),
    async (params) => await props.listWithCountsResource.query(params)
  );

  return (
    <div>
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '1rem' }}>
        <h2 style={{ margin: 0 }}>{props.title}</h2>
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
        <ReferenceDataList 
          itemName={props.itemName}
          listResource={props.listResource}
          deleteMutation={props.deleteMutation}
          updateMutation={props.updateMutation}
          createMutation={props.createMutation}
          refetchList={props.refetchList}
          refetchDrill={() => refetchDrill()}
        />
      </Show>

      <Show when={activeTab() === 1}>
        <ReferenceDataDrillDown 
          itemName={props.itemName}
          listWithCountsResource={props.listWithCountsResource}
          filterKey={props.filterKey}
        />
      </Show>
    </div>
  );
};

export default ReferenceDataView;
