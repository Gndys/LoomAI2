import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';
import { createProvider } from './providers';
import { getProviderConfig } from './config';
import type { ProviderName } from './types';

interface StreamOptions {
  messages: UIMessage[];
  provider?: ProviderName;
  model?: string;
}

interface UsageData {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface StreamResponseWithUsage {
  response: Response;
  usage: Promise<UsageData>;
  provider: string;
  model: string;
}

/**
 * Stream AI response with usage tracking capability
 * Returns both the response and a promise for usage data
 */
export function streamResponseWithUsage({ messages, provider, model }: StreamOptions): StreamResponseWithUsage {
  // Validate messages
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid messages: messages must be an array');
  }
  
  // Validate each message
  messages.forEach((message, index) => {
    if (!message || typeof message !== 'object') {
      throw new Error(`Invalid message at index ${index}: message must be an object`);
    }
    if (!message.role || typeof message.role !== 'string') {
      throw new Error(`Invalid message at index ${index}: role must be a string`);
    }
  });
  
  const providerName = provider || 'openai';
  const config = getProviderConfig(providerName);
  const aiProvider = createProvider(providerName, config);
  
  const result = streamText({
    model: aiProvider(model as any),
    messages: convertToModelMessages(messages),
  });
  
  const response = result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: () => crypto.randomUUID(),
  });
  
  // Use SDK's usage data directly with safe defaults
  const usagePromise: Promise<UsageData> = result.usage.then((usage) => ({
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0
  }));

  return {
    response,
    usage: usagePromise,
    provider: providerName,
    model: model || 'default'
  };
}

/**
 * Simple stream response (backwards compatible)
 * Use streamResponseWithUsage for credit consumption tracking
 */
export function streamResponse({ messages, provider, model }: StreamOptions): Response {
  return streamResponseWithUsage({ messages, provider, model }).response;
}