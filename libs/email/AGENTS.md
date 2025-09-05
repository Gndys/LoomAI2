# AGENTS.md

## Overview

Email service with Resend provider implementation and internationalized MJML templates. Currently supports Resend with SendGrid and SMTP planned for future implementation. Solves monorepo deployment issues with inline templates and provides verification/password reset emails.

## Setup Commands

```bash
# Environment configuration required
# Add to .env file:
RESEND_API_KEY=your_resend_api_key

# Other providers planned but not yet implemented:
# SENDGRID_API_KEY=your_sendgrid_api_key (planned)
# SMTP_USERNAME=your_smtp_username (planned)
# SMTP_PASSWORD=your_smtp_password (planned)

# No additional installation - configured via @config
```

## Code Style

- Single provider implementation (Resend) with multi-provider interface design
- MJML templates with inline deployment for monorepo compatibility
- Configuration split: sensitive data in env vars, non-sensitive in `@config`
- Internationalization support via `@libs/i18n`
- Template variables with placeholder replacement (`{{name}}`, `{{expiry_hours}}`)
- TypeScript interfaces ready for future provider implementations

## Usage Examples

### Template Email Sending

```typescript
import { sendVerificationEmail, sendResetPasswordEmail } from '@libs/email';

// Verification email
await sendVerificationEmail('user@example.com', {
  name: 'vikingmute',
  verification_url: 'https://example.com/verify?token=123',
  expiry_hours: 1,
  locale: 'zh-CN' // 'en' | 'zh-CN'
});

// Password reset email
await sendResetPasswordEmail('user@example.com', {
  name: 'vikingmute',
  reset_url: 'https://example.com/reset?token=456',
  expiry_hours: 1,
  locale: 'zh-CN'
});
```

### Basic Email Sending

```typescript
import { sendEmail } from '@libs/email';

// Using default provider (Resend)
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our service',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
});

// Explicitly specify Resend provider
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  provider: 'resend'
});

// Note: Other providers will return "not implemented" error
```

### Error Handling

```typescript
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Test email</p>'
});

if (!result.success) {
  console.error('Email failed:', result.error?.message);
  console.error('Provider:', result.error?.provider);
}
```

## Common Tasks

### Available Email Templates

- **Verification Email**: User registration email verification
- **Password Reset Email**: Forgot password reset links
- **Supported Languages**: Chinese (`zh-CN`) and English (`en`)
- **Responsive Design**: MJML-based responsive email layouts

### Provider Configuration

```typescript
// Configuration in config.ts (current implementation)
email: {
  defaultProvider: 'resend',
  defaultFrom: 'noreply@example.com',
  resend: {
    apiKey: requireEnv('RESEND_API_KEY'),
  },
  // Planned providers (not yet implemented):
  // sendgrid: {
  //   apiKey: requireEnv('SENDGRID_API_KEY'),
  // },
  // smtp: {
  //   host: 'smtp.example.com',
  //   port: 587,
  //   username: requireEnv('SMTP_USERNAME'),
  //   password: requireEnv('SMTP_PASSWORD'),
  //   secure: true,
  // }
}
```

### Add New Template

1. Design template using [MJML online editor](https://mjml.io/try-it-live/)
2. Add MJML template string in `templates/templates.ts`
3. Add interface and generation function in `templates/index.ts`
4. Add translations in `@libs/i18n` locales
5. Add sender function in `templates-sender.ts`

### Add New Provider (Planned Implementation)

1. Add environment variables to `.env.example`
2. Add provider config to `config.ts`
3. Create provider implementation in `providers/` (e.g., `sendgrid.ts`, `smtp.ts`)
4. Provider types already exist in `types.ts`
5. Update case handling in `email-sender.ts` (currently returns "not implemented" error)

## Testing Instructions

```bash
# Test email configuration
# 1. Verify all environment variables are set
# 2. Test basic email sending with default provider
# 3. Test template emails with different locales
# 4. Verify error handling for invalid configurations

# Template testing
# 1. Use MJML online editor for template preview
# 2. Test variable placeholder replacement
# 3. Verify responsive design on different devices
# 4. Test both languages (en/zh-CN)
```

## Troubleshooting

### Configuration Issues
- Verify `RESEND_API_KEY` environment variable is set
- Check `config.ts` email configuration is properly structured
- Ensure default provider is set to 'resend' (only implemented provider)

### Template Problems
- Use MJML online editor to validate template syntax
- Check placeholder variables match expected format (`{{variable}}`)
- Verify translation keys exist in `@libs/i18n` for both languages

### Provider Errors
- **Resend**: Check API key validity and domain verification
- **SendGrid**: Not implemented yet - will return "UnsupportedProvider" error
- **SMTP**: Not implemented yet - will return "UnsupportedProvider" error

### Monorepo Deployment
- Templates are inlined - no file path issues
- Ensure all dependencies are properly linked
- Check imports resolve correctly across monorepo boundaries

## Architecture Notes

- **Current Implementation**: Only Resend provider is fully implemented and functional
- **Multi-Provider Design**: Architecture supports multiple providers, interfaces ready for SendGrid/SMTP
- **Template System**: MJML-based responsive templates with internationalization
- **Inline Deployment**: Templates embedded in code to solve monorepo file path issues
- **Configuration Split**: Sensitive data in environment variables, settings in `@config`
- **Internationalization**: Integrated with `@libs/i18n` for multilingual support
- **Error Handling**: Standardized response format with provider-specific error details
- **Future Extensibility**: Type definitions and interfaces ready for additional provider implementations
- **Monorepo Ready**: Designed for shared usage across Next.js and Nuxt.js applications
