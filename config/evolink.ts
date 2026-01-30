import { getEnvForService } from './utils';

export const evolinkConfig = {
  get apiKey() {
    return getEnvForService('EVOLINK_API_KEY', 'Evolink');
  },
  get baseUrl() {
    return getEnvForService('EVOLINK_BASE_URL', 'Evolink') ?? 'https://api.evolink.ai/v1';
  },
} as const;

