import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getJobById, updateJobFields } from "@/lib/data";
import { generateAndCache, readArtifact, readMasterCV } from "@/lib/llm/generate";
import { buildResumePrompt } from "@/lib/llm/prompts/resume";
import { generateResumePdf } from "@/lib/llm/resumePdf";

export const maxDuration = 120;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const mdContent = readArtifact(job.artifacts.resumePath?.replace(".pdf", ".md") ?? job.artifacts.resumePath ?? "");
  return NextResponse.json({ content: mdContent });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  let force = false;
  try { const b = await req.json(); force = b.force === true; } catch { /* no body */ }

  try {
    const cv = readMasterCV();
    const mdRelPath = `data/jobs/${id}/resume.md`;
    const pdfRelPath = `data/jobs/${id}/resume.pdf`;

    // Generate (or return cached) tailored markdown
    const mdContent = await generateAndCache({
      jobId: id,
      artifactKey: "resumePath",
      artifactRelPath: mdRelPath,
      prompt: buildResumePrompt(job.title, job.company, job.artifacts.jdText ?? "", cv),
      maxTokens: 4096,
      force,
    });

    // Generate PDF from the markdown
    const pdfFullPath = path.join(process.cwd(), pdfRelPath);
    const pdfExists = fs.existsSync(pdfFullPath);

    if (!pdfExists || force) {
      await generateResumePdf(mdContent, pdfFullPath);
      // Store PDF path in artifacts too
      const fresh = getJobById(id);
      if (fresh) {
        updateJobFields(id, {
          artifacts: { ...fresh.artifacts, resumePath: pdfRelPath },
        });
      }
    }

    return NextResponse.json({ content: mdContent, pdfPath: pdfRelPath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

