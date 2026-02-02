import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { fal, createFal } from '@ai-sdk/fal';
import type { ChatProviderName, ImageProviderName, ProviderConfig } from './types';

/**
 * Create a chat-capable AI provider instance
 * 
 * These providers support the callable pattern: provider(modelName)
 * - qwen: Chat + Image (via OpenAI-compatible API)
 * - openai: Chat + Image (DALL-E)
 * - deepseek: Chat only
 * - devdove: Chat only (OpenAI-compatible)
 */
export function createChatProvider(
  providerName: ChatProviderName,
  config?: ProviderConfig[ChatProviderName]
) {
  switch (providerName) {
    case 'qwen': {
      const qwenConfig = config as ProviderConfig['qwen'] | undefined;
      return createOpenAICompatible({
        name: 'qwen',
        apiKey: qwenConfig?.apiKey || process.env.QWEN_API_KEY || '',
        baseURL: qwenConfig?.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });
    }
    case 'openai': {
      return createOpenAI(config as ProviderConfig['openai']);
    }
    case 'deepseek': {
      return createDeepSeek(config as ProviderConfig['deepseek']);
    }
    case 'devdove': {
      const devdoveConfig = config as ProviderConfig['devdove'] | undefined;
      return createOpenAICompatible({
        name: 'devdove',
        apiKey: devdoveConfig?.apiKey || process.env.DEVDOVE_API_KEY || '',
        baseURL: devdoveConfig?.baseURL || process.env.DEVDOVE_BASE_URL || 'https://api.devdove.site',
      });
    }
    default:
      throw new Error(`Unsupported chat provider: ${providerName}`);
  }
}

/**
 * Create an image-capable AI provider instance
 * 
 * Returns the provider object for image generation
 * - fal: Image only (Flux models)
 * - openai: Chat + Image (DALL-E)
 */
export function createImageProvider(
  providerName: ImageProviderName,
  config?: ProviderConfig[ImageProviderName]
) {
  switch (providerName) {
    case 'fal': {
      const falConfig = config as ProviderConfig['fal'] | undefined;
      if (falConfig?.apiKey) {
        return createFal({ apiKey: falConfig.apiKey });
      }
      // Use default fal instance (reads FAL_API_KEY from env)
      return fal;
    }
    case 'openai': {
      return createOpenAI(config as ProviderConfig['openai']);
    }
    case 'qwen': {
      // Qwen image generation uses native HTTP, not AI SDK
      // Return null to indicate direct API usage is required
      return null;
    }
    default:
      throw new Error(`Unsupported image provider: ${providerName}`);
  }
}

// Legacy alias for backwards compatibility
export const createProvider = createChatProvider;

// Re-export the default fal instance for convenience
export { fal } from '@ai-sdk/fal';
