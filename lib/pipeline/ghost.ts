/**
 * Ghost / repost detection (Phase 4).
 *
 * career-ops's ghost-detection (oferta.md Block G, _shared.md legitimacy signals)
 * is mostly LLM-qualitative: description quality, requirements realism, layoff news.
 * The one signal computable deterministically in a pipeline is REPOSTING: the same
 * company+title surfacing again as a "fresh" posting. That is what we lift here.
 *
 * We track normalized "company|title" counts in the seen ledger (roleHistory). When
 * a posting's company+title has been seen in a prior run but arrives with a new
 * fingerprint (e.g. new posting ID / relisted), we flag it. The richer qualitative
 * signals are deferred (they belong with the LLM, not the deterministic pipeline).
 *
 * Flag, never drop — surface as a badge so Dev decides. Do not silently trust a
 * fresh date on a repeatedly-reposted role.
 */
import type { SeenLedger } from "@/lib/types";

export function roleHistoryKey(company: string, title: string): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${norm(company)}|${norm(title)}`;
}

/**
 * Returns true if this company+title has been seen before (a repost signal).
 * Does not mutate the ledger — the pipeline records history after classifying.
 */
export function isLikelyRepost(
  company: string,
  title: string,
  ledger: SeenLedger
): boolean {
  const key = roleHistoryKey(company, title);
  const seenCount = ledger.roleHistory?.[key] ?? 0;
  return seenCount >= 1;
}

/** Increment the company+title counter in the ledger (mutates). */
export function recordRoleHistory(
  company: string,
  title: string,
  ledger: SeenLedger
): void {
  if (!ledger.roleHistory) ledger.roleHistory = {};
  const key = roleHistoryKey(company, title);
  ledger.roleHistory[key] = (ledger.roleHistory[key] ?? 0) + 1;
}
