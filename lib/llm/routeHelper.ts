import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/data";
import { generateAndCache, readArtifact, type ArtifactKey } from "./generate";

export type PromptBuilder = (job: ReturnType<typeof getJobById> & object) => Promise<{
  prompt: string;
  system?: string;
  useWebSearch?: boolean;
  searchQuery?: string;
  maxTokens?: number;
}>;

export function makeTabRoute(
  artifactKey: ArtifactKey,
  artifactFilename: string,
  buildPromptOrOptions: PromptBuilder
) {
  async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const job = getJobById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const content = readArtifact(job.artifacts[artifactKey]);
    return NextResponse.json({ content });
  }

  async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const job = getJobById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    let force = false;
    try {
      const body = await req.json();
      force = body.force === true;
    } catch { /* no body */ }

    try {
      const opts = await buildPromptOrOptions(job as NonNullable<typeof job>);
      const artifactRelPath = `data/jobs/${id}/${artifactFilename}`;

      const content = await generateAndCache({
        jobId: id,
        artifactKey,
        artifactRelPath,
        prompt: opts.prompt,
        system: opts.system,
        useWebSearch: opts.useWebSearch,
        searchQuery: opts.searchQuery,
        maxTokens: opts.maxTokens,
        force,
      });

      return NextResponse.json({ content });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return { GET, POST };
}
