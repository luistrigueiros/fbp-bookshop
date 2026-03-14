import type {Context} from "hono";

import {ExportEnv} from "@/types";

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

<!-- Modal -->
<div id="errorModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div class="p-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-bold text-red-700">Error Details</h3>
            <button id="closeModal" class="text-gray-500 hover:text-gray-700">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <pre id="errorDetail" class="bg-gray-50 p-4 rounded text-sm text-red-600 whitespace-pre-wrap font-mono"></pre>
        </div>
        <div class="p-4 border-t text-right">
            <button id="closeBtn" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">Close</button>
        </div>
    </div>
</div>

<script>
const exportBtn = document.getElementById('exportBtn');
const jobsList = document.getElementById('jobsList');
const errorModal = document.getElementById('errorModal');
const errorDetail = document.getElementById('errorDetail');
const closeModal = document.getElementById('closeModal');
const closeBtn = document.getElementById('closeBtn');

function showModal(error) {
    errorDetail.textContent = error;
    errorModal.classList.remove('hidden');
}

function hideModal() {
    errorModal.classList.add('hidden');
}

closeModal.onclick = hideModal;
closeBtn.onclick = hideModal;
window.onclick = (event) => {
    if (event.target === errorModal) hideModal();
};

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
        const isFailed = job.status === 'failed';
        const errorMsg = job.errorMessage || job.error;
        
        let statusHtml = \`
            <span class="px-2 py-1 rounded text-xs font-semibold \${
                job.status === 'completed' ? 'bg-green-100 text-green-800' : 
                job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }">\${job.status}</span>
        \`;

        if (isFailed && errorMsg) {
            const shortError = errorMsg.length > 30 ? errorMsg.substring(0, 30) + '...' : errorMsg;
            statusHtml += \`
                <div class="mt-1 text-xs text-red-600 italic">
                    \${shortError}
                    <button class="text-blue-600 hover:underline ml-1 font-normal view-error" data-error="\${encodeURIComponent(errorMsg)}">view</button>
                </div>
            \`;
        }
        
        row.innerHTML = \`
            <td class="px-4 py-3">\${date}</td>
            <td class="px-4 py-3">\${statusHtml}</td>
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

    document.querySelectorAll('.view-error').forEach(btn => {
        btn.onclick = (e) => {
            const errorText = decodeURIComponent(e.target.getAttribute('data-error'));
            showModal(errorText);
        };
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

export const landingPage = async (_: Context<{ Bindings: ExportEnv }>) => {
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
