# Email Service

This service provides a unified email sending interface that supports multiple email service providers. Currently supports Resend, with planned support for SendGrid and SMTP.

## Configuration

Configuration is divided into two parts:
- Sensitive information (like API keys, passwords, etc.) configured through environment variables
- Non-sensitive information (like default provider, server addresses, etc.) configured directly in `config.ts`

### Environment Variables

Copy `.env.example` file to `.env` and fill in the sensitive information:

```env
# Resend Configuration (Sensitive)
RESEND_API_KEY=your_resend_api_key

# SendGrid Configuration (Sensitive)
SENDGRID_API_KEY=your_sendgrid_api_key

# SMTP Configuration (Sensitive)
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

### Configuration File

Email configuration structure in `config.ts`:

```typescript
export const config = {
  email: {
    // Default email service provider
    defaultProvider: 'resend',

    // Default sender email
    defaultFrom: 'noreply@example.com',

    // Resend configuration
    resend: {
      apiKey: requireEnv('RESEND_API_KEY'),  // Sensitive: from env vars
    },

    // SendGrid configuration
    sendgrid: {
      apiKey: requireEnv('SENDGRID_API_KEY'),  // Sensitive: from env vars
    },

    // SMTP configuration
    smtp: {
      host: 'smtp.example.com',              // Fixed value
      port: 587,                             // Fixed value
      username: requireEnv('SMTP_USERNAME'), // Sensitive: from env vars
      password: requireEnv('SMTP_PASSWORD'), // Sensitive: from env vars
      secure: true,                          // Fixed value
    }
  }
};
```

## Usage

### Basic Usage

```typescript
import { sendEmail } from '@libs/email';

// Send email using default provider
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our service',
  html: '<h1>Welcome!</h1><p>Thank you for signing up.</p>'
});

// Send email using specific provider
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  provider: 'sendgrid'
});

// Send email with custom sender
await sendEmail({
  to: 'user@example.com',
  from: 'support@example.com',
  subject: 'Hello',
  html: '<p>Hello World</p>',
  cc: ['admin@example.com'],
  bcc: ['archive@example.com'],
  replyTo: 'support@example.com'
});
```

### Response Format

```typescript
interface EmailResponse {
  success: boolean;        // Whether the send was successful
  id?: string;            // Email ID
  error?: {
    message: string;
    name: string;
    provider?: 'resend' | 'sendgrid' | 'smtp';
  } | null;
}
```

## Adding New Service Providers

1. Add required sensitive information for the new provider in `.env.example` and `.env`
2. Add new provider configuration in `config.ts` under the `email` config (separate sensitive and non-sensitive information)
3. Create new provider implementation file in the `providers` directory
4. Add new provider to `EmailProvider` type in `types.ts`
5. Add new case handling in `email-sender.ts`

## Important Notes

- Ensure all required environment variables are properly configured (sensitive information only)
- Configure non-sensitive information directly in `config.ts`
- Different providers may require different configuration parameters
- Error handling and retry mechanisms are recommended in production environments

# ShipEasy Email Module

This module uses MJML to create responsive email templates and provides generic functions for sending these templates. It supports multiple email service providers and can be configured according to your needs.

## MJML Preview

When developing new email templates or modifying existing ones, you can use MJML's official online preview tool to see the email rendering in real-time:

[MJML Online Preview Tool](https://mjml.io/try-it-live/)

Simply copy the code from your `.mjml` file into the left editor, and the rendered email will be displayed in real-time on the right, supporting both mobile and desktop view switching.

## Usage Examples

### Sending Verification Email (Supports Internationalization and Multiple Email Providers)

```typescript
import { sendVerificationEmail } from '@libs/email';

