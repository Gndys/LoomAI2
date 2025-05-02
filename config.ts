import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to get environment variables
function getEnv(key: string): string | undefined {
  return process.env[key];
}

// Warning function
function warnMissingEnv(key: string, service: string): void {
  console.warn(`Warning: Missing environment variable ${key} for ${service} service. This service will not be available.`);
}

// Function to get environment variables for optional services
function getEnvForService(key: string, service: string): string | undefined {
  const value = getEnv(key);
  if (!value) {
    warnMissingEnv(key, service);
  }
  return value;
}

// Function to get environment variables for required services
function requireEnvForService(key: string, service: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key} for ${service} service. This service is required for the application to function.`);
  }
  return value;
}

/**
 * Application Configuration
 */
export const config = {
  /**
   * Authentication Service Configuration
   */
  auth: {
    /**
     * Social Login Providers Configuration
     */
    socialProviders: {
      /**
       * Google OAuth Configuration
       */
      google: {
        get clientId() {
          return getEnvForService('GOOGLE_CLIENT_ID', 'Google Auth');
        },
        get clientSecret() {
          return getEnvForService('GOOGLE_CLIENT_SECRET', 'Google Auth');
        }
      },

      /**
       * GitHub OAuth Configuration
       */
      github: {
        get clientId() {
          return getEnvForService('GITHUB_CLIENT_ID', 'GitHub Auth');
        },
        get clientSecret() {
          return getEnvForService('GITHUB_CLIENT_SECRET', 'GitHub Auth');
        }
      },

      /**
       * WeChat OAuth Configuration
       */
      wechat: {
        get appId() {
          return getEnvForService('WECHAT_APP_ID', 'WeChat Auth');
        },
        get appSecret() {
          return getEnvForService('WECHAT_APP_SECRET', 'WeChat Auth');
        }
      }
    }
  },

  /**
   * SMS Service Configuration
   */
  sms: {
    /**
     * Default SMS Provider
     */
    defaultProvider: 'aliyun',

    /**
     * Aliyun SMS Configuration
     */
    aliyun: {
      // Optional service, using warning instead of error
      get accessKeyId() {
        return getEnvForService('ALIYUN_ACCESS_KEY_ID', 'Aliyun SMS');
      },
      get accessKeySecret() {
        return getEnvForService('ALIYUN_ACCESS_KEY_SECRET', 'Aliyun SMS');
      },
      endpoint: 'dysmsapi.aliyuncs.com',
      signName: 'Your Sign Name',
    },

    /**
     * Twilio SMS Configuration
     */
    twilio: {
      // Optional service, using warning instead of error
      get accountSid() {
        return getEnvForService('TWILIO_ACCOUNT_SID', 'Twilio SMS');
      },
      get authToken() {
        return getEnvForService('TWILIO_AUTH_TOKEN', 'Twilio SMS');
      },
      defaultFrom: '+1234567890',
    }
  },

  /**
   * Email Service Configuration
   */
  email: {
    /**
     * Default Email Provider
     */
    defaultProvider: 'resend',

    /**
     * Default Sender Email
     */
    defaultFrom: 'noreply@tailwindresume.co',

    /**
     * Resend Configuration
     */
    resend: {
      // Optional service, using warning instead of error
      get apiKey() {
        return getEnvForService('RESEND_API_KEY', 'Resend Email');
      }
    },

    /**
     * SendGrid Configuration
     */
    sendgrid: {
      // Optional service, using warning instead of error
      get apiKey() {
        return getEnvForService('SENDGRID_API_KEY', 'SendGrid Email');
      }
    },

    /**
     * SMTP Configuration
     */
    smtp: {
      host: getEnv('SMTP_HOST') || 'smtp.example.com',
      port: Number(getEnv('SMTP_PORT')) || 587,
      // Optional service, using warning instead of error
      get username() {
        return getEnvForService('SMTP_USERNAME', 'SMTP Email');
      },
      get password() {
        return getEnvForService('SMTP_PASSWORD', 'SMTP Email');
      },
      secure: true,
    }
  },

  /**
   * Database Configuration
   */
  database: {
    // Required core service, using error instead of warning
    get url() {
      return requireEnvForService('DATABASE_URL', 'Database');
    }
  },
} as const; 