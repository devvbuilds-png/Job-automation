# BUILD_PLAN.md — Job Finder & Tracker

Phase-by-phase build plan for Claude Code. Each phase ends in something testable. Do the phases in order. `CLAUDE.md` is the source of truth for architecture, data model, and rules; the prompts below reference it rather than repeating it.

**Working rule:** finish and test each phase before starting the next. Do not jump ahead. Each phase has a "Done when" check that must pass.

---

## Phase 0 — Setup, data model, scaffold ✓ Done

**Goal:** a running empty Next.js app with the data model and folder structure locked.

**Build:** Next.js (App Router, TS) + Tailwind. The `JobRecord` type from CLAUDE.md. Empty `data/jobs.json` (`[]`) and `data/seen.json`. The full folder structure. A read/write data-access module for `jobs.json`.

**Guards:** the `JobRecord` type must match CLAUDE.md exactly, because the UI is built against it next.

**Prompt:**
```
Read CLAUDE.md fully. Scaffold a local Next.js app (App Router, TypeScript, Tailwind) for the Job Finder & Tracker described there.

Create the exact repo structure from CLAUDE.md's "Repo structure" section (app/, lib/, data/, scripts/). 

In lib/, define the JobRecord TypeScript type exactly as specified in CLAUDE.md's "Data model" section. Create data/jobs.json containing [] and data/seen.json containing an empty ledger.

Write a small data-access module (lib/data) with typed functions to read all records, read one by id, upsert a record, and update fields on a record. All reads/writes go to data/jobs.json as the single source of truth.

Do not build any UI screens yet. Confirm the app builds and runs with npm run dev.
```

**Done when:** `npm run dev` runs, the app compiles, the type and data files exist, and the data module reads/writes `jobs.json`.

---

## Phase 1 — V0 UI shell (no data) ✓ Done

**Goal:** both screens and the 4-tab detail fully laid out, with no mock data. This is the gate Dev signs off before any backend.

**Build:**
- App-level navigation between **Screen 1 (Find & Apply)** and **Screen 2 (Track)**.
- Screen 1: the job list layout (rows with company, title, location, posted date, source, tier badge, status badge, liveness/ghost flags) showing an **empty state**. Clicking a row opens the detail view.
- Detail view: the six always-on tabs (Job Description, Company & Product Research, Gap Analysis, Resume Modifier, Stand Out, Outreach), each laid out with empty states, plus a stage-gated Interview & Offer tab that only appears when status is heard_back/interview/offer. Tier selector (A/B/C) and status controls present in the UI.
- Screen 2: the tracker layout (applied / building / heard-back groupings) with empty states.

**Guards:** no mock data; only structure and empty states. Build against the `JobRecord` type so the backend plugs in without rework. Keep the design restrained and senior, not clever.

**Prompt:**
```
Per CLAUDE.md, build the V0 UI shell with NO mock data — only the screen structure and empty states.

Build two top-level screens with navigation between them:
1. Screen 1 "Find & Apply": a job list whose rows are shaped for the JobRecord fields (company, title, location, postedDate, source, tier badge, status badge, liveness and ghost flags). Empty state for now. Clicking a row opens a detail view with the tabs exactly as named in CLAUDE.md: six always-on tabs (Job Description, Company & Product Research, Gap Analysis, Resume Modifier, Stand Out From the Crowd, Outreach), each with an empty state, plus a stage-gated Interview & Offer tab that appears only when status is heard_back/interview/offer. Include a tier selector (A/B/C) and the status controls in the UI.
2. Screen 2 "Track": tracker layout grouping by status (applied, building, heard-back) with empty states.

Use Tailwind. Style it clean, restrained, senior — minimal color, clear hierarchy. Everything must render against the JobRecord type so real data drops in later. No fake data.
```

**Done when:** Dev can click through both screens and all tabs, see the layout and empty states, and signs off. **This gates everything after.**

---

## Phase 2 — Canonical store live + manual entry/paste ✓ Done

**Goal:** the UI works end to end on real data that Dev adds by hand or by pasting a URL. A full vertical slice, minus auto-intake and tab AI.

**Build:**
- Wire the list and detail to read real records from `jobs.json`.
- **Manual paste intake:** paste a job URL → fetch the page → extract company, title, location, posted date, JD text → create a `JobRecord` → appears in the list.
- Wire the UI controls to write back: set tier (A/B/C), change status, set demo status. Screen 2 reflects these and can edit post-application states (heard-back, demo progress) inline.

**Guards:** all writes go through the single data module. Tier is set only by Dev. Status changes from Screen 1 (pre-application) and Screen 2 (post-application) write the same record.

