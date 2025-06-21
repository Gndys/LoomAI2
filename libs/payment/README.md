# Payment Service

## Overview
A flexible payment service implementation supporting WeChat Pay, Stripe, and Creem payment methods, with support for both one-time payments and subscriptions. The service provides a simple factory function to create payment provider instances.

## Structure
```
libs/payment/
├── providers/           # Payment provider implementations
│   ├── wechat.ts       # WeChat Pay implementation (Native QR code)
│   ├── stripe.ts       # Stripe implementation (Checkout Session)
│   └── creem.ts        # Creem implementation (Checkout Session)
├── types.ts            # Shared types and interfaces
└── index.ts            # Factory function and type exports
```

## Core Interfaces

```typescript
// Payment Parameters
interface PaymentParams {
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

// Payment Result
interface PaymentResult {
  paymentUrl: string;
  providerOrderId: string;
  metadata?: Record<string, any>;
}

// Payment Provider Interface
interface PaymentProvider {
  createPayment(params: PaymentParams): Promise<PaymentResult>;
  handleWebhook(payload: any, signature: string): Promise<WebhookVerification>;
  queryOrder?(orderId: string): Promise<OrderQueryResult>;
}

// Factory Function
function createPaymentProvider(provider: 'stripe' | 'wechat' | 'creem'): PaymentProvider;
```

## Implementation Notes

1. **Provider Creation**
   - Use `createPaymentProvider` factory function to create provider instances
   - Each provider implements the `PaymentProvider` interface
   - Configuration is automatically loaded from `config.ts`

2. **Payment Flow**
   - Create order record in database
   - Create payment provider instance
   - Initialize payment through provider
   - Handle webhook notifications for status updates

3. **Webhook Handling**
   - Each provider implements its own webhook verification
   - Standardized webhook response format
   - Support for various payment events (payment success, subscription updates, etc.)

4. **Order Status Tracking**
   - Query order status directly from provider instances
   - Support for asynchronous payment completion

## Usage Example

```typescript
// Create a payment provider instance
const stripeProvider = createPaymentProvider('stripe');
const creemProvider = createPaymentProvider('creem');

// Initialize payment with Stripe
const stripeResult = await stripeProvider.createPayment({
  orderId: 'order_123',
  userId: 'user_123',
  planId: 'plan_123',
  amount: 100,
  currency: 'CNY',
  provider: 'stripe',
  metadata: {
    clientIp: '127.0.0.1'
  }
});

// Initialize payment with Creem
const creemResult = await creemProvider.createPayment({
  orderId: 'order_456',
  userId: 'user_123',
  planId: 'monthlyCreem',
  amount: 10,
  currency: 'USD',
  provider: 'creem',
  metadata: {
    clientIp: '127.0.0.1'
  }
});

// Handle Stripe webhook
app.post('/api/webhook/stripe', async (req, res) => {
  const provider = createPaymentProvider('stripe');
  const result = await provider.handleWebhook(
    req.body,
    req.headers['stripe-signature']
  );
  res.status(200).json(result);
});

// Handle Creem webhook
app.post('/api/webhook/creem', async (req, res) => {
  const provider = createPaymentProvider('creem');
  const result = await provider.handleWebhook(
    req.body,
    '' // Creem doesn't use signature verification
  );
  res.status(200).json(result);
});

// Query order status
const provider = createPaymentProvider('stripe');
const status = await provider.queryOrder('order_123');
```

## Error Handling

- Provider-specific errors are normalized to standard formats
- Clear error messages when creating providers
- Proper error logging and monitoring

## Configuration

- Environment variables for API keys and secrets
- Provider-specific configuration in `config.ts`
- Support for test/production modes
- Automatic configuration loading when creating providers 