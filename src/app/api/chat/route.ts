import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Cache the ZAI instance
let zaiInstance: ZAI | null = null;
let zaiInitError: string | null = null;

async function getZAI(): Promise<ZAI> {
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    return zaiInstance;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    zaiInitError = msg;
    console.error('ZAI SDK init error:', msg);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let zai: ZAI;
    try {
      zai = await getZAI();
    } catch {
      return NextResponse.json({
        response: "The AI assistant is not configured on this server. This feature works when running locally or with proper SDK configuration. Your tracker still works perfectly — check off items manually! 💪",
        error: 'SDK not configured',
      });
    }

    // Build messages array for the LLM
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Add system prompt as 'system' role message
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // Add conversation history (skip initial welcome message)
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      response: "Sorry Uday, I'm having trouble connecting right now. Please try again in a moment.",
      error: 'Chat failed',
    });
  }
}
