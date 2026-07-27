/**
 * Local fixture wave without Inngest/DB — validates fan-out math + model clients.
 * Usage: pnpm wave:demo
 */
import "dotenv/config";
import { ALL_MODELS, complete } from "../src/lib/models";

async function main() {
  const promptCount = Number(process.env.DEMO_PROMPTS ?? 3);
  const sampleN = Number(process.env.DEMO_SAMPLES ?? 2);
  const prompts = Array.from(
    { length: promptCount },
    (_, i) => `What is the best BNPL app for online shopping? (#${i + 1})`,
  );

  let totalCost = 0;
  let written = 0;
  const maxCost = Number(process.env.MAX_WAVE_COST_USD ?? 25);

  console.log(
    `wave:demo — ${prompts.length} prompts × ${ALL_MODELS.length} models × ${sampleN} samples`,
  );

  for (const prompt of prompts) {
    for (const model of ALL_MODELS) {
      for (let s = 1; s <= sampleN; s++) {
        if (totalCost >= maxCost) {
          console.log("Budget kill-switch hit; stopping.");
          return;
        }
        const result = await complete(model, { prompt }, s);
        totalCost += result.costUsd;
        written += 1;
        console.log(
          `  [${model} #${s}] ${result.fixture ? "fixture" : "live"} ${result.latencyMs}ms $${result.costUsd.toFixed(5)}`,
        );
      }
    }
  }

  console.log(`Done. ${written} completions, total cost $${totalCost.toFixed(4)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
