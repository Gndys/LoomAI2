import { PaymentProvider, PaymentParams, PaymentResult, WebhookVerification } from '../types';
import { config } from '@config';
import { db } from '@libs/database';
import { order, orderStatus } from '@libs/database/schema/order';
import { subscription, subscriptionStatus, paymentTypes } from '@libs/database/schema/subscription';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path'

// 微信支付回调响应类型
interface WechatPayNotification {
  event_type: string;
  resource: {
    ciphertext: string;
    nonce: string;
    associated_data: string;
    original_type: string;
    algorithm: string;
  };
  resource_type: string;
  summary: string;
}

// 解密后的交易信息
interface WechatPaymentTransaction {
  mchid: string;
  appid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  trade_state: string;
  trade_state_desc: string;
  bank_type: string;
  success_time: string;
  payer: {
    openid: string;
  };
  amount: {
    total: number;
    payer_total: number;
    currency: string;
    payer_currency: string;
  };
}

export class WechatPayProvider implements PaymentProvider {
  private appId: string;
  private mchId: string;
  private apiKey: string;
  private notifyUrl: string;
  private privateKey: Buffer;
  private publicKey: Buffer;
  private baseUrl = 'https://api.mch.weixin.qq.com/v3';

  constructor() {
    const publicKeyPath = process.env.WECHAT_PAY_PUBLIC_KEY_PATH;
    const privateKeyPath = process.env.WECHAT_PAY_PRIVATE_KEY_PATH;
    
    if (!publicKeyPath || !privateKeyPath) {
      throw new Error('WeChat Pay certificate paths not configured');
    }

    this.appId = config.payment.providers.wechat.appId;
    this.mchId = config.payment.providers.wechat.mchId;
    this.apiKey = config.payment.providers.wechat.apiKey;
    this.notifyUrl = config.app.payment.webhookUrls.wechat;
    this.privateKey = fs.readFileSync(path.resolve(__dirname, '../../cert/apiclient_cert.pem'));
    this.publicKey = fs.readFileSync(path.resolve(__dirname, '../../cert/apiclient_key.pem'));
  }

  private generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateTimestamp() {
    return Math.floor(Date.now() / 1000).toString();
  }
  // https://pay.weixin.qq.com/doc/v3/merchant/4012365336
  private async sign(method: string, path: string, timestamp: string, nonce: string, body?: string) {
    const message = `${method}\n${path}\n${timestamp}\n${nonce}\n${body || ''}\n`;
    const signature = crypto.createSign('RSA-SHA256')
      .update(Buffer.from(message))
      .sign(this.privateKey, 'base64');
    return signature;
  }

  private async request(method: string, path: string, data?: any) {
    const timestamp = this.generateTimestamp();
    const nonce = this.generateNonce();
    const url = `${this.baseUrl}${path}`;
    const body = data ? JSON.stringify(data) : '';
    const signature = await this.sign(method, path, timestamp, nonce, body);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.mchId}"`,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? body : undefined
    });

    if (!response.ok) {
      throw new Error(`WeChat Pay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const plan = config.payment.plans[params.planId as keyof typeof config.payment.plans];
    const description = params.metadata?.description || `${plan.name} - ${plan.duration.description}`;
    
    try {
      const data = {
        appid: this.appId,
        mchid: this.mchId,
        description,
        out_trade_no: params.orderId,
        notify_url: this.notifyUrl,
        amount: {
          total: Math.round(params.amount as number * 100),
          currency: 'CNY'
        },
        scene_info: {
          payer_client_ip: params.metadata?.clientIp || '127.0.0.1'
        }
      };

      const result = await this.request('POST', '/transactions/native', data);

      if (result.code_url) {
        return {
          paymentUrl: result.code_url,
          providerOrderId: '',
          metadata: { result }
        };
      } else {
        throw new Error(`微信支付下单失败: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error('微信支付创建订单失败:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookVerification> {
    try {
      // 验证签名
      const headers = payload.headers || {};
      const timestamp = headers['wechatpay-timestamp'];
      const nonce = headers['wechatpay-nonce'];
      const body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload);
      
      const message = `${timestamp}\n${nonce}\n${body}\n`;
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(Buffer.from(message));
      const isValid = verify.verify(this.publicKey, signature, 'base64');

      if (!isValid) {
        console.error('微信支付回调签名验证失败');
        return { success: false };
      }

      const notification = payload as WechatPayNotification;
      
      // 处理支付成功通知
      if (notification.event_type === 'TRANSACTION.SUCCESS') {
        const orderId = notification.resource.ciphertext; // 这里需要解密获取订单号
        
        // 更新订单状态
        await db.update(order)
          .set({ 
            status: orderStatus.PAID,
            providerOrderId: orderId,
            updatedAt: new Date()
          })
          .where(eq(order.id, orderId));
          
        // 获取订单信息
        const orderRecord = await db.query.order.findFirst({
          where: eq(order.id, orderId)
        });
        
        if (orderRecord) {
          const plan = config.payment.plans[orderRecord.planId as keyof typeof config.payment.plans];
          const now = new Date();
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + plan.duration.months);

          // 创建订阅记录
          await db.insert(subscription).values({
            id: randomUUID(),
            userId: orderRecord.userId,
            planId: orderRecord.planId,
            status: subscriptionStatus.ACTIVE,
            paymentType: paymentTypes.ONE_TIME,
            periodStart: now,
            periodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            metadata: JSON.stringify({
              transactionId: orderId
            })
          });
        }
        
        return { success: true, orderId };
      }
      
      return { success: true };
    } catch (err) {
      console.error('处理微信支付回调失败:', err);
      return { success: false };
    }
  }

  async queryOrder(orderId: string): Promise<{
    status: 'pending' | 'paid' | 'failed';
    transaction?: WechatPaymentTransaction;
  }> {
    try {
      const result = await this.request('GET', `/transactions/out-trade-no/${orderId}`);

      if (result) {
        const transaction = result as WechatPaymentTransaction;
        
        switch (transaction.trade_state) {
          case 'SUCCESS':
            return { status: 'paid', transaction };
          case 'NOTPAY':
          case 'USERPAYING':
            return { status: 'pending', transaction };
          default:
            return { status: 'failed', transaction };
        }
      }

      return { status: 'pending' };
    } catch (err) {
      console.error('查询微信支付订单状态失败:', err);
      return { status: 'failed' };
    }
  }
} 