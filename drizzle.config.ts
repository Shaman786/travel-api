import { defineConfig } from "drizzle-kit";

// Use process.env for local tools like drizzle-kit
// (It reads .dev.vars automatically if you use `bun --env-file=.dev.vars` or we can just hardcode for the migration script)

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // This points to your LOCAL Docker Postgres
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:password@localhost:5432/travel_db",
  },
});
