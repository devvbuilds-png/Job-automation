/**
 * Role-title filter (Phase 4) — the authoritative intake gate.
 *
 * Apify search is fuzzy and returns noise; this is what actually decides what
 * reaches the list. Per CLAUDE.md:
 *   - positive → auto-ingest
 *   - negative → drop
 *   - maybe    → ingest but flag for Dev's review (never silently dropped)
 *
 * Negative is checked BEFORE positive so a senior/lead modifier wins over a
 * matching base title (e.g. "Senior Product Manager" → negative, not positive).
 */

export type RoleVerdict = "positive" | "negative" | "maybe";

// Seniority / function modifiers that disqualify regardless of the base title.
const NEGATIVE_PATTERNS: RegExp[] = [
  /\bproject manager\b/i,
  /\bprogram manager\b/i,
  /\bproduct marketing\b/i,
  /\bproduct design(er)?\b/i,
  /\bengineering manager\b/i,
  /\b(senior|sr\.?|lead|principal|staff|director|head of|vp|vice president|chief)\b/i,
  /\bsales\b/i,
  /\bproduct analyst\b/i, // dropped from positive per CLAUDE.md
];

// Target titles that auto-ingest.
const POSITIVE_PATTERNS: RegExp[] = [
  /\bassociate product manager\b/i,
  /\bapm\b/i,
  /\bproduct intern\b/i,
  /\bproduct\s+management\s+intern\b/i,
  /\bfounding (product manager|pm)\b/i,
  /\bfounder'?s office\b/i,
  /\bai apm\b/i,
  /\bai associate product manager\b/i,
  /\bproduct builder\b/i,
  /\bgrowth (product manager|pm)\b/i, // entry growth PM — entry-ness checked at maybe stage too
];

// Borderline: plain or entry "Product Manager" → Maybe (PM usually needs prior APM).
const MAYBE_PATTERNS: RegExp[] = [
  /\bproduct manager\b/i,
  /\bproduct owner\b/i,
];

export function classifyRole(title: string): RoleVerdict {
  const t = title.trim();
  if (!t) return "maybe"; // empty/unknown title — never silently drop

  if (NEGATIVE_PATTERNS.some((p) => p.test(t))) return "negative";
  if (POSITIVE_PATTERNS.some((p) => p.test(t))) return "positive";
  if (MAYBE_PATTERNS.some((p) => p.test(t))) return "maybe";

  // Title mentions "product" but matched nothing above → borderline, not dropped.
  if (/\bproduct\b/i.test(t)) return "maybe";

  return "negative";
}
