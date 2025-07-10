import { PaymentProvider, PaymentParams, PaymentResult, WebhookVerification } from '../types';
import { config } from '@config';
import { db } from '@libs/database';
import { order, orderStatus } from '@libs/database/schema/order';
import { subscription, subscriptionStatus, paymentTypes } from '@libs/database/schema/subscription';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { X509Certificate } from '@peculiar/x509';
import { ofetch } from 'ofetch';


// 商户 API 证书，是用来证实商户身份的。证书中包含商户号、证书序列号、证书有效期等信息，由证书授权机构（Certificate Authority ，简称 CA）签发，以防证书被伪造或篡改。详情见 什么是商户API证书？如何获取商户API证书？ 。

// 商户 API 私钥。你申请商户 API 证书时，会生成商户私钥，并保存在本地证书文件夹的文件 apiclient_key.pem 中。为了证明 API 请求是由你发送的，你应使用商户 API 私钥对请求进行签名。

// 🔑 不要把私钥文件暴露在公共场合，如上传到 Github，写在 App 代码中等。

// 微信支付平台证书。微信支付平台证书是指：由微信支付负责申请，包含微信支付平台标识、公钥信息的证书。你需使用微信支付平台证书中的公钥验证 API 应答和回调通知的签名。

// 证书序列号。每个证书都有一个由 CA 颁发的唯一编号，即证书序列号。

// 微信支付公钥，用于应答及回调通知的数据签名，可在 微信支付商户平台 -> 账户中心 -> API安全 直接下载。

// 微信支付公钥ID，是微信支付公钥的唯一标识，可在 微信支付商户平台 -> 账户中心 -> API安全 直接查看。


// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取项目根目录（假设在 libs/payment/providers 文件夹中）
// 直接从项目根目录定位证书路径
// 不管在什么环境下，都从当前工作目录向上找到项目根目录
const findProjectRoot = (startPath: string): string => {
  let currentPath = startPath
  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, 'libs', 'payment', 'cert'))) {
      return currentPath
    }
    currentPath = path.dirname(currentPath)
  }
  throw new Error('Could not find project root directory')
}

const projectRoot = findProjectRoot(process.cwd())
const certPath = path.join(projectRoot, 'libs', 'payment', 'cert')

// 微信支付回调响应类型
interface WechatPayNotification {
  id: string;
  create_time: string;
  resource_type: 'encrypt-resource';
  event_type: 'TRANSACTION.SUCCESS' | 'TRANSACTION.CLOSED' | 'REFUND.SUCCESS' | 'REFUND.CLOSED';
  summary: string;
  resource: {
    original_type: 'transaction' | 'refund';
    algorithm: 'AEAD_AES_256_GCM';
    ciphertext: string;
    associated_data: string;
    nonce: string;
  };
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

// 微信支付回调请求类型
interface WechatPayWebhookRequest {
  headers: {
    'wechatpay-signature': string;
    'wechatpay-timestamp': string;
    'wechatpay-nonce': string;
    'wechatpay-serial': string;
  };
  body: string;
}

export class WechatPayProvider implements PaymentProvider {
  private appId: string;
  private mchId: string;
  private apiKey: string;
  private notifyUrl: string;
  private privateKey: Buffer;
  private publicKey: Buffer;
  private serialNo: string;
  private baseUrl = 'https://api.mch.weixin.qq.com';
  private platformCertificates: Map<string, string> = new Map();

  constructor() {
    this.appId = config.payment.providers.wechat.appId;
    this.mchId = config.payment.providers.wechat.mchId;
    this.apiKey = config.payment.providers.wechat.apiKey;
    this.notifyUrl = `${config.app.baseUrl}/api/payment/webhook/wechat`;
    
    console.log('Certificate path:', certPath);
    
    try {
      this.privateKey = fs.readFileSync(path.join(certPath, 'apiclient_key.pem'));
      this.publicKey = fs.readFileSync(path.join(certPath, 'apiclient_cert.pem'));
      
      // 从证书中获取序列号
      this.serialNo = this.getSerialNumber(this.publicKey);
      console.log('Certificate serial number:', this.serialNo);
      
      // 异步初始化平台证书
      this.initializePlatformCertificates().catch(error => {
        console.error('Failed to initialize platform certificates:', error);
      });
      
    } catch (error) {
      console.error('Error loading certificates:', error);
      throw new Error('Failed to load WeChat Pay certificates');
    }
  }

  private getSerialNumber(certificateData: Buffer): string {
    try {
      const certificate = new X509Certificate(certificateData);
      return certificate.serialNumber;
    } catch (error) {
      console.error('Error getting certificate serial number:', error);
      throw new Error('Failed to get certificate serial number');
    }
  }

