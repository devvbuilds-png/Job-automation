Good. I now have enough data to build a thorough, well-sourced report. Let me also note one critical disambiguation: the Tracxn "Auric" funding data ($6.42M, Cactus Venture Partners) appears to refer to a **different company** called "Auric" (a wellness/personal care brand). Auric AI Labs Private Limited was only incorporated in January 2025 and shows paid-up capital of ₹10L — consistent with a pre-revenue, self-described self-funded early-stage entity. I will flag this clearly.

---

**INTEL REPORT: AURIC AI LABS — PRODUCT MANAGER, VISION INTELLIGENCE PLATFORM**
*Researched and compiled: Mon, 08 Jun 2026 | Sources: MCA filings, company career pages, job boards, public media. Flags marked ⚠️ where data is absent or uncertain.*

---

## TL;DR



Auric AI is building India's next-generation Multi-INT Search and Reasoning platform for defense and intelligence, with systems that process large volumes of multi-source data — including satellite imagery, SAR, signals, and documents — to generate actionable intelligence at scale.

 

The company was officially incorporated in January 2025 and is registered in Maharashtra, making it an extremely early-stage founding-team entity.

 This role exists because the core AI research is sufficiently mature to need a product owner who can translate detection models into a usable analyst-facing workflow — there is no PM on the team yet, and the platform has no structured product layer.

---

## 1. The Product

### What is the product?
The product is called the **Vision Intelligence Platform** (referred to internally also as the **Multi-INT Search and Reasoning Platform**). 

Auric AI Labs is developing an AI-powered vision intelligence platform for defense applications; the system processes satellite imagery — EO, IR, SAR, hyperspectral — and drone imagery to detect, classify, and track high-value enemy assets like tanks, radars, missile launchers, aircraft, and warships.



The core loop is: **Ingest multi-source imagery → run AI detection/classification models → geolocate targets → prioritize threats → disseminate intelligence to analysts/commanders.** 

The system is designed to enable real-time situational awareness and strategic military decision-making, not just build an AI model.



A second technical thread is now emerging: 

the company is building an AI-native intelligence system from scratch — no legacy DSP pipeline, no AI-as-classifier-stage — with deep learning models that detect, classify, geolocate, and fingerprint radar and communications emitters directly from raw IQ data.

 This signals the platform is expanding from EO/SAR imagery into SIGINT (signals intelligence), consistent with the Multi-INT framing.

### Who is the user?
The primary user is a **military imagery analyst or intelligence officer** — someone who receives batches of satellite and drone imagery under time pressure, must manually scan for military assets (tanks, radar installations, missile systems), and currently does much of this via slow, error-prone manual review. Secondary users are **military commanders** who consume the finished intelligence product. These users are non-technical, work under operational urgency, and have extremely low tolerance for false positives on high-stakes targeting.

### What is the current product problem?
There is no product layer. 

Auric AI is a small, high-output founding team where everyone operates with high autonomy and high ownership.

 The research team has been building models; 

they are optimizing models for high accuracy in mission-critical operations, implementing intelligent target prioritization workflows, and developing advanced localization techniques

 — but these are ML outputs, not user-facing products. There is no PM, no defined analyst workflow, no PRD structure, no UX. The actual product problem is: **raw model outputs need to be turned into a trustable, time-sensitive analyst interface with a defined ingestion → detection → review → dissemination loop.**

---

## 2. Stage & Traction

### Founding and legal structure


Auric AI Labs Private Limited is registered in Maharashtra and was officially incorporated on 16 January 2025.

 

The company has two directors: Soham Aatish Dedhia and Pushpa Nanji Dedhia.



### Funding


Auric AI Labs describes itself as "a well-funded cutting-edge defense technology company."

 However, the MCA filings tell a more grounded story: 

the authorized share capital is INR 1.00 cr and total paid-up capital is INR 10.00 lac

 — consistent with a bootstrapped or angel-backed early-stage entity, not institutional Series A+ funding.

⚠️ **FLAG:** Tracxn data showing "$6.42M raised" and investors including Cactus Venture Partners and Venture Catalysts appears to refer to a **different company called "Auric"** (a consumer wellness brand) — not Auric AI Labs. No verifiable third-party funding records for Auric AI Labs specifically have been found. The "well-funded" claim on their Breezy HR page is **unverified and should be treated as promotional language** until independently confirmed.



