import { createSignal, For, Show } from 'solid-js';

export interface Publisher {
  id: number;
  name: string;
}

interface PublisherSelectorProps {
  allPublishers: Publisher[] | undefined;
  selectedId: number | null | undefined;
  onChange: (id: number | null) => void;
}

const PublisherSelector = (props: PublisherSelectorProps) => {
  const [query, setQuery] = createSignal('');
  const [open, setOpen] = createSignal(false);

  const selectedPublisher = () =>
    (props.allPublishers ?? []).find((p) => p.id === props.selectedId);

  const suggestions = () => {
    const q = query().toLowerCase().trim();
    return (props.allPublishers ?? []).filter(
      (p) => p.id !== props.selectedId && (q === '' || p.name.toLowerCase().includes(q))
    );
  };

  const selectPublisher = (publisher: Publisher) => {
    const currentPublisher = selectedPublisher();
    
    if (currentPublisher) {
      const confirmed = window.confirm(
        `The current book will be associated with the new publisher "${publisher.name}" and it moving from the previous publisher "${currentPublisher.name}".\n\nDo you want to continue?`
      );
      if (!confirmed) {
        setQuery('');
        setOpen(false);
        return;
      }
    }

    props.onChange(publisher.id);
    setQuery('');
    setOpen(false);
  };

  const removePublisher = () => {
    props.onChange(null);
  };

  const handleInput = (e: InputEvent & { target: HTMLInputElement }) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div class="entity-selector-wrapper">
      {/* Selected publisher chip */}
      <div class="entity-chips-row">
        <Show when={selectedPublisher()}>
          {(pub) => (
            <span class="entity-tag">
              {pub().name}
              <button
                type="button"
                class="entity-tag-remove"
                onClick={removePublisher}
                aria-label={`Remove ${pub().name}`}
              >
                ×
              </button>
            </span>
          )}
        </Show>
      </div>

      {/* Typeahead input */}
      <div class="entity-typeahead-wrapper">
        <input
          class="entity-typeahead"
          type="text"
          placeholder="Search publishers..."
          value={query()}
          onInput={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <Show when={open() && suggestions().length > 0}>
          <ul class="entity-dropdown" role="listbox">
            <For each={suggestions()}>
              {(pub) => (
                <li
                  class="entity-dropdown-item"
                  role="option"
                  onMouseDown={() => selectPublisher(pub)}
                >
                  <span class="entity-dropdown-item-icon">+</span>
                  {pub.name}
                </li>
              )}
            </For>
          </ul>
        </Show>
        <Show when={open() && suggestions().length === 0 && query().length > 0}>
          <div class="entity-dropdown entity-dropdown-empty">No publishers match "{query()}"</div>
        </Show>
      </div>
    </div>
  );
};

export default PublisherSelector;
