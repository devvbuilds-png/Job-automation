import { makeTabRoute } from "@/lib/llm/routeHelper";
import { buildStandOutPrompt } from "@/lib/llm/prompts/standout";
import { readArtifact } from "@/lib/llm/generate";

export const maxDuration = 120;

const { GET, POST } = makeTabRoute(
  "standoutPath",
  "standout.md",
  async (job) => {
    const research = readArtifact(job.artifacts.researchPath);
    const gap = readArtifact(job.artifacts.gapPath);

    if (!research) throw new Error("Run Company & Product Research first.");
    if (!gap) throw new Error("Run Gap Analysis first.");

    return {
      prompt: buildStandOutPrompt(job.title, job.company, research, gap),
      maxTokens: 4096,
    };
  }
);

export { GET, POST };