One job listing describes Auric AI as "a self-funded, research-driven company" with a 10–15 person team, 3–4 year runway, and zero commercial pressure — focused purely on technical excellence.

 This is the most candid data point available.

### Team size


The team is 10–15 people.

 Hiring is active across Computer Vision Researchers, Geospatial AI Engineers, AI/ML Research Engineers, SDE Interns, and now a Product Manager — plus a second Talent Acquisition Intern, 

suggesting the company is expanding its hiring function and recruiting for technically demanding roles in AI research, computer vision, and applied AI engineering.



### Revenue / Traction
⚠️ **FLAG:** No verifiable revenue, customers, or signed contracts are publicly available. No government contract wins (e.g., iDEX, DRDO, DPP) have been announced. The company has not appeared in any deal-flow or startup funding news. Assume pre-revenue.

---

## 3. Recent Moves (Last 6–12 Months)

### Product evolution: from vision to Multi-INT
The most significant recent signal is a product scope expansion. Early job postings (late 2024/early 2025) describe a pure **computer vision platform** for satellite/drone imagery. By April 2026, the company's own description has shifted to a 

"Multi-INT Search and Reasoning platform" processing satellite imagery, SAR, signals, and documents.

 Simultaneously, 

a new AI/ML Engineer role targets raw IQ data SIGINT — explicitly contrasting with the industry norm of "AI bolted onto a 1990s DSP pipeline."

 This is a meaningful pivot in ambition and scope.

### Hiring velocity
In the last ~60 days alone (as of June 2026): the PM role (this JD), a second Talent Acquisition Intern, a Geospatial AI Researcher, a Computer Vision Researcher, an SDE Intern, and an AI/ML Engineer have all been posted. This is a company simultaneously trying to staff its research bench AND install its first product function.

### Key hire context


Founder Soham Dedhia earned a degree in Aerospace Engineering from Virginia Tech, conducted research at the Unmanned Systems Lab on autonomous systems, and built Auric AI Labs around that research foundation.

 His background is aerospace/autonomy — not software product or go-to-market. This is precisely why the PM hire matters: there is no existing product sensibility at the founding layer.

⚠️ **FLAG:** No notable senior product, design, or GTM hires have been found publicly. The company appears to be research-first with this PM role as the first dedicated product hire.

---

## 4. Market & Differentiation

### Market context


Indian defense tech startups have raised $432M so far, with 70% ($307M) of that since 2024. Drones and anti-drone systems dominate, claiming 71% of total funding, and nearly all now use AI.

 Auric AI is positioned in the **software intelligence layer** of this market — not hardware drones.

### Main competitors

| Player | Focus | Differentiation vs. Auric |
|---|---|---|
| **Tonbo Imaging** | Electro-optics, sensor systems for military | Hardware-first; 

specializes in imaging and sensor systems for military reconnaissance, leveraging micro-optics and real-time vision processing.

 Established, funded ($44M+). |
| **GalaxEye** | Multi-sensor EO satellite | 

Produces AI-based multi-sensor satellites for real-time strategic intelligence.

 Upstream data provider, not the analytics layer. |
| **Pixxel** | Hyperspectral imaging satellites | 

Pushing into orbital data centers for faster geospatial intelligence delivery.

 Again, data source — not the analyst platform. |
| **ideaForge** | Drone platforms / UAV | 

India's leading drone manufacturer, deploying UAVs for defense and security.

 Platform, not intelligence software. |
| **Global: Palantir, Maxar, Hawkeye 360** | Defense intelligence software | Well-resourced Western players; export-restricted or not indigenized for India's specific operational needs. |

### Auric's actual wedge


Auric is explicitly designing solutions tailored to India's unique operational needs and challenges

 — framing indigenization as a strategic differentiator. The broader competitive moat is: (1) **full-stack AI-native architecture** (no legacy DSP), (2) **India-specific military object library** (Indian Army-relevant assets and terrain), and (3) **analyst-facing product layer** that Palantir/Maxar deliver at prohibitive cost and with export constraints.

