import { Creem } from 'creem';
import { config } from '@config';
import {
  PaymentProvider,
  PaymentParams,
  PaymentResult,
  WebhookVerification,
  OrderQueryResult
} from '../types';
import { db } from '@libs/database';
import { 
  subscription as userSubscription, 
  subscriptionStatus, 
  paymentTypes 
} from '@libs/database/schema/subscription';
import { order, orderStatus } from '@libs/database/schema/order';
import { user } from '@libs/database/schema/user';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// 添加一个简单的支付计划接口，只包含我们需要的属性
interface PaymentPlan {
  creemProductId?: string;
  duration: {
    type: 'recurring' | 'one_time';
    months: number;
  };
  currency: string;
  amount: number;
}

export class CreemProvider implements PaymentProvider {
  private creem: Creem;
  private apiKey: string;

  constructor() {
    this.apiKey = config.payment.providers.creem.apiKey;
    
    // 根据配置选择服务器环境
    const isTestMode = config.payment.providers.creem.serverUrl?.includes('test-api');
    
    this.creem = new Creem({
      serverIdx: isTestMode ? 1 : 0, // 0: production, 1: test-mode
      // 或者直接使用 serverURL
      serverURL: config.payment.providers.creem.serverUrl
    });
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const plan = config.payment.plans[params.planId as keyof typeof config.payment.plans] as PaymentPlan;
    
    if (!plan.creemProductId) {
      throw new Error(`Creem product ID not configured for plan: ${params.planId}`);
    }
    
    // 获取或创建客户
    const customer = await this.getOrCreateCustomer(params.userId);
    
    try {
      // 使用官方 Creem SDK 创建 checkout
      // 基于 MCP 工具的结构，使用正确的参数格式
      const checkoutData = {
        productId: plan.creemProductId,
        customer: customer.customerId ? {
          id: customer.customerId,
          email: customer.email
        } : {
          email: customer.email
        },
        success_url: `${config.app.payment.successUrl}?session_id={CHECKOUT_ID}`,
        metadata: {
          orderId: params.orderId,
          userId: params.userId,
          planId: params.planId
        }
      };

      const checkoutResult = await this.creem.createCheckout({
        xApiKey: this.apiKey,
        createCheckoutRequest: checkoutData
      });

      // 检查响应格式
      if (!checkoutResult?.checkoutUrl) {
        throw new Error('Failed to create Creem checkout session: No URL returned');
      }

      return {
        paymentUrl: checkoutResult.checkoutUrl,
        providerOrderId: checkoutResult.order?.id as string,
        metadata: {
          customerId: customer.customerId,
          checkoutId: checkoutResult.id
        }
      };
    } catch (error) {
      console.error('Creem payment creation failed:', error);
      throw new Error(`Failed to create Creem payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleWebhook(payload: string | Record<string, any>, signature: string): Promise<WebhookVerification> {
    try {
      // Creem 不使用签名验证，而是通过API查询来验证事件
      const webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;
      
      // 基于事件类型处理
      switch (webhookData.event_type) {
        case 'checkout.completed': {
          return this.handleCheckoutCompleted(webhookData);
        }
        case 'subscription.created': {
          return this.handleSubscriptionCreated(webhookData);
        }
        case 'subscription.updated': {
          return this.handleSubscriptionUpdated(webhookData);
        }
        case 'subscription.cancelled': {
          return this.handleSubscriptionCancelled(webhookData);
        }
        default:
          console.log(`Unhandled Creem webhook event: ${webhookData.event_type}`);
          return { success: true };
      }
    } catch (error) {
      console.error('Error handling Creem webhook:', error);
      return { success: false };
    }
  }

  private async handleCheckoutCompleted(webhookData: any): Promise<WebhookVerification> {
    if (!webhookData.data?.metadata?.orderId) {
      return { success: false };
    }

    const { orderId, userId, planId } = webhookData.data.metadata;
    const plan = config.payment.plans[planId as keyof typeof config.payment.plans] as PaymentPlan;
    
    // 更新订单状态
    await db.update(order)
      .set({ status: orderStatus.PAID })
      .where(eq(order.id, orderId));

    if (plan.duration.type === 'recurring') {
      // 处理订阅
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + plan.duration.months);

      await db.insert(userSubscription).values({
        id: randomUUID(),
        userId: userId,
        planId: planId,
        status: subscriptionStatus.ACTIVE,
        paymentType: paymentTypes.RECURRING,
        creemCustomerId: webhookData.data.customer?.id,
        creemSubscriptionId: webhookData.data.subscription?.id,
        periodStart: now,
        periodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        metadata: JSON.stringify({
          checkoutId: webhookData.data.id
        })
      });
    } else {
      // 处理一次性支付
      const now = new Date();
      const isLifetime = plan.duration.months >= 9999;
      let periodEnd;
      
      if (isLifetime) {
        periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 100);
      } else {
        periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + plan.duration.months);
      }

      await db.insert(userSubscription).values({
        id: randomUUID(),
        userId: userId,
        planId: planId,
        status: subscriptionStatus.ACTIVE,
        paymentType: paymentTypes.ONE_TIME,
        creemCustomerId: webhookData.data.customer?.id,
        periodStart: now,
        periodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        metadata: JSON.stringify({
          checkoutId: webhookData.data.id
        })
      });
    }

    return { success: true, orderId };
  }

  private async handleSubscriptionCreated(webhookData: any): Promise<WebhookVerification> {
    // 订阅创建事件通常在checkout完成时已经处理
    return { success: true };
  }

  private async handleSubscriptionUpdated(webhookData: any): Promise<WebhookVerification> {
    try {
      const subscriptionId = webhookData.data.id;
      
      // 根据Creem订阅ID查找本地订阅记录
      const existingSubscriptions = await db.select()
        .from(userSubscription)
        .where(eq(userSubscription.creemSubscriptionId, subscriptionId));

      if (existingSubscriptions.length === 0) {
        console.warn(`No local subscription found for Creem subscription ${subscriptionId}`);
        return { success: false };
      }

      const subscription = existingSubscriptions[0];
      
      // 更新订阅状态和周期
      await db.update(userSubscription)
        .set({
          status: this.mapCreemStatus(webhookData.data.status),
          periodStart: webhookData.data.current_period_start ? new Date(webhookData.data.current_period_start * 1000) : subscription.periodStart,
          periodEnd: webhookData.data.current_period_end ? new Date(webhookData.data.current_period_end * 1000) : subscription.periodEnd,
          cancelAtPeriodEnd: webhookData.data.cancel_at_period_end || false
        })
        .where(eq(userSubscription.id, subscription.id));

      return { success: true };
    } catch (error) {
      console.error('Error handling Creem subscription update:', error);
      return { success: false };
    }
  }

  private async handleSubscriptionCancelled(webhookData: any): Promise<WebhookVerification> {
    try {
      const subscriptionId = webhookData.data.id;
      
      // 根据Creem订阅ID查找本地订阅记录
      const existingSubscriptions = await db.select()
        .from(userSubscription)
        .where(eq(userSubscription.creemSubscriptionId, subscriptionId));

      if (existingSubscriptions.length === 0) {
        console.warn(`No local subscription found for Creem subscription ${subscriptionId}`);
        return { success: false };
      }

      const subscription = existingSubscriptions[0];
      
      // 更新订阅状态为取消
      await db.update(userSubscription)
        .set({
          status: subscriptionStatus.CANCELLED,
          cancelAtPeriodEnd: true
        })
        .where(eq(userSubscription.id, subscription.id));

      return { success: true };
    } catch (error) {
      console.error('Error handling Creem subscription cancellation:', error);
      return { success: false };
    }
  }

  private mapCreemStatus(status: string): string {
    switch (status) {
      case 'active':
        return subscriptionStatus.ACTIVE;
      case 'canceled':
      case 'cancelled':
        return subscriptionStatus.CANCELLED;
      case 'past_due':
        return subscriptionStatus.PAST_DUE;
      case 'unpaid':
        return subscriptionStatus.UNPAID;
      default:
        return subscriptionStatus.INACTIVE;
    }
  }

  private async getOrCreateCustomer(userId: string): Promise<{ customerId: string; email: string }> {
    // 从用户表获取用户信息
    const users = await db.select()
      .from(user)
      .where(eq(user.id, userId));

    if (users.length === 0) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = users[0];
    const email = userData.email;

    if (!email) {
      throw new Error(`User email not found for user: ${userId}`);
    }

    // 检查是否已有Creem客户记录
    if (userData.creemCustomerId) {
      return {
        customerId: userData.creemCustomerId,
        email: email
      };
    }

    // 尝试通过邮箱查找现有客户
    try {
      const customerResult = await this.creem.retrieveCustomer({
        xApiKey: this.apiKey,
        email: email
      });

      if (customerResult?.id) {
        // 更新用户表中的Creem客户ID
        await db.update(user)
          .set({ creemCustomerId: customerResult.id })
          .where(eq(user.id, userId));

        return {
          customerId: customerResult.id,
          email: email
        };
      }
    } catch (error) {
      // 客户不存在，继续创建新客户
      console.log('Customer not found in Creem, will create new one');
    }

    // 如果没有现有客户，Creem会在checkout时自动创建
    // 所以我们返回邮箱，让checkout过程处理客户创建
    return {
      customerId: '', // Creem将在checkout时创建
      email: email
    };
  }

  async queryOrder(orderId: string): Promise<OrderQueryResult> {
    try {
      // 从数据库获取订单的Creem checkout ID
      const orders = await db.select()
        .from(order)
        .where(eq(order.id, orderId));

      if (orders.length === 0) {
        return { status: 'failed' };
      }

      const orderData = orders[0];
      
      if (orderData.status === orderStatus.PAID) {
        return { status: 'paid' };
      } else if (orderData.status === orderStatus.FAILED) {
        return { status: 'failed' };
      } else {
        return { status: 'pending' };
      }
    } catch (error) {
      console.error('Error querying Creem order:', error);
      return { status: 'failed' };
    }
  }

  async closeOrder(orderId: string): Promise<boolean> {
    try {
      // 更新订单状态为已关闭
      await db.update(order)
        .set({ status: orderStatus.FAILED })
        .where(eq(order.id, orderId));

      return true;
    } catch (error) {
      console.error('Error closing Creem order:', error);
      return false;
    }
  }

  // Creem特有方法：创建客户门户链接
  async createCreemCustomerPortal(customerId: string, returnUrl: string) {
    try {
      const result = await this.creem.generateCustomerLinks({
        xApiKey: this.apiKey,
        createCustomerPortalLinkRequestEntity:{
          customerId
        } 
      });

      return {
        url: result?.customerPortalLink || returnUrl
      };
    } catch (error) {
      console.error('Error creating Creem customer portal:', error);
      throw error;
    }
  }
} 