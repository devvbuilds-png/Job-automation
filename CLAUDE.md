# CLAUDE.md — Job Finder & Tracker

This file is the persistent context for this project. Read it at the start of every session. It holds the durable facts, architecture, data model, and hard rules. The step-by-step build sequence lives in `BUILD_PLAN.md`.

---

## What this is

A personal, local web app that finds India-based **APM / product intern / product builder** roles and carries each one from discovery to application. It scrapes job listings, cleans them, and for each job provides company research, a tailored resume, and stand-out ideas, then tracks the application to outcome.

**Owner:** Dev. Single user. Runs locally on his machine.

## Non-goals (do not build these)
- No auto-apply. The app never submits an application. Dev applies manually.
- No multi-user, no auth, no cloud hosting in v1.
- No analytics beyond the tracker.
- Do not keep CC's self-written reasoning or cleaning logic where career-ops has an equivalent. Use career-ops three ways (see Feature → tool map): **vendor + wrap** its real scripts (liveness, optionally PDF), **adapt** its prompt patterns (research, gap, resume, outreach, interview), and **write our own** only where our data model differs (dedup fingerprint, status labels). Native only where career-ops has no equivalent (UI, Apify, freshness/role filters, Stand Out). (ATS provider scanners are deferred to v2 — see below.)

## Core principles (enforce these everywhere)
1. **Single source of truth.** Every job exists once, as one canonical record in `data/jobs.json`. The list, the detail tabs, and the tracker are all views of that record. Never duplicate state.
2. **The AI suggests; Dev builds.** Tab 4 outputs ideas and plans only. The app never builds a demo.
3. **No fabrication in resumes.** Resume tailoring only reframes true experience from Dev's master CV. It never invents experience, metrics, or titles.
4. **Clean intake or nothing.** No duplicates, no closed listings, nothing older than 21 days ever reaches the list. This is the part that failed before; treat it as critical.
5. **Tiers are manual.** The app never auto-assigns a tier. Dev marks each job A/B/C himself.
6. **Vertical slices.** Each build phase ends in something testable on screen, not a logic layer with no UI.

---

## Tech stack (decided)
- **Framework:** Next.js (App Router) + TypeScript + React. One codebase: React for the UI, route handlers / server actions for file I/O and orchestration. Runs locally (`npm run dev`).
- **Styling:** Tailwind CSS. Clean, restrained, senior. No clutter.
- **Data store:** local files. `data/jobs.json` is the canonical record store and the single source of truth. Per-job generated artifacts live under `data/jobs/<id>/`.
- **Intake:** Apify (`apify-client`) for LinkedIn / Naukri / Wellfound — organic, company-agnostic scraping; plus manual paste. (Direct ATS-portal intake is deferred to v2; see Planned for v2.)
- **LLM generation (tabs 2-4):** DeepSeek via its OpenAI-compatible API (`openai` SDK pointed at `DEEPSEEK_BASE_URL`; model in env — `deepseek-chat` = V3/latest, cheap fast generalist used for all tabs; `deepseek-reasoner` available if a tab needs heavier reasoning). Swapped from Anthropic in the pre-Phase 4 shift (Anthropic key kept commented in `.env.local` as an optional fallback). **Web search:** DeepSeek has no native web-search tool, so the Research tab grounds itself via a retrieval step (Tavily, optional `TAVILY_API_KEY`) whose results are fed into the prompt; without the key it degrades to model-knowledge-only.
- **career-ops:** the logic/brain for every feature that overlaps with it. A real open-source repo (`github.com/santifer/career-ops`, MIT), cloned into `reference/career-ops/` and used as the source to **port logic from**. It is prompt/skill files + `.mjs` scripts, not an importable library, so its logic is adapted into our routes and pipeline, never installed as a package. Native code is used **only** where career-ops has no equivalent (see the Feature → tool map below).

---

## Feature → tool map

Authoritative reference for what powers each feature and its scope boundary, so our own logic never contradicts career-ops. career-ops is used **three ways**, plus native:
- **Vendor + wrap** — copy its real deterministic script into `lib/careerops/` and run it as-is behind a TypeScript wrapper that outputs our `JobRecord` shape (liveness, optionally PDF; ATS provider scanners deferred to v2).
- **Adapt prompt** — take its prompt/mode pattern and rewrite it for Dev's India APM/product search and resume rules (research, gap, resume, outreach, interview). The LLM running these is the **LLM brain (DeepSeek)**.
- **Our own (career-ops as concept ref)** — write fresh logic where our data model differs from career-ops's (dedup fingerprint, status labels). Not ported.
- **Native** — features career-ops has no equivalent for (web UI, Apify intake, freshness/role filters, Stand Out).

