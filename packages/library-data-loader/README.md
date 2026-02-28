To run this project, you need to have a `.env` file (or use the one specified in `package.json`) with the following variable:
- `CLOUDFLARE_DATABASE_ID`: The ID of your D1 database.

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```


To upload the worker to Cloudflare:

```bash
 curl -X POST <WORKER_DEPLOY_URL>/upload -F "file=@test/FBP-DB.xlsx"
```