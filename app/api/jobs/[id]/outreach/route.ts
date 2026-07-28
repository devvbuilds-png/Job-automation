import { makeTabRoute } from "@/lib/llm/routeHelper";
import { buildOutreachPrompt } from "@/lib/llm/prompts/outreach";
import { readArtifact } from "@/lib/llm/generate";

export const maxDuration = 120;

const { GET, POST } = makeTabRoute(
  "outreachPath",
  "outreach.md",
  async (job) => {
    const research = readArtifact(job.artifacts.researchPath) ?? "";
    return {
      prompt: buildOutreachPrompt(
        job.title,
        job.company,
        job.artifacts.jdText ?? "(no JD text available)",
        research
      ),
      maxTokens: 2048,
    };
  }
);

export { GET, POST };