**Intake**

| Feature | Tool | Scope / boundary |
|---|---|---|
| Job scraping (LinkedIn, Naukri, Wellfound) | Apify (native) | Pulls raw listings only. career-ops has no India scraping. |
| ATS portal intake (Greenhouse/Ashby/Lever/Recruitee/SmartRecruiters/Workable) | **Deferred to v2** | Per-company APIs, no global search — needs a company watchlist, which contradicts v1's organic/company-agnostic intake. Vendor career-ops scanners when built. |
| Manual paste | Native + DeepSeek | Extracts JD fields from a pasted URL. Covers ATS-hosted jobs found organically. |

**Cleaning pipeline**

| Feature | Tool | Scope / boundary |
|---|---|---|
| Dedup / fingerprint | Our own (career-ops as concept ref) | career-ops dedups by URL/tracker; we need fingerprint = company + title + location + fuzzy JD. |
| Liveness / expired detection | career-ops script (vendor + wrap) | Real Playwright check; flags closed/expired. Does not re-scrape JD. |
| Ghost / repost detection | Our own (informed by career-ops liveness) | Flags suspicious reposts; surface as a badge. |
| Status normalization | Our own (our status labels) | career-ops uses different labels (Evaluated, Applied…); we map to ours. |
| 21-day freshness filter | Native | Drops postings older than 21 days. |
| Role title filter | Native | Positive/negative keywords + Maybe bucket. |

**Job detail tabs**

| Feature | Tool | Scope / boundary |
|---|---|---|
| Job Description + liveness | career-ops liveness script (vendor + wrap) | Shows stored JD + apply link; checks liveness. Does not re-scrape. |
| Company & Product Research | career-ops prompt pattern (adapted) + LLM brain (DeepSeek) + Tavily retrieval grounding | Company + the specific product context. |
| Gap Analysis | career-ops prompt pattern (adapted) + LLM brain (DeepSeek) | Maps JD requirements to the real CV; names gaps + what to develop. Never fabricates. |
| Resume Modifier (content) | career-ops prompt pattern (adapted) + LLM brain (DeepSeek) | Reframes real CV to JD/ATS. Never invents experience. |
| Resume PDF export | Native (or vendor career-ops `generate-pdf.mjs`) | Renders the tailored resume to PDF. |
| Stand Out | Native + LLM brain (DeepSeek) | Suggests demo / non-demo moves. Advisory only; Dev builds. **UNIQUE — no career-ops equivalent.** |
| Outreach | career-ops prompt pattern (adapted) + LLM brain (DeepSeek) | **Drafts the message Dev should send, only.** Does NOT find, look up, or suggest who to contact — Dev decides the recipient. |
| Interview & Offer | career-ops prompt pattern (adapted) + LLM brain (DeepSeek) | STAR prep + negotiation framing. Stage-gated. |

**Tracker**

| Feature | Tool | Scope / boundary |
|---|---|---|
| Application states / tracking | Native (jobs.json) | Status per job. |
| Heard-back logging | Native | Logs responses. |
| Follow-up reminders | Native | Basic v1; career-ops cadence = v2. |

**App shell**

| Feature | Tool | Scope / boundary |
|---|---|---|
| Web UI (2 screens, tabs) | Native / Next.js | **UNIQUE — career-ops has no UI.** |
| LLM brain (runs all reasoning) | DeepSeek (OpenAI-compatible API) | Powers research, gap, resume, stand out, outreach, interview. |
| Coach screen | Native + DeepSeek | v2 only. |

**Why not career-ops end to end:** (1) it has no web UI, (2) its scanner targets foreign portals, not Indian ones. Those two gaps are why the UI is native and scraping is Apify.

