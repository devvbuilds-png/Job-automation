import { readFileSync, writeFileSync } from "fs";

const jobs = JSON.parse(readFileSync("data/jobs.json", "utf-8"));
let changed = false;

for (const job of jobs) {
  if (!job.artifacts?.jdText) continue;
  let t = job.artifacts.jdText;

  // Insert breaks before known section patterns
  const breaks = [
    "Job Description", "About Auric AI", "The Role",
    "What You Will Do", "What You'll Do",
    "Vision and Roadmap", "Vision & Roadmap",
    "Workflow and UX Design", "Workflow & UX Design",
    "Feature Prioritization", "Execution and Delivery", "Execution & Delivery",
    "User and Stakeholder Engagement", "User & Stakeholder Engagement",
    "Metrics and Success", "Metrics & Success",
    "What We're Looking For", "Why Join Us", "Apply for this Job",
  ];

  for (const h of breaks) {
    t = t.split(h).join("\n\n" + h + "\n");
  }

  // Break before sentences that start after ". Capital" (bullet-like)
  t = t.replace(/\. ([A-Z][a-z])/g, ".\n$1");

  // Collapse 3+ blank lines
  t = t.replace(/\n{3,}/g, "\n\n").trim();

  job.artifacts.jdText = t;
  changed = true;
}

if (changed) {
  writeFileSync("data/jobs.json", JSON.stringify(jobs, null, 2));
  console.log("jdText reformatted.");
} else {
  console.log("Nothing to fix.");
}
