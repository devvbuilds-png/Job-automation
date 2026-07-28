import fs from "fs";
import path from "path";
import { getClient, getModel } from "./client";
import { webSearchContext } from "./search";
import { getJobById, updateJobFields } from "@/lib/data";
import type { JobRecord } from "@/lib/types";

export type ArtifactKey = keyof JobRecord["artifacts"];

interface GenerateOptions {
  jobId: string;
  artifactKey: ArtifactKey;
  /** Relative path from project root, e.g. "data/jobs/<id>/research.md" */
  artifactRelPath: string;
  prompt: string;
  system?: string;
  useWebSearch?: boolean;
  /** Query for live web-search grounding when useWebSearch is true. */
  searchQuery?: string;
  force?: boolean;
  maxTokens?: number;
}

/**
 * Call DeepSeek (OpenAI-compatible chat completions). When useWebSearch is set,
 * we retrieve grounding context ourselves (DeepSeek has no native search) and
 * prepend it to the prompt. If search isn't configured, we note that and proceed
 * on model knowledge alone. Returns the text content.
 */
async function callLLM(
  prompt: string,
  system: string | undefined,
  useWebSearch: boolean,
  searchQuery: string | undefined,
  maxTokens: number
): Promise<string> {
  const client = getClient();
  const model = getModel();

  let groundedPrompt = prompt;
  if (useWebSearch) {
    const context = await webSearchContext(searchQuery ?? prompt.slice(0, 200));
    groundedPrompt = context
      ? `${context}\n\nUse the live search results above as primary grounding. Cite the source URLs. Flag anything not supported by them.\n\n${prompt}`
      : `(No live web search configured — answer from your own knowledge and clearly flag anything you are not certain is current.)\n\n${prompt}`;
  }

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: groundedPrompt });

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages,
  });

  return (response.choices[0]?.message?.content ?? "").trim();
}

/** Generate content, cache to disk, update job record. Returns the content. */
export async function generateAndCache(opts: GenerateOptions): Promise<string> {
  const fullPath = path.join(process.cwd(), opts.artifactRelPath);

  // Return cached unless force
  if (!opts.force && fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, "utf-8");
  }

  const content = await callLLM(
    opts.prompt,
    opts.system,
    opts.useWebSearch ?? false,
    opts.searchQuery,
    opts.maxTokens ?? 4096
  );

  // Persist to disk
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");

  // Update artifacts on the job record
  const job = getJobById(opts.jobId);
  if (job) {
    updateJobFields(opts.jobId, {
      artifacts: { ...job.artifacts, [opts.artifactKey]: opts.artifactRelPath },
    });
  }

  return content;
}

/** Read artifact from disk if it exists, else return null. */
export function readArtifact(relPath: string | undefined): string | null {
  if (!relPath) return null;
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf-8");
}

/** Read the master CV from resume/cv.md. Throws if missing. */
export function readMasterCV(): string {
  const candidates = ["resume/cv.md", "resume/cv.txt", "resume/cv.pdf"];
  for (const p of candidates) {
    const full = path.join(process.cwd(), p);
    if (fs.existsSync(full)) {
      return fs.readFileSync(full, "utf-8");
    }
  }
  throw new Error(
    "Master CV not found. Add your CV to resume/cv.md (markdown format preferred)."
  );
}
