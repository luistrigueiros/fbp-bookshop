import { createSignal, createEffect, For, Show } from 'solid-js';
import { trpc } from '@/frontend/trpc';

// tRPC serialises Date → string over the wire, so we use a local type
type MediaItem = {
  id: number;
  bookId: number;
  mediaType: string;
  mediaCategory: string;
  r2Key: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  thumbnailKey: string | null;
  displayOrder: number | null;
  isPrimary: boolean | null;
  description: string | null;
  uploadedAt: string | Date;
  duration: number | null;
  url: string;
  thumbnailUrl: string | null;
};

interface BookMediaGalleryProps {
  bookId: number;
  editMode?: boolean;
  onDeleted?: (id: number) => void;
  refreshKey?: number;
}

const BookMediaGallery = (props: BookMediaGalleryProps) => {
  const [media, setMedia] = createSignal<MediaItem[]>([]);
  const [lightboxUrl, setLightboxUrl] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const result = await trpc.bookMedia.getByBook.query({ bookId: props.bookId });
      setMedia(result as MediaItem[]);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    // Re-fetch whenever refreshKey changes (or on initial mount)
    void props.refreshKey;
    void fetchMedia();
  });

  const primaryCover = () =>
    media().find((m) => m.mediaCategory === 'cover' && m.isPrimary);

  const remainingItems = () => {
    const primary = primaryCover();
    return media().filter((m) => !primary || m.id !== primary.id);
  };

  const handleDelete = async (id: number) => {
    await trpc.bookMedia.delete.mutate({ id });
    setMedia((prev) => prev.filter((m) => m.id !== id));
    props.onDeleted?.(id);
  };

  return (
    <div>
      <Show when={loading()}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading media...</p>
      </Show>

      <Show when={!loading() && media().length === 0}>
        <p style={{ color: 'var(--text-secondary)', 'font-style': 'italic' }}>No media available for this book.</p>
      </Show>

      <Show when={!loading() && media().length > 0}>
        {/* Primary cover */}
        <Show when={primaryCover()}>
          {(cover) => (
            <div style={{ 'margin-bottom': '1.5rem', 'text-align': 'center', position: 'relative', display: 'inline-block' }}>
              <img
                src={cover().thumbnailUrl ?? cover().url}
                alt={cover().description ?? 'Primary cover'}
                style={{
                  'max-width': '300px',
                  'max-height': '400px',
                  'border-radius': '8px',
                  'box-shadow': '0 4px 16px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  display: 'block',
                  margin: '0 auto',
                }}
                onClick={() => setLightboxUrl(cover().url)}
              />
              <Show when={props.editMode}>
                <button
                  onClick={() => handleDelete(cover().id)}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    'border-radius': '4px',
                    padding: '0.2rem 0.5rem',
                    cursor: 'pointer',
                    'font-size': '0.75rem',
                  }}
                >
                  Delete
                </button>
              </Show>
            </div>
          )}
        </Show>

        {/* Thumbnail grid for remaining items */}
        <div
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <For each={remainingItems()}>
            {(item) => (
              <div style={{ position: 'relative' }}>
                <Show when={item.mediaType === 'image'}>
                  <img
                    src={item.thumbnailUrl ?? item.url}
                    alt={item.description ?? item.fileName}
                    style={{
                      width: '100%',
                      'aspect-ratio': '1',
                      'object-fit': 'cover',
                      'border-radius': '6px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                    }}
                    onClick={() => setLightboxUrl(item.url)}
                  />
                </Show>
                <Show when={item.mediaType === 'video'}>
                  <video
                    controls
                    src={item.url}
                    style={{
                      width: '100%',
                      'border-radius': '6px',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                </Show>
                <Show when={props.editMode}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      'border-radius': '4px',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                      'font-size': '0.75rem',
                    }}
                  >
                    Delete
                  </button>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Lightbox */}
      <Show when={lightboxUrl()}>
        <div
          style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'z-index': 1000,
            cursor: 'pointer',
          }}
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl()!}
            alt="Full size"
            style={{
              'max-width': '90vw',
              'max-height': '90vh',
              'object-fit': 'contain',
              'border-radius': '8px',
              'box-shadow': '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              'border-radius': '50%',
              width: '2.5rem',
              height: '2.5rem',
              'font-size': '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
            }}
            onClick={() => setLightboxUrl(null)}
          >
            ✕
          </button>
        </div>
      </Show>
    </div>
  );
};

export default BookMediaGallery;
