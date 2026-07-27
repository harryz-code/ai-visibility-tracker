/**
 * Seed BNPL US demo into Postgres when DATABASE_URL is set.
 * Always prints fixture summary so the dashboard can run offline via src/lib/demo/data.ts.
 *
 * Usage: pnpm seed
 */
import "dotenv/config";
import { demoDataset } from "../src/lib/demo/data";

async function seedDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("No DATABASE_URL — skipping DB insert (fixture module is enough for UI).");
    return;
  }

  const { getDb } = await import("../src/db");
  const schema = await import("../src/db/schema");
  const db = getDb();

  const [category] = await db
    .insert(schema.categories)
    .values({
      name: demoDataset.category.name,
      market: demoDataset.category.market,
    })
    .returning();

  for (const b of demoDataset.brands) {
    await db.insert(schema.brands).values({
      name: b.name,
      aliases: b.aliases,
      domain: b.domain,
      categoryId: category.id,
    });
  }

  for (const p of demoDataset.prompts) {
    await db.insert(schema.prompts).values({
      categoryId: category.id,
      text: p.text,
      intentType: p.intentType,
      active: true,
    });
  }

  console.log(
    `Seeded category ${category.id} with ${demoDataset.brands.length} brands and ${demoDataset.prompts.length} prompts.`,
  );
}

async function main() {
  console.log("AVT demo seed");
  console.log(
    `Category: ${demoDataset.category.name} / ${demoDataset.category.market}`,
  );
  console.log(`Brands: ${demoDataset.brands.map((b) => b.name).join(", ")}`);
  console.log(`Prompts: ${demoDataset.prompts.length}`);
  console.log(
    `Tracked: ${demoDataset.trackedBrand} — overall models:`,
    demoDataset.perModel.map((m) => `${m.model}=${m.visibilityScore}`).join(" "),
  );
  await seedDb();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
