/**
 * Cleaning pipeline (Phase 4) — the trust layer. Every job from every source
 * passes through here before it is allowed into jobs.json.
 *
 * Order (cheap drops first, expensive network last):
 *   role filter → freshness → dedup (seen ledger + within-batch merge) → ghost → liveness
 *
 * Guards (historical failure points): never add a job already in seen.json; never
 * keep anything older than 21 days; flag reposts; never silently drop borderline
 * titles (they become roleBucket "maybe").
 */
import { getAllJobs, upsertJob, readSeenLedger, writeSeenLedger } from "@/lib/data";
import { computeId } from "./fingerprint";
import { classifyRole } from "./roleFilter";
import { isFresh } from "./freshness";
import { isLikelyRepost, recordRoleHistory } from "./ghost";
import { checkLiveness } from "@/lib/careerops/liveness";
import type { JobRecord, SeenLedger } from "@/lib/types";

/** What an intake source produces, pre-pipeline. postedDate already parsed to ISO. */
export type CandidateJob = {
  company: string;
  title: string;
  location: string;
  postedDate: string; // ISO
  applyUrl: string;
  platform: string;
  rawId?: string;
  jdText?: string;
};

export type PipelineStats = {
  received: number;
  droppedByRole: number;
  droppedByFreshness: number;
  duplicates: number;
  ghostsFlagged: number;
  added: number;
  maybeBucket: number;
};

export type PipelineResult = {
  added: JobRecord[];
  stats: PipelineStats;
};

// Source priority (high to low) for merge — highest-priority source's applyUrl wins.
const SOURCE_PRIORITY: Record<string, number> = {
  linkedin: 3,
  naukri: 2,
  wellfound: 1,
};
function priority(platform: string): number {
  return SOURCE_PRIORITY[platform.toLowerCase()] ?? 0;
}

type Surviving = {
  candidate: CandidateJob;
  bucket: "positive" | "maybe";
  id: string;
};

export async function runPipeline(
  candidates: CandidateJob[],
  opts: { checkLivenessFlag?: boolean } = {}
): Promise<PipelineResult> {
  // Default OFF for bulk intake: raw-fetching scraped LinkedIn apply URLs is
  // unreliable (LinkedIn 404s bots, company SPAs return empty bodies), and would
  // falsely mark fresh jobs expired. Fresh scraped jobs are presumed live
  // (`unknown`); the Job Description tab re-checks liveness per-job when Dev opens
  // it ("before a job is shown", per CLAUDE.md). Callers can opt in explicitly.
  const checkLivenessFlag = opts.checkLivenessFlag ?? false;
  const ledger: SeenLedger = readSeenLedger();
  const existing = getAllJobs();
  const existingIds = new Set(existing.map((j) => j.id));

  const stats: PipelineStats = {
    received: candidates.length,
    droppedByRole: 0,
    droppedByFreshness: 0,
    duplicates: 0,
    ghostsFlagged: 0,
    added: 0,
    maybeBucket: 0,
  };

  // Pass 1 — role + freshness + dedup, merging within-batch by fingerprint.
  const survivors = new Map<string, Surviving>();

  for (const c of candidates) {
    const verdict = classifyRole(c.title);
    if (verdict === "negative") {
      stats.droppedByRole++;
      continue;
    }

    if (!isFresh(c.postedDate)) {
      stats.droppedByFreshness++;
      continue;
    }

    const id = computeId(c.company, c.title, c.location);

    // Already in the ledger or the store → seen before, do not re-add.
    if (ledger.fingerprints.includes(id) || existingIds.has(id)) {
      stats.duplicates++;
      continue;
    }

    // Within-batch collision → keep the higher-priority source's applyUrl + merge.
    const prior = survivors.get(id);
    if (prior) {
      stats.duplicates++;
      if (priority(c.platform) > priority(prior.candidate.platform)) {
        prior.candidate.applyUrl = c.applyUrl;
        prior.candidate.platform = c.platform;
      }
      // positive beats maybe if any source classifies it positive
      if (verdict === "positive") prior.bucket = "positive";
      continue;
    }

    survivors.set(id, { candidate: c, bucket: verdict, id });
  }

  // Pass 2 — ghost flag + liveness + build records. Persist as we go.
  const added: JobRecord[] = [];
  const nowIso = new Date().toISOString();

  for (const { candidate: c, bucket, id } of survivors.values()) {
    const ghost = isLikelyRepost(c.company, c.title, ledger);
    if (ghost) stats.ghostsFlagged++;

    let liveness: JobRecord["liveness"] = "unknown";
    let livenessCheckedAt: string | undefined;
    if (checkLivenessFlag) {
      const r = await checkLiveness(c.applyUrl);
      liveness = r.liveness;
      livenessCheckedAt = r.checkedAt;
    }

    const record: JobRecord = {
      id,
      company: c.company,
      title: c.title,
      location: c.location,
      postedDate: c.postedDate,
      discoveredDate: nowIso,
      sources: [{ platform: c.platform, url: c.applyUrl, rawId: c.rawId }],
      applyUrl: c.applyUrl,
      tier: null,
      liveness,
      livenessCheckedAt,
      ghostFlag: ghost,
      roleBucket: bucket,
      status: "discovered",
      demoStatus: "none",
      followups: [],
      artifacts: c.jdText ? { jdText: c.jdText } : {},
    };

    upsertJob(record);
    added.push(record);

    // Update ledger
    ledger.fingerprints.push(id);
    if (!ledger.sourceIds[c.platform]) ledger.sourceIds[c.platform] = [];
    if (c.rawId) ledger.sourceIds[c.platform].push(c.rawId);
    recordRoleHistory(c.company, c.title, ledger);

    if (bucket === "maybe") stats.maybeBucket++;
  }

  stats.added = added.length;
  writeSeenLedger(ledger);

  return { added, stats };
}
