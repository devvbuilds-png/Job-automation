/**
 * Gap Analysis prompt — adapted from career-ops modes/oferta.md Block B
 * ("Match with CV": map each JD requirement to exact CV lines; gaps with
 * a structured mitigation framework — hard blocker vs nice-to-have, adjacent
 * experience, mitigation plan). Stripped of the A-G scoring; we only want the
 * honest requirement-to-experience mapping. No fabrication.
 */
export function buildGapPrompt(
  title: string,
  company: string,
  jdText: string,
  cvText: string
): string {
  return `Honest gap analysis for a candidacy. Zero fabrication — every claim must cite an exact line or item from the CV below. Never invent experience, metrics, or titles.

Role: ${title} at ${company}

--- MASTER CV (the only source of truth) ---
${cvText}
--- END CV ---

--- JOB DESCRIPTION ---
${jdText}
--- END JD ---

## Block 1 — Requirement → CV Mapping
A table. One row per explicit JD requirement. Columns:
| JD Requirement | CV Evidence (quote the exact line) | Verdict |
Verdict is one of: ✅ Met · ⚠️ Partial · ❌ Gap. If Partial or Gap, the CV Evidence cell says what is present and what is missing. Do not stretch evidence to force a Met.

## Block 2 — Gaps, Structured
For each ❌ Gap and significant ⚠️ Partial, answer four questions (career-ops's mitigation frame):
1. **Hard blocker or nice-to-have?** Would this gap alone get the application filtered out?
2. **Adjacent experience?** Is there anything in the CV that is close enough to bridge from honestly?
3. **Portfolio cover?** Could a project or demo close this gap before applying?
4. **Mitigation plan.** One concrete move: a phrase for the application, a small project, a skill to pick up. Actionable, not generic.

## Block 3 — The Three That Matter
Name the three gaps most likely to cost this specific application, ranked. For each, one line on why it matters for THIS role at THIS company.

## Block 4 — What to Develop
The shortlist of skills or proof points to build, in priority order. Tie each to a JD requirement.

Rules: honest over encouraging. Never reference anything not in the CV. A real gap named clearly is more useful than a soft reassurance.`;
}
