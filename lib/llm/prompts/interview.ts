/**
 * Interview & Offer prompt — adapted from career-ops modes/interview-prep.md.
 * Key patterns ported: audience segmentation (recruiter-screen / hiring-manager /
 * peer-tech — the recruiter screen is the first gate and gets its own prep), and
 * STAR+R (STAR plus a Reflection column, which career-ops uses as the seniority
 * signal). career-ops's heavy WebSearch research loop is dropped — we ground answers
 * in the gap analysis (which is grounded in the real CV) instead of live company intel.
 * Offer negotiation framing is injected only at the offer stage.
 */
export function buildInterviewPrompt(
  title: string,
  company: string,
  jdText: string,
  gapText: string,
  heardBack: string | undefined
): string {
  const isOffer = heardBack === "offer";

  return `Interview prep for ${title} at ${company}. A working prep document, not a pep talk. Be direct. Ground every answer in the gap analysis below (which is grounded in the real CV). Never fabricate experience. Never invent a question and attribute it to a source — label anything you infer from the JD as [inferred from JD].

--- JOB DESCRIPTION ---
${jdText}
--- END JD ---

--- GAP ANALYSIS (candidate's real experience and gaps) ---
${gapText}
--- END GAP ANALYSIS ---

Segment the prep by AUDIENCE — career-ops's core insight is that the first round is almost always a recruiter/HR screen, not a technical panel, and each audience evaluates different things.

## Audience 1 — Recruiter / HR Screen (the first gate)
The recruiter screens for fit, not skill. A fuzzy answer here ends the process before any product signal is collected. Prepare:
- **"Walk me through your background / why are you looking?"** — a 60-90s narrative for an APM/product candidate.
- **Why this company** — 2-3 sentences referencing a real signal about ${company}.
- **Comp / location / availability** — how to handle these for an India startup APM role without over-anchoring.
- **Any background red flags** — honest, forward-looking framing for gaps surfaced in the gap analysis.

## Audience 2 — Hiring Manager / Product Lead
Screens for motivation and scope fit. Prepare:
- **"Why this role, why now?"** — connect the candidate's path to the team's named problem.
- **"What would your first 90 days look like?"** — derived from the JD scope.
- **2-3 sharp questions to ask back** — tied to something specific about ${company}'s product, not generic.

## Audience 3 — Product / Peer Round
Depth on product thinking. Prepare:
- **Top 5 likely questions** for THIS role. For each: the question, why it is likely (which JD requirement it maps to), and a STAR+R answer framework built from the candidate's real experience.
- **STAR+R** = Situation, Task, Action, Result, plus **Reflection** (what was learned or would be done differently). The Reflection is the seniority signal — do not skip it.
- A likely product-sense or case question for ${company}'s domain, with how to approach it.
${
  isOffer
    ? `
## Offer Stage — Negotiation Framing
The candidate has an OFFER. Provide:
- How to approach comp for this role in India's startup ecosystem (base, ESOPs, joining bonus, scope, title).
- Which levers are realistic to negotiate at this company's stage.
- A specific, non-adversarial script for the negotiation conversation.
- What is reasonable to ask for, and what to concede.`
    : ""
}

Tag inferred questions [inferred from JD]. Keep it honest and specific.`;
}
