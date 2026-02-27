import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "placeholder", // Not needed for local generation
    databaseId: "placeholder", // Not needed for local generation
    token: "placeholder", // Not needed for local generation
  },
});
