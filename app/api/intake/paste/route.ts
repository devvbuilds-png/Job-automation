import { NextRequest, NextResponse } from "next/server";
import { extractAndBuildRecord } from "@/lib/intake/paste";
import { getAllJobs, upsertJob, readSeenLedger, writeSeenLedger } from "@/lib/data";

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = body.url?.trim();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Invalid request body or URL" }, { status: 400 });
  }

  try {
    const record = await extractAndBuildRecord(url);

    // Dedup: check seen ledger
    const ledger = readSeenLedger();
    if (ledger.fingerprints.includes(record.id)) {
      // Return the existing record instead of creating a duplicate
      const existing = getAllJobs().find((j) => j.id === record.id);
      return NextResponse.json({ job: existing ?? record, duplicate: true });
    }

    // Save to seen ledger
    ledger.fingerprints.push(record.id);
    const platform = record.sources[0]?.platform ?? "Other";
    if (!ledger.sourceIds[platform]) ledger.sourceIds[platform] = [];
    writeSeenLedger(ledger);

    // Save to jobs.json
    upsertJob(record);

    return NextResponse.json({ job: record, duplicate: false }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
