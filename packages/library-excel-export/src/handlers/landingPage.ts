import type {Context} from "hono";
import type {Env} from "@/assembler";

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Library Excel Export</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">
<div class="max-w-4xl mx-auto">
<header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800">Library Excel Export</h1>
    <p class="text-gray-600">Request and download excel exports of the library catalog.</p>
</header>

<main class="space-y-8">
    <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Request New Export</h2>
        <button id="exportBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
            Start Export
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
                <tbody id="jobsList">
                    <!-- Jobs will be loaded here -->
                </tbody>
            </table>
        </div>
    </section>
</main>
</div>

<script>
const exportBtn = document.getElementById('exportBtn');
const jobsList = document.getElementById('jobsList');

async function loadJobs() {
    const res = await fetch('/status');
    const jobs = await res.json();
    jobsList.innerHTML = '';
    
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(job => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        
        const date = new Date(job.createdAt).toLocaleString();
        const progress = job.progress || 0;
        const isCompleted = job.status === 'completed';
        
        row.innerHTML = \`
            <td class="px-4 py-3">\${date}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs font-semibold \${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }">\${job.status}</span>
            </td>
            <td class="px-4 py-3">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: \${progress}%"></div>
                </div>
                <span class="text-xs text-gray-500">\${progress}%</span>
            </td>
            <td class="px-4 py-3">
                \${isCompleted ? \`<a href="/download/\${job.id}" class="text-blue-600 hover:underline font-medium">Download</a>\` : ''}
            </td>
        \`;
        jobsList.appendChild(row);
    });
}

exportBtn.onclick = async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Requesting...';
    try {
        await fetch('/export', { method: 'POST' });
        await loadJobs();
    } finally {
        exportBtn.disabled = false;
        exportBtn.textContent = 'Start Export';
    }
};

loadJobs();
setInterval(loadJobs, 5000);
</script>
</body>
</html>
`;

export const landingPage = async (_: Context<{ Bindings: Env }>) => {
    const headers = new Headers();
    headers.set("Content-Type", "text/html");
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");


    return new Response(
        htmlContent
        , {
        status: 200,
        headers
    });

}
