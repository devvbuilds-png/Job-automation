import { NextRequest, NextResponse } from "next/server";
import { runAllIntake } from "@/lib/intake/run";

// Apify scraping + liveness fetches per job — give it room.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let maxItems = 25;
  try {
    const body = await req.json();
    if (typeof body.maxItems === "number") maxItems = body.maxItems;
  } catch {
    /* no body — use defaults */
  }

  try {
    const digest = await runAllIntake({ maxItems });
    return NextResponse.json(digest);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Intake failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
