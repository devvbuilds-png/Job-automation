#!/usr/bin/env node
/**
 * daily-run.mjs — scheduled intake (Phase 4).
 *
 * Calls the app's intake API route, which runs all Apify sources through the
 * cleaning pipeline and writes only new/changed jobs. Prints the digest.
 *
 * The local app must be running (`npm run dev`). Point at a different port/host
 * with APP_URL if needed.
 *
 *   node scripts/daily-run.mjs [maxItemsPerQuery]
 */

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const maxItems = Number(process.argv[2] ?? 25);

async function main() {
  console.log(`Daily run → ${APP_URL}/api/intake/run (maxItems=${maxItems})`);

  let res;
  try {
    res = await fetch(`${APP_URL}/api/intake/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxItems }),
    });
  } catch (err) {
    console.error(`\nCould not reach the app at ${APP_URL}. Is \`npm run dev\` running?`);
    console.error(err.message);
    process.exit(1);
  }

  const data = await res.json();
  if (!res.ok) {
    console.error("Intake failed:", data.error ?? res.statusText);
    process.exit(1);
  }

  const { sources, stats, newJobs } = data;
  console.log("\nSources:");
  for (const s of sources) {
    console.log(`  ${s.source}: fetched ${s.fetched}${s.error ? ` (ERROR: ${s.error})` : ""}`);
  }
  console.log("\nPipeline:");
  console.log(`  received        ${stats.received}`);
  console.log(`  dropped (role)  ${stats.droppedByRole}`);
  console.log(`  dropped (stale) ${stats.droppedByFreshness}`);
  console.log(`  duplicates      ${stats.duplicates}`);
  console.log(`  ghosts flagged  ${stats.ghostsFlagged}`);
  console.log(`  added           ${stats.added} (${stats.maybeBucket} in Maybe bucket)`);

  if (newJobs.length) {
    console.log("\nNew since last run:");
    for (const j of newJobs) {
      console.log(`  [${j.roleBucket}] ${j.title} — ${j.company}`);
    }
  } else {
    console.log("\nNo new jobs this run.");
  }
}

main();
