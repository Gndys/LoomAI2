import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import type { ProviderName, ProviderConfig } from './types';

export function createProvider(providerName: ProviderName, config: ProviderConfig[ProviderName]) {
  switch (providerName) {
    case 'qwen': {
      return createOpenAI({
        ...config,
        compatibility: 'compatible'
      });
    }
    case 'openai': {
      return createOpenAI(config);
    }
    case 'deepseek':
      return createDeepSeek(config);
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}
