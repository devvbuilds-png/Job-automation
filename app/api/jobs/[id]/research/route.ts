import { makeTabRoute } from "@/lib/llm/routeHelper";
import { buildResearchPrompt } from "@/lib/llm/prompts/research";

export const maxDuration = 120;

const { GET, POST } = makeTabRoute(
  "researchPath",
  "research.md",
  async (job) => ({
    prompt: buildResearchPrompt(
      job.company,
      job.title,
      job.artifacts.jdText ?? "(no JD text available)",
      new Date().toDateString()
    ),
    useWebSearch: true,
    searchQuery: `${job.company} product company India funding users ${job.title}`,
    maxTokens: 4096,
  })
);

export { GET, POST };
