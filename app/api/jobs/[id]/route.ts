import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJobFields } from "@/lib/data";
import type { JobRecord } from "@/lib/types";

// Fields Dev is allowed to update via the UI
type WritableFields = Pick<
  JobRecord,
  | "tier"
  | "status"
  | "demoStatus"
  | "heardBack"
  | "appliedDate"
  | "notes"
  | "followups"
  | "liveness"
  | "livenessCheckedAt"
  | "ghostFlag"
  | "fitScore"
  | "outcome"
>;

const WRITABLE: (keyof WritableFields)[] = [
  "tier",
  "status",
  "demoStatus",
  "heardBack",
  "appliedDate",
  "notes",
  "followups",
  "liveness",
  "livenessCheckedAt",
  "ghostFlag",
  "fitScore",
  "outcome",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only allow whitelisted fields
  const update: Partial<JobRecord> = {};
  for (const key of WRITABLE) {
    if (key in body) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (update as any)[key] = body[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No writable fields in payload" }, { status: 400 });
  }

  const updated = updateJobFields(id, update);
  return NextResponse.json({ job: updated });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ job });
}
