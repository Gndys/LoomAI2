# ShipEasy Start Guide

Welcome to ShipEasy! This guide will help you get started with setting up and running the project.

## Project Structure Overview

```
shipeasy/
├── apps/                  # Application implementations
│   ├── next-app/         # Next.js application
│   ├── nuxt-app/         # Nuxt.js application
│   └── docs/             # Documentation site
├── libs/                  # Core libraries
│   ├── database/         # Database operations and schema
│   ├── auth/             # Authentication service
│   ├── email/            # Email service
│   ├── sms/             # SMS service
│   ├── ai/              # AI integration
│   ├── i18n/            # Internationalization
│   ├── permissions/      # Permission management
│   ├── ui/              # Shared UI components
│   └── validators/       # Data validation
└── docs/                 # Project documentation
```

Each library in the `libs/` directory has its own README with detailed documentation. This guide provides a high-level overview and setup instructions.

## Setup Steps

### 1. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Database Setup

The project uses PostgreSQL as the database. To set up:

1. Create a PostgreSQL database
2. Configure environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

For detailed database configuration and migrations, see: [`libs/database/README.md`](./libs/database/README.md)

### 3. Authentication Setup

The authentication system provides multiple authentication methods:

#### Default Authentication (Email/Password)
Email and password authentication is enabled by default with the following features:
- User registration with email verification
- Password reset functionality
- Account recovery options
- Session management
- Remember me functionality

#### OAuth Providers (Optional)
You can enable additional OAuth providers by configuring their environment variables:

1. **Google OAuth**
   ```env
   GOOGLE_CLIENT_ID="your_client_id"
   GOOGLE_CLIENT_SECRET="your_client_secret"
   ```
   Setup: [Google Cloud Console](https://console.cloud.google.com/)

2. **GitHub OAuth**
   ```env
   GITHUB_CLIENT_ID="your_client_id"
   GITHUB_CLIENT_SECRET="your_client_secret"
   ```
   Setup: [GitHub OAuth Apps](https://github.com/settings/developers)

3. **WeChat OAuth**
   ```env
   WECHAT_APP_ID="your_app_id"
   WECHAT_APP_SECRET="your_app_secret"
   ```
   Setup: [WeChat Open Platform](https://open.weixin.qq.com/)

#### Authentication Features
- Multiple authentication methods per user
- Account linking between different providers
- Role-based access control
- Session management
- Secure token handling
- Rate limiting for security

For detailed authentication configuration and advanced features, see: [`libs/auth/README.md`](./libs/auth/README.md)

### 4. SMS Service Setup

The SMS service primarily provides OTP (One-Time Password) functionality for user authentication, with support for multiple providers (Aliyun, Twilio). The service is also extensible for other SMS use cases.

#### Authentication with Phone Number
The SMS service is integrated with the authentication system to provide:
- Phone number verification during registration
- OTP-based login
- Two-factor authentication (2FA)
- Account recovery via SMS

#### Provider Configuration
Configure your preferred SMS provider:

```env
# Aliyun SMS (Optional)
ALIYUN_ACCESS_KEY_ID="your_key_id"
ALIYUN_ACCESS_KEY_SECRET="your_key_secret"

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
```

#### Example Usage in Authentication
The SMS service is used in the authentication flow as shown in `libs/auth/auth.ts`:
```typescript
phoneNumber({
  sendOTP: async ({ phoneNumber, code }) => {
    // Send OTP code via your configured SMS provider
    await sendSMSByAliyun({
      phoneNumber,
      templateCode: 'your_template_code',
      templateParam: { code }
    });
  },
  signUpOnVerification: {
    getTempEmail: (phoneNumber) => `${phoneNumber}@temp.com`,
    getTempName: (phoneNumber) => phoneNumber
  }
})
```

#### Extending SMS Functionality
You can extend the SMS service for additional use cases:
- Marketing campaigns
- Notification systems
- Alert services
- Custom verification flows

For detailed SMS service configuration, templates, and extension examples, see: [`libs/sms/README.md`](./libs/sms/README.md)

### 5. Email Service Setup

The email service is primarily used for authentication-related communications (verification emails and password reset), with support for multiple providers (Resend, SendGrid, SMTP). The service is also extensible for other email communication needs.

#### Authentication Email Features
The email service is integrated with the authentication system to provide:
- Email verification for new registrations
- Password reset links
- Account recovery notifications
- Multi-language support for all emails

#### Provider Configuration
Configure your preferred email provider:

```env
# Resend (Optional)
RESEND_API_KEY="your_api_key"

# SendGrid (Optional)
SENDGRID_API_KEY="your_api_key"

# SMTP (Optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USERNAME="your_username"
SMTP_PASSWORD="your_password"
```

#### Example Usage in Authentication
The email service is used in the authentication flow as shown in `libs/auth/auth.ts`:
```typescript
emailVerification: {
  sendVerificationEmail: async ({ user, url }, request) => {
    // Send verification email with localization support
    await sendVerificationEmail(user.email, {
      name: user.name || user.email.split('@')[0],
      verification_url: url,
      expiry_hours: 1,
      locale: 'en' // or 'zh-CN'
    });
  }
},
emailAndPassword: {
  sendResetPassword: async ({ user, url }, request) => {
    // Send password reset email
    await sendResetPasswordEmail(user.email, {
      name: user.name,
      reset_url: url,
      expiry_hours: 1,
      locale: 'en' // or 'zh-CN'
    });
  }
}
```

#### Extending Email Functionality
You can extend the email service for additional use cases:
- Welcome emails
- Newsletter systems
- Notification emails
- Marketing campaigns
- System alerts
- Custom email templates

For detailed email service configuration, templates, and extension examples, see: [`libs/email/README.md`](./libs/email/README.md)

## Running the Applications

### Next.js Application

```bash
# Development
pnpm dev:next

# Production build
pnpm build:next
pnpm start:next
```

### Nuxt.js Application

```bash
# Development
pnpm dev:nuxt

# Production build
pnpm build:nuxt
pnpm start:nuxt
```

### Documentation Site

```bash
# Development
pnpm dev:docs

# Production build
pnpm build:docs
```

## Additional Resources

- For internationalization setup: [`libs/i18n/README.md`](./libs/i18n/README.md)
- For permissions configuration: [`libs/permissions/README.md`](./libs/permissions/README.md)
- For AI integration: [`libs/ai/README.md`](./libs/ai/README.md)
- For UI components: [`libs/ui/README.md`](./libs/ui/README.md)
- For validation rules: [`libs/validators/README.md`](./libs/validators/README.md)

## Troubleshooting

If you encounter any issues:

1. Ensure all required environment variables are set
2. Check the specific service's README for detailed troubleshooting
3. Verify database connections and migrations
4. Check authentication provider configurations

For more detailed documentation, refer to the [`docs/`](./docs/) directory. 