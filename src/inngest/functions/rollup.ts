import { inngest } from "../client";
import { rollupRunToMetrics } from "@/lib/pipeline/judge-rollup";

export type WaveRollupData = {
  runId: string;
  date?: string;
};

/**
 * wave/rollup — roll up a run's extractions into metrics_daily
 * (Wilson CIs, share of voice, citation share). Upserts, so safe to re-run.
 */
export const waveRollup = inngest.createFunction(
  {
    id: "wave-rollup",
    retries: 2,
    triggers: [{ event: "wave/rollup" }],
  },
  async ({ event, step }) => {
    const { runId, date } = event.data as WaveRollupData;
    return step.run("rollup-run", () => rollupRunToMetrics(runId, date));
  },
);
