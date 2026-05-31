import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Cache the ZAI instance and config
let zaiInstance: ZAI | null = null;
let cachedConfig: { baseUrl: string; apiKey: string; chatId?: string; userId?: string; token?: string } | null = null;

// Load config directly (bypassing SDK's loadConfig to add more logging)
async function loadConfigDirect() {
  if (cachedConfig) return cachedConfig;

  const homeDir = os.homedir();
  const configPaths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(homeDir, '.z-ai-config'),
    '/etc/.z-ai-config',
  ];

  for (const filePath of configPaths) {
    try {
      const configStr = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(configStr);
      if (config.baseUrl && config.apiKey) {
        console.log(`[AI Chat] Config loaded from: ${filePath}`);
        cachedConfig = config;
        return config;
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[AI Chat] Error reading config at ${filePath}:`, error);
      }
    }
  }

  throw new Error('No .z-ai-config found in project, home, or /etc');
}

async function getZAI(): Promise<ZAI> {
  if (zaiInstance) return zaiInstance;
  try {
    // Try loading config ourselves first for better error messages
    await loadConfigDirect();
    zaiInstance = await ZAI.create();
    console.log('[AI Chat] ZAI SDK initialized successfully');
    return zaiInstance;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Chat] ZAI SDK init error:', msg);
    // Reset so next attempt tries again
    zaiInstance = null;
    throw error;
  }
}

// Direct API call fallback (bypasses SDK if it fails to init)
async function directChatCall(
  messages: Array<{ role: string; content: string }>,
  config: { baseUrl: string; apiKey: string; chatId?: string; userId?: string; token?: string }
): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'X-Z-AI-From': 'Z',
  };
  if (config.chatId) headers['X-Chat-Id'] = config.chatId;
  if (config.userId) headers['X-User-Id'] = config.userId;
  if (config.token) headers['X-Token'] = config.token;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, thinking: { type: 'disabled' } }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build messages array for the LLM
    // IMPORTANT: z-ai-web-dev-sdk uses 'assistant' role for system prompts (NOT 'system')
    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'assistant', content: systemPrompt });
    }

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    // Try SDK first, then direct API call as fallback
    let responseText = '';

    try {
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });
      responseText = completion.choices?.[0]?.message?.content || '';
    } catch (sdkError) {
      console.warn('[AI Chat] SDK call failed, trying direct API call...', sdkError instanceof Error ? sdkError.message : sdkError);

      // Fallback: direct API call
      try {
        const config = await loadConfigDirect();
        responseText = await directChatCall(messages, config);
        console.log('[AI Chat] Direct API call succeeded');
      } catch (directError) {
        console.error('[AI Chat] Direct API call also failed:', directError instanceof Error ? directError.message : directError);
      }
    }

    if (responseText && responseText.trim().length > 0) {
      return NextResponse.json({ response: responseText });
    }

    // All methods failed
    return NextResponse.json({
      response: "Sorry Uday, I'm having trouble connecting right now. Please try again in a moment. 🔄",
      error: 'All AI methods failed',
    });
  } catch (error) {
    console.error('[AI Chat] Route error:', error);
    return NextResponse.json({
      response: "Sorry Uday, I'm having trouble connecting right now. Please try again in a moment. 🔄",
      error: 'Chat route failed',
    });
  }
}
