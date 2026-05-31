import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Cache the ZAI instance
let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (zaiInstance) return zaiInstance;
  zaiInstance = await ZAI.create();
  return zaiInstance;
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
    } catch (initError) {
      console.error('ZAI SDK init error:', initError);
      return NextResponse.json({
        response: "The AI assistant is temporarily unavailable. Your tracker still works perfectly — check off items manually! 💪",
        error: 'SDK not configured',
      });
    }

    // Build messages array for the LLM
    // IMPORTANT: z-ai-web-dev-sdk uses 'assistant' role for system prompts (NOT 'system')
    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [];

    // Add system prompt as 'assistant' role message (SDK requirement)
    if (systemPrompt) {
      messages.push({ role: 'assistant', content: systemPrompt });
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

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: 'disabled' },
        });

        const response = completion.choices?.[0]?.message?.content;

        if (!response || response.trim().length === 0) {
          throw new Error('Empty response from AI');
        }

        return NextResponse.json({ response });
      } catch (attemptError) {
        lastError = attemptError instanceof Error ? attemptError : new Error(String(attemptError));
        console.error(`Chat attempt ${attempt} failed:`, lastError.message);

        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    console.error('All chat attempts failed. Last error:', lastError?.message);
    return NextResponse.json({
      response: "Sorry Uday, I'm having trouble connecting right now. Please try again in a moment.",
      error: 'Chat failed after retries',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      response: "Sorry Uday, I'm having trouble connecting right now. Please try again in a moment.",
      error: 'Chat failed',
    });
  }
}