  // https://pay.weixin.qq.com/doc/v3/merchant/4012365336
  private async sign(method: string, path: string, timestamp: string, nonce: string, body?: string) {
    const message = `${method}\n${path}\n${timestamp}\n${nonce}\n${body || ''}\n`;
    console.log('message:', JSON.stringify(message));
    const signature = crypto.createSign('RSA-SHA256')
      .update(message)
      .sign(this.privateKey, 'base64');
    return signature;
  }

  private async initializePlatformCertificates(): Promise<void> {
    try {
      await this.fetchPlatformCertificates();
      if (this.platformCertificates.size > 0) {
        console.log('Successfully initialized platform certificates');
      } else {
        console.warn('No platform certificates were initialized');
      }
    } catch (error) {
      console.error('Failed to initialize platform certificates:', error);
      // 不抛出错误，让应用继续运行
      // 后续的验证签名操作会处理证书缺失的情况
    }
  }

  private async fetchPlatformCertificates() {
    try {
      const response = await this.request('GET', '/v3/certificates');

      if (response.data) {
        for (const item of response.data) {
          const decryptedCertificate = this.decryptWebhookData<string>(
            item.encrypt_certificate.ciphertext,
            item.encrypt_certificate.associated_data,
            item.encrypt_certificate.nonce
          );
          
          // 使用 X509Certificate 解析证书并获取公钥
          const certificate = new X509Certificate(Buffer.from(decryptedCertificate));
          this.platformCertificates.set(item.serial_no, certificate.publicKey.toString());
        }
        
        console.log('Successfully updated platform certificates');
      }
    } catch (error) {
      console.error('Failed to fetch platform certificates:', error);
      throw error;
    }
  }
  // https://pay.weixin.qq.com/doc/v3/merchant/4013053420
  private async verifySignature(timestamp: string, nonce: string, body: string, signature: string, serialNo: string): Promise<boolean> {
    const message = `${timestamp}\n${nonce}\n${body}\n`;
    // 获取对应序列号的平台证书公钥
    let platformPublicKey = this.platformCertificates.get(serialNo);
    
    // 如果找不到证书，尝试重新获取
    if (!platformPublicKey) {
      console.log('Certificate not found, attempting to refresh...');
      try {
        await this.fetchPlatformCertificates();
        platformPublicKey = this.platformCertificates.get(serialNo);
      } catch (error) {
        console.error('Failed to refresh certificates:', error);
      }
    }

    if (!platformPublicKey) {
      console.error('Platform certificate not found for serial number:', serialNo);
      return false;
    }

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    const isValid = verify.verify(platformPublicKey, signature, 'base64');
    return isValid;
  }

  private async request(method: string, path: string, data?: any) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const url = `${this.baseUrl}${path}`;
    const body = data ? JSON.stringify(data) : '';
    
    const signature = await this.sign(method, path, timestamp, nonce, body);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'zh-CN',
      'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.serialNo}"`,
    };

    console.log('Request details:', {
      url,
      method,
      headers,
      body: data
    });

