import createChatCompletion from "@/utils/gptClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const result = await request.json();

  const completion = await createChatCompletion(
    result.apiKey,
    result.maxTokens,
    result.direction,
    result.question
  );

  return NextResponse.json(completion);
}
