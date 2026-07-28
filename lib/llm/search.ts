/**
 * Web-search augmentation for the Research tab.
 *
 * Anthropic had a native `web_search` tool; DeepSeek does not. So we do retrieval
 * ourselves: query a search API, then feed the results into the prompt as grounding
 * context. We use Tavily (built for LLM grounding, generous free tier).
 *
 * GRACEFUL DEGRADATION: if TAVILY_API_KEY is not set, this returns null and the
 * Research tab falls back to model-knowledge-only (with a note in the prompt). The
 * app never hard-fails just because search isn't configured.
 */

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export async function webSearchContext(query: string): Promise<string | null> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: "advanced",
        max_results: 8,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      answer?: string;
      results?: TavilyResult[];
    };

    const lines: string[] = [];
    if (data.answer) lines.push(`Search summary: ${data.answer}\n`);
    for (const r of data.results ?? []) {
      lines.push(`- [${r.title}](${r.url})\n  ${r.content}`);
    }
    if (lines.length === 0) return null;

    return `--- LIVE WEB SEARCH RESULTS (retrieved ${new Date().toDateString()}) ---\n${lines.join(
      "\n"
    )}\n--- END SEARCH RESULTS ---`;
  } catch {
    return null;
  }
}
