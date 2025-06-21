# Creem Payment Provider Integration

## Overview

The Creem payment provider integrates with Creem's payment platform to handle subscriptions and one-time payments. This implementation uses the official [Creem TypeScript SDK](https://docs.creem.io/sdk/typescript-sdk) and includes support for MCP (Model Context Protocol) tools for easy management.

## SDK Implementation

Our implementation uses the official Creem TypeScript SDK for better type safety and maintenance. The SDK is configured to automatically select the correct server environment:

```typescript
const creem = new Creem({
  serverIdx: isTestMode ? 1 : 0, // 0: production, 1: test-mode
  serverURL: config.payment.providers.creem.serverUrl
});
```

Due to some discrepancies between the SDK's TypeScript definitions and the actual API structure (which matches the MCP tools format), we use the MCP-compatible parameter structure internally.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Creem Configuration
CREEM_API_KEY=ck_live_your_api_key_here  # or ck_test_... for testing
CREEM_SERVER_URL=https://api.creem.io     # Default production URL
```

### Plan Configuration

In your `config.ts`, add Creem plans:

```typescript
monthlyCreem: {
  provider: 'creem',
  id: 'monthlyCreem',
  name: '月度订阅',
  description: '每月订阅，灵活管理',
  amount: 10,
  currency: 'USD',
  duration: {
    months: 1,
    description: '1个月',
    type: 'recurring'
  },
  creemProductId: 'prod_xxxxxxxxxxxxx', // Set after creating product in Creem
  features: [
    '所有高级功能',
    '优先支持'
  ],
  i18n: {
    'en': {
      name: 'Monthly Plan (Creem)',
      description: 'Perfect for short-term projects via Creem',
      duration: 'month',
      features: [
        'All premium features',
        'Priority support'
      ]
    },
    'zh-CN': {
      name: '月度订阅 (Creem)',
      description: '每月订阅，通过Creem支付',
      duration: '月',
      features: [
        '所有高级功能',
        '优先支持'
      ]
    }
  }
}
```

## Setup Process

### 1. Create Products in Creem

Use MCP tools to create products in Creem:

```typescript
// Example: Create a monthly subscription product
await mcp_Creem_create_product({
  request: {
    'x-api-key': 'your_api_key',
    CreateProductRequestEntity: {
      name: 'Monthly Subscription',
      price: 1000, // $10.00 (price in cents)
      currency: 'USD',
      billing_type: 'recurring',
      billing_period: 'month',
      description: 'Monthly subscription with premium features',
      default_success_url: 'https://yourapp.com/payment-success',
      tax_mode: 'automatic',
      tax_category: 'digital_services'
    }
  }
});
```

### 2. Update Configuration

After creating products, update your `config.ts` with the returned product IDs:

```typescript
creemProductId: 'prod_xxxxxxxxxxxxx' // Replace with actual product ID
```

### 3. Database Schema Updates

The database schema has been updated to include Creem-specific fields:

```sql
-- User table additions
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;

-- Subscription table additions  
ALTER TABLE "subscription" ADD COLUMN "creem_customer_id" text;
ALTER TABLE "subscription" ADD COLUMN "creem_subscription_id" text;
```

## Usage

### Creating Payments

```typescript
import { createPaymentProvider } from '@libs/payment';

const creemProvider = createPaymentProvider('creem');

const result = await creemProvider.createPayment({
  orderId: 'order_123',
  userId: 'user_123', 
  planId: 'monthlyCreem',
  amount: 10,
  currency: 'USD',
  metadata: {
    customField: 'value'
  }
});

// Redirect user to: result.paymentUrl
```

### Webhook Handling

Creem webhooks are automatically handled at `/api/payment/webhook/creem`:

```typescript
// Webhook events handled:
// - checkout.completed: Payment successful
// - subscription.created: New subscription
// - subscription.updated: Subscription changes
// - subscription.cancelled: Subscription cancellation
```

### Customer Portal

Create customer portal links for subscription management:

```typescript
const creemProvider = createPaymentProvider('creem');
const portal = await creemProvider.createCreemCustomerPortal(
  customerId,
  'https://yourapp.com/dashboard'
);

// Redirect user to: portal.url
```

## MCP Tools Available

The following MCP tools are available for Creem management:

### Products
- `mcp_Creem_create-product`: Create new products
- `mcp_Creem_retrieve-product`: Get product details
- `mcp_Creem_search-products`: List all products

### Customers
- `mcp_Creem_retrieve-customer`: Get customer details
- `mcp_Creem_generate-customer-links`: Create customer portal links

### Subscriptions
- `mcp_Creem_retrieve-subscription`: Get subscription details
- `mcp_Creem_cancel-subscription`: Cancel a subscription
- `mcp_Creem_update-subscription`: Update subscription
- `mcp_Creem_upgrade-subscription`: Upgrade to different product

### Checkouts
- `mcp_Creem_create-checkout`: Create new checkout session
- `mcp_Creem_retrieve-checkout`: Get checkout details

### Licenses
- `mcp_Creem_activate-license`: Activate license keys
- `mcp_Creem_deactivate-license`: Deactivate licenses
- `mcp_Creem_validate-license`: Validate license status

### Discounts
- `mcp_Creem_create-discount`: Create discount codes
- `mcp_Creem_retrieve-discount`: Get discount details
- `mcp_Creem_delete-discount`: Remove discounts

### Transactions
- `mcp_Creem_search-transactions`: List transaction history

## Example MCP Tool Usage

### Creating a Product

```typescript
const product = await mcp_Creem_create_product({
  request: {
    'x-api-key': process.env.CREEM_API_KEY,
    CreateProductRequestEntity: {
      name: 'Premium Plan',
      price: 2000, // $20.00
      currency: 'USD',
      billing_type: 'recurring',
      billing_period: 'month',
      description: 'Premium features with priority support',
      image_url: 'https://yourapp.com/images/premium-plan.png',
      custom_field: [
        {
          type: 'text',
          key: 'company',
          label: 'Company Name',
          optional: true,
          text: {
            max_length: 100,
            min_length: 1
          }
        }
      ]
    }
  }
});
```

### Managing Subscriptions

```typescript
// Cancel a subscription
await mcp_Creem_cancel_subscription({
  request: {
    id: 'sub_xxxxxxxxxxxxx',
    'x-api-key': process.env.CREEM_API_KEY
  }
});

// Upgrade subscription
await mcp_Creem_upgrade_subscription({
  request: {
    id: 'sub_xxxxxxxxxxxxx',
    'x-api-key': process.env.CREEM_API_KEY,
    UpgradeSubscriptionRequestEntity: {
      product_id: 'prod_new_plan_id',
      update_behavior: 'proration-charge-immediately'
    }
  }
});
```

## Error Handling

The Creem provider includes comprehensive error handling:

```typescript
try {
  const result = await creemProvider.createPayment(params);
  // Handle success
} catch (error) {
  if (error.message.includes('Creem product ID not configured')) {
    // Handle missing product configuration
  } else if (error.message.includes('User not found')) {
    // Handle user validation errors
  } else {
    // Handle other payment errors
  }
}
```

## Testing

Use test API keys for development:

```bash
CREEM_API_KEY=ck_test_your_test_key_here
CREEM_SERVER_URL=https://test-api.creem.io
```

## Migration from Other Providers

If migrating from Stripe or other providers:

1. Map existing subscription data to Creem format
2. Update webhook endpoints
3. Test payment flows thoroughly
4. Update customer portal integrations

## Support

For Creem-specific issues:
- Check Creem documentation: https://docs.creem.io
- Use MCP tools for debugging
- Monitor webhook logs for payment events 