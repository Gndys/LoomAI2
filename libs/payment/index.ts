import { config } from '@config';
import { StripeProvider } from './providers/stripe';
import { WechatPayProvider } from './providers/wechat';

export type PaymentProviderType = 'stripe' | 'wechat';

/**
 * 创建支付提供商实例
 * @param provider 支付提供商类型
 * @returns 支付提供商实例
 */
export function createPaymentProvider(provider: PaymentProviderType) {
  switch (provider) {
    case 'stripe':
      return new StripeProvider();
    case 'wechat':
      return new WechatPayProvider();
    default:
      throw new Error(`不支持的支付提供商: ${provider}`);
  }
}

// 导出类型和提供商实现，方便使用
export * from './types';
export { StripeProvider, WechatPayProvider }; 