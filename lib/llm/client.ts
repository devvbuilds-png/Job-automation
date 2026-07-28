import OpenAI from "openai";

/**
 * LLM client — DeepSeek via its OpenAI-compatible API.
 *
 * DeepSeek speaks the OpenAI chat-completions protocol, so we use the `openai`
 * SDK pointed at DEEPSEEK_BASE_URL. Model is set in env (deepseek-chat = V3, the
 * cheap fast generalist we use for all tabs; deepseek-reasoner = R1 if a tab ever
 * needs heavier reasoning).
 *
 * (Previously @anthropic-ai/sdk — swapped in the pre-Phase 4 DeepSeek shift. The
 * Anthropic key is kept commented in .env.local as an optional fallback.)
 */
let _client: OpenAI | null = null;

export function getClient(): OpenAI {
  if (!_client) {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error("DEEPSEEK_API_KEY is not set in .env.local");
    _client = new OpenAI({
      apiKey: key,
      baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    });
  }
  return _client;
}

export function getModel(): string {
  return process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
}