// Call after user registration/password reset request
async function handleUserRegistration(user: User) {
  const verificationToken = generateVerificationToken(); // Custom function
  const verificationUrl = `https://your-app.com/verify?token=${verificationToken}`;

  try {
    // Choose language based on user preferences, defaults to English
    const locale = user.preferredLanguage || 'en'; // Available options: 'en', 'zh-CN'
    
    await sendVerificationEmail(user.email, {
      name: user.name,
      verification_url: verificationUrl,
      expiry_hours: 24,
      locale // Pass language option
    }, {
      // Optional configuration
      from: 'custom@example.com', // Custom sender
      provider: 'resend', // Specify email service provider, defaults to 'resend'
      cc: 'admin@example.com', // Optional CC
      bcc: ['archive@example.com'], // Optional BCC
      replyTo: 'support@example.com' // Optional reply-to address
    });
    
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}
```

### Sending Password Reset Email

```typescript
import { sendResetPasswordEmail } from '@libs/email';

// Call after user requests password reset
async function handlePasswordReset(user: User) {
  const resetToken = generateResetToken(); // Custom function
  const resetUrl = `https://your-app.com/reset-password?token=${resetToken}`;

  try {
    // Choose language based on user preferences, defaults to English
    const locale = user.preferredLanguage || 'en'; // Available options: 'en', 'zh-CN'
    
    await sendResetPasswordEmail(user.email, {
      name: user.name,
      reset_url: resetUrl,
      expiry_hours: 24,
      locale // Pass language option
    }, {
      // Optional configuration
      from: 'security@example.com', // Custom sender
      provider: 'resend', // Specify email service provider, defaults to 'resend'
      replyTo: 'support@example.com' // Optional reply-to address
    });
    
    console.log('Password reset email sent successfully!');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}
```

### Using in Next.js API Routes

```typescript
// pages/api/auth/register.ts
import { sendVerificationEmail } from '@libs/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, name, locale = 'en' } = req.body;
    // Create user, generate token, etc...
    
    await sendVerificationEmail(email, {
      name,
      verification_url: `https://your-app.com/verify?token=your-token`,
      expiry_hours: 24,
      locale // Get language setting from request
    }, {
      // Use different email services in different environments
      provider: process.env.NODE_ENV === 'production' ? 'resend' : 'smtp'
    });
    
    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
```

### Using in Nuxt Server Routes

```typescript
// server/api/auth/register.ts
import { sendVerificationEmail } from '@libs/email';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, name, locale = 'en' } = body;
  
  try {
    // Create user, generate token, etc...
    
    await sendVerificationEmail(email, {
      name,
      verification_url: `https://your-app.com/verify?token=your-token`,
      expiry_hours: 24,
      locale // Get language setting from request
    });
    
    return { message: 'Verification email sent' };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to send email',
      data: error
    });
  }
});
```

## Supported Email Service Providers

The module currently supports the following email service providers:

- **Resend** (`provider: 'resend'`) - Default provider
- **SendGrid** (`provider: 'sendgrid'`) - Coming soon
- **Mailchimp** (`provider: 'mailchimp'`) - Coming soon
- **SMTP** (`provider: 'smtp'`) - Coming soon

You can choose which provider to use by configuring the `provider` parameter. Adding new providers only requires implementing the corresponding send function and updating the `sendEmail` method.

## Supported Languages

The templates currently support the following languages:
- English (`en`)
- Simplified Chinese (`zh-CN`)

You can specify which language to use by adding the `locale` property in the parameters.

## Adding New Templates

1. Create a new MJML template file in the `templates/` directory (e.g., `welcome.mjml`)
2. Add new translation type definitions in `i18n/locales/types.ts`
3. Add corresponding translations in `i18n/locales/en.ts` and `i18n/locales/zh-CN.ts`
4. Add new interface and generation function in `templates/index.ts`
5. Add helper function for sending the new template in `templates-sender.ts`
6. Test your template using the [MJML Online Preview Tool](https://mjml.io/try-it-live/)

## Adding New Email Service Providers

1. Create a new provider file (e.g., `sendgrid.ts`)
2. Implement the send interface, ensuring compatibility with `ShipEasyEmailOptions` type
3. Update `EmailProvider` type and `sendEmail` function in `templates-sender.ts`

## Environment Variables

Set the appropriate environment variables based on your chosen email service provider:

### Resend
```
RESEND_API_KEY=your_resend_api_key
```

### SendGrid (Coming Soon)
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Other Providers
Configure the corresponding environment variables based on the specific provider. 