import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/avt";

/** Lazy client — safe to import when DATABASE_URL is unset (fixture/demo mode). */
let _client: ReturnType<typeof postgres> | null = null;

function getClient() {
  if (!_client) {
    _client = postgres(connectionString, { max: 10, prepare: false });
  }
  return _client;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export type Db = ReturnType<typeof getDb>;
