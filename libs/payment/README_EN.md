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

## Payment Workflow

### Complete Payment Flow

The payment system follows a structured workflow from order creation to subscription activation:

```
1. User initiates payment (Frontend)
   ↓
2. Create order record (Payment Initiate API)
   ↓
3. Initialize payment provider (Payment Library)
   ↓
4. Redirect to payment provider (Stripe/Creem) or Show QR code (WeChat)
   ↓
5. User completes payment (External payment provider)
   ↓
6. Payment provider sends webhook (Provider → Our webhook endpoint)
   ↓
7. Verify payment and create subscription (Webhook handler)
   ↓
8. User redirected to success page (Payment provider → Frontend)
```

### Key Components

#### 1. Order Creation
**Location**: `/api/payment/initiate` (both Next.js and Nuxt)
- Creates order record in database with `PENDING` status
- Generates unique order ID using `nanoid()`
- Sets up 2-hour order expiration timer
- Stores order metadata including user, plan, and amount information

```typescript
// Order creation example
await db.insert(order).values({
  id: orderId,
  userId: session.user.id,
  planId,
  amount: plan.amount.toString(),
  currency: plan.currency,
  status: orderStatus.PENDING,
  provider,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date()
});
```

#### 2. Payment Provider Integration
**Location**: `libs/payment/providers/` (Stripe, WeChat, Creem)
- Each provider implements the `PaymentProvider` interface
- Handles payment URL generation and provider-specific logic
- Manages customer creation and payment session setup

#### 3. Webhook Processing
**Location**: `/api/payment/webhook/[provider]`
- Receives payment notifications from providers
- **Updates order status** from `PENDING` to `PAID`
- Creates subscription records in database
- Handles both one-time and recurring payments
- Processes subscription updates and renewals

```typescript
// Order status update example
await db.update(order)
  .set({ 
    status: orderStatus.PAID,
    updatedAt: new Date()
  })
  .where(eq(order.id, session.metadata.orderId));
```

#### 4. Subscription Creation & Management
**Location**: Webhook handlers in each provider

**Initial Subscription Creation** (First Payment):
- Created automatically when payment is confirmed via webhook
- Supports both one-time purchases and recurring subscriptions
- Handles subscription metadata and billing periods

```typescript
// Initial subscription creation example
await db.insert(userSubscription).values({
  id: randomUUID(),
  userId: session.metadata.userId,
  planId: session.metadata.planId,
  status: subscriptionStatus.ACTIVE,
  paymentType: paymentTypes.RECURRING, // or ONE_TIME
  stripeSubscriptionId: subscription.id, // Provider-specific ID
  periodStart: now,
  periodEnd: periodEnd,
  cancelAtPeriodEnd: false,
  metadata: JSON.stringify({ sessionId: session.id })
});
```

**Subscription Updates & Renewals**:
- Handles recurring payment renewals
- Processes plan upgrades/downgrades
- Manages subscription cancellations
- Updates billing periods and pricing

```typescript
// Subscription renewal example (Stripe)
await db.update(userSubscription)
  .set({
    planId: newPlanId, // Updated if plan changed
    periodStart: new Date(subscriptionItem.current_period_start * 1000),
    periodEnd: new Date(subscriptionItem.current_period_end * 1000),
    updatedAt: new Date()
  })
  .where(eq(userSubscription.stripeSubscriptionId, stripeSubscription.id));
```

### Provider-Specific Flows

#### Stripe Flow
1. **Payment Initiate**: Creates Stripe Checkout Session
2. **User Payment**: Redirected to Stripe's hosted checkout page
3. **Webhook**: `checkout.session.completed` event triggers subscription creation
4. **Success Redirect**: User redirected to `/payment-success?session_id=xxx&provider=stripe`

#### Creem Flow
1. **Payment Initiate**: Creates Creem Checkout Session
2. **User Payment**: Redirected to Creem's hosted checkout page
3. **Webhook**: `checkout.completed` event triggers subscription creation
4. **Success Redirect**: User redirected to `/payment-success?provider=creem&checkout_id=xxx&...`

#### WeChat Pay Flow
1. **Payment Initiate**: Creates WeChat Pay QR code
2. **User Payment**: Scans QR code with WeChat app
3. **Polling**: Frontend polls payment status every 3 seconds
4. **Webhook**: WeChat sends payment notification (optional)
5. **Success Redirect**: Frontend redirects to success page after polling confirms payment

### Subscription Lifecycle Management

