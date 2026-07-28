# Build Progress Log

Phase-by-phase record of what was built, what broke, and how it was fixed.
Companion to `BUILD_PLAN.md` and `CLAUDE.md`.

---

## Phase 0 — Setup, data model, scaffold
**Status: Complete ✓**

### What was built
- Next.js 16 (App Router, TypeScript, Tailwind v4) scaffolded into project root
- Full folder structure: `app/`, `lib/careerops/`, `lib/intake/`, `lib/pipeline/`, `lib/llm/`, `lib/data/`, `data/jobs/`, `resume/`, `scripts/`
- `lib/types.ts` — `JobRecord` and `SeenLedger` types, exactly matching CLAUDE.md spec
- `data/jobs.json` — empty array `[]`
- `data/seen.json` — `{ fingerprints: [], sourceIds: {} }`
- `lib/data/index.ts` — typed data-access module: `getAllJobs`, `getJobById`, `upsertJob`, `updateJobFields`, `readSeenLedger`, `writeSeenLedger`
- `.env.local` — placeholder for `APIFY_TOKEN`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ATS_WATCHLIST`

### Issues
None. Clean phase, `tsc --noEmit` passed, `npm run dev` started in 691ms.

---

## Phase 1 — V0 UI shell (no data)
**Status: Complete ✓**

### What was built
- `app/layout.tsx` — root layout with Geist font, full-height flex container
- `components/Nav.tsx` — client component nav with active-link highlighting (`/find`, `/track`)
- `app/page.tsx` — redirects to `/find`
- `app/find/page.tsx` — server component rendering `<FindScreen jobs={[]} />`
- `app/track/page.tsx` — server component rendering `<TrackBoard jobs={[]} />`
- `components/shared/TierBadge.tsx` — A/B/C badges (amber/sky/zinc)
- `components/shared/StatusBadge.tsx` — all 7 status values with distinct colors
- `components/shared/LivenessBadge.tsx` — live dot / expired / unknown + ghost flag
- `components/find/FindScreen.tsx` — split-pane client component (list left, detail right)
- `components/find/JobRow.tsx` — job list row with tier, title, company, status, liveness
- `components/find/JobDetail.tsx` — client component with tab switching, tier selector (disabled), status selector (disabled)
- `components/find/tabs/TabJobDescription.tsx` — empty state
- `components/find/tabs/TabResearch.tsx` — empty state
- `components/find/tabs/TabGapAnalysis.tsx` — empty state
- `components/find/tabs/TabResumeModifier.tsx` — empty state with download placeholder
- `components/find/tabs/TabStandOut.tsx` — empty state
- `components/find/tabs/TabOutreach.tsx` — empty state
- `components/find/tabs/TabInterview.tsx` — stage-gated (renders only when `status === "heard_back"`)
- `components/track/TrackBoard.tsx` — three-column layout: Building / Applied / Heard Back
- `components/track/TrackGroup.tsx` — group with empty state

### Bugs fixed
**"Preview detail layout" button did nothing.**
- Root cause: `FindScreen` always rendered `<JobDetail job={null} />` regardless of `selectedId`, because `jobs.find()` on an empty array returns `undefined` → falls back to `null`. When `selectedId` was `null` vs `"__preview"`, the `job` prop was `null` in both cases and the tab structure was always rendered — so there was no visual change on click.
- Fix: added a conditional in `FindScreen` — right pane shows "Select a job" plain text when `selectedId === null`, and only mounts `<JobDetail>` when `selectedId` is set (even to `"__preview"`). This made the click visually meaningful.

---

## Phase 2 — Canonical store live + manual entry/paste
**Status: Complete ✓**

### What was built
- `lib/pipeline/fingerprint.ts` — `computeId(company, title, location)` using SHA-256 → 16-char hex ID; `parseRelativeDate()` for "2 weeks ago" → ISO string
- `lib/intake/paste.ts` — URL fetcher + multi-platform HTML extractor (Greenhouse, Lever, Ashby, Wellfound, generic fallback); `extractAndBuildRecord(url)` returns a fully-formed `JobRecord`
- `app/api/intake/paste/route.ts` — `POST /api/intake/paste`; checks `seen.json` for dedup before writing; returns existing record on duplicate
- `app/api/jobs/[id]/route.ts` — `PATCH /api/jobs/[id]` with field whitelist; `GET /api/jobs/[id]` for single record
- Both pages marked `export const dynamic = "force-dynamic"` so server components re-read `jobs.json` on every request
- `FindScreen` updated — "+ Add job" button expands URL paste form; on success calls `router.refresh()` and auto-selects the new job
- `JobDetail` updated — tier A/B/C buttons, status dropdown, demoStatus dropdown all functional; optimistic local state update + `router.refresh()` for persistence
- `TrackGroup` updated — inline `heardBack` and `demoStatus` dropdowns on Track screen cards; each calls `PATCH /api/jobs/[id]` + `router.refresh()`
- `TrackBoard` updated — passes `showDemo` to Building column, `showHeardBack` to Heard Back column
- `cheerio` installed for HTML parsing

### Extraction platform support
| Platform | Title | Company | Location | Posted date | JD text |
|---|---|---|---|---|---|
| Greenhouse | ✓ | From URL slug | ✓ | ✓ | ✓ |
| Lever | ✓ | From URL slug | ✓ | ✓ | ✓ |
| Ashby | ✓ | From URL slug | ~ | — | ✓ |
| Wellfound | ✓ | ✓ | ✓ | ~ | ✓ |
| Generic | From `<h1>` or `<title>` | From "Role at Company" title pattern or og:site_name | ~ | ~ | From `<main>` / `<article>` |
| LinkedIn / Naukri | ✗ (auth required) | — | — | — | — |

### Bugs fixed
**JD text rendered as a wall of unformatted prose.**
- Root cause: cheerio's `.text()` concatenates all text nodes with no whitespace between block elements, so sections like "About Auric AI", "The Role", "What You'll Do" ran together into one giant paragraph.
- Fix 1 (extractor): replaced all `.text().trim()` JD calls with a custom `extractText($, el)` helper that walks the DOM recursively, inserting `\n` before each block-level element (`p`, `h1`–`h6`, `li`, `div`, `section`, `article`, etc.) and `\n` for `<br>`. Collapses 3+ newlines to 2.
- Fix 2 (display): rewrote `TabJobDescription`'s `JdBody` renderer to process line-by-line — short title-case/all-caps lines become small uppercase section headers; lines starting with `- • *` become bullet items; empty lines become vertical spacers.
- Fix 3 (existing data): `scripts/fix-jdtext.mjs` one-off script to reformat the already-stored Auric AI jdText in `data/jobs.json`.

---

## Phase 3 — The tab brains
**Status: Complete ✓**

### What was built
- `lib/pipeline/liveness.ts` — `checkLiveness(url)` fetches the apply URL, detects 404/410/expired signals in body text, returns `active | expired | unknown`; `checkAndPersistLiveness()` writes result back to `jobs.json`
- `lib/llm/client.ts` — Anthropic SDK singleton; reads `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` from env
- `lib/llm/generate.ts` — `generateAndCache()`: checks disk cache, calls Claude, saves to `data/jobs/<id>/`, updates `job.artifacts`; `readArtifact()`, `readMasterCV()` helpers
- `lib/llm/routeHelper.ts` — `makeTabRoute()` factory: one function produces a `GET` (return cached) + `POST` (generate or force-regenerate) pair for any tab; eliminates boilerplate across 5 routes
- `lib/llm/resumePdf.ts` — `generateResumePdf()`: uses `@react-pdf/renderer` to convert the tailored markdown to an ATS-clean PDF
- `lib/llm/prompts/research.ts` — grounded research prompt: must answer what product / who is user / what is current problem; web search enabled
- `lib/llm/prompts/gap.ts` — honest gap analysis: ✅/⚠️/❌ per JD requirement, top 3 gaps, what to develop; no fabrication enforced in prompt
- `lib/llm/prompts/resume.ts` — resume modifier: no em dashes, verb-led bullets, noticed→did→changed structure, banned words, ATS keywords, no fabrication — all rules hard-coded in prompt
- `lib/llm/prompts/standout.ts` — demo idea or non-demo move; advisory only; uses research + gap as context
- `lib/llm/prompts/outreach.ts` — who to contact + LinkedIn search + referral path + cold message (<150 words) + subject line
- `lib/llm/prompts/interview.ts` — STAR prep mapped to JD, product/domain questions, questions to ask; offer negotiation framing injected when `heardBack === "offer"`
- `app/api/jobs/[id]/liveness/route.ts` — `POST`: triggers liveness check + persist
- `app/api/jobs/[id]/research/route.ts` — GET/POST with web search enabled (`web_search_20250305` tool)
- `app/api/jobs/[id]/gap/route.ts` — GET/POST; reads `resume/cv.md`
- `app/api/jobs/[id]/resume/route.ts` — GET/POST; generates markdown + PDF
- `app/api/jobs/[id]/resume/download/route.ts` — serves PDF (falls back to .md)
- `app/api/jobs/[id]/standout/route.ts` — GET/POST; requires research + gap to exist first
- `app/api/jobs/[id]/outreach/route.ts` — GET/POST
- `app/api/jobs/[id]/interview/route.ts` — GET/POST; requires gap first
- `components/find/tabs/useTabContent.ts` — shared hook: loads cached content on mount, exposes `generate(force)` that POSTs and updates state
- `components/find/tabs/TabShell.tsx` — shared UI wrapper: handles idle/loading/error/done states with spinner, error display, regenerate button
- `components/shared/MarkdownBody.tsx` — `react-markdown` + `remark-gfm` with Tailwind Typography prose styling
- All 7 tab components updated to use `useTabContent` + `TabShell` + `MarkdownBody`
- `TabJobDescription` updated: triggers liveness check via API on every tab open, shows animated spinner while checking
- `@tailwindcss/typography` installed; `@plugin` added to `globals.css` for prose classes

### Dependency order enforced
Research → Gap Analysis → (Resume Modifier, Stand Out) → Interview; Stand Out errors clearly if research/gap missing; Interview errors if gap missing

### Packages added
- `@anthropic-ai/sdk` — Anthropic API client
- `@react-pdf/renderer` — server-side PDF generation (no browser required)
- `react-markdown` + `remark-gfm` — markdown rendering in tab content
- `@tailwindcss/typography` — prose CSS for MarkdownBody

### Bugs fixed
**`@react-pdf/renderer` TypeScript type mismatch** — `pdf()` accepts `DocumentProps` but `createElement(Document, ...)` returns `ReactElement<unknown>`. Fixed with `as any` assertion on the `pdf()` call and the `toBuffer()` write (which returns a `ReadableStream` at runtime but types as wrong). Functionality unaffected.

**`puppeteer` install failed** — Chromium download errored on Windows. Switched to `@react-pdf/renderer` which is pure JavaScript and requires no browser binary.

### Known limitations (addressed in later phases)
- LinkedIn / Naukri paste returns HTTP error (auth wall) — Phase 4 uses Apify for these
- Company name extracted from URL slug for ATS platforms (e.g. `auric-ai.talismatic.com` instead of `Auric AI`) for non-standard ATS URLs — acceptable for now

---

## Phase 3.5 — Swap CC's brain for career-ops logic
**Status: Complete ✓**

### Context
Phases 2-3 used CC's own self-written prompts and liveness logic. This phase replaced that homemade reasoning with career-ops's proven logic (github.com/santifer/career-ops, cloned into `reference/career-ops/`), per the three-way split in CLAUDE.md's Feature → tool map. UI, data layer, caching, Stand Out, dedup, and status labels were left untouched.

### VENDOR + WRAP (ran career-ops's real script)
- `lib/careerops/liveness-core.mjs` — **vendored verbatim** from career-ops. This is its real classification engine (the `classifyLiveness` function with HARD_EXPIRED_PATTERNS, LISTING_PAGE_PATTERNS, apply-control detection) used across its 740+ job evaluations. Not rewritten.
- `lib/careerops/liveness.ts` — TypeScript wrapper. career-ops's original I/O layer (`liveness-browser.mjs`) drives **Playwright** to read the hydrated DOM. Playwright/Chromium does not install on this Windows machine (puppeteer Chromium download failed in Phase 3). So the wrapper feeds the SAME engine via `fetch` + `cheerio` instead — extracts bodyText and apply-control labels from raw HTML, calls `classifyLiveness`, maps career-ops's `uncertain` → our `unknown`.
- `lib/pipeline/liveness.ts` — rewritten to delegate to the vendored wrapper. Keeps the exact same exported API (`checkLiveness`, `checkAndPersistLiveness`) so no Phase 3 route or Phase 4 pipeline caller changed.
- `lib/careerops/ats-normalize.ts` — ported career-ops's `sanitizeText` from `generate-pdf.mjs` (text-only portion): converts em/en dashes, smart quotes, arrows, bullets, zero-width chars to ASCII. Wired into `resumePdf.ts` so even if the model emits an em dash, it never reaches the PDF — directly serves Dev's "no em dashes" rule.

### ADAPT PROMPT (rewrote career-ops's prompt patterns for India APM/product search)
- `lib/llm/prompts/research.ts` ← `modes/deep.md` — kept the 6-axis deep-research structure, retuned from AI/eng roles to product/PM, preserved our hard what-product / who-is-user / what-is-current-problem requirement.
- `lib/llm/prompts/gap.ts` ← `modes/oferta.md` Block B — ported the JD-requirement → exact-CV-line mapping table and the structured gap mitigation frame (hard blocker vs nice-to-have, adjacent experience, portfolio cover, mitigation plan). Dropped the A-G scoring.
- `lib/llm/prompts/resume.ts` ← `modes/pdf.md` — ported the ATS keyword-injection strategy and the ethical truth-based reformulation examples ("reword real experience using exact JD vocabulary, NEVER add skills the candidate lacks"). Layered Dev's hard rules (no em dash, verb-led, noticed→did→changed, banned words) on top.
- `lib/llm/prompts/outreach.ts` ← `modes/contacto.md` — ported ONLY the 3-sentence Hook/Proof/CTA message framework, segmented per contact type. **Deliberately stripped career-ops's "identify targets via WebSearch" step** — CLAUDE.md mandates drafting-only, must not find/name/suggest contacts. (This also fixed a Phase 3 bug: our old prompt told Claude to "identify who to contact," violating the rule.)
- `lib/llm/prompts/interview.ts` ← `modes/interview-prep.md` — ported the audience segmentation (recruiter-screen / hiring-manager / peer-tech) and STAR+R (STAR + Reflection column as the seniority signal). Grounded answers in our gap analysis instead of career-ops's heavy WebSearch loop. Offer-stage negotiation framing injected only when `heardBack === "offer"`.

### WRITE OUR OWN (career-ops as concept ref only — confirmed, NOT ported)
- Dedup/fingerprint (`lib/pipeline/fingerprint.ts`) — confirmed career-ops's `dedup-tracker.mjs` dedups by company+role on a markdown tracker file. Our company+title+location+(fuzzy JD) fingerprint is genuinely different. Unchanged.
- Status labels — career-ops uses Evaluated/Responded/Discarded/SKIP; we keep our own (discovered/triaged/building/applied/heard_back/skipped/expired). Unchanged.

### LEFT UNTOUCHED (as required)
Web UI, routes, navigation, artifact caching, `jobs.json` data layer, Stand Out (Tab 4 — no career-ops equivalent), and the resume PDF renderer (`@react-pdf/renderer`).

### Decisions / deviations from CLAUDE.md's tool map
- **Liveness uses fetch+cheerio, not Playwright.** CLAUDE.md's map says "Real Playwright check." Playwright won't install on this Windows box, so the vendored *engine* runs but is fed by fetch+cheerio. Accurate for server-rendered ATS pages; heavy client-only SPAs (Ashby, Workday) where the apply button is JS-injected fall to `unknown` (the safe, non-destructive result). Swappable to Playwright later without touching the engine.
- **PDF stays `@react-pdf/renderer`, did not vendor `generate-pdf.mjs`.** career-ops's PDF script is Playwright-based and would hit the same install wall. The build plan made vendoring it optional ("only if it cleanly improves output"). Ported its ATS Unicode normalizer instead — the one dependency-free win.

### Verified
- `tsc --noEmit` clean.
- Live end-to-end test: `POST /api/jobs/bcf062f100027494/liveness` returned `{ liveness: "active", code: "apply_control_visible", reason: "visible apply control detected" }` — the vendored career-ops engine fetched the page, extracted apply controls via cheerio, classified, and persisted.

### Bug fixed
**Outreach prompt violated the drafting-only rule.** Phase 3's `buildOutreachPrompt` instructed Claude to "identify who to contact (hiring manager, recruiter, referral path)." CLAUDE.md forbids this — Dev decides the recipient. Rewriting from career-ops's `contacto.md` pattern, kept only the message framework and explicitly forbade naming/finding contacts.

### Doc discrepancy flagged (not acted on — belongs to Phase 4)
CLAUDE.md's role-filter section (Intake & cleaning rules) currently shows the original list including Product Analyst and AI PM. Earlier this session Dev approved tightening these (drop Product Analyst, AI PM → AI APM only, move plain/entry PM to the Maybe bucket); those edits are not present in the current CLAUDE.md. They matter at Phase 4 (Apify role filter), not Phase 3.5. Re-confirm and re-apply before building the pipeline filter.

---

## Scope decisions (between Phase 3.5 and Phase 4)

**Role filters tightened (re-applied to CLAUDE.md + BUILD_PLAN.md).** Dropped Product Analyst and broad "AI PM"; AI roles narrowed to AI APM / AI Associate Product Manager only; plain and entry/0-1 "Product Manager" moved from positive auto-ingest to the Maybe bucket (PM roles usually need prior APM experience). Apify two-layer keyword strategy documented: pass targeted keywords + `location: India` to the actor to cut credit spend, but the pipeline title filter remains the authoritative gate.

**ATS-portal intake deferred to v2.** Dev's call: v1 intake is purely **organic and company-agnostic** — Apify scraping (LinkedIn / Naukri / Wellfound) filtered by role, never by company. There is no company watchlist. The earlier watchlist examples (Scapia / PeopleHum / Leap) were illustrative only, never a real target list. Technical reason this is the right cut: Greenhouse / Lever / Ashby APIs are per-company boards with no global/region search, so ATS intake structurally *requires* a watchlist — incompatible with company-blind v1. Manual paste still ingests any ATS-hosted job found organically. Updated: CLAUDE.md (architecture diagram, Feature→tool map, intake rules, repo structure, env, cost control, v2 section), BUILD_PLAN.md (Phase 4 stripped of the ATS-scanner prompt; daily-run now Apify-only; ATS added to Deferred), `.env.local` (`ATS_WATCHLIST` removed).

**Phase 4 is now:** cleaning pipeline + Apify intake (organic, role-filtered) + `scripts/daily-run.mjs`. No ATS vendoring.

---

## Pre-Phase 4 shift — LLM provider swap (Anthropic → DeepSeek)
**Status: Complete ✓**

Dev switched the LLM brain from Anthropic to DeepSeek (cost). Phases 2–3.5 were built on the Anthropic SDK, so this retrofit was needed before Phase 4 (though Phase 4 itself is deterministic and uses no LLM).

### What changed
- `lib/llm/client.ts` — swapped `@anthropic-ai/sdk` → `openai` SDK pointed at `DEEPSEEK_BASE_URL`. `getClient()` returns an `OpenAI` client; `getModel()` reads `DEEPSEEK_MODEL` (default `deepseek-chat`). `npm install openai`.
- `lib/llm/generate.ts` — `callLLM` rewritten from Anthropic's `messages.create` (content-block parsing) to OpenAI `chat.completions.create` (system + user messages, `choices[0].message.content`). Added a `searchQuery` option.
- `lib/llm/search.ts` (new) — web-search augmentation. **Why:** Anthropic had a native `web_search` tool; DeepSeek does not. So Research now does retrieval itself via Tavily and feeds results into the prompt. **Graceful degradation:** if `TAVILY_API_KEY` is unset, returns null and Research falls back to model-knowledge-only with a flag in the prompt. Never hard-fails.
- `lib/llm/routeHelper.ts` — `PromptBuilder` type + POST handler pass `searchQuery` through.
- `app/api/jobs/[id]/research/route.ts` — supplies a targeted `searchQuery` (`{company} product company India funding users {title}`).
- `.env.local` — DeepSeek vars (`DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL=deepseek-chat`, `DEEPSEEK_BASE_URL`), optional `TAVILY_API_KEY`; Anthropic key commented as fallback.
- Docs: CLAUDE.md (stack line, Feature→tool map "Claude API brain" → "LLM brain (DeepSeek)", research web-search note, env secrets), BUILD_PLAN.md (Phase 3 research prompt + build line).

### Verified
- `tsc --noEmit` clean.
- Live API test: real call to DeepSeek returned successfully. Note: the `deepseek-chat` alias currently resolves to `deepseek-v4-flash` (DeepSeek points the alias at their latest) — connection and chat-completions path confirmed working end-to-end.

### Open item
- `TAVILY_API_KEY` is unset, so Research runs model-knowledge-only until Dev adds a (free-tier) Tavily key. All other tabs are fully functional on DeepSeek.

---

## Phase 4 — Automated intake + cleaning pipeline
**Status: Core complete & verified ✓ — LinkedIn live; Naukri + Wellfound pending**

### What was built
**Cleaning pipeline (`lib/pipeline/`)** — every job passes through before reaching jobs.json:
- `roleFilter.ts` — `classifyRole(title)` → positive / negative / maybe. Negative checked BEFORE positive so "Senior Product Manager" → negative. Plain/entry "Product Manager" → maybe. Product Analyst dropped. **Tested: 22/22 title cases pass.**
- `freshness.ts` — `isFresh()` hard 21-day cut; unparseable dates treated as stale.
- `ghost.ts` — reposting detection (the deterministically-computable career-ops signal): tracks normalized `company|title` counts in the ledger; a known company+title arriving with a new fingerprint flags `ghostFlag`. Richer qualitative signals stay with the LLM (deferred).
- `index.ts` — `runPipeline(candidates)` orchestrates: role → freshness → dedup (seen-ledger + within-batch source-priority merge) → ghost → liveness. Returns added records + stats.
- Type additions: `JobRecord.roleBucket` ("positive"|"maybe"), `SeenLedger.roleHistory`.

**Apify intake (`lib/intake/`)** — organic, company-agnostic:
- `apify.ts` — `fetchLinkedIn()` calls `harvestapi/linkedin-job-search` with target ROLE keywords + India. Input/output schemas confirmed via live probe runs. Maps `company.name`, `location.linkedinText`, `applyMethod.companyApplyUrl` (real apply URL, not the LinkedIn view), `descriptionText`, ISO `postedDate`. Source registry ready for Naukri + Wellfound.
- `run.ts` — `runAllIntake()` fetches sources → pipeline → digest.
- `app/api/intake/run/route.ts` — POST endpoint.
- `scripts/daily-run.mjs` — calls the endpoint, prints the digest (server must be running).

**UI:** `JobRow` shows a "Maybe" badge so borderline jobs are never invisible.

### Verified (live)
- Real run: 20 LinkedIn candidates → role filter dropped 12 → 1 stale dropped → **7 real India APM jobs added** (Zocket, Shaadi.com, etc.), 5 positive + 2 Maybe (plain "Product Manager" correctly bucketed).
- **Dedup proven:** re-run skipped already-seen jobs; jobs.json has 0 duplicate rows; seen-ledger fingerprints match record count.
- Find page renders the live data (HTTP 200).

### Bug fixed (important — would have hidden real jobs)
**Bulk liveness at intake produced false `expired`.** First run marked 8/13 jobs expired. Probe showed why: LinkedIn `job-apply` URLs 404 for non-logged-in fetches, and JS-SPA apply pages (e.g. `t.mercor.com`) return empty bodies → `insufficient_content`. Neither means the job is closed. Fixes: (1) **intake no longer bulk-checks liveness** — fresh scraped jobs are `unknown`, the JD tab checks per-job on open; (2) the liveness wrapper now **downgrades LinkedIn-host 404s and `insufficient_content` to `unknown`** (real ATS 404s, closed-text, and redirect-to-listing still mark `expired`). Reset the 8 false-expired records to `unknown`.

### Remaining for full Phase 4
- **Naukri + Wellfound sources** — not yet wired. Same `fetchSource` pattern; each needs an input/output schema probe (like LinkedIn got) + a mapper, then enable in `ENABLED_SOURCES`. LinkedIn proves the whole architecture end-to-end.
- Phase 5 owns the in-app digest UI and follow-up reminders.
