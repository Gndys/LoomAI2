export * from './types';
export { createProvider } from './providers';
export { getConfig, getProviderConfig } from './config';
export { streamResponse } from './utils';

import { createProvider } from './providers';
import { getConfig, getProviderConfig } from './config';
import type { ProviderName } from './types';

export function createAIHandler(options: { provider?: ProviderName } = {}) {
  if (options.provider) {
    return createProvider(options.provider, getProviderConfig(options.provider));
  }
  const config = getConfig();
  return createProvider(config.provider, config.config);
}
