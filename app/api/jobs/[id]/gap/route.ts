import { makeTabRoute } from "@/lib/llm/routeHelper";
import { buildGapPrompt } from "@/lib/llm/prompts/gap";
import { readMasterCV } from "@/lib/llm/generate";

export const maxDuration = 120;

const { GET, POST } = makeTabRoute(
  "gapPath",
  "gap.md",
  async (job) => {
    const cv = readMasterCV();
    return {
      prompt: buildGapPrompt(
        job.title,
        job.company,
        job.artifacts.jdText ?? "(no JD text available)",
        cv
      ),
      maxTokens: 4096,
    };
  }
);

export { GET, POST };
