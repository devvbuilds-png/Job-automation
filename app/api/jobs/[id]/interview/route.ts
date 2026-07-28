import { makeTabRoute } from "@/lib/llm/routeHelper";
import { buildInterviewPrompt } from "@/lib/llm/prompts/interview";
import { readArtifact } from "@/lib/llm/generate";

export const maxDuration = 120;

const { GET, POST } = makeTabRoute(
  "interviewPath",
  "interview.md",
  async (job) => {
    const gap = readArtifact(job.artifacts.gapPath);
    if (!gap) throw new Error("Run Gap Analysis first.");

    return {
      prompt: buildInterviewPrompt(
        job.title,
        job.company,
        job.artifacts.jdText ?? "(no JD text available)",
        gap,
        job.heardBack
      ),
      maxTokens: 4096,
    };
  }
);

export { GET, POST };
