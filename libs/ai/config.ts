import type { AIConfig, ProviderName, ProviderConfig } from './types';

const ENV_KEYS = {
  openai: {
    apiKey: 'OPENAI_API_KEY',
    baseURL: 'OPENAI_BASE_URL'
  },
  qwen: {
    apiKey: 'QWEN_API_KEY',
    baseURL: 'QWEN_BASE_URL'
  },
  deepseek: {
    apiKey: 'DEEPSEEK_API_KEY'
  }
} as const;

export function getProviderConfig(provider: ProviderName): ProviderConfig[ProviderName] {
  const envKey = ENV_KEYS[provider];
  const config = {
    apiKey: process.env[envKey.apiKey] || ''
  };

  if ('baseURL' in envKey && process.env[envKey.baseURL]) {
    return {
      ...config,
      baseURL: process.env[envKey.baseURL]!
    } as ProviderConfig[ProviderName];
  }

  return config as ProviderConfig[ProviderName];
}

export function getConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER as ProviderName) || 'openai';
  return {
    provider,
    config: getProviderConfig(provider)
  };
}
