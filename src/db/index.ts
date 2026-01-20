import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// This creates a singleton connection pool
// We use 'postgres' driver because it works great locally with Bun
const client = postgres(
  process.env.DATABASE_URL ||
    "postgres://postgres:password@localhost:5432/travel_db",
);

export const db = drizzle(client, { schema });
