/**
 * Freshness filter (Phase 4) — hard 21-day cutoff at intake.
 *
 * One of the historical failure points: stale listings reaching the list. Relative
 * dates ("2 weeks ago") are parsed to real dates first (parseRelativeDate lives in
 * fingerprint.ts and is reused by the Apify mappers before this runs).
 */

const MAX_AGE_DAYS = 21;

export function ageInDays(postedDateIso: string): number {
  const posted = new Date(postedDateIso);
  if (isNaN(posted.getTime())) return Infinity; // unparseable → treat as stale
  const ms = Date.now() - posted.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function isFresh(postedDateIso: string): boolean {
  const age = ageInDays(postedDateIso);
  // Allow small negative skew (future-dated by a day from TZ differences).
  return age <= MAX_AGE_DAYS && age >= -1;
}
