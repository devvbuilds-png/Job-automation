import * as cheerio from "cheerio";
import { computeId, parseRelativeDate } from "@/lib/pipeline/fingerprint";
import type { JobRecord } from "@/lib/types";

interface Extracted {
  company: string;
  title: string;
  location: string;
  postedDate: string;
  jdText: string;
  platform: string;
}

// ── block-aware text extraction ───────────────────────────────────────────────

const BLOCK_TAGS = new Set([
  "p","h1","h2","h3","h4","h5","h6","li","div","section","article",
  "tr","td","th","blockquote","pre","header","footer","nav","aside",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>): string {
  let out = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root.contents().each((_: number, node: any) => {
    if (node.type === "text") {
      out += node.data ?? "";
    } else if (node.type === "tag" || node.type === "script" || node.type === "style") {
      const tag: string = (node.name ?? "").toLowerCase();
      if (tag === "br") { out += "\n"; return; }
      if (tag === "script" || tag === "style") return;
      const inner = extractText($, $(node)).trim();
      if (!inner) return;
      if (BLOCK_TAGS.has(tag)) {
        out += `\n${inner}\n`;
      } else {
        out += inner;
      }
    }
  });

  // Collapse runs of 3+ newlines → 2, trim leading/trailing whitespace per line
  return out
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── fetcher ───────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ── platform-specific extractors ──────────────────────────────────────────────

function extractGreenhouse(
  $: cheerio.CheerioAPI,
  url: string
): Extracted {
  const title =
    $("h1.app-title").text().trim() ||
    $(".job-post h1").text().trim() ||
    $("h1").first().text().trim();

  // Company slug lives between greenhouse.io/ and /jobs/
  const slugMatch = url.match(/greenhouse\.io\/([^/]+)/);
  const company = slugMatch
    ? slugMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : $(".company-name").text().trim();

  const location =
    $(".location").first().text().trim() ||
    $("[class*='location']").first().text().trim();

  const rawDate = $(".posted-date, time").first().attr("datetime") ||
    $(".posted-date, time").first().text().trim();

  const jdEl = $("#content").length ? $("#content") :
    $(".job__description").length ? $(".job__description") :
    $("section.content");
  const jdText = extractText($, jdEl);

  return {
    company: company || "Unknown Company",
    title: title || "Unknown Title",
    location: location || "India",
    postedDate: rawDate ? parseRelativeDate(rawDate) : new Date().toISOString(),
    jdText,
    platform: "Greenhouse",
  };
}

function extractLever($: cheerio.CheerioAPI, url: string): Extracted {
  const title =
    $(".posting-headline h2").text().trim() ||
    $("h2").first().text().trim();

  const slugMatch = url.match(/jobs\.lever\.co\/([^/]+)/);
  const company = slugMatch
    ? slugMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : $(".main-header-logo").attr("alt") || "";

  const location =
    $(".posting-categories .location").text().trim() ||
    $(".location").first().text().trim();

  const rawDate = $("time").first().attr("datetime") || "";

  const jdEl = $(".section[data-qa='job-description']").length
    ? $(".section[data-qa='job-description']")
    : $(".posting-content");
  const jdText = extractText($, jdEl);

  return {
    company: company || "Unknown Company",
    title: title || "Unknown Title",
    location: location || "India",
    postedDate: rawDate ? parseRelativeDate(rawDate) : new Date().toISOString(),
    jdText,
    platform: "Lever",
  };
}

function extractAshby($: cheerio.CheerioAPI, url: string): Extracted {
  const title =
    $("h1").first().text().trim() ||
    $("[class*='title']").first().text().trim();

  const slugMatch = url.match(/ashbyhq\.com\/([^/]+)/);
  const company = slugMatch
    ? slugMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const location = $("[class*='location']").first().text().trim() ||
    $("[class*='Location']").first().text().trim();

  const jdEl = $("[class*='description']").length
    ? $("[class*='description']")
    : $("[class*='content']");
  const jdText = extractText($, jdEl);

  return {
    company: company || "Unknown Company",
    title: title || "Unknown Title",
    location: location || "India",
    postedDate: new Date().toISOString(),
    jdText,
    platform: "Ashby",
  };
}

function extractWellfound($: cheerio.CheerioAPI, url: string): Extracted {
  const title =
    $("h1").first().text().trim() ||
    $(".job-title").first().text().trim();

  const company =
    $(".company-name").first().text().trim() ||
    $("[class*='company']").first().text().trim();

  const location =
    $(".job-location").first().text().trim() ||
    $("[class*='location']").first().text().trim();

  const rawDate = $("time").first().attr("datetime") || "";

  const jdEl = $(".job-description").length
    ? $(".job-description")
    : $("[class*='description']");
  const jdText = extractText($, jdEl);

  return {
    company: company || "Unknown Company",
    title: title || "Unknown Title",
    location: location || "India",
    postedDate: rawDate ? parseRelativeDate(rawDate) : new Date().toISOString(),
    jdText,
    platform: "Wellfound",
  };
}

function extractGeneric($: cheerio.CheerioAPI, url: string): Extracted {
  // Remove nav, footer, script, style noise
  $("nav, footer, header, script, style, noscript").remove();

  const pageTitle = $("title").text().trim();
  const h1 = $("h1").first().text().trim();

  // Title: prefer h1, fallback to page title
  const title = h1 || pageTitle.split("|")[0].split(" at ")[0].trim();

  // Company: often "Role at Company" in page title
  let company = "";
  const atMatch = pageTitle.match(/ at (.+?)(\s*[|\-–]|$)/);
  if (atMatch) company = atMatch[1].trim();

  // Try meta tags
  if (!company) {
    company =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="author"]').attr("content") ||
      "";
  }

  const location =
    $("[class*='location' i]").first().text().trim() ||
    $("[id*='location' i]").first().text().trim();

  const rawDate =
    $("time").first().attr("datetime") ||
    $("[class*='date' i], [class*='posted' i]").first().text().trim();

  // JD text: largest text block in main/article/section
  const jdRoot = $("main").length ? $("main")
    : $("article").length ? $("article")
    : $(".job-description, .description, #job-description").length
      ? $(".job-description, .description, #job-description")
      : $("body");
  const jdText = extractText($, jdRoot).slice(0, 10000);

  return {
    company: company || new URL(url).hostname.replace(/^www\./, ""),
    title: title || "Unknown Title",
    location: location || "India",
    postedDate: rawDate ? parseRelativeDate(rawDate) : new Date().toISOString(),
    jdText,
    platform: "Other",
  };
}

// ── main export ───────────────────────────────────────────────────────────────

export async function extractAndBuildRecord(url: string): Promise<JobRecord> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  let extracted: Extracted;
  if (url.includes("greenhouse.io"))  extracted = extractGreenhouse($, url);
  else if (url.includes("lever.co"))  extracted = extractLever($, url);
  else if (url.includes("ashbyhq.com")) extracted = extractAshby($, url);
  else if (url.includes("wellfound.com") || url.includes("angel.co"))
    extracted = extractWellfound($, url);
  else extracted = extractGeneric($, url);

  const id = computeId(extracted.company, extracted.title, extracted.location);

  const record: JobRecord = {
    id,
    company: extracted.company,
    title: extracted.title,
    location: extracted.location,
    postedDate: extracted.postedDate,
    discoveredDate: new Date().toISOString(),
    sources: [{ platform: extracted.platform, url }],
    applyUrl: url,
    tier: null,
    liveness: "unknown",
    ghostFlag: false,
    status: "discovered",
    demoStatus: "none",
    followups: [],
    artifacts: {
      jdText: extracted.jdText || undefined,
    },
  };

  return record;
}
