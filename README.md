# Job Finder & Tracker

**A local, single-user app that finds India-based APM and product roles, cleans the noise out, and carries each job from discovery to application with AI-assisted research, gap analysis and resume tailoring.**

## What it is / why I built it

Job hunting for APM roles meant juggling scraped listings full of duplicates, reposts, senior roles and dead postings, then redoing the same research, resume edits and outreach drafts for every application. My earlier attempts broke at intake: the list filled up with junk before I ever got to apply.

So I built a personal pipeline around two rules: **clean intake or nothing**, and **the AI suggests, I build**. Every job exists once as a canonical record. Each job gets a detail view with company research, a gap analysis against my real CV, a tailored resume that never invents experience, and ideas for standing out. A tracker then follows it to an outcome. The app never auto-applies; I apply manually. The prompt patterns and liveness logic are adapted from the open-source [career-ops](https://github.com/santifer/career-ops) project (MIT).

## Features

**Intake and cleaning**
- Automated LinkedIn intake via Apify (India, target role keywords), plus manual URL paste with extractors for Greenhouse, Lever, Ashby, Wellfound and generic pages
- Role filter: positive / negative / "Maybe" buckets, so "Senior PM" is dropped and borderline titles stay visible
- Hard 21-day freshness cut
- Deduplication by fingerprint (company + title + location) with a persistent seen-ledger
- Ghost and repost detection, shown as a badge
- Per-job liveness check using career-ops's vendored classifier (active / expired / unknown)

**Job detail tabs** (generated on demand by an LLM)
- Job Description + liveness
- Company & Product Research, grounded with optional Tavily web search
- Gap Analysis: JD requirements mapped against my real CV
- Resume Modifier: reframes true experience for the JD/ATS, with PDF export
- Stand Out: demo and non-demo ideas (advisory only)
- Outreach: drafts the message only and never picks the recipient
- Interview & Offer: STAR prep and negotiation framing, unlocked once a job reaches "heard back"

**Tracking**
- Manual A/B/C tiers, status and demo-status per job
- Track board with Building / Applied / Heard Back columns
- `scripts/daily-run.mjs` triggers a scheduled intake run and prints a digest

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Local JSON storage (`data/jobs.json` + per-job artifacts in `data/jobs/<id>/`)
- DeepSeek via the OpenAI-compatible `openai` SDK for generation; Tavily for research grounding
- Apify (`apify-client`) for scraping; Cheerio for HTML extraction
- `@react-pdf/renderer` for resume PDFs

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Create a `.env.local` in the project root with:

- `APIFY_TOKEN`: Apify intake
- `APIFY_LINKEDIN_ACTOR` (optional; defaults to `harvestapi/linkedin-job-search`)
- `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`: LLM generation
- `TAVILY_API_KEY` (optional; without it, research uses model knowledge only)

To run a scheduled intake while the dev server is running:

```bash
node scripts/daily-run.mjs [maxItemsPerQuery]   # APP_URL overrides http://localhost:3000
```

Put your master CV in `resume/cv.md`. Resume tailoring only reframes what is in it.

## Project structure

```
app/          pages (/find, /track) and API routes (intake, per-job tabs, liveness, resume)
components/   Find screen, job detail tabs, Track board, shared badges
lib/
  intake/     Apify + manual paste
  pipeline/   role filter, freshness, fingerprint/dedup, ghost, liveness
  careerops/  vendored career-ops liveness logic + wrappers
  llm/        DeepSeek client, search grounding, prompts, resume PDF
  data/       typed access to the JSON store
data/         canonical job store + seen-ledger
scripts/      daily intake runner
```

`CLAUDE.md`, `BUILD_PLAN.md` and `PROGRESS.md` document the design rules and phase-by-phase build log.

## Status

v1 in personal use. LinkedIn intake is live; Naukri and Wellfound sources are not yet wired up.
