# AGENTS.md — Job Finder & Tracker

This file is the persistent context for this project. Read it at the start of every session. It holds the durable facts, architecture, data model, and hard rules. The step-by-step build sequence lives in `BUILD_PLAN.md`.

---

## What this is

A personal, local web app that finds India-based **APM / product intern / product builder** roles and carries each one from discovery to application. It scrapes job listings, cleans them, and for each job provides company research, a tailored resume, and stand-out ideas, then tracks the application to outcome.

**Owner:** Dev. Single user. Runs locally on his machine.

## Non-goals (do not build these)
- No auto-apply. The app never submits an application. Dev applies manually.
- No multi-user, no auth, no cloud hosting in v1.
- No analytics beyond the tracker.
- Do not rebuild logic that career-ops already provides (dedup, liveness, ghost detection, research/resume prompt patterns). Reuse it.

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
- **Intake:** Apify (`apify-client`) for LinkedIn / Naukri / Wellfound; direct ATS APIs (Greenhouse / Lever / Ashby) for watchlist companies; manual paste.
- **LLM generation (tabs 2-4):** Anthropic API (model set in env, swappable). This is a small API cost separate from the Codex subscription. Optional alternative: shell out to the local Codex CLI to use the existing subscription instead.
- **career-ops:** vendored into `lib/careerops/`. Its deterministic Node utility scripts (dedup, liveness, ghost detection, status normalization) are reused directly. Its research/resume prompt logic is adapted into `lib/llm/`.

---

## Architecture

```
INTAKE                     PIPELINE                STORE              UI (2 screens)
LinkedIn (Apify)  ─┐                                                  Screen 1: Find & Apply
Naukri (Apify)    ─┤                                                    - job list
Wellfound (Apify) ─┼─► dedup ─► liveness ─► 21-day ─► data/jobs.json ──  - 4-tab detail
ATS APIs          ─┤    +ghost    check      filter        │            Screen 2: Track
Manual paste      ─┘                                       │              - applied/building/heard-back
                                                  data/jobs/<id>/ artifacts
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
6. **Outreach** — who to contact (hiring manager, recruiter, referral path) and a drafted cold message or referral ask for this role. Especially relevant for India startups, where a direct or warm approach beats the ATS.

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

- **Sources & priority (high to low):** LinkedIn, Naukri, Wellfound (all Apify), ATS APIs, manual paste. (Indeed + Adzuna are later breadth, not v1.)
- **Dedup:** canonical fingerprint = normalized(company) + normalized(title) + normalized(location), plus a fuzzy match on JD text. On collision, merge into one record and keep the highest-priority source's apply URL. Persist every fingerprint to `data/seen.json`; never re-add a seen job on re-runs.
- **Liveness:** before a job is shown, re-fetch its URL and detect 404 / "no longer accepting applications" / removed. Mark `expired` and drop from the active list. Reuse career-ops liveness utilities.
- **Freshness:** hard filter — drop anything with `postedDate` older than 21 days at intake. Parse relative dates ("2 weeks ago") into real dates.
- **Ghost jobs:** flag suspicious reposts (career-ops ghost-detection). Surface as a badge; do not silently trust a fresh date.
- **Role filters:**
  - **Positive (auto-ingest):** APM, Associate Product Manager, Product Intern, Founding PM, Founder's Office (product), AI APM, AI Associate Product Manager, Product Builder, entry Growth PM.
  - **Negative (drop):** Project Manager, Program Manager, Product Marketing, Product Designer, Engineering Manager, Senior/Lead/Principal/Director/VP, Sales.
  - **Maybe (Dev reviews):** entry/0-1 Product Manager, any plain "Product Manager" title — PM roles typically require prior APM experience; treat as low priority and never auto-ingest.
  - Borderline titles always go to the Maybe bucket. Never silently drop.
- **Apify keyword strategy:** pass targeted search keywords (e.g. `APM OR "Associate Product Manager" OR "Product Intern" OR "Product Builder"`) and `location: India` to each actor at call time. This reduces scrape volume and Apify credit spend. The pipeline title filter is still the authoritative gate — Apify search is fuzzy and will return noise.

## Tiering (manual)
- Dev reviews the list and marks each job **A / B / C**.
- **Tier A** = tech-savvy company, high hiring bar, likely to reply and appreciate a prototype (e.g. Cars24, HyperVerge, Byldd). Gets the full pipeline + a custom Tab 4 demo. **Hard cap: 3 demos in progress at once.** Extras wait or get Tier B treatment until a slot frees.
- **Tier B** = good fit. Tailored resume + apply. No demo. The throughput tier.
- **Tier C** = marginal. Quick apply or skip.

## Tracker states
`discovered → triaged → building → applied → heard_back(outcome)`, plus `skipped` and `expired`. Demo progress tracked separately via `demoStatus`. Follow-ups and heard-back logged with dates.

## Planned for v2 — Coach screen (DO NOT build in v1)
A third top-level screen that reads all job records plus a profile/preferences file and reasons over Dev's accumulated history to: rank the job list by predicted fit, suggest a tier per new job (advisory only — Dev still marks tiers himself), and surface patterns once enough data exists (e.g. where replies cluster, where demos are being wasted). It is cross-job analysis, so it is a screen, not a tab. It is a cold-start feature — useless without history — so it is strictly v2. It does not train a model; it reads accumulated data as context each run.

**v1 obligation:** capture the signals the Coach will later need. These already live in the data model (`tier`, `status`, `demoStatus`, `heardBack`, `outcome`, applied-vs-skipped). Do not drop them. Build no Coach logic in v1.

---

## Repo structure

```
/
  AGENTS.md
  BUILD_PLAN.md
  resume/                 # Dev's master CV lives here (cv.md or cv.pdf) — canonical
  data/
    jobs.json             # canonical records (source of truth)
    seen.json             # dedup ledger
    jobs/<id>/            # per-job artifacts: research.md, resume.pdf, standout.md
  app/                    # Next.js App Router (screens, components, api routes)
  lib/
    careerops/            # vendored career-ops utility scripts
    intake/               # apify, ats, paste
    pipeline/             # dedup, liveness, window, ghost
    llm/                  # research, resume, standout prompts + calls
  scripts/
    daily-run.mjs         # scheduled intake run
  .env.local              # secrets
```

## Environment / secrets (`.env.local`)
- `APIFY_TOKEN`
- `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL`)
- ATS watchlist seed (Scapia, PeopleHum, Leap) configured in `lib/intake/ats`.
- Later: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`.

## Cost control
- Apify: per-run `maxJobs` cap, daily budget ceiling, incremental mode (new/changed only), spend logged per run.
- ATS APIs / manual paste: free.
- LLM (tabs): cache generated artifacts to disk; never regenerate unless Dev asks.

---

## Definition of done (v1)
One job flows end to end: discovered → researched → resume tailored → stand-out planned → tracked → marked applied. No duplicates, no expired listings, nothing older than 21 days.
