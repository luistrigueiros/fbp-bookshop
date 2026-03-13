This is a specification file for the Excel export feature of the library management system.
This a subpackage of the library management system, it is used to export the library data to an Excel file.
This package should be used as a dependency by the library management system and it needs to follow the same patterns as the rest of the system, that is being built using Bun.js and TypeScript.
It should leverage the existing data models and services from the [library-data-layer](../../library-data-layer/README.md) package by using as a dependency.
In the end this subpackage should be used as a dependency by the [library-app](../../library-app/README.md) or another Cloudflare worker dedicated to perform the export functionality.
Because of the CPU limits of Cloudflare workers in the free tier, this package should implement a chunked export pattern, using durable objects to store the chunks of the export file and a queue to process the chunks.
The source of the data is a D1 database, altough it is not huge and it will grow over time, so the export process should be able to handle this growth.
Not sure about the best way to implement this, but I think it should be a worker that is triggered by a user request, that will create a job and enqueue it to a queue, then a worker will process the queue and generate the export file, and finally a worker will download the file and return it to the user.
As such it may be required to add additional table in the [library-data-layer](../../library-data-layer) to keep track of the export job status and progress, allowing in future to display this status in the UI of the [library-app](../../library-app).

The contents that I a looking to export are the following:

1 - A list of all books in the library, in the first tab of the Excel file.
2 - A list of the genres in the library in the second tab 
3 - A list of the publishers in the library in the third tab 

Im the first tab the books should have linking reference to the second and third tab, so that the user can click on a genre or publisher and be taken to the corresponding tab.

I am new to Cloudflare workers and Durable Objects, so I am not sure about the best way to implement this.

Not user if this could be implemented by leveraging existing libraries or if it needs to be implemented from scratch.
Existing libraries to consider: 

1 - https://github.com/exceljs/exceljs
2 - https://slingdata.io/articles/export-d1-to-local-csv-json-parquet/
3 - https://www.npmjs.com/package/dofs