    try {
      const response = await ofetch(url, {
        method,
        body: data,
        headers
      });

      console.log('Response details:', {
        status: 200,
        body: response
      });

      return response;
    } catch (error: any) {
      console.error('Response error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        data: error.data
      });
      throw error;
    }
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const plan = config.payment.plans[params.planId as keyof typeof config.payment.plans];
    const description = params.metadata?.description || `${plan.i18n['zh-CN']?.name} - ${plan.i18n['zh-CN']?.description}`;
    
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

      const result = await this.request('POST', '/v3/pay/transactions/native', data);

      if (result.code_url) {
        return {
          paymentUrl: result.code_url,
          providerOrderId: params.orderId,
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

  private decryptWebhookData<T extends any>(ciphertext: string, associated_data: string, nonce: string): T {
    const _ciphertext = Buffer.from(ciphertext, 'base64');

    // 解密 ciphertext字符  AEAD_AES_256_GCM算法
    const authTag = _ciphertext.subarray(_ciphertext.length - 16);
    const data = _ciphertext.subarray(0, _ciphertext.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.apiKey, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associated_data));
    const decoded = decipher.update(data, undefined, 'utf8');

    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded as T;
    }
  }

  /**
   * 关闭微信支付订单
   * @param orderId 商户订单号
   * @returns 是否成功关闭
   */
  async closeOrder(orderId: string): Promise<boolean> {
    try {
      // 关闭订单API需要在请求体中包含商户号
      const data = {
        mchid: this.mchId
      };
      
      const response = await this.request('POST', `/v3/pay/transactions/out-trade-no/${orderId}/close`, data);
      
      // 关闭订单成功时返回204状态码，无响应体
      // 当使用ofetch时，204状态码会返回空对象 {}
      console.log('Close order response:', response);
      
      // 更新本地订单状态
      try {
        await db.update(order)
          .set({ 
            status: orderStatus.CANCELED,
            updatedAt: new Date()
          })
          .where(eq(order.id, orderId));
      } catch (dbError) {
        console.error('更新订单状态失败:', dbError);
        // 即使数据库更新失败，只要微信那边关闭成功，我们仍然返回true
      }
      
      return true;
    } catch (error) {
      console.error('关闭微信支付订单失败:', error);
      return false;
    }
  }

  async handleWebhook(payload: string | Record<string, any>, signature: string): Promise<WebhookVerification> {
    try {
      const { headers, body } = typeof payload === 'string' ? { headers: {}, body: payload } : payload;
      const timestamp = headers['wechatpay-timestamp'];
      const nonce = headers['wechatpay-nonce'];
      
      console.log('Webhook verification details:', {
        timestamp,
        nonce,
        body,
        signature,
        headers
      });
      
      const isValid = await this.verifySignature(timestamp, nonce, body, signature, headers['wechatpay-serial']);

      if (!isValid) {
        console.error('微信支付回调签名验证失败');
        // return { success: false };
      }

      const notification = JSON.parse(body) as WechatPayNotification;
      
      // 处理支付成功通知
      if (notification.event_type === 'TRANSACTION.SUCCESS') {
        // 解密回调数据
        const decryptedData = this.decryptWebhookData<WechatPaymentTransaction>(
          notification.resource.ciphertext,
          notification.resource.associated_data,
          notification.resource.nonce
        );

        console.log('Decrypted webhook data:', decryptedData);
        
        // 使用解密后的订单号
        const orderId = decryptedData.out_trade_no;
        
        // 更新订单状态
        await db.update(order)
          .set({ 
            status: orderStatus.PAID,
            providerOrderId: decryptedData.transaction_id,
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
          
          // 检查用户是否已有有效订阅
          const existingSubscription = await db.query.subscription.findFirst({
            where: and(
              eq(subscription.userId, orderRecord.userId),
              eq(subscription.planId, orderRecord.planId),
              eq(subscription.status, subscriptionStatus.ACTIVE)
            ),
            orderBy: [desc(subscription.periodEnd)]
          });
          
          // 处理终身会员的情况
          const isLifetime = plan.duration.months >= 9999;
          
          const newPeriodEnd = new Date();
          if (isLifetime) {
            // 设置一个固定的远期日期，但在合理范围内 (100年)
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 100);
          } else {
            // 普通订阅
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + plan.duration.months);
          }
          
          if (existingSubscription) {
            // 如果已有订阅，更新现有订阅的结束日期
            // 如果现有订阅还未过期，则在其基础上延长时间
            const extensionStart = existingSubscription.periodEnd > now 
              ? existingSubscription.periodEnd 
              : now;
            
            const extensionEnd = new Date(extensionStart);
            if (isLifetime) {
              // 终身会员直接设置为固定的远期日期
              extensionEnd.setFullYear(now.getFullYear() + 100);
            } else {
              // 普通订阅按月数延长
              extensionEnd.setMonth(extensionEnd.getMonth() + plan.duration.months);
            }
            
            await db.update(subscription)
              .set({
                periodEnd: extensionEnd,
                updatedAt: now,
                metadata: JSON.stringify({
                  ...JSON.parse(existingSubscription.metadata || '{}'),
                  renewed: true,
                  lastTransactionId: decryptedData.transaction_id,
                  lastTradeState: decryptedData.trade_state,
                  lastTradeStateDesc: decryptedData.trade_state_desc,
                  lastSuccessTime: decryptedData.success_time,
                  isLifetime: isLifetime
                })
              })
              .where(eq(subscription.id, existingSubscription.id));
          } else {
            // 如果没有现有订阅，创建新订阅
            await db.insert(subscription).values({
              id: randomUUID(),
              userId: orderRecord.userId,
              planId: orderRecord.planId,
              status: subscriptionStatus.ACTIVE,
              paymentType: paymentTypes.ONE_TIME,
              periodStart: now,
              periodEnd: newPeriodEnd,
              cancelAtPeriodEnd: false,
              metadata: JSON.stringify({
                transactionId: decryptedData.transaction_id,
                tradeState: decryptedData.trade_state,
                tradeStateDesc: decryptedData.trade_state_desc,
                successTime: decryptedData.success_time,
                isLifetime: isLifetime
              })
            });
          }
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
      const result = await this.request('GET', `/v3/pay/transactions/out-trade-no/${orderId}?mchid=${this.mchId}`);

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