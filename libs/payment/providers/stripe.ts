import Stripe from 'stripe';
import { config } from '@config';
import { 
  PaymentProvider, 
  PaymentParams, 
  PaymentResult, 
  WebhookVerification
} from '../types';
import { db } from '@libs/database';
import { 
  subscription as userSubscription, 
  subscriptionStatus, 
  paymentTypes 
} from '@libs/database/schema/subscription';
import { order, orderStatus } from '@libs/database/schema/order';
import { and, eq } from 'drizzle-orm';
import { user } from '@libs/database/schema/user';
import { randomUUID } from 'crypto';

// 添加一个简单的支付计划接口，只包含我们需要的属性
interface PaymentPlan {
  stripePriceId?: string;
  duration: {
    type: 'recurring' | 'one_time';
    months: number;
  };
}

export class StripeProvider implements PaymentProvider {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.payment.providers.stripe.secretKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const plan = config.payment.plans[params.planId as keyof typeof config.payment.plans] as PaymentPlan;
    
    if (plan.duration.type === 'recurring') {
      return this.createSubscription(params, plan);
    } else {
      return this.createOneTimePayment(params, plan);
    }
  }

  private async createSubscription(params: PaymentParams, plan: PaymentPlan): Promise<PaymentResult> {
    // 1. 获取或创建客户
    const customer = await this.getOrCreateCustomer(params.userId);

    // 2. 创建 Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{
        price: plan.stripePriceId!,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${config.app.payment.successUrl}?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: config.app.payment.cancelUrl,
      metadata: {
        orderId: params.orderId,
        userId: params.userId,
        planId: params.planId
      }
    });

    return {
      paymentUrl: session.url || '',
      providerOrderId: session.id,
      metadata: {
        customerId: customer.id,
        sessionId: session.id
      }
    };
  }

  private async createOneTimePayment(params: PaymentParams, plan: PaymentPlan): Promise<PaymentResult> {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [{
        price: plan.stripePriceId!,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.app.payment.successUrl}?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: config.app.payment.cancelUrl,
      metadata: {
        orderId: params.orderId,
        userId: params.userId,
        planId: params.planId
      }
    });

    return {
      paymentUrl: session.url || '',
      providerOrderId: session.id,
      metadata: {
        sessionId: session.id
      }
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookVerification> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.payment.providers.stripe.webhookSecret
      );
      console.log(event, 'event')
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === 'subscription') {
            return this.handleSubscriptionCreated(session);
          } else {
            return this.handleOneTimePayment(session);
          }
        }

        case 'customer.subscription.updated': {
          // 处理订阅更新事件（包括计划变更、续订等）
          const subscription = event.data.object as Stripe.Subscription;
          return this.handleSubscriptionUpdated(subscription);
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          return this.handleSubscriptionDeleted(subscription);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return { success: false };
    }
  }

  private async handleSubscriptionCreated(session: Stripe.Checkout.Session): Promise<WebhookVerification> {
    if (!session.subscription || !session.metadata?.orderId) return { success: false };

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string, {
      expand: ['latest_invoice']
    });    
    // 使用 Stripe 的订阅周期
    const subscriptionItem = subscription.items.data[0];
    const periodStart = new Date(subscriptionItem.current_period_start * 1000);
    const periodEnd = new Date(subscriptionItem.current_period_end * 1000);

    // 更新订单状态
    await db.update(order)
      .set({ status: orderStatus.PAID })
      .where(eq(order.id, session.metadata.orderId));

    // 创建订阅记录
    await db.insert(userSubscription).values({
      id: randomUUID(),
      userId: session.metadata.userId,
      planId: session.metadata.planId,
      status: subscriptionStatus.ACTIVE,
      paymentType: paymentTypes.RECURRING,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      periodStart: periodStart,
      periodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      metadata: JSON.stringify({
        sessionId: session.id
      })
    });

    return { success: true, orderId: session.metadata.orderId };
  }

  private async handleOneTimePayment(session: Stripe.Checkout.Session): Promise<WebhookVerification> {
    if (!session.metadata?.orderId) return { success: false };

    const now = new Date();
    const plan = config.payment.plans[session.metadata.planId as keyof typeof config.payment.plans] as PaymentPlan;
    
    // 处理终身会员的情况
    const isLifetime = plan.duration.months >= 9999;
    let periodEnd;
    
    if (isLifetime) {
      // 设置一个固定的远期日期，但在合理范围内 (100年)
      periodEnd = new Date(now);
      periodEnd.setFullYear(periodEnd.getFullYear() + 100);
    } else {
      // 普通订阅
      periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + plan.duration.months);
    }

    // 更新订单状态
    await db.update(order)
      .set({ status: orderStatus.PAID })
      .where(eq(order.id, session.metadata.orderId));

    // 创建订阅记录
    await db.insert(userSubscription).values({
      id: randomUUID(),
      userId: session.metadata.userId,
      planId: session.metadata.planId,
      status: subscriptionStatus.ACTIVE,
      paymentType: paymentTypes.ONE_TIME,
      stripeCustomerId: session.customer as string,
      periodStart: now,
      periodEnd: periodEnd,
      cancelAtPeriodEnd: true,
      metadata: JSON.stringify({
        sessionId: session.id,
        isLifetime: isLifetime
      })
    });

    return { success: true, orderId: session.metadata.orderId };
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<WebhookVerification> {
    // 获取 Stripe 客户 ID
    const stripeCustomerId = stripeSubscription.customer as string;
    
    // 通过 Stripe 客户 ID 查找订阅记录，而不是通过 subscription ID
    const existingSubscription = await db.query.subscription.findFirst({
      where: eq(userSubscription.stripeCustomerId, stripeCustomerId)
    });
    console.log(existingSubscription, 'existingSubscription')
    if (!existingSubscription) {
      console.error(`找不到对应的订阅记录，Stripe 客户 ID: ${stripeCustomerId}`);
      return { success: false };
    }

    // 使用 Stripe 的订阅周期
    const subscriptionItem = stripeSubscription.items.data[0];
    const periodStart = new Date(subscriptionItem.current_period_start * 1000);
    const periodEnd = new Date(subscriptionItem.current_period_end * 1000);
    
    // 获取 price ID，用于确定当前计划
    const priceId = subscriptionItem.price.id;
    
    // 查找对应的计划 ID
    let newPlanId = existingSubscription.planId; // 默认保持原计划
    
    
    // 遍历所有计划，查找匹配当前 price ID 的计划
    for (const [planId, planDetails] of Object.entries(config.payment.plans)) {
      if (planDetails.provider === 'stripe' && planDetails.stripePriceId === priceId) {
        newPlanId = planId;
        break;
      }
    }

    console.log(newPlanId, 'newPlanId')
    // 更新订阅记录
    await db.update(userSubscription)
      .set({
        status: this.mapStripeStatus(stripeSubscription.status),
        planId: newPlanId, // 更新计划 ID
        stripeSubscriptionId: stripeSubscription.id, // 更新为新的订阅 ID
        periodStart: periodStart,
        periodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date()
      })
      .where(eq(userSubscription.stripeCustomerId, stripeCustomerId));

    return { success: true };
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<WebhookVerification> {
    await db.update(userSubscription)
      .set({
        status: subscriptionStatus.CANCELED,
        updatedAt: new Date()
      })
      .where(eq(userSubscription.stripeSubscriptionId, stripeSubscription.id));

    return { success: true };
  }

  private mapStripeStatus(status: string): string {
    switch (status) {
      case 'active':
        return subscriptionStatus.ACTIVE;
      case 'canceled':
        return subscriptionStatus.CANCELED;
      case 'past_due':
        return subscriptionStatus.PAST_DUE;
      case 'unpaid':
        return subscriptionStatus.UNPAID;
      case 'trialing':
        return subscriptionStatus.TRIALING;
      default:
        return subscriptionStatus.ACTIVE;
    }
  }

  private async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    // 1. 先从数据库中查找用户
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId)
    });

    if (!userRecord) {
      throw new Error('User not found');
    }

    // 2. 如果用户已有 Stripe Customer ID，直接返回
    if (userRecord.stripeCustomerId) {
      try {
        const customer = await this.stripe.customers.retrieve(userRecord.stripeCustomerId);
        if (!customer.deleted) {
          return customer as Stripe.Customer;
        }
        // 如果客户已被删除，继续创建新客户
      } catch (error) {
        console.error('Error retrieving Stripe customer:', error);
        // 如果获取失败（比如客户被删除），继续创建新客户
      }
    }

    // 3. 创建新的 Stripe Customer
    const customer = await this.stripe.customers.create({
      email: userRecord.email,
      name: userRecord.name || undefined,
      phone: userRecord.phoneNumber || undefined,
      metadata: {
        userId: userId
      }
    });

    // 4. 更新用户记录
    await db.update(user)
      .set({ 
        stripeCustomerId: customer.id,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));

    return customer;
  }

  /**
   * 创建 Stripe 客户门户会话
   * @param customerId Stripe 客户 ID
   * @param returnUrl 完成后返回的 URL
   * @returns 门户会话对象，包含重定向 URL
   */
  async createCustomerPortal(customerId: string, returnUrl: string) {
    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return portalSession;
  }

  /**
   * 关闭订单 (目前Stripe不支持)
   * @param orderId 订单ID
   * @returns 是否成功关闭
   */
  async closeOrder(orderId: string): Promise<boolean> {
    console.warn('Stripe does not support canceling orders via API. This is a no-op.');
    return false;
  }
} 