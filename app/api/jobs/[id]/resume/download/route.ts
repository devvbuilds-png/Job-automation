import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getJobById } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return new NextResponse("Not found", { status: 404 });

  // Try PDF first, fall back to MD
  const candidates = [
    `data/jobs/${id}/resume.pdf`,
    `data/jobs/${id}/resume.md`,
  ];

  for (const relPath of candidates) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const isPdf = relPath.endsWith(".pdf");
      return new NextResponse(buf, {
        headers: {
          "Content-Type": isPdf ? "application/pdf" : "text/markdown",
          "Content-Disposition": `attachment; filename="${job.company.replace(/\s+/g, "-")}-resume.${isPdf ? "pdf" : "md"}"`,
        },
      });
    }
  }

  return new NextResponse("Resume not generated yet", { status: 404 });
}
