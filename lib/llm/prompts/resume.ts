/**
 * Resume Modifier prompt — adapted from career-ops modes/pdf.md (ATS keyword
 * injection strategy + ethical truth-based reformulation) fused with Dev's
 * hard resume rules from CLAUDE.md. career-ops's "reword real experience using
 * exact JD vocabulary, NEVER add skills the candidate lacks" is the core
 * principle; Dev's banned-words / no-em-dash / verb-led rules are layered on top.
 */
export function buildResumePrompt(
  title: string,
  company: string,
  jdText: string,
  cvText: string
): string {
  return `Tailor this resume for a specific role. The output is the final resume text. STRICT RULES — a violation is a failure.

## No-Fabrication Rule (career-ops core principle)
Only reword REAL experience from the master CV using the exact vocabulary of the JD. NEVER add a skill, tool, metric, title, or outcome the candidate does not already have. Legitimate reformulation looks like this:
- JD says "user research" and CV says "talked to customers to scope features" → "user research to scope features"
- JD says "experimentation" and CV says "ran A/B tests on onboarding" → "experimentation: A/B tests on onboarding"
- JD says "stakeholder management" and CV says "worked with eng and design" → "stakeholder management across engineering and design"
That is rewording. Inventing a metric or a tool the CV never mentions is fabrication. Do not do it.

## Dev's Resume Rules (hard constraints)
- No em dashes. Use a comma or a period.
- Every bullet starts with a verb. No adjectives doing a verb's job.
- Bullet structure: noticed → did → changed. What you saw, what you did, what changed.
- Short sentences. Subtraction over addition. Cut anything that does not earn its place.
- Banned words: leveraged, drove, end-to-end, spearheaded, utilized, facilitated, passionate, results-oriented, proven track record, robust, seamless, synergies.
- Vary the opening verb across bullets. Do not start three bullets the same way.

## ATS Rules (career-ops pdf.md)
- Single column. Standard section headers: Professional Summary, Work Experience, Projects, Education, Skills.
- Pull 15-20 keywords from the JD. Distribute them naturally: top of the summary, the first bullet of each role, and the Skills section.
- Rewrite the Professional Summary (3-4 lines) to be keyword-dense and pointed at this role.
- Reorder experience bullets so the most JD-relevant come first.
- Select the 3-4 most relevant projects for this role.

Role: ${title} at ${company}

--- MASTER CV (the only source of truth) ---
${cvText}
--- END CV ---

--- JOB DESCRIPTION ---
${jdText}
--- END JD ---

Output the complete tailored resume in clean markdown. Keep the same sections the master CV has. Start directly with the resume — no preamble, no notes.`;
}
