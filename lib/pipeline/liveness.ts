/**
 * Pipeline liveness — now delegates to career-ops's vendored classification engine
 * (lib/careerops/liveness-core.mjs) via the wrapper in lib/careerops/liveness.ts.
 *
 * This file keeps the same exported API that the Phase 3 routes and the Phase 4
 * pipeline call, so swapping our homemade fetch-and-string-match logic for
 * career-ops's proven engine required no caller changes.
 */
import { updateJobFields } from "@/lib/data";
import { checkLiveness as careeropsCheck, type LivenessResult } from "@/lib/careerops/liveness";

export type { LivenessResult };

export async function checkLiveness(applyUrl: string): Promise<LivenessResult> {
  return careeropsCheck(applyUrl);
}

export async function checkAndPersistLiveness(
  jobId: string,
  applyUrl: string
): Promise<LivenessResult> {
  const result = await checkLiveness(applyUrl);
  updateJobFields(jobId, {
    liveness: result.liveness,
    livenessCheckedAt: result.checkedAt,
  });
  return result;
}
