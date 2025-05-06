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

// 计划类型定义

type BasePlan = {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  features: readonly string[];
};

export type RecurringPlan = BasePlan & {
  duration: { type: 'recurring'; months: number; description: string };
  stripePriceId: string | undefined;
  stripeProductId: string | undefined;
};

export type OneTimePlan = BasePlan & {
  duration: { type: 'one_time'; months: number; description: string };
};

export type Plan = RecurringPlan | OneTimePlan;

/**
 * Application Configuration
 */
export const config = {
  /**
   * Application Configuration
   */
  app: {
    /**
     * Base URL Configuration
     * This will be used for all callback URLs and webhooks
     */
    get baseUrl() {
      return requireEnvForService('APP_BASE_URL', 'Application');
    },

    /**
     * Payment Related URLs
     */
    payment: {
      /**
       * Payment Success/Cancel URLs
       * These URLs will be used by payment providers for redirects
       */
      get successUrl() {
        return `${config.app.baseUrl}/payment-success`;
      },
      get cancelUrl() {
        return `${config.app.baseUrl}/payment-cancel`;
      },
      /**
       * Webhook URLs
       * These URLs will be used by payment providers for notifications
       */
      get webhookUrls() {
        return {
          stripe: `${config.app.baseUrl}/api/payment/webhook/stripe`,
          wechat: `${config.app.baseUrl}/api/payment/webhook/wechat`
        };
      }
    }
  },

  /**
   * Payment Configuration
   */
  payment: {
    /**
     * Available Payment Providers
     */
    providers: {
      /**
       * WeChat Pay Configuration
       */
      wechat: {
        get appId() {
          return requireEnvForService('WECHAT_PAY_APP_ID', 'WeChat Pay');
        },
        get mchId() {
          return requireEnvForService('WECHAT_PAY_MCH_ID', 'WeChat Pay');
        },
        get apiKey() {
          return requireEnvForService('WECHAT_PAY_API_KEY', 'WeChat Pay');
        },
        get notifyUrl() {
          return requireEnvForService('WECHAT_PAY_NOTIFY_URL', 'WeChat Pay');
        }
      },

      /**
       * Stripe Configuration
       */
      stripe: {
        get secretKey() {
          return requireEnvForService('STRIPE_SECRET_KEY', 'Stripe');
        },
        get publicKey() {
          return requireEnvForService('STRIPE_PUBLIC_KEY', 'Stripe');
        },
        get webhookSecret() {
          return requireEnvForService('STRIPE_WEBHOOK_SECRET', 'Stripe');
        }
      }
    },

    /**
     * Subscription Plans
     */
    plans: {
      monthly: {
        id: 'monthly',
        name: '月度订阅',
        description: '每月订阅，灵活管理',
        amount: 29,
        currency: 'CNY',
        duration: {
          months: 1,
          description: '1个月',
          type: 'recurring'
        },
        features: [
          '所有高级功能',
          '优先支持'
        ],
        stripePriceId: 'price_1RL2GgDjHLfDWeHDBHjoZaap',
        stripeProductId: process.env.STRIPE_MONTHLY_PRODUCT_ID
      },
      yearly: {
        id: 'yearly',
        name: '年度订阅',
        description: '年付更优惠',
        amount: 299,
        currency: 'CNY',
        duration: {
          months: 12,
          description: '12个月',
          type: 'recurring'
        },
        features: [
          '所有高级功能',
          '优先支持',
          '两个月免费'
        ],
        stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID,
        stripeProductId: process.env.STRIPE_YEARLY_PRODUCT_ID
      },
      lifetime: {
        id: 'lifetime',
        name: '终身会员',
        description: '一次付费，永久使用',
        amount: 999,
        currency: 'CNY',
        duration: {
          months: 999999,
          description: '终身',
          type: 'one_time'
        },
        features: [
          '所有高级功能',
          '优先支持',
          '终身免费更新'
        ],
        stripePriceId: 'price_1RL2IcDjHLfDWeHDMCmobkzb',
        stripeProductId: process.env.STRIPE_YEARLY_PRODUCT_ID
      }
    } as const,

    // 测试环境的密钥
    testKeys: {
      stripe: {
        secretKey: 'sk_test_...',
        publicKey: 'pk_test_...',
        webhookSecret: 'whsec_test_...'
      },
      wechat: {
        appId: 'wx_test_...',
        mchId: 'test_mch_id',
        apiKey: 'test_api_key',
        notifyUrl: 'http://localhost:3000/api/payment/wechat/notify'
      }
    }
  },

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