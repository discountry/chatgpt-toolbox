import { SSE } from "sse";
import { MAX_TOKENS, OPENAI_MODEL, OPENAI_URL } from "./config";

const endPoint = process.env.NEXT_PUBLIC_OPENAI_URL ? process.env.NEXT_PUBLIC_OPENAI_URL : OPENAI_URL;

export type LLMType = "gpt-3.5-turbo" | "claude-3-haiku" | "llama-3-70b" | "mixtral-8x7b";

export default function createLiveChatCompletion(
  model: LLMType,
  apiKey: string,
  maxTokens: number,
  direction: string,
  question: any,
  type = "tool"
) {
  const prompt = [
    { role: "system", content: direction },
    { role: "user", content: question },
  ];

  const data = {
    model: model || OPENAI_MODEL,
    messages:
      type === "tool"
        ? prompt
        : [{ role: "system", content: direction }, ...question],
    temperature: 0.7,
    // max_tokens: maxTokens ? maxTokens : MAX_TOKENS,
    stream: true,
  };

  const source = new SSE(endPoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey ? apiKey : process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    payload: JSON.stringify(data),
  });

  return source;
}
