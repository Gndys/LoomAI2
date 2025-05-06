import { Stripe } from 'stripe';

export interface PaymentParams {
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: string;
  metadata?: {
    clientIp?: string;
    [key: string]: any;
  };
}

export interface PaymentResult {
  paymentUrl: string;
  providerOrderId: string;
  metadata?: Record<string, any>;
}

export interface WebhookVerification {
  success: boolean;
  orderId?: string;
}

export interface PaymentProvider {
  createPayment(params: PaymentParams): Promise<PaymentResult>;
  handleWebhook(payload: any, signature: string): Promise<WebhookVerification>;
  queryOrder?(orderId: string): Promise<OrderQueryResult>;
}

export interface OrderQueryResult {
  status: 'pending' | 'paid' | 'failed';
  metadata?: Record<string, any>;
}

// Stripe 扩展类型
export interface ExtendedStripeInvoice extends Stripe.Invoice {
  subscription: string;
  payment_intent?: string;
  amount_paid: number;
}

export interface ExtendedStripeSubscription extends Omit<Stripe.Subscription, 'items'> {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
      }
    }>
  };
}

// Stripe specific types
export type StripeSubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';
export type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'; 