import { getEnvForService } from './utils';

export const apimartConfig = {
  get apiKey() {
    return getEnvForService('APIMART_API_KEY', 'APIMart');
  },
  get baseUrl() {
    return getEnvForService('APIMART_BASE_URL', 'APIMart') ?? 'https://api.apimart.ai/v1';
  },
} as const;
