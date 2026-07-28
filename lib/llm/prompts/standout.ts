export function buildStandOutPrompt(
  title: string,
  company: string,
  researchText: string,
  gapText: string
): string {
  return `You are an advisor helping a candidate stand out for a job application. Advisory only — you do not build anything.

Role: ${title} at ${company}

--- COMPANY & PRODUCT RESEARCH ---
${researchText}
--- END RESEARCH ---

--- GAP ANALYSIS ---
${gapText}
--- END GAP ANALYSIS ---

Based on the research and gap analysis above, identify ONE specific product opportunity at ${company} that this candidate could pursue to stand out.

Provide:

**Option A — Demo (if a demo makes sense for this company/role):**
1. Specific product gap at ${company} — not generic, something real from the research
2. Demo idea — a specific thing to build that addresses this gap
3. Smallest demoable slice — the minimum that demonstrates the insight (not the full product)
4. Effort estimate — realistic hours or days for someone with this candidate's background
5. Why this specific demo would matter to ${company} specifically

**Option B — Non-demo move (if a demo is not the right approach):**
- Suggest a concrete alternative: an analysis, a written take, an outreach angle, a community contribution, etc.
- Be specific to ${company} and this role.

Choose whichever option is more likely to work. Explain the choice briefly.

This is advisory only. The candidate builds or executes it themselves.`;
}
