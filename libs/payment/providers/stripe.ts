import Stripe from 'stripe';
import { config } from '@config';
import type { RecurringPlan, OneTimePlan } from '@config';
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

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.payment.providers.stripe.secretKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const plan = config.payment.plans[params.planId as keyof typeof config.payment.plans];
    
    if (plan.duration.type === 'recurring') {
      return this.createSubscription(params, plan as RecurringPlan);
    } else {
      return this.createOneTimePayment(params, plan as OneTimePlan);
    }
  }

  private async createSubscription(params: PaymentParams, plan: RecurringPlan): Promise<PaymentResult> {
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
      success_url: `${config.app.payment.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
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

  private async createOneTimePayment(params: PaymentParams, plan: OneTimePlan): Promise<PaymentResult> {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: plan.name,
            description: plan.description
          },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.app.payment.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
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
      console.log('event', event);
      console.log('signature', signature);
      console.log('payload', event.data.object);
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
    const now = new Date();
    const periodEnd = new Date(subscription.ended_at! * 1000);

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
      periodStart: now,
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
    const plan = config.payment.plans[session.metadata.planId as keyof typeof config.payment.plans];
    
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
      periodStart: now,
      periodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      metadata: JSON.stringify({
        sessionId: session.id,
        isLifetime: isLifetime
      })
    });

    return { success: true, orderId: session.metadata.orderId };
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<WebhookVerification> {
    await db.update(userSubscription)
      .set({
        status: this.mapStripeStatus(stripeSubscription.status),
        periodStart: new Date(stripeSubscription.start_date * 1000),
        periodEnd: new Date(stripeSubscription.ended_at! * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date()
      })
      .where(eq(userSubscription.stripeSubscriptionId, stripeSubscription.id));

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
} 