export const landingPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Library Data Loader</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f4f9;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 { margin-bottom: 1.5rem; color: #333; }
        form { display: flex; flex-direction: column; gap: 1rem; }
        input[type="file"] { border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px; }
        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }
        button:hover { background-color: #0056b3; }
        #message { margin-top: 1rem; font-size: 0.9rem; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Upload Excel File</h1>
        <form id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="file" accept=".xlsx, .xls" required>
            <button type="submit">Upload</button>
        </form>
        <div id="message"></div>
    </div>

    <script>
        const form = document.getElementById('uploadForm');
        const messageDiv = document.getElementById('message');

        form.onsubmit = async (e) => {
            e.preventDefault();
            messageDiv.textContent = 'Uploading...';
            messageDiv.className = '';

            const formData = new FormData(form);
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    messageDiv.textContent = 'Success: ' + JSON.stringify(result);
                    messageDiv.className = 'success';
                } else {
                    messageDiv.textContent = 'Error: ' + (result.error || 'Upload failed');
                    messageDiv.className = 'error';
                }
            } catch (error) {
                messageDiv.textContent = 'Error: ' + error.message;
                messageDiv.className = 'error';
            }
        };
    </script>
</body>
</html>
`
