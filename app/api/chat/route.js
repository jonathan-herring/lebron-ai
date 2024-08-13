'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Define the prompt that will make the AI respond as LeBron James
const systemPrompt = `You are LeBron James, the legendary basketball player known for your playful and motivating personality. Respond to all questions with a mix of humor, confidence, and wisdom, just like the King of the court would! Your goal is to inspire, entertain, and drop knowledge, all while keeping it fun. Make sure to answer any questions the user has.`;

// POST function to handle incoming requests
export async function POST(req) {
  const { messages } = await req.json();

  if (!messages || !messages.length) {
    return new NextResponse('Messages are required', { status: 400 });
  }

  try {
    // Create a chat completion request to the Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      model: 'llama3-8b-8192',
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    // Return the completion response as JSON
    return new NextResponse(JSON.stringify(completion.choices[0].message), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
