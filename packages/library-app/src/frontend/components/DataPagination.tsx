import { Accessor, Show } from 'solid-js';

interface DataPaginationProps {
  page: Accessor<number>;
  onPrevious: () => void;
  onNext: () => void;
  // Option A: total-pages mode (0-based page index by default)
  totalPages?: Accessor<number>;
  pageBase?: 0 | 1; // default 0; set to 1 if page is 1-based
  // Option B: has-more mode (1-based page index)
  hasMore?: Accessor<boolean>;
  showing?: Accessor<number>;
  total?: Accessor<number>;
  itemLabel?: string;
}

const DataPagination = (props: DataPaginationProps) => {
  const isTotalPagesMode = () => props.totalPages !== undefined;
  const base = () => props.pageBase ?? 0;

  const prevDisabled = () =>
    isTotalPagesMode() ? props.page() === base() : props.page() === 1;

  const nextDisabled = () =>
    isTotalPagesMode()
      ? props.page() >= props.totalPages!() - 1 + base()
      : !props.hasMore?.();

  const pageLabel = () =>
    isTotalPagesMode()
      ? `Page ${props.page() - base() + 1} of ${props.totalPages!()}`
      : `Page ${props.page()}`;

  const label = () => props.itemLabel ?? 'items';

  return (
    <div style={{ padding: '1rem', display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'border-top': '1px solid var(--border-color)' }}>
      <Show
        when={props.showing !== undefined && props.total !== undefined}
        fallback={<span />}
      >
        <div style={{ color: 'var(--text-secondary)', 'font-size': '0.9rem' }}>
          Showing {props.showing!()} of {props.total!()} {label()}
        </div>
      </Show>
      <div style={{ display: 'flex', gap: '0.5rem', 'align-items': 'center' }}>
        <button
          disabled={prevDisabled()}
          onClick={props.onPrevious}
          style={{ padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: prevDisabled() ? 'not-allowed' : 'pointer', opacity: prevDisabled() ? 0.5 : 1 }}
        >
          Previous
        </button>
        <span style={{ padding: '0 0.5rem', 'font-weight': 'bold' }}>{pageLabel()}</span>
        <button
          disabled={nextDisabled()}
          onClick={props.onNext}
          style={{ padding: '0.5rem 1rem', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 'border-radius': '4px', cursor: nextDisabled() ? 'not-allowed' : 'pointer', opacity: nextDisabled() ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataPagination;
