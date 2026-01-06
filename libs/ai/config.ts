import type { AIConfig, ProviderName, ProviderConfig, AllProviderName, ImageProviderName } from './types';

/**
 * Unified provider configuration
 * Supports both chat and image generation capabilities
 */
const PROVIDER_ENV_KEYS: Record<AllProviderName, {
  apiKey: string;
  baseURL?: string;
  capabilities: readonly ('chat' | 'image')[];
}> = {
  // Chat + Image providers
  openai: {
    apiKey: 'OPENAI_API_KEY',
    baseURL: 'OPENAI_BASE_URL',
    capabilities: ['chat', 'image'],
  },
  qwen: {
    apiKey: 'QWEN_API_KEY',
    baseURL: 'QWEN_BASE_URL',
    capabilities: ['chat', 'image'],
  },
  // Chat only providers
  deepseek: {
    apiKey: 'DEEPSEEK_API_KEY',
    capabilities: ['chat'],
  },
  // Image only providers
  fal: {
    apiKey: 'FAL_API_KEY',
    capabilities: ['image'],
  },
};

/**
 * Get API key for any provider
 */
export function getApiKey(provider: AllProviderName): string {
  const envKey = PROVIDER_ENV_KEYS[provider];
  return process.env[envKey.apiKey] || '';
}

/**
 * Get base URL for providers that support custom endpoints
 */
export function getBaseUrl(provider: AllProviderName): string | undefined {
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (envKey.baseURL) {
    return process.env[envKey.baseURL] || undefined;
  }
  return undefined;
}

/**
 * Get provider config for chat providers (legacy support)
 */
export function getProviderConfig(provider: ProviderName): ProviderConfig[ProviderName] {
  const config: Record<string, string | undefined> = {
    apiKey: getApiKey(provider),
  };

  const baseURL = getBaseUrl(provider);
  if (baseURL) {
    config.baseURL = baseURL;
  }

  return config as ProviderConfig[ProviderName];
}

/**
 * Get default AI config from environment
 */
export function getConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER as ProviderName) || 'openai';
  return {
    provider,
    config: getProviderConfig(provider),
  };
}

/**
 * Check if a provider supports a specific capability
 */
export function hasCapability(
  provider: AllProviderName,
  capability: 'chat' | 'image'
): boolean {
  const envKey = PROVIDER_ENV_KEYS[provider];
  return envKey.capabilities.includes(capability);
}
