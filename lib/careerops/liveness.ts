import * as cheerio from "cheerio";
import { classifyLiveness as classifyLivenessRaw } from "./liveness-core.mjs";

// The vendored .mjs has loose inferred types; wrap with our explicit signature.
const classifyLiveness = classifyLivenessRaw as (input: {
  status?: number;
  finalUrl?: string;
  bodyText?: string;
  applyControls?: string[];
}) => { result: "active" | "expired" | "uncertain"; code: string; reason: string };

/**
 * TypeScript wrapper around career-ops's vendored liveness-core.mjs.
 *
 * career-ops's original I/O layer (liveness-browser.mjs) drives Playwright to read
 * the rendered DOM and visible apply controls. Playwright/Chromium does not install
 * cleanly on this Windows machine (puppeteer Chromium download failed earlier), so
 * this wrapper feeds the SAME classification engine via fetch + cheerio instead.
 *
 * Trade-off: we read the raw HTML, not the hydrated SPA DOM. For server-rendered ATS
 * pages (Greenhouse, Lever, most career pages) this is accurate. For heavy client-only
 * SPAs (Ashby, Workday) the apply button may be injected by JS and not present in raw
 * HTML — those fall to 'uncertain' → 'unknown', which is the safe non-destructive result.
 * If Dev later installs Playwright, swap the snapshot source without touching the engine.
 */

type CoreResult = {
  result: "active" | "expired" | "uncertain";
  code: string;
  reason: string;
};

export type LivenessResult = {
  liveness: "active" | "expired" | "unknown";
  checkedAt: string;
  code: string;
  reason: string;
};

const APPLY_SELECTORS =
  'a, button, input[type="submit"], input[type="button"], [role="button"]';

/** Extract apply-control-like labels from raw HTML (best-effort, no browser). */
function extractApplyControls($: cheerio.CheerioAPI): string[] {
  const labels: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $(APPLY_SELECTORS).each((_: number, el: any) => {
    const $el = $(el);
    // Skip nav/header/footer like career-ops's browser layer does
    if ($el.closest("nav, header, footer").length) return;
    if ($el.closest('[aria-hidden="true"]').length) return;
    const label = [
      $el.text(),
      $el.attr("value"),
      $el.attr("aria-label"),
      $el.attr("title"),
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (label) labels.push(label);
  });
  return labels;
}

export async function checkLiveness(applyUrl: string): Promise<LivenessResult> {
  const checkedAt = new Date().toISOString();

  let status = 0;
  let finalUrl = applyUrl;
  let bodyText = "";
  let applyControls: string[] = [];

  try {
    const res = await fetch(applyUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    status = res.status;
    finalUrl = res.url || applyUrl;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    bodyText = $("body").text().replace(/\s+/g, " ").trim();
    applyControls = extractApplyControls(cheerio.load(html));
  } catch (err) {
    // Transient failures (timeout, DNS, TLS) must NOT be treated as expired —
    // career-ops's own rule. Return uncertain → unknown.
    return {
      liveness: "unknown",
      checkedAt,
      code: "navigation_error",
      reason: `fetch error: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}`,
    };
  }

  const core: CoreResult = classifyLiveness({ status, finalUrl, bodyText, applyControls });

  // Map career-ops's 'uncertain' → our model's 'unknown'.
  let liveness: LivenessResult["liveness"] =
    core.result === "uncertain" ? "unknown" : core.result;

  // Robustness for raw-fetch (no Playwright) on scraped URLs: some "expired"
  // results are false positives we must NOT trust, or we'd hide real jobs:
  //  - LinkedIn apply URLs (linkedin.com/job-apply/...) 404 for any non-logged-in
  //    fetch — a 404 there says nothing about the listing.
  //  - JS-only SPA pages return an empty/thin server body (insufficient_content),
  //    which is a rendering artifact, not a closed listing.
  // Downgrade these to 'unknown' (safe, non-destructive). Explicit closed-text
  // (expired_body), redirect-to-listing, and real ATS 404s stay 'expired'.
  if (liveness === "expired") {
    const host = (() => {
      try { return new URL(finalUrl).hostname.toLowerCase(); } catch { return ""; }
    })();
    const isLinkedIn = host.endsWith("linkedin.com");
    if (core.code === "insufficient_content") liveness = "unknown";
    else if (core.code === "http_gone" && isLinkedIn) liveness = "unknown";
  }

  return { liveness, checkedAt, code: core.code, reason: core.reason };
}