### Implementation notes (Phase 3.5 — career-ops swap)
Two deviations from the table above, forced by this Windows machine:
- **Liveness runs the vendored engine, fed by fetch+cheerio, NOT Playwright.** career-ops's real classification engine (`liveness-core.mjs`) is vendored verbatim into `lib/careerops/` and is the source of truth for active/expired. Its original Playwright I/O layer (`liveness-browser.mjs`) is replaced by a fetch+cheerio wrapper (`lib/careerops/liveness.ts`) because Playwright/Chromium won't install here. Accurate for server-rendered ATS pages; JS-only SPAs (Ashby, Workday) where the apply button is injected fall to `unknown` (safe, non-destructive). Swap the snapshot source back to Playwright later without touching the engine.
- **Resume PDF stays `@react-pdf/renderer`**, did not vendor career-ops `generate-pdf.mjs` (also Playwright-based). Ported only its ATS Unicode normalizer (`lib/careerops/ats-normalize.ts`), which enforces Dev's "no em dashes" rule at render time.
- **Outreach is drafting-only.** career-ops's `contacto.md` finds contacts via WebSearch; that step is intentionally NOT ported. The prompt only drafts messages per contact type — Dev picks the recipient.

### Implementation notes (Phase 4 — intake & liveness)
- **Liveness is NOT bulk-checked at intake.** Raw-fetching scraped LinkedIn apply URLs is unreliable: `linkedin.com/job-apply/...` URLs 404 for any non-logged-in fetch, and company SPA pages return empty server bodies — both produce false `expired`. So the pipeline defaults `checkLivenessFlag` OFF; freshly scraped jobs are presumed live (`unknown`), and the Job Description tab re-checks liveness per-job when Dev opens it ("before a job is shown"). The liveness wrapper also hardens against these false positives: a `404` on a `linkedin.com` host and an `insufficient_content` (empty/JS body) both downgrade to `unknown`. Explicit closed-text, redirect-to-listing, and real ATS 404s still mark `expired`.
- **Apify intake confirmed source = LinkedIn** (`harvestapi/linkedin-job-search`, no cookies, pay-per-event). Input/output schemas confirmed via live probe runs (`jobTitles[]`, `locations[]`, `maxItems`, `postedLimit`; output maps `company.name`, `location.linkedinText`, `applyMethod.companyApplyUrl`, `descriptionText`, ISO `postedDate`). Naukri + Wellfound use the same `fetchSource` pattern once their actor schemas are probed.

---

## Architecture

```
INTAKE                     PIPELINE                STORE              UI (2 screens)
LinkedIn (Apify)  ─┐                                                  Screen 1: Find & Apply
Naukri (Apify)    ─┤                                                    - job list
Wellfound (Apify) ─┼─► dedup ─► liveness ─► 21-day ─► data/jobs.json ──  - 4-tab detail
Manual paste      ─┘    +ghost    check      filter        │            Screen 2: Track
                                                          │              - applied/building/heard-back
                                                  data/jobs/<id>/ artifacts
(ATS-portal intake deferred to v2 — needs a company watchlist)
```

- **Screen 1 — Find & Apply:** the job list plus the 4-tab detail view. Owns pre-application status (triaged, tier, applied).
- **Screen 2 — Track:** dashboard of applied-to, demos in progress, heard-back. May edit only post-application states inline (heard-back, demo progress). Both screens read/write the same records.

---

## Data model

Canonical record in `data/jobs.json` (array of these). Define as a TypeScript type.

```ts
type JobRecord = {
  id: string;                 // canonical fingerprint (see Dedup)
  company: string;
  title: string;
  location: string;
  postedDate: string;         // ISO; used by the 21-day filter
  discoveredDate: string;     // ISO
  sources: { platform: string; url: string; rawId?: string }[];
  applyUrl: string;

  tier: "A" | "B" | "C" | null;   // MANUAL. null until Dev sets it.
  fitScore?: number;               // optional sort hint only; never sets tier

  liveness: "active" | "expired" | "unknown";
  livenessCheckedAt?: string;
  ghostFlag: boolean;              // suspected repost / ghost job

  status: "discovered" | "triaged" | "building" | "applied" | "heard_back" | "skipped" | "expired";
  demoStatus: "none" | "not_started" | "in_progress" | "shipped" | "abandoned";
  appliedDate?: string;
  followups: { date: string; note: string }[];
  heardBack?: "no_response" | "rejected" | "screening" | "interview" | "offer";
  outcome?: string;

  artifacts: {                     // paths into data/jobs/<id>/
    jdText?: string;
    researchPath?: string;
    gapPath?: string;
    resumePath?: string;
    standoutPath?: string;
    outreachPath?: string;
    interviewPath?: string;
  };
  notes?: string;
};
```

