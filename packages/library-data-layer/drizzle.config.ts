import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "placeholder",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || "placeholder",
    token: process.env.CLOUDFLARE_D1_TOKEN || "placeholder",
  },
});