### Where they are vulnerable
- **No verifiable deployment**: Zero known live users, pilots, or government contract wins — a critical gap in a procurement-driven market.
- **Tiny team, broad scope**: 10–15 people targeting EO, SAR, SIGINT, drone imagery, AND analyst UX simultaneously.
- **Defense procurement cycles are long**: Even well-positioned startups spend 2–4 years in trial/procurement before revenue.
- **No product layer yet**: The PM hire is the first structured product function — meaning there is no design system, no analyst research, no workflow documentation.
- 

India's defense startup strengths include strong private-sector innovation, but challenges like scaling manufacturing to military-grade needs and competing with global primes in system integration remain major bottlenecks.



---

## 5. The Product Problem This Role Owns

This role is, in effect, **the founding PM** — the first person to impose product structure on a research team. In the first 6 months, the specific surface area owned will be:

1. **The analyst workflow end-to-end**: The JD explicitly names it — "image ingestion → preprocessing → AI detection → quality review → database → dissemination." None of this workflow is currently documented, designed, or owned. This PM will build it from scratch.

2. **MVP scoping on the Vision Intelligence Platform**: The research team can detect and classify; it cannot yet present that output in a usable, trusted interface. The PM must define what "minimum viable" means for a defense analyst who cannot afford false confidence.

3. **Trust and explainability layer**: Defense users working under operational pressure need to understand *why* an AI flagged a target, not just *that* it did. Designing the quality review and confidence display layer is the hardest and most consequential UX problem this role owns.

4. **Internal tooling and PRD infrastructure**: 

Engineers are currently building backend services and workflows that "enable internal users and the overall development of the product" — with agency to iterate fast.

 There are no PRDs, no specs, and no product process. This PM will install that operating system.

5. **Stakeholder translation**: Bridging 

novel AI/ML systems for multi-modal intelligence analysis — including cross-modal data fusion, geospatial-temporal reasoning, and anomaly detection in sparse adversarial environments —

 into language and screens that a field analyst or retired officer can immediately use.

---

## 6. Candidate Angle

**The sharpest angle for an APM / founding-PM / product-builder candidate:**

This is not a role where "PM experience at a B2B SaaS company" wins. The JD's actual signal is: *Can you think from first principles in a domain you don't fully know yet, and build something a non-technical user in a high-stakes environment will trust?*

The winning narrative is built on three pillars:

**A. AI-native builder credibility** — Demonstrate you've already used AI tools to ship wireframes, prototypes, or demo flows at speed. Not "I've used ChatGPT." Show a Figma mockup built with an AI plugin, a prototype built with Cursor or v0, a demo flow assembled in 48 hours. This is table stakes for this JD.

**B. Workflow thinking, not feature thinking** — The company needs someone who maps the *job to be done* (analyst processes imagery → identifies threat → gets intel to commander in <X minutes) before touching the UI. If your application or interview doesn't lead with a proposed analyst journey map, you're behind the candidates who do.

**C. Trust as a design constraint** — The hardest product problem here is building for users who cannot tolerate false confidence under fire. Candidates who can articulate how they'd design a "confidence score + evidence trail + human-override" layer for AI outputs — referencing how Palantir, Primer, or even medical AI products handle this — will stand out sharply against candidates who talk about "delightful UX."

**What not to lead with:** B2C product experience, growth metrics, or SaaS roadmap frameworks. This team will discount all of it. 

The single most important thing they look for is first-principles thinking — someone who, when faced with a problem, breaks it down from the ground up rather than reaching for a template or convention.



**The honest risk to flag in your own assessment:** 

This is a self-funded, research-driven company with a 10–15 person team and a 3–4 year runway

 — with no confirmed revenue, no government contract wins on record, and a PM function that doesn't yet exist. The upside is maximum ownership and genuine impact on a hard, important problem. The downside is that defense procurement cycles are slow, the team is very small, and the "well-funded" claim is not independently verifiable. Enter with eyes open.

---
*⚠️ Uncertainty log: Funding status unverified (self-described "well-funded" conflicts with MCA paid-up capital of ₹10L). No revenue or customer data available publicly. Tracxn "$6.42M Auric" data attributed to a different company — do not use in interviews. Team headcount (10–15) sourced from a single job description. Investor names not confirmed for Auric AI Labs specifically.*