/**
 * Apply Drizzle SQL migrations to DATABASE_URL.
 * Usage: pnpm db:migrate
 *
 * RLS policies (apply manually in Supabase after migrate):
 * - workspace_members: SELECT where auth.uid()::text = user_id
 * - metrics_daily / brands: via workspace membership
 * - completions: service_role only
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required for migrations.");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