**Prompt:**
```
Per CLAUDE.md, make the UI real on data Dev adds manually.

1. Wire Screen 1's list and the detail view to read real records from data/jobs.json via the data module.
2. Add a "paste a job URL" intake: fetch the page, extract company, title, location, postedDate, and JD text, build a JobRecord (status "discovered", tier null), and save it. It should then appear in the list and open in the detail view.
3. Wire the controls: tier selector writes tier; status controls write status; demoStatus is editable. Screen 2 reflects all records by status and can inline-edit heardBack and demoStatus.

All writes go through the single data module — jobs.json stays the only source of truth. Do not auto-assign tier; only Dev sets it.
```

**Done when:** Dev pastes a URL, the job appears, he opens it, marks it Tier A, changes status to applied, and sees it move correctly in the Track screen.

---

## Phase 3 — The tab brains ✓ Done

**Goal:** a single job becomes fully actionable — every tab produces real output. Build in dependency order: research feeds gap; gap feeds resume and stand out.

**Build (one tab at a time, each testable):**
- **Job Description:** render stored JD text + live apply link; re-check liveness on open and show active/expired. (Build the liveness utility here; the pipeline reuses it in Phase 4.)
- **Company & Product Research:** API route calls the LLM (DeepSeek) with live web-search grounding (Tavily retrieval, since DeepSeek has no native search); must answer what product / who is the user / what is the current problem; date-stamped. Save to `data/jobs/<id>/research.md` and cache. *(Built on Anthropic in Phase 3, swapped to DeepSeek in the pre-Phase 4 shift.)*
- **Gap Analysis:** API route maps every JD requirement to Dev's real experience (from the master CV + profile) and names where he falls short for this role, plus what to develop. Honest, no fabrication. Save to `data/jobs/<id>/gap.md`.
- **Resume Modifier:** API route tailors the master CV (`resume/`) to the JD + ATS, obeying Dev's resume rules in CLAUDE.md, exports a clean PDF to `data/jobs/<id>/resume.pdf`. Reframe only, never fabricate.
- **Stand Out:** API route uses the research + gap to propose a specific product gap + a buildable demo idea with a "smallest demoable slice" and effort estimate, or a non-demo move. Advisory only. Save to `data/jobs/<id>/standout.md`.
- **Outreach:** API route identifies who to contact (hiring manager, recruiter, referral path) and drafts a cold message or referral ask for this role. Save to `data/jobs/<id>/outreach.md`.
- **Interview & Offer (stage-gated):** only rendered when status is heard_back/interview/offer. STAR behavioral prep mapped to the JD, plus negotiation framing at offer stage. Save to `data/jobs/<id>/interview.md`.

**Guards:** cache every artifact to disk; regenerate only on explicit request (cost). Resume Modifier obeys the resume rules and the no-fabrication rule strictly. Gap Analysis and Stand Out never fabricate and never build anything. Interview & Offer must stay hidden until the status gate is met.

**Prompts (run in order):**
```
Per CLAUDE.md, build the Job Description tab: render the stored JD text and the live apply link. On open, re-check the listing's liveness by fetching applyUrl and detecting 404 / "no longer accepting" / removed; update liveness and livenessCheckedAt and show active or expired clearly. Put the liveness check in lib/pipeline so it can be reused later.
```
```
Per CLAUDE.md, build the Company & Product Research tab: an API route that calls the LLM (DeepSeek) with web-search grounding (Tavily retrieval) to research the company and specifically the product this role sits on. It must answer: what product, who is the user, what is the current product problem. Date-stamp it. Save to data/jobs/<id>/research.md and show it. Cache: do not regenerate unless asked.
```
```
Per CLAUDE.md, build the Gap Analysis tab: an API route that maps every requirement in this job's JD to Dev's real experience (from the master CV in resume/ and his profile), then names clearly where he falls short for this specific role and what skills to develop. Honest, never fabricates experience. Save to data/jobs/<id>/gap.md and show it. Cache.
```
```
Per CLAUDE.md, build the Resume Modifier tab: an API route that reads Dev's master CV from resume/, tailors it to this job's JD and ATS keywords, and exports a clean ATS-friendly PDF to data/jobs/<id>/resume.pdf. It MUST obey Dev's resume rules in CLAUDE.md and the no-fabrication rule — reframe true experience only, never invent. Show the result with a download link. Cache.
```
```
Per CLAUDE.md, build the Stand Out From the Crowd tab: an API route that, using the research and gap outputs for this job, proposes a specific product gap at this company and a buildable demo idea with a "smallest demoable slice" and a rough effort estimate, or a non-demo stand-out move. Advisory only — never build anything. Save to data/jobs/<id>/standout.md and show it. Cache.
```
```
Per CLAUDE.md, build the Outreach tab: an API route that identifies who to contact for this role (hiring manager, recruiter, referral path) and drafts a cold message or referral ask tailored to the company and role. Save to data/jobs/<id>/outreach.md and show it. Cache.
```
```
Per CLAUDE.md, build the stage-gated Interview & Offer tab: it must render ONLY when the job's status is heard_back, interview, or offer (hidden otherwise). An API route produces STAR behavioral prep mapped to the JD, plus negotiation framing for the offer stage. Save to data/jobs/<id>/interview.md and show it. Cache.
```

