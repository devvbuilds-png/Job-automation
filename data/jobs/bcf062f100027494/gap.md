# Gap Analysis: Dev Saxena → Product Manager, Auric AI

---

## Section 1 — Requirement Mapping

### Role Fundamentals

**"AI-native builder: highly proficient in using AI tools for prototyping, wireframing, and creating demo flows"**
✅ Met — Claude Code, prompt engineering, agent design, LLM app architecture listed. Ships full products solo (Kaizen, Divyakala LMS, SohailCab). Explicitly builds with AI tools (Figma, Vercel, Railway stack via AI tools).

---

**"Define product vision and articulate a clear north star for the platform"**
⚠️ Partial — Kaizen has a documented vision ("product intelligence layer" reconciling marketing/support/model views). BetterPlace shows requirements definition. However, both contexts are early-stage consumer/HR SaaS. No evidence of vision definition for a defense, mission-critical, or analyst-facing platform. The domain translation is unproven.

---

**"Build and communicate a roadmap balancing near-term MVP delivery with long-term platform growth"**
⚠️ Partial — BetterPlace internship shows feature delivery and sprint involvement ("drove end-to-end delivery"). Kaizen shows solo roadmap ownership. No evidence of formal roadmap documentation or balancing competing timelines across a multi-stakeholder team in a high-stakes environment.

---

**"Map the full analyst journey: image ingestion → preprocessing → AI detection → quality review → database → dissemination"**
❌ Gap — No evidence of workflow mapping for any analyst-facing or intelligence product. No computer vision, geospatial, or military intelligence workflow experience. The specific pipeline described (satellite/drone imagery → detection → dissemination) has zero overlap with anything in the CV.

---

**"Work with engineers and designers to create intuitive, analyst-ready screens"**
⚠️ Partial — BetterPlace shows collaboration with engineers on LMS features. Figma is listed. However, "analyst-ready" implies designing for expert, high-pressure, non-consumer users — a design context entirely absent from the CV. All prior design work is consumer/learner-facing.

---

**"Use AI-powered tools (Figma plugins, AI prototyping, AI design assistants) to generate wireframes and demo flows rapidly"**
✅ Met — Figma is listed. Builds and ships production interfaces solo using AI tools. Portfolio and multiple live products demonstrate rapid prototyping capability.

---

**"Define MVP scope and ruthlessly separate must-haves from nice-to-haves"**
✅ Met — BetterPlace: drove end-to-end feature delivery with defined requirements. Kaizen: solo founder scoping for a live product. Allen Doubt Solver: identified a gap and prototyped before a large incumbent shipped it — demonstrates prioritization instinct.

---

**"Make trade-offs between speed-to-decision, detection accuracy, and user trust"**
❌ Gap — No evidence of reasoning about detection accuracy, model confidence thresholds, or trust calibration in AI outputs. The CV's AI work is LLM/text-based, not vision model outputs. The specific trade-off triangle in defense AI (speed vs. accuracy vs. trust) is entirely unaddressed.

---

**"Translate requirements into clear PRDs and product specs"**
✅ Met — PRDs listed as a skill. BetterPlace explicitly involved defining requirements for delivered features.

---

**"Drive collaboration between AI researchers, engineers, and domain experts"**
⚠️ Partial — BetterPlace shows cross-functional collaboration with engineers. TEDxMAHE shows leading a 30-person team. However, there is no evidence of collaborating with AI researchers (as opposed to using AI tools), and no domain expert collaboration in a technical or defense context.

---

**"Engage with analysts, retired officers, and other stakeholders to understand workflows"**
❌ Gap — No evidence of any engagement with defense stakeholders, military domain users, or analyst personas. All user research in the CV is consumer/learner/HR-SaaS context. No interviews, walkthroughs, or synthesis with high-stakes professional users documented.

---

**"Synthesize fragmented feedback into coherent product direction"**
⚠️ Partial — BetterPlace implies this through requirements definition and driving delivery. Kaizen as a founder role implies it. However, no specific example of synthesizing fragmented, conflicting, or domain-expert feedback into documented product direction is shown.

---

**"Define and track success metrics: time-to-insight, adoption, accuracy, and trust in outputs"**
⚠️ Partial — CV cites specific metrics (11% DAU increase, 6% lift in course completion). However, these are lagging adoption metrics, not mission-critical metrics like time-to-insight or trust calibration. The metric vocabulary required for defense intelligence products is absent.

---

**"Use feedback and data to iterate rapidly"**
⚠️ Partial — Allen Doubt Solver shows identifying a gap before an incumbent shipped it — implies observation and iteration instinct. BetterPlace shows post-launch metric tracking. No explicit iteration loop documented with data-driven pivots.

---

**"First principles thinker who simplifies complex problems into clear workflows"**
✅ Met — Kaizen's framing ("Marketing knows one version, support knows another, the model sees neither") shows clear first-principles problem articulation. Allen Doubt Solver shows gap identification before a large player. The writing at devvv.bearblog.dev (not reviewed here but listed) may further support this.