A separate `data/seen.json` holds the dedup ledger (fingerprints + source rawIds already ingested) so daily re-runs never re-add a job.

---

## Tabs (Screen 1 detail view)

**Always-on (pre-application):**
1. **Job Description** — full JD text + live apply link. Re-checks liveness on open; shows active/expired clearly.
2. **Company & Product Research** — company + the specific product the role sits on: users, stage, current product problem. Live-search grounded, date-stamped. Must answer: what product, who is the user, what is the current problem. No generic filler.
3. **Gap Analysis** — maps every JD requirement to Dev's real experience and names where he falls short for this specific role, plus what to develop. Honest, no fabrication. Feeds the Resume and Stand Out tabs.
4. **Resume Modifier** — tailors the master CV to this JD + ATS, exports a clean PDF. Enforces Dev's resume rules (below). Reframes only; never fabricates.
5. **Stand Out From the Crowd** — advisory only. Names a specific product gap and a buildable demo (with a "smallest demoable slice" and effort estimate), or a non-demo move. Dev builds it himself.
6. **Outreach** — drafts the cold message or referral ask Dev should send for this role. **Drafting only:** it does not find, look up, or suggest who to contact; Dev decides the recipient. Tuned for India startups, where a direct or warm approach beats the ATS.

**Stage-gated (appears only when status is heard_back / interview / offer):**
7. **Interview & Offer** — STAR behavioral prep mapped to the JD, plus negotiation framing at offer stage. Hidden until the job reaches the relevant status, to keep the detail view focused.

### Dev's resume rules (the Resume Modifier tab must obey)
- No em dashes.
- Verbs lead. No adjectives doing verbs' work.
- Bullet structure: noticed → did → changed.
- Short sentences. Subtraction over addition.
- Banned words: leveraged, drove, end-to-end.
- No fabricated metrics or experience. Master CV is the only source of truth.

---

## Intake & cleaning rules (the part that broke before)