**Done when:** open any manually-added job and every always-on tab produces correct, cached output; the resume PDF obeys the rules and invents nothing; the Interview & Offer tab stays hidden until status reaches heard_back/interview/offer.

---

## Phase 3.5 — Swap CC's brain for career-ops logic ✓ Done

**Why:** Phases 2-3 were built with CC's own self-written prompts and cleaning logic. We don't trust that. career-ops has proven logic for the same jobs. This phase replaces CC's homemade reasoning/cleaning with career-ops's, without touching the UI, the data layer, PDF export, caching, or the one unique feature (Stand Out).

**What changes vs what stays (per the Feature → tool map in CLAUDE.md):**
- **Vendor + wrap (run career-ops's real script):** liveness / expired detection. Copy into `lib/careerops/`, wrap in TypeScript that returns our `JobRecord` shape. (career-ops's ATS provider scanners are NOT vendored — ATS intake is deferred to v2.)
- **Adapt prompt (rewrite career-ops's prompt pattern):** Research, Gap Analysis, Resume tailoring, Outreach drafting, Interview & Offer.
- **Write our own (career-ops as concept ref only, do NOT port):** dedup/fingerprint (career-ops dedups by URL/tracker; we need company+title+location+fuzzy JD) and status normalization (career-ops's labels differ from ours).
- **Leave untouched:** the web UI and routes, PDF export, caching, the `jobs.json` data layer, the 21-day freshness filter, the role-title filter, and **Stand Out (Tab 4)**.

### What Dev does first (manual)
1. At the project root, clone career-ops into the reference folder:
   ```
   git clone https://github.com/santifer/career-ops.git reference/career-ops
   ```
2. Add `reference/` to `.gitignore` (it's read-only source, not part of the app).
3. Then paste the prompt below to Claude Code.

### Prompt for Claude Code
```
Read CLAUDE.md, especially the Feature → tool map and its three-way split. Then read reference/career-ops fully — its skill/prompt files (modes/) and its .mjs scripts (liveness-core.mjs, liveness-browser.mjs, scan.mjs, generate-pdf.mjs, analyze-patterns.mjs). career-ops is NOT an importable library; it is prompt files + scripts.

Apply it three ways, replacing the homemade logic from Phases 2-3:

VENDOR + WRAP (copy the real script into lib/careerops/, wrap in TypeScript returning our JobRecord shape — do not rewrite from scratch):
- Liveness / expired detection (liveness-core.mjs + liveness-browser.mjs)

ADAPT PROMPT (rewrite career-ops's prompt pattern for Dev's India APM/product search and the resume rules in CLAUDE.md):
- Company & Product Research
- Gap Analysis (career-ops's JD-requirement-to-experience evaluation)
- Resume tailoring (career-ops's "reframe real experience, never fabricate" CV pattern)
- Outreach — DRAFTING ONLY: drafts the message to send; must NOT find, look up, or suggest contacts
- Interview & Offer (career-ops STAR + negotiation)

WRITE OUR OWN (use career-ops only as concept reference, do NOT port its version):
- Dedup/fingerprint — career-ops dedups by URL/markdown tracker; we need fingerprint = normalized company + title + location + fuzzy JD match
- Status normalization — career-ops uses Evaluated/Applied/etc.; map to our statuses (discovered, triaged, building, applied, heard_back, skipped, expired)

DO NOT TOUCH (stays exactly as built):
- Web UI, routes, navigation
- Resume PDF export (optional: you may vendor career-ops generate-pdf.mjs instead, but only if it cleanly improves output)
- Artifact caching
- jobs.json data layer
- 21-day freshness filter and role-title filter
- Stand Out (Tab 4)

After each change, re-test that the feature still produces output and still caches. Report which files you changed per feature.
```

**Done when:** liveness runs career-ops's vendored script; research/gap/resume/outreach/interview run adapted career-ops prompts; dedup and status use our own model; Outreach drafts only; the UI and Stand Out are untouched; everything still renders and caches.

---

## Phase 4 — Automated intake + cleaning pipeline

**Goal:** the list fills automatically with clean, fresh jobs from real sources. This is the highest-risk phase; the cleaning pipeline is what makes it trustworthy.

**Build:**
- **Cleaning pipeline** (`lib/pipeline`): dedup (fingerprint + `seen.json` ledger + source-priority merge), liveness (reuse Phase 3), 21-day freshness filter, ghost flag, role-title filter with a "Maybe" bucket.
- **Apify intake (the only v1 intake source):** wire `apify-client` to LinkedIn, Naukri, and Wellfound actors. Map their output to `JobRecord`. Pipe everything through the pipeline before writing to `jobs.json`. Apply per-run `maxJobs` cap and log spend. Intake is **organic and company-agnostic** — the role-title filter is the only gate; there is no company watchlist.
- **Daily run:** `scripts/daily-run.mjs` runs all Apify sources, dedups against the ledger, and surfaces "new since last run" as an in-app digest.

> **ATS-portal intake (Greenhouse / Lever / Ashby) is deferred to v2.** Those APIs are per-company boards with no global search, so they require a company watchlist — which contradicts the organic, company-blind v1 approach. Manual paste already covers any ATS-hosted job Dev finds organically. See Deferred section.

**Guards (the historical failure points):** never add a job already in `seen.json`; never show an expired listing; never show anything older than 21 days; parse relative dates correctly; flag reposts. Confirm current Apify actor names on the Apify store before wiring (do not assume IDs).

**Prompts (run in order):**
```
Per CLAUDE.md, build the cleaning pipeline in lib/pipeline: 
- dedup: compute the canonical fingerprint, check against data/seen.json, merge duplicates keeping the highest-priority source's applyUrl, and record every fingerprint so re-runs never re-add. 
- freshness: drop anything with postedDate older than 21 days; parse relative dates like "2 weeks ago" into real dates first. 
- ghost: flag suspected reposts. 
- role filter: keep the positive titles, drop the negative ones, send borderline titles to a "Maybe" bucket (never silently drop). 
Reuse the liveness check from Phase 3. Every job must pass through this pipeline before being written to jobs.json.
```
```
Per CLAUDE.md, build Apify intake in lib/intake: use apify-client to pull jobs from LinkedIn, Naukri, and Wellfound actors (confirm the current actor names on the Apify store first; don't assume IDs). When calling each actor, pass targeted search keywords (APM OR "Associate Product Manager" OR "Product Intern" OR "Product Builder" OR "Founding PM" OR "AI APM" OR "AI Associate Product Manager" OR "entry Growth PM") and location "India" as actor inputs to reduce scrape volume and credit spend. Intake is organic and company-agnostic — no company watchlist; the role-title filter is the only gate. Map results to JobRecord, then run them through lib/pipeline (which is the authoritative title filter) before saving. Apply a per-run maxJobs cap and log Apify spend per run.
```
```
Per CLAUDE.md, write scripts/daily-run.mjs that runs all Apify intake sources once, pipes everything through lib/pipeline, dedups against seen.json, and writes only new/changed jobs, exposing "new since last run" for an in-app digest on Screen 1.
```

**Done when:** running the daily script fills the list with real, deduped, live, sub-21-day jobs; pasting a duplicate of an existing job does not create a second row; a closed listing shows as expired.

---

## Phase 5 — Hardening + definition-of-done pass

**Goal:** confirm the whole loop and tighten edges.

**Build / check:**
- In-app digest of new jobs surfaced cleanly on Screen 1.
- Follow-up reminders surfaced by status on Screen 2.
- Cost caps verified (Apify ceiling, artifact caching).
- Empty/error states everywhere (failed scrape, dead link, LLM error).
- Run the v1 definition-of-done end to end.

**Prompt:**
```
Per CLAUDE.md, do a hardening pass: surface the "new since last run" digest on Screen 1; surface follow-up reminders by status on Screen 2; verify Apify cost caps and that LLM artifacts are cached and not regenerated unless asked; add clean empty and error states for failed scrapes, dead links, and LLM errors. Then walk the v1 definition of done: one job from discovered through researched, resume tailored, stand-out planned, tracked, marked applied — with no duplicates, no expired listings, nothing older than 21 days. Report anything that fails.
```

**Done when:** the v1 definition of done passes cleanly.

---

## Deferred (not v1)
- **Coach screen (v2)** — third top-level screen that ranks jobs by predicted fit, suggests tiers (advisory only — Dev still marks them), and surfaces patterns from accumulated history. Cross-job, cold-start; build only after v1 has real data. It does not train a model; it reads accumulated data as context. v1 must capture the signals it needs (`tier`, `status`, `demoStatus`, `heardBack`, `outcome`) — they already live in the data model, so do not drop them.
- **ATS-portal intake (Greenhouse / Lever / Ashby / Recruitee / SmartRecruiters / Workable)** — vendor career-ops's `scan.mjs` + `providers/*.mjs`. Requires a company watchlist (these APIs are per-company boards with no global search), so it only makes sense once Dev wants to track specific companies. Deferred from v1, which is organic / company-agnostic. Manual paste covers ATS-hosted jobs in the meantime.
- Indeed + Adzuna + WebSearch breadth.
- Follow-up cadence automation.
- Ghost-job scoring refinement.
- Any auto-apply. (Never, per CLAUDE.md.)
