/**
 * Storage Configuration
 */
import { getEnv, getEnvForService, requireEnvForService, requireEnvWithFallback } from './utils';

export const storageConfig = {
  /**
   * Default Storage Provider
   * @type {'oss' | 's3' | 'r2'}
   */
  get defaultProvider() {
    const provider = getEnv('STORAGE_PROVIDER');
    if (provider && ['oss', 's3', 'r2'].includes(provider)) {
      return provider as 'oss' | 's3' | 'r2';
    }
    return 'oss' as const;
  },

  /**
   * Alibaba Cloud OSS Configuration
   * Note: OSS can reuse ALIYUN_ACCESS_KEY_ID/SECRET if OSS_ACCESS_KEY_ID/SECRET are not set
   */
  oss: {
    get region() {
      return getEnv('OSS_REGION') || 'oss-cn-shanghai';
    },
    get accessKeyId() {
      // Fallback to ALIYUN_ACCESS_KEY_ID if OSS_ACCESS_KEY_ID is not set
      return requireEnvWithFallback(['OSS_ACCESS_KEY_ID', 'ALIYUN_ACCESS_KEY_ID'], 'Alibaba Cloud OSS');
    },
    get accessKeySecret() {
      // Fallback to ALIYUN_ACCESS_KEY_SECRET if OSS_ACCESS_KEY_SECRET is not set
      return requireEnvWithFallback(['OSS_ACCESS_KEY_SECRET', 'ALIYUN_ACCESS_KEY_SECRET'], 'Alibaba Cloud OSS');
    },
    get bucket() {
      return getEnv('OSS_BUCKET') || 'tinyship';
    },
    get endpoint() {
      return getEnv('OSS_ENDPOINT') || 'oss-cn-shanghai.aliyuncs.com';
    },
    defaultExpiration: 60, // 1 minute in seconds
  },

  /**
   * AWS S3 Configuration
   */
  s3: {
    get region() {
      return getEnv('S3_REGION') || 'us-east-1';
    },
    get accessKeyId() {
      return requireEnvForService('S3_ACCESS_KEY_ID', 'AWS S3');
    },
    get accessKeySecret() {
      return requireEnvForService('S3_ACCESS_KEY_SECRET', 'AWS S3');
    },
    get bucket() {
      return getEnv('S3_BUCKET') || 'tinyship';
    },
    get endpoint() {
      return getEnvForService('S3_ENDPOINT', 'AWS S3');
    },
    get forcePathStyle() {
      return getEnv('S3_FORCE_PATH_STYLE') === 'true';
    },
    defaultExpiration: 3600, // 1 hour in seconds
  },

  /**
   * Cloudflare R2 Configuration
   * R2 is S3-compatible, uses S3Provider under the hood
   */
  r2: {
    get accountId() {
      return requireEnvForService('R2_ACCOUNT_ID', 'Cloudflare R2');
    },
    get accessKeyId() {
      return requireEnvForService('R2_ACCESS_KEY_ID', 'Cloudflare R2');
    },
    get accessKeySecret() {
      return requireEnvForService('R2_ACCESS_KEY_SECRET', 'Cloudflare R2');
    },
    get bucket() {
      return getEnv('R2_BUCKET') || 'tinyship';
    },
    defaultExpiration: 3600, // 1 hour in seconds
  }
} as const;
