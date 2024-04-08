import { SSE } from "sse";
import { MAX_TOKENS, OPENAI_MODEL, OPENAI_URL } from "./config";

const endPoint = process.env.NEXT_PUBLIC_OPENAI_URL ? process.env.NEXT_PUBLIC_OPENAI_URL : OPENAI_URL;

export default function createLiveChatCompletion(
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
    model: OPENAI_MODEL,
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
