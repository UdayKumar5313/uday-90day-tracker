import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, history } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    
    // Build messages array for the LLM
    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [];
    
    // Add system prompt as first assistant message
    if (systemPrompt) {
      messages.push({ role: 'assistant', content: systemPrompt });
    }
    
    // Add conversation history
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

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', response: 'Sorry Uday, I\'m having trouble connecting right now. Please try again.' },
      { status: 500 }
    );
  }
}
