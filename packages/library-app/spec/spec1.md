In this subpackage create the API layer for the library app.
This API will expose the necessary endpoints to interact with the library.
It will leverage the subpackage library-data-layer to interact with the database.
This will be deployed as Cloudflare worker with a similar setup as the library-data-loader subpackage.
Again, Bun.js will be used for development and deployment using TypeScript.
Use https://trpc.io/ for the api layer take the openapi.yaml as reference for the endpoints, discard the implementaion of the /api/scan openapi endpoint for now.
Create tests for the API layer, follow the similar pattern of the library-data-loader subpackage for the tests setup leaveraging the subpackage library-test-utils for the test setup.