- **Sources & priority (high to low):** LinkedIn, Naukri, Wellfound (all Apify), manual paste. Intake is **organic and company-agnostic** — the role-title filter is the only gate; there is no company watchlist. (ATS-portal intake deferred to v2. Indeed + Adzuna are later breadth, not v1.)
- **Dedup:** **our own logic** (career-ops as concept ref only — its `dedup-tracker.mjs` dedups by company+role on a markdown tracker, which does not fit our model). Canonical fingerprint = normalized(company) + normalized(title) + normalized(location). A fuzzy JD-text match is planned for Phase 4 (not yet built; Phase 2's `computeId` is the three-field hash). On collision, merge into one record and keep the highest-priority source's apply URL. Persist every fingerprint to `data/seen.json`; never re-add a seen job on re-runs.
- **Liveness:** **career-ops's vendored engine** (`liveness-core.mjs` in `lib/careerops/`, copied verbatim; `lib/pipeline/liveness.ts` delegates to it). Re-fetches the URL and detects 404 / "no longer accepting applications" / removed. Fed by fetch+cheerio, not Playwright, on this machine — see Implementation notes above. Mark `expired` and drop from the active list.
- **Freshness:** hard filter — drop anything with `postedDate` older than 21 days at intake. Parse relative dates ("2 weeks ago") into real dates.
- **Ghost jobs:** flag suspicious reposts. **Lift career-ops's ghost-detection heuristics here** — clone career-ops and read them before writing this in Phase 4, rather than inventing a naive version. Surface as a badge; do not silently trust a fresh date.
- **Role filters:**
  - **Positive (auto-ingest):** APM, Associate Product Manager, Product Intern, Founding PM, Founder's Office (product), AI APM, AI Associate Product Manager, Product Builder, entry Growth PM.
  - **Negative (drop):** Project Manager, Program Manager, Product Marketing, Product Designer, Engineering Manager, Senior/Lead/Principal/Director/VP, Sales.
  - **Maybe (Dev reviews):** entry/0-1 Product Manager, any plain "Product Manager" title — PM roles typically require prior APM experience; treat as low priority and never auto-ingest.
  - Borderline titles always go to the Maybe bucket. Never silently drop.
  - **Dropped from positive vs. original:** Product Analyst (removed), AI PM as a broad catch-all (tightened to AI APM / AI Associate Product Manager only).
- **Apify keyword strategy:** pass targeted search keywords (e.g. `APM OR "Associate Product Manager" OR "Product Intern" OR "Product Builder"`) and `location: India` to each actor at call time. This reduces scrape volume and Apify credit spend. The pipeline title filter is still the authoritative gate — Apify search is fuzzy and will return noise.

## Tiering (manual)
- Dev reviews the list and marks each job **A / B / C**.
- **Tier A** = tech-savvy company, high hiring bar, likely to reply and appreciate a prototype (e.g. Cars24, HyperVerge, Byldd). Gets the full pipeline + a custom Tab 4 demo. **Hard cap: 3 demos in progress at once.** Extras wait or get Tier B treatment until a slot frees.
- **Tier B** = good fit. Tailored resume + apply. No demo. The throughput tier.
- **Tier C** = marginal. Quick apply or skip.

## Tracker states
`discovered → triaged → building → applied → heard_back(outcome)`, plus `skipped` and `expired`. Demo progress tracked separately via `demoStatus`. Follow-ups and heard-back logged with dates.

## Planned for v2

### ATS-portal intake (DO NOT build in v1)
Direct intake from Greenhouse / Lever / Ashby / Recruitee / SmartRecruiters / Workable by vendoring career-ops's `scan.mjs` + `providers/*.mjs`. These are per-company board APIs with no global/region search, so they require a **company watchlist**. v1 is deliberately organic and company-agnostic (Apify scraping, role-filtered, no company bias), so ATS intake only makes sense later, if and when Dev decides to actively track specific companies. Until then, manual paste covers any ATS-hosted job he finds organically.

### Coach screen (DO NOT build in v1)
A third top-level screen that reads all job records plus a profile/preferences file and reasons over Dev's accumulated history to: rank the job list by predicted fit, suggest a tier per new job (advisory only — Dev still marks tiers himself), and surface patterns once enough data exists (e.g. where replies cluster, where demos are being wasted). It is cross-job analysis, so it is a screen, not a tab. It is a cold-start feature — useless without history — so it is strictly v2. It does not train a model; it reads accumulated data as context each run.

**v1 obligation:** capture the signals the Coach will later need. These already live in the data model (`tier`, `status`, `demoStatus`, `heardBack`, `outcome`, applied-vs-skipped). Do not drop them. Build no Coach logic in v1. (career-ops's `analyze-patterns.mjs` is a useful reference when the Coach is built.)

---

## Repo structure

```
/
  CLAUDE.md
  BUILD_PLAN.md
  reference/
    career-ops/           # cloned career-ops repo — read-only source to PORT logic from (not imported)
  resume/                 # Dev's master CV lives here (cv.md) — canonical
  data/
    jobs.json             # canonical records (source of truth)
    seen.json             # dedup ledger
    jobs/<id>/            # per-job artifacts: research.md, gap.md, resume.pdf, standout.md, outreach.md, interview.md
  app/                    # Next.js App Router (screens, components, api routes)
  lib/
    careerops/            # vendored career-ops scripts that run as-is, TS-wrapped (liveness; ATS scanners are v2)
    intake/               # apify, paste  (ats deferred to v2)
    pipeline/             # dedup, liveness, freshness, ghost, status — career-ops logic
    llm/                  # research, gap, resume, standout, outreach, interview prompts + calls
  scripts/
    daily-run.mjs         # scheduled intake run
  .env.local              # secrets
```

## Environment / secrets (`.env.local`)
- `APIFY_TOKEN`
- `DEEPSEEK_API_KEY` (+ `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`)
- `TAVILY_API_KEY` (optional — live web-search grounding for Research)
- Later: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`. (ATS watchlist seed is a v2 concern — no watchlist in v1.)

## Cost control
- Apify: per-run `maxJobs` cap, daily budget ceiling, incremental mode (new/changed only), spend logged per run.
- Manual paste: free.
- LLM (tabs): cache generated artifacts to disk; never regenerate unless Dev asks.

---

## Definition of done (v1)
One job flows end to end: discovered → researched → resume tailored → stand-out planned → tracked → marked applied. No duplicates, no expired listings, nothing older than 21 days.
