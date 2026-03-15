import { createSignal, Show } from 'solid-js';

interface BookMediaUploadProps {
  bookId: number;
  onUploaded?: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const BookMediaUpload = (props: BookMediaUploadProps) => {
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [mediaCategory, setMediaCategory] = createSignal('cover');
  const [description, setDescription] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleFileChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const file = selectedFile();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaCategory', mediaCategory());
    if (description()) {
      formData.append('description', description());
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/books/${props.bookId}/media`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        setDescription('');
        props.onUploaded?.();
      } else {
        const body = await res.json<{ error?: string }>();
        setError(body.error ?? 'Upload failed');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', 'flex-direction': 'column', gap: '0.75rem' }}>
      <div>
        <label style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': '500' }}>
          File
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          required
        />
        <Show when={selectedFile()}>
          {(file) => (
            <p style={{ margin: '0.25rem 0 0', 'font-size': '0.85rem', color: 'var(--text-secondary)' }}>
              {file().name} — {formatFileSize(file().size)}
            </p>
          )}
        </Show>
      </div>

      <div>
        <label style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': '500' }}>
          Category
        </label>
        <select
          value={mediaCategory()}
          onChange={(e) => setMediaCategory(e.currentTarget.value)}
          style={{ padding: '0.4rem 0.6rem', 'border-radius': '4px', border: '1px solid var(--border-color)' }}
        >
          <option value="cover">Cover</option>
          <option value="back_cover">Back Cover</option>
          <option value="promotional">Promotional</option>
          <option value="interview">Interview</option>
          <option value="event">Event</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': '500' }}>
          Description (optional)
        </label>
        <input
          type="text"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Enter a description..."
          style={{ width: '100%', padding: '0.4rem 0.6rem', 'border-radius': '4px', border: '1px solid var(--border-color)', 'box-sizing': 'border-box' }}
        />
      </div>

      <Show when={error()}>
        <p style={{ color: '#ef4444', margin: 0, 'font-size': '0.9rem' }}>{error()}</p>
      </Show>

      <button
        type="submit"
        disabled={loading() || !selectedFile()}
        style={{
          padding: '0.5rem 1.25rem',
          'border-radius': '4px',
          border: 'none',
          background: loading() ? 'var(--text-secondary)' : 'var(--accent-color, #3b82f6)',
          color: 'white',
          cursor: loading() || !selectedFile() ? 'not-allowed' : 'pointer',
          'align-self': 'flex-start',
          opacity: loading() || !selectedFile() ? '0.7' : '1',
        }}
      >
        {loading() ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
};

export default BookMediaUpload;
