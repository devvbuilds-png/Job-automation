/**
 * Intake orchestration (Phase 4). Runs each Apify source, pipes everything through
 * the cleaning pipeline, and returns a digest ("new since last run") for Screen 1.
 */
import { fetchSource, type SourceName } from "./apify";
import { runPipeline, type CandidateJob, type PipelineStats } from "@/lib/pipeline";
import type { JobRecord } from "@/lib/types";

export type IntakeDigest = {
  ranAt: string;
  sources: { source: string; fetched: number; error?: string }[];
  stats: PipelineStats;
  newJobs: { id: string; company: string; title: string; roleBucket?: string }[];
};

const ENABLED_SOURCES: SourceName[] = ["linkedin"];

export async function runAllIntake(
  opts: { maxItems?: number; sources?: SourceName[] } = {}
): Promise<IntakeDigest> {
  const maxItems = opts.maxItems ?? 25;
  const sources = opts.sources ?? ENABLED_SOURCES;

  const candidates: CandidateJob[] = [];
  const sourceReports: IntakeDigest["sources"] = [];

  for (const source of sources) {
    try {
      const fetched = await fetchSource(source, maxItems);
      candidates.push(...fetched);
      sourceReports.push({ source, fetched: fetched.length });
    } catch (err) {
      sourceReports.push({
        source,
        fetched: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const { added, stats } = await runPipeline(candidates);

  return {
    ranAt: new Date().toISOString(),
    sources: sourceReports,
    stats,
    newJobs: added.map((j: JobRecord) => ({
      id: j.id,
      company: j.company,
      title: j.title,
      roleBucket: j.roleBucket,
    })),
  };
}