---

**"Technical fluency: understand how AI and software systems work, even if you don't code daily"**
✅ Met — LLM app architecture, agent design, multi-agent systems listed. Ships production apps. ECE undergraduate. Understands the stack end-to-end even if AI-assisted.

---

**"User empathy: can design for non-technical users working under pressure"**
⚠️ Partial — Meesho frontline learner work shows designing for non-technical users. SohailCab shows designing for a single non-technical user with a real need. However, "working under pressure" in a defense/mission-critical context is a qualitatively different design constraint with no supporting evidence.

---

**"Prior startup/founder experience or exposure to AI/ML products is a strong plus"**
✅ Met — Seemara (founder), Kaizen (AI product), Divyakala LMS (sole technical partner for paying client). Clear founder track record.

---

**"Communication skills: able to align researchers, engineers, and defense users"**
⚠️ Partial — Strong communication evidence: TEDxMAHE (28 universities, 35K+ attendance), Think Tank leadership, BetterPlace cross-functional work. The "defense users" dimension has no supporting evidence.

---

## Section 2 — The 3 Most Significant Gaps

### Gap 1: Zero defense, intelligence, or vision AI domain knowledge
This is the most disqualifying gap for this specific role. Auric AI's platform processes satellite and drone imagery to detect tanks, artillery, radars, and missile launchers. The analyst workflow — image ingestion, preprocessing, AI detection, quality review, dissemination — is a specialized domain with its own vocabulary, constraints, and user needs. Dev's entire AI experience is LLM/text-based. There is no computer vision work, no geospatial data context, no imagery analysis workflow, and no exposure to defense or intelligence users anywhere in the CV. This isn't a gap that communication skills or AI-native building instincts can paper over during an interview — the JD explicitly asks for someone who can map the analyst journey and design for mission-critical contexts. The domain is entirely absent.

### Gap 2: No experience designing for high-stakes, expert professional users
Every user-facing product in the CV targets consumers or frontline learners: Meesho workers, LMS students, a cab driver, students needing doubt resolution. These are low-stakes, forgiving UX contexts where errors are recoverable. Auric AI's users are defense analysts and military commanders making time-sensitive decisions where a wrong detection or a trusted false positive has real-world consequences. Designing for "trust in AI outputs" in that context requires understanding how expert users calibrate confidence, handle ambiguity, and reject or accept AI recommendations under pressure. Nothing in the CV demonstrates this.

### Gap 3: No demonstrated ability to translate AI research into product
The JD explicitly states: "Translate AI research into usable, analyst-facing products" and calls for driving "collaboration between AI researchers, engineers, and domain experts." Dev builds with AI tools — he uses LLMs, prompts them, and ships on top of APIs. That is not the same as sitting with a computer vision research team, understanding their model outputs (confidence scores, bounding boxes, false positive rates), and translating those into a product a non-technical analyst can act on. There is no evidence in the CV of working with or alongside AI researchers, reviewing model performance documentation, or making product decisions grounded in ML system behavior.

---

## Section 3 — What to Develop

### For Gap 1 (Defense/Vision AI domain knowledge):
**Build a working prototype of a satellite image analysis tool.** Take a publicly available dataset — NASA Worldview, Sentinel Hub free tier, or the DOTA (Detection in Optical Remote Sensing Images) dataset — and build a simple interface that ingests an image, runs it through an open-source object detection model (YOLOv8 is accessible), and displays detections with confidence scores in an analyst-style interface. Document the product decisions you made: what do you show when confidence is low? How do you display a "no detection" result? What does the dissemination output look like? This directly addresses domain unfamiliarity and produces a concrete artifact for the interview. Do not just describe this — host it and link it, the same way every other project in the CV is live.

### For Gap 2 (High-stakes, expert user design):
**Conduct and document structured interviews with domain-adjacent expert users.** The CV mentions user research as a skill but shows no documented examples. Find 3–5 people who work in high-stakes, time-pressured analytical roles — intelligence analysts, air traffic controllers, radiologists, emergency dispatchers — and run structured interviews about how they consume AI-assisted outputs, where they don't trust the system, and what makes them override a recommendation. Write it up as a user research document with direct quotes, behavioral patterns, and product implications. Post it to your blog or portfolio. This demonstrates the user empathy the JD requires in the actual context it requires it.

### For Gap 3 (Translating AI research into product):
**Read the primary literature on object detection evaluation and write a PM-facing translation of it.** Specifically: understand precision-recall tradeoffs, what mAP means, and how false positive rate interacts with analyst trust — then write a short document (publishable on your blog) titled something like "What a PM needs to know about computer vision model outputs to build analyst products." This is not a research paper — it's a demonstration that you can sit in a room with a CV researcher, understand what they're telling you about model performance, and translate it into product requirements. This directly addresses the gap the JD is hiring for, and it's a document you can reference in your cover letter or interview.