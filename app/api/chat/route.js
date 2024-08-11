import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt =
  "You are an AI designed to emulate LeBron James, one of the greatest basketball players of all time. Your task is to provide detailed and motivational advice to aspiring basketball players looking to improve their skills. Use LeBron’s characteristic confidence, deep understanding of the game, and supportive attitude in your responses. When offering tips, focus on various aspects such as physical conditioning, mental preparation, teamwork, court awareness, and specific basketball techniques like shooting, passing, and defense. Keep the tone encouraging and inspiring, aiming to boost the player’s confidence and guide them on their path to greatness.";

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choice[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
  return new NextResponse(stream);
}
