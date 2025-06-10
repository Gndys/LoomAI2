# Authentication Service

This service uses [Better Auth](https://www.better-auth.com/) to provide comprehensive authentication and authorization functionality. It supports multiple authentication methods, including email/password, social login, and phone number verification.

## Features

- Multiple Authentication Methods
  - Email/Password Login
  - Social Account Login (Google, GitHub, WeChat)
  - Phone Number Verification Login
- Account Management
  - Email Verification
  - Password Reset
  - Account Linking (multiple login methods can be linked to a single account)
- Access Control
  - Admin Roles
  - Role-Based Access Control
- Internationalization Support
  - Supports English and Chinese email templates
  - Sends emails based on user language preferences

## Configuration

Configuration is divided into two parts:
- Sensitive information (like OAuth keys) configured through environment variables
- Non-sensitive information (like feature toggles, expiry times) configured directly in `config.ts`

### Environment Variables

Copy `.env.example` file to `.env` and fill in the sensitive information:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# WeChat OAuth
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# Base URL (optional, defaults to http://localhost:3000)
AUTH_BASE_URL=your_base_url
```

### Configuration File

Authentication service configuration structure (in `config.ts`):

```typescript
export const config = {
  auth: {
    // Application name
    appName: 'shipeasy',

    // Base URL
    baseURL: 'http://localhost:3000',

    // Social provider configuration
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      wechat: {
        appId: process.env.WECHAT_APP_ID,
        appSecret: process.env.WECHAT_APP_SECRET
      }
    },

    // Email verification configuration
    emailVerification: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: true,
      autoSignInAfterVerification: true,
      expiryHours: 1
    },

    // Account configuration
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github', 'wechat']
      }
    },

    // Admin configuration
    admin: {
      roles: ['admin']
    }
  }
};
```

## Usage

### Server-side

```typescript
import { auth } from '@libs/auth';
import { toNextJsHandler } from "better-auth/next-js";

// Next.js API route handler
export const { GET, POST } = auth.createHandler(
  toNextJsHandler()
);
```

### Client-side (React)

```typescript
import { authClientReact } from '@libs/auth/authClient';

// Use in components
const { signIn, signOut, user } = authClientReact.useAuth();

// Email/password login
await signIn.emailAndPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Social login
await signIn.socialProvider('google');

// Sign out
await signOut();

// Get current session
const { data: session } = await authClientReact.getSession();

// Reactive session access
const { data: session } = authClientReact.useSession();

// Session management
const sessions = await authClientReact.listSessions(); // Get all sessions
await authClientReact.revokeSession({ token: "session-token" }); // Revoke specific session
await authClientReact.revokeOtherSessions(); // Revoke other sessions
await authClientReact.revokeSessions(); // Revoke all sessions

// Password management
await authClientReact.changePassword({
  newPassword: 'newPassword123',
  currentPassword: 'currentPassword123',
  revokeOtherSessions: true // Revoke other sessions when changing password
});

// User information management
await authClientReact.updateUser({
  name: 'New Name',
  image: 'https://example.com/avatar.jpg'
});

// Get linked accounts
const accountsResponse = await authClientReact.listAccounts();

// Delete user account
await authClientReact.deleteUser({});
```

### Client-side (Vue)

```typescript
import { authClientVue } from '@libs/auth/authClient';

// Use in components
const { signIn, signOut, user } = authClientVue.useAuth();

// Email/password login
await signIn.emailAndPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Social login
await signIn.socialProvider('google');

// Sign out
await signOut();
```

## Advanced Features

### Session Management
Better Auth provides comprehensive session management functionality, including session caching, session refresh, and session revocation.

**Related Documentation:**
- [Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [Session Caching](https://www.better-auth.com/docs/concepts/session-management#session-caching)

### User and Account Management
Supports user information updates, password management, account deletion, and more.

**Related Documentation:**
- [Users and Accounts](https://www.better-auth.com/docs/concepts/users-accounts)
- [Change Password](https://www.better-auth.com/docs/concepts/users-accounts#change-password)
- [Delete User](https://www.better-auth.com/docs/concepts/users-accounts#delete-user)

### Email Verification
Supports email verification functionality with configurable auto-login and verification requirements.

**Related Documentation:**
- [Email Verification](https://www.better-auth.com/docs/authentication/email-verification)

### Access Control
Role-based access control system supporting admin permissions and custom roles.

**Related Documentation:**
- [Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Roles and Permissions](https://www.better-auth.com/docs/concepts/roles-permissions)

### Rate Limiting
Protects API endpoints from abuse by limiting the number of requests users can make within a specified time period.

**Related Documentation:**
- [Rate Limiting](https://www.better-auth.com/docs/concepts/rate-limiting)

### Custom Plugins
Better Auth supports custom plugin development to extend authentication functionality.

**Related Documentation:**
- [Plugin Development](https://www.better-auth.com/docs/plugins/custom-plugin)
- [Plugin API](https://www.better-auth.com/docs/plugins/plugin-api)

## Database Models

The authentication service uses Drizzle ORM and includes the following tables:
- `user`: Basic user information
- `account`: Linked social account information
- `session`: User session information
- `verification`: Verification records (email verification, phone verification, etc.)

## Plugin System

The service uses the following Better Auth plugins:
- `admin`: Provides admin roles and access control
- `phoneNumber`: Provides phone number verification functionality
- `validator`: Provides input validation
- Custom `wechat` plugin: Provides WeChat login functionality

## Additional Documentation

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [WeChat Open Platform Documentation](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html) 