#### Initial Payment & Subscription Creation
```
Webhook Event → Order Update (PENDING → PAID) → Subscription Creation (ACTIVE)
```

#### Recurring Payment Renewals (Stripe/Creem)
```
Subscription Renewal Due → Provider charges customer → Webhook Event → 
Subscription Period Update → Billing Cycle Extended
```

#### Subscription Updates & Plan Changes
```
User upgrades plan → API call to provider → Webhook Event → 
Database update (planId, pricing, billing period)
```

#### Webhook Event Types by Provider

**Stripe Webhook Events**:
- `checkout.session.completed`: Initial payment completion
- `customer.subscription.updated`: Plan changes, renewals
- `customer.subscription.deleted`: Subscription cancellation
- `invoice.paid`: Recurring payment success
- `invoice.payment_failed`: Failed renewal payment

**Creem Webhook Events**:
- `checkout.completed`: Initial payment completion
- `subscription.active`: Subscription activated
- `subscription.paid`: Recurring payment success
- `subscription.canceled`: Subscription cancelled
- `subscription.expired`: Subscription expired

**WeChat Pay**:
- Payment status verified through polling (no recurring subscriptions)
- Webhook notifications for payment completion (optional)

### Order Lifecycle

#### Order States & Transitions
- `PENDING`: Order created, awaiting payment
- `PAID`: **Payment confirmed via webhook**, subscription created
- `FAILED`: Payment failed or webhook verification failed
- `CANCELED`: Order expired (after 2 hours) or manually canceled
- `REFUNDED`: Payment refunded (handled separately)

#### Order Status Update Flow
```
1. Order Created (PENDING)
   ↓
2. User Completes Payment (External Provider)
   ↓
3. Webhook Received & Verified
   ↓
4. Order Updated (PENDING → PAID)
   ↓
5. Subscription Created/Updated (ACTIVE)
```

**Critical: Order status is ONLY updated to PAID after webhook verification**, not immediately after payment redirect. This ensures payment integrity and prevents race conditions.

#### Automatic Order Expiration
Orders automatically expire after 2 hours to prevent stale pending orders:

```typescript
setTimeout(async () => {
  const currentOrder = await db.query.order.findFirst({
    where: eq(order.id, orderId)
  });
  
  if (currentOrder?.status === orderStatus.PENDING) {
    await db.update(order)
      .set({ status: orderStatus.CANCELED })
      .where(eq(order.id, orderId));
      
    // For WeChat Pay, also close the order with provider
    if (provider === paymentProviders.WECHAT) {
      await paymentProvider.closeOrder(orderId);
    }
  }
}, ORDER_EXPIRATION_TIME); // 2 hours
```

### Error Handling & Recovery

#### Payment Verification
- **Success Page**: Verifies payment session before showing success
- **Stripe**: Validates `session_id` parameter
- **Creem**: Validates URL signature with all parameters
- **WeChat**: Pre-verified through frontend polling

#### Failed Payments
- Orders remain in `PENDING` state until expired
- Users can retry payment with the same order
- Failed webhook processing triggers error logging

#### Internationalization
- **Locale Middleware**: Automatically adds locale prefix to payment callback URLs
- **URL Pattern**: `/payment-success` → `/zh-CN/payment-success`
- **Language Detection**: Based on `Accept-Language` header and cookies

## WeChat Pay Certificate Configuration

### Certificate Management
WeChat Pay uses environment variables to store certificates, replacing file-based storage:

- **WECHAT_PAY_PRIVATE_KEY**: Merchant API private key (PEM format)
- **WECHAT_PAY_PUBLIC_KEY**: Merchant API certificate (PEM format)

### Certificate Format
Certificate content is stored as single-line format using `\n` escape sequences:

```env
WECHAT_PAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
WECHAT_PAY_PUBLIC_KEY="-----BEGIN CERTIFICATE-----\nMIIEpDCCA4ygAwIBAgIU...\n-----END CERTIFICATE-----"
```

### Certificate Conversion
Convert from PEM files to environment variable format:

```bash
# Convert private key
awk '{printf "%s\\n", $0}' apiclient_key.pem

# Convert certificate
awk '{printf "%s\\n", $0}' apiclient_cert.pem
```

### Security Benefits
- ✅ Avoid exposing certificate files in codebase
- ✅ Simplify deployment process, no file dependencies
- ✅ Solve file inclusion issues in Monorepo builds
- ✅ Cloud-native friendly, all platforms support environment variables 