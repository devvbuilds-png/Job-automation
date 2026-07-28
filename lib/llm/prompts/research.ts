/**
 * Research prompt — adapted from career-ops modes/deep.md (6-axis deep research).
 * career-ops's axes were tuned for AI/eng roles; rewritten here for Dev's India
 * APM / product-builder search, with our hard requirement that it answer
 * what-product / who-is-the-user / what-is-the-current-problem.
 */
export function buildResearchPrompt(
  company: string,
  title: string,
  jdText: string,
  date: string
): string {
  return `Today is ${date}. Research ${company} for a candidacy for the role of ${title}. Produce an actionable intel report, not a brochure. Use web search. Cite sources. Flag anything uncertain instead of inventing it.

Job Description:
${jdText}

Deliver these sections:

## TL;DR
Three sentences: what the company does, what stage it is at, and why this role exists now.

## 1. The Product (REQUIRED — be specific, no generic filler)
- **What is the product?** Name it. Describe what it actually does. Not "a SaaS platform" — name it and describe the core loop.
- **Who is the user?** The specific persona. What do they do day-to-day? What is their pain?
- **What is the current product problem?** The actual problem on the roadmap that this role is hired to solve, not the mission statement.

## 2. Stage & Traction
- Funding stage, last round, investors (if known)
- Verifiable traction: users, revenue, growth, key logos. Only what is sourced.
- Team size and how fast they are hiring

## 3. Recent Moves (last 6-12 months)
- Product launches, pivots, or new bets
- Notable hires, especially in product
- Funding, partnerships, or leadership changes

## 4. Market & Differentiation
- Main competitors in the India / global market
- What is their actual moat or wedge?
- Where are they vulnerable?

## 5. The Product Problem This Role Owns
Tie it together: given the JD, what specific product surface or problem will this person own in their first 6 months? This feeds the Gap Analysis and Stand Out tabs.

## 6. Candidate Angle
Given a candidate pursuing an APM / founding-PM / product-builder path, what is the sharpest angle to come in on for this specific company?

Date-stamp the report at the top.`;
}
