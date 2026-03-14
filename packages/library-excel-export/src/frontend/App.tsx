import { createSignal, onMount, For, Show } from 'solid-js';
import { trpc } from './trpc';
import type { ExportJobRecord } from 'library-data-layer';

export default function App() {
  const [jobs, setJobs] = createSignal<ExportJobRecord[]>([]);
  const [isRequesting, setIsRequesting] = createSignal(false);
  const [errorDetails, setErrorDetails] = createSignal<string | null>(null);

  const loadJobs = async () => {
    try {
      const result = await trpc.exports.list.query() as unknown as (Omit<ExportJobRecord, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string })[];
      setJobs(result.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) as unknown as ExportJobRecord[]);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const startExport = async () => {
    setIsRequesting(true);
    try {
      await trpc.exports.start.mutate();
      await loadJobs();
    } catch (error) {
      console.error('Failed to start export:', error);
      alert('Failed to start export');
    } finally {
      setIsRequesting(false);
    }
  };

  onMount(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  });

  return (
    <div class="bg-gray-100 min-h-screen p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Library Excel Export</h1>
          <p class="text-gray-600">Request and download excel exports of the library catalog.</p>
        </header>

        <main class="space-y-8">
          <section class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Request New Export</h2>
            <button 
              onClick={startExport}
              disabled={isRequesting()}
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {isRequesting() ? 'Requesting...' : 'Start Export'}
            </button>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Export Requests</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full table-auto">
                <thead>
                  <tr class="bg-gray-50 border-b">
                    <th class="px-4 py-2 text-left">Date</th>
                    <th class="px-4 py-2 text-left">Status</th>
                    <th class="px-4 py-2 text-left">Progress</th>
                    <th class="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={jobs()}>
                    {(job) => (
                      <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-3">{new Date(job.createdAt).toLocaleString()}</td>
                        <td class="px-4 py-3">
                          <span class={`px-2 py-1 rounded text-xs font-semibold ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                          <Show when={job.status === 'failed' && job.errorMessage}>
                            <div class="mt-1 text-xs text-red-600 italic">
                              {(job.errorMessage as string).length > 30 ? (job.errorMessage as string).substring(0, 30) + '...' : job.errorMessage}
                              <button 
                                onClick={() => setErrorDetails(job.errorMessage)}
                                class="text-blue-600 hover:underline ml-1 font-normal"
                              >
                                view
                              </button>
                            </div>
                          </Show>
                        </td>
                        <td class="px-4 py-3">
                          <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style={{ width: `${job.progress || 0}%` }}></div>
                          </div>
                          <span class="text-xs text-gray-500">{job.progress || 0}%</span>
                        </td>
                        <td class="px-4 py-3">
                          <Show when={job.status === 'completed'}>
                            <a href={`/download/${job.id}`} class="text-blue-600 hover:underline font-medium">Download</a>
                          </Show>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <Show when={errorDetails()}>
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div class="p-4 border-b flex justify-between items-center">
              <h3 class="text-lg font-bold text-red-700">Error Details</h3>
              <button onClick={() => setErrorDetails(null)} class="text-gray-500 hover:text-gray-700">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-6 overflow-y-auto">
              <pre class="bg-gray-50 p-4 rounded text-sm text-red-600 whitespace-pre-wrap font-mono">{errorDetails()}</pre>
            </div>
            <div class="p-4 border-t text-right">
              <button onClick={() => setErrorDetails(null)} class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">Close</button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
