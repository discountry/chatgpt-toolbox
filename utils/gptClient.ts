import { MAX_TOKENS, OPENAI_MODEL, OPENAI_URL } from "./config";

const endPoint = process.env.NEXT_PUBLIC_OPENAI_URL ? process.env.NEXT_PUBLIC_OPENAI_URL : OPENAI_URL;

export default async function createChatCompletion(
  apiKey: string,
  maxTokens: number,
  direction: string,
  question: string
) {
  const prompt = [
    { role: "system", content: direction },
    { role: "user", content: question },
  ];

  const data = JSON.stringify({
    model: OPENAI_MODEL,
    messages: prompt,
    max_tokens: maxTokens ? maxTokens : MAX_TOKENS,
  });

  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey ? apiKey : process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: data,
  });

  const completion = await response.json();

  console.log(completion);

  if (Object.prototype.hasOwnProperty.call(completion, "choices")) {
    return completion.choices[0].message.content;
  } else if (Object.prototype.hasOwnProperty.call(completion, "error")) {
    return completion.error.message;
  } else {
    return false;
  }
}
