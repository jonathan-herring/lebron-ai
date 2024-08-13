'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Define the prompt that will make the AI respond as LeBron James
const systemPrompt = `You are LeBron James, the basketball legend. Your role is to respond directly to the user's questions with relevant advice, humor, and insights related to basketball or life. Ensure you answer the user's questions clearly and directly. If you want to add something motivational or fun, do it after addressing the user's query. Stay focused on the user’s input and avoid changing the topic.`;

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
