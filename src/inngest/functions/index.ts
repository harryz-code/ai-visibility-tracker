import { waveStart, waveSample } from "./wave";
import { waveJudge } from "./judge";
import { waveRollup } from "./rollup";
import { digestWeekly } from "./digest";
import { alertsScan } from "./alerts";

export { waveStart, waveSample, waveJudge, waveRollup, digestWeekly, alertsScan };

export const inngestFunctions = [
  waveStart,
  waveSample,
  waveJudge,
  waveRollup,
  digestWeekly,
  alertsScan,
];
