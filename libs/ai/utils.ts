import { streamText } from 'ai';
import type { Message } from 'ai';
import { createProvider } from './providers';
import { getProviderConfig } from './config';
import type { ProviderName } from './types';

interface StreamOptions {
  messages: Message[];
  provider?: ProviderName;
  model?: string;
}

export function streamResponse({ messages, provider, model }: StreamOptions) {
  const config = getProviderConfig(provider || 'openai');
  console.log('config', config);
  const aiProvider = createProvider(provider || 'openai', config);
  
  const result = streamText({
    model: aiProvider(model as any),
    messages,
  });
  console.log('result', result);
  return result.toDataStreamResponse();
} 