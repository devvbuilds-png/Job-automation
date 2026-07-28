/**
 * Apify intake (Phase 4) — the v1 automated source. Organic, company-agnostic:
 * we pass target ROLE keywords + India to each actor; the pipeline's role filter
 * is the authoritative gate (Apify search is fuzzy and returns noise).
 *
 * Actor input/output schemas were confirmed against live runs (see PROGRESS.md).
 * LinkedIn = harvestapi/linkedin-job-search (no cookies, pay-per-event).
 */
import { ApifyClient } from "apify-client";
import { parseRelativeDate } from "@/lib/pipeline/fingerprint";
import type { CandidateJob } from "@/lib/pipeline";

// Target role search terms passed to actors (one query per title × location).
export const ROLE_KEYWORDS = [
  "Associate Product Manager",
  "APM",
  "Product Intern",
  "Product Builder",
  "Founding Product Manager",
  "AI APM",
  "Growth Product Manager",
];

const LOCATION = "India";

export function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not set in .env.local");
  return new ApifyClient({ token });
}

// ── field helpers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function str(v: any): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function firstLine(s: string): string {
  return s.split("\n")[0]?.trim() ?? "";
}

// ── LinkedIn (harvestapi/linkedin-job-search) — schema confirmed via live run ────

const LINKEDIN_ACTOR =
  process.env.APIFY_LINKEDIN_ACTOR ?? "harvestapi/linkedin-job-search";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLinkedInItem(item: any): CandidateJob | null {
  const title = str(item.title).trim();
  if (!title) return null;

  // Company: object with .name, else universalName, else header caption first line
  const company =
    str(item.company?.name).trim() ||
    str(item.company?.universalName).trim() ||
    firstLine(str(item.headerCaptionText)) ||
    "Unknown Company";

  const location =
    str(item.location?.linkedinText).trim() ||
    str(item.location?.parsed?.text).trim() ||
    LOCATION;

  // postedDate is already ISO from this actor; parseRelativeDate is a safe fallback
  const postedRaw = str(item.postedDate).trim();
  const postedDate = postedRaw
    ? (isNaN(Date.parse(postedRaw)) ? parseRelativeDate(postedRaw) : new Date(postedRaw).toISOString())
    : new Date().toISOString();

  // Prefer the real company apply URL over the LinkedIn view URL
  const applyUrl =
    str(item.applyMethod?.companyApplyUrl).trim() ||
    str(item.easyApplyUrl).trim() ||
    str(item.linkedinUrl).trim();
  if (!applyUrl) return null;

  return {
    company,
    title,
    location,
    postedDate,
    applyUrl,
    platform: "LinkedIn",
    rawId: str(item.id) || undefined,
    jdText: str(item.descriptionText).trim() || undefined,
  };
}

export async function fetchLinkedIn(maxItemsPerQuery = 25): Promise<CandidateJob[]> {
  const client = getApifyClient();
  const run = await client.actor(LINKEDIN_ACTOR).call({
    jobTitles: ROLE_KEYWORDS,
    locations: [LOCATION],
    maxItems: maxItemsPerQuery,
    postedLimit: "month", // pipeline still enforces the hard 21-day cut
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const mapped: CandidateJob[] = [];
  for (const it of items) {
    const c = mapLinkedInItem(it);
    if (c) mapped.push(c);
  }
  return mapped;
}

// ── source registry ──────────────────────────────────────────────────────────
// Naukri + Wellfound are wired the same way once their schemas are probed (see
// PROGRESS.md). LinkedIn is the confirmed v1 source.

export type SourceName = "linkedin"; // | "naukri" | "wellfound" (pending schema probe)

export async function fetchSource(
  source: SourceName,
  maxItems = 25
): Promise<CandidateJob[]> {
  switch (source) {
    case "linkedin":
      return fetchLinkedIn(maxItems);
    default:
      return [];
  }
}
