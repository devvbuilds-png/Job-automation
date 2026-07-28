/**
 * Outreach prompt — adapts career-ops modes/contacto.md's MESSAGE FRAMEWORK only
 * (the 3-sentence Hook / Proof / CTA structure, tuned per contact type).
 *
 * DELIBERATELY STRIPPED: career-ops's contacto.md opens by identifying targets via
 * WebSearch (hiring manager, recruiter, peers). CLAUDE.md forbids that — Outreach here
 * is DRAFTING ONLY. It must NOT find, look up, name, or suggest who to contact. Dev
 * decides the recipient. We draft messages for each contact TYPE so Dev picks the one
 * matching whoever he chose.
 */
export function buildOutreachPrompt(
  title: string,
  company: string,
  jdText: string,
  researchText: string
): string {
  return `Draft outreach messages for a candidacy. DRAFTING ONLY.

HARD RULE: Do NOT identify, name, look up, or suggest who to contact. Do not invent a person, a hiring manager's name, or a recruiter. Dev decides the recipient himself. Your job is only to write the message text for each contact TYPE, so Dev can pick the one that fits whoever he reaches out to.

Role: ${title} at ${company}

--- JOB DESCRIPTION ---
${jdText}
--- END JD ---

--- COMPANY RESEARCH (for grounding the message in something real) ---
${researchText || "(no research generated yet — keep the message specific to the JD)"}
--- END RESEARCH ---

Write three message variants. Each uses career-ops's 3-sentence framework: Hook, Proof, CTA. Each must reference a real observation about ${company} from the research or JD, not generic interest. Tuned for India startups, where a direct or warm approach beats the ATS.

### Variant 1 — to a Hiring Manager / Product Lead
- **Hook:** a specific product challenge their team faces (from the research or JD).
- **Proof:** the candidate's most relevant, quantifiable angle for that challenge.
- **CTA:** an invitation to talk about how they are approaching that specific problem.

### Variant 2 — to a Recruiter
- **Hook:** direct fit — the role, the relevant experience, availability.
- **Proof:** the data that answers their screening question before they ask it.
- **CTA:** offer to share more if it aligns.

### Variant 3 — Warm / Referral ask
- **Hook:** a genuine reference to something the company or team did.
- **Proof:** what the candidate is working on in the same space (not a job pitch).
- **CTA:** a low-pressure ask to hear their take.

## Message rules (career-ops contacto.md)
- Keep each under ~300 characters where it is a LinkedIn-style note; the email variant can be a touch longer.
- No corporate-speak. No "I'm passionate about". No "I hope this finds you well".
- Never include a phone number.
- Give a one-line subject for the variant that would go by email.

End with a one-line note reminding Dev that he chooses the recipient — these are drafts to adapt, not a contact list.`;
}
