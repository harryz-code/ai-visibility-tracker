import { inngest } from "../client";
import { judgeRun } from "@/lib/pipeline/judge-rollup";

export type WaveJudgeData = {
  runId: string;
};

/**
 * wave/judge — extract structured mentions for every completion in a run.
 * Idempotent: skips completions that already have an extraction.
 */
export const waveJudge = inngest.createFunction(
  {
    id: "wave-judge",
    retries: 2,
    triggers: [{ event: "wave/judge" }],
  },
  async ({ event, step }) => {
    const { runId } = event.data as WaveJudgeData;

    const result = await step.run("judge-run", () => judgeRun(runId));

    await step.sendEvent("trigger-rollup", {
      name: "wave/rollup",
      data: { runId },
    });

    return result;
  },
);
