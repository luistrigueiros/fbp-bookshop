import { createSignal, For, Show } from 'solid-js';

export interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  allGenres: Genre[] | undefined;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const GenreSelector = (props: GenreSelectorProps) => {
  const [query, setQuery] = createSignal('');
  const [open, setOpen] = createSignal(false);

  const selectedGenres = () =>
    (props.allGenres ?? []).filter((g) => props.selectedIds.includes(g.id));

  const suggestions = () => {
    const q = query().toLowerCase().trim();
    return (props.allGenres ?? []).filter(
      (g) => !props.selectedIds.includes(g.id) && (q === '' || g.name.toLowerCase().includes(q))
    );
  };

  const addGenre = (genre: Genre) => {
    props.onChange([...props.selectedIds, genre.id]);
    setQuery('');
    setOpen(false);
  };

  const removeGenre = (id: number) => {
    props.onChange(props.selectedIds.filter((gid) => gid !== id));
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
    <div class="genre-selector-wrapper">
      {/* Selected genre chips */}
      <div class="genre-chips-row">
        <For each={selectedGenres()}>
          {(genre) => (
            <span class="genre-tag">
              {genre.name}
              <button
                type="button"
                class="genre-tag-remove"
                onClick={() => removeGenre(genre.id)}
                aria-label={`Remove ${genre.name}`}
              >
                ×
              </button>
            </span>
          )}
        </For>
      </div>

      {/* Typeahead input */}
      <div class="genre-typeahead-wrapper">
        <input
          class="genre-typeahead"
          type="text"
          placeholder="Search genres to add…"
          value={query()}
          onInput={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <Show when={open() && suggestions().length > 0}>
          <ul class="genre-dropdown" role="listbox">
            <For each={suggestions()}>
              {(genre) => (
                <li
                  class="genre-dropdown-item"
                  role="option"
                  onMouseDown={() => addGenre(genre)}
                >
                  <span class="genre-dropdown-item-icon">+</span>
                  {genre.name}
                </li>
              )}
            </For>
          </ul>
        </Show>
        <Show when={open() && suggestions().length === 0 && query().length > 0}>
          <div class="genre-dropdown genre-dropdown-empty">No genres match "{query()}"</div>
        </Show>
      </div>
    </div>
  );
};

export default GenreSelector;
