import type { Locale } from './types'

export const en: Locale = {
  common: {
    welcome: "Welcome to ShipEasy",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    settings: "Settings",
    and: "and",
    loading: "Loading...",
    unexpectedError: "An unexpected error occurred",
    theme: {
      light: "Light Theme",
      dark: "Dark Theme",
      system: "System Theme",
      toggle: "Toggle Theme"
    }
  },
  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    orders: "Orders",
    shipments: "Shipments",
    tracking: "Tracking",
    admin: {
      dashboard: "Dashboard",
      users: "Users",
      subscriptions: "Subscriptions",
      orders: "Orders",
      application: "Application"
    }
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    tryAgain: "Try again",
    createAccount: "Create account",
    sendCode: "Send Code",
    verify: "Verify",
    backToList: "Back to Users",
    saveChanges: "Save Changes",
    createUser: "Create User",
    deleteUser: "Delete User",
    back: "Back",
    resendCode: "Resend Code"
  },
  email: {
    verification: {
      subject: "Verify your ShipEasy account",
      title: "Verify your email address",
      greeting: "Hello {{name}},",
      message: "Thank you for registering with ShipEasy. To complete your registration, please click the button below to verify your email address.",
      button: "Verify Email Address",
      alternativeText: "Or, copy and paste the following link into your browser:",
      expiry: "This link will expire in {{expiry_hours}} hours.",
      disclaimer: "If you didn't request this verification, please ignore this email.",
      signature: "Happy Shipping,<br>The ShipEasy Team",
      copyright: "© {{year}} ShipEasy. All rights reserved."
    },
    resetPassword: {
      subject: "Reset your ShipEasy password",
      title: "Reset your password",
      greeting: "Hello {{name}},",
      message: "We received a request to reset your password. Please click the button below to create a new password. If you didn't make this request, you can safely ignore this email.",
      button: "Reset Password",
      alternativeText: "Or, copy and paste the following link into your browser:",
      expiry: "This link will expire in {{expiry_hours}} hours.",
      disclaimer: "If you didn't request a password reset, no action is required.",
      signature: "Happy Shipping,<br>The ShipEasy Team",
      copyright: "© {{year}} ShipEasy. All rights reserved."
    }
  },
  auth: {
    metadata: {
      signin: {
        title: "TinyShip - Sign In",
        description: "Sign in to your TinyShip account to access your dashboard, manage subscriptions, and use premium features.",
        keywords: "sign in, login, authentication, account access, dashboard"
      },
      signup: {
        title: "TinyShip - Create Account",
        description: "Create your TinyShip account and start building amazing SaaS applications with our comprehensive starter kit.",
        keywords: "sign up, register, create account, new user, get started"
      },
      forgotPassword: {
        title: "TinyShip - Reset Password",
        description: "Reset your TinyShip account password securely. Enter your email to receive password reset instructions.",
        keywords: "forgot password, reset password, password recovery, account recovery"
      },
      resetPassword: {
        title: "TinyShip - Create New Password",
        description: "Create a new secure password for your TinyShip account. Choose a strong password to protect your account.",
        keywords: "new password, password reset, secure password, account security"
      },
      phone: {
        title: "TinyShip - Phone Login",
        description: "Sign in to TinyShip using your phone number. Quick and secure authentication with SMS verification.",
        keywords: "phone login, SMS verification, mobile authentication, phone number"
      },
      wechat: {
        title: "TinyShip - WeChat Login",
        description: "Sign in to TinyShip using your WeChat account. Convenient authentication for Chinese users.",
        keywords: "WeChat login, 微信登录, social login, Chinese authentication"
      }
    },
    signin: {
      title: "Sign in to your account",
      welcomeBack: "Welcome back",
      socialLogin: "Sign in with your favorite social account",
      continueWith: "Or continue with",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      submit: "Sign in",
      submitting: "Signing in...",
      noAccount: "Don't have an account?",
      signupLink: "Sign up",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      socialProviders: {
        google: "Continue with Google",
        github: "Continue with GitHub",
        apple: "Continue with Apple",
        wechat: "Continue with WeChat",
        phone: "Continue with Phone"
      },
      errors: {
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        requiredPassword: "Password is required",
        invalidCredentials: "Invalid email or password",
        captchaRequired: "Please complete the captcha verification"
      }
    },
    signup: {
      title: "Sign up for ShipEasy",
      createAccount: "Create an account",
      socialSignup: "Sign up with your favorite social account",
      continueWith: "Or continue with",
      name: "Name",
      namePlaceholder: "Enter your name",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Create a password",
      imageUrl: "Profile Image URL",
      imageUrlPlaceholder: "https://example.com/your-image.jpg",
      optional: "Optional",
      submit: "Create account",
      submitting: "Creating account...",
      haveAccount: "Already have an account?",
      signinLink: "Sign in",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      verification: {
        title: "Verification Required",
        sent: "We've sent a verification email to",
        checkSpam: "Can't find the email? Please check your spam folder.",
        spamInstruction: "If you still don't see it,"
      },
      errors: {
        invalidName: "Please enter a valid name",
        requiredName: "Name is required",
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        invalidPassword: "Please enter a valid password",
        requiredPassword: "Password is required",
        invalidImage: "Please enter a valid image URL",
        captchaRequired: "Please complete the captcha verification",
        captchaError: "Captcha verification failed, please try again",
        captchaExpired: "Captcha verification expired, please try again"
      }
    },
    phone: {
      title: "Login with Phone",
      description: "Enter your phone number to receive a verification code",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "Enter your phone number",
      countryCode: "Country/Region",
      verificationCode: "Verification Code",
      enterCode: "Enter Verification Code",
      sendingCode: "Sending code...",
      verifying: "Verifying...",
      codeSentTo: "Verification code sent to",
      resendIn: "Resend in",
      seconds: "seconds",
      resendCode: "Resend Code",
      resendCountdown: "seconds remaining",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      errors: {
        invalidPhone: "Please enter a valid phone number",
        requiredPhone: "Phone number is required",
        requiredCountryCode: "Please select country/region",
        invalidCode: "Please enter a valid verification code",
        requiredCode: "Verification code is required",
        captchaRequired: "Please complete the captcha verification"
      }
    },
    forgetPassword: {
      title: "Forgot Password",
      description: "Reset your password and regain access to your account",
      email: "Email",
      emailPlaceholder: "Enter your email",
      submit: "Send reset link",
      submitting: "Sending...",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      verification: {
        title: "Check your email",
        sent: "We've sent a password reset link to",
        checkSpam: "Can't find the email? Please check your spam folder."
      },
      errors: {
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        captchaRequired: "Please complete the captcha verification"
      }
    },
    resetPassword: {
      title: "Reset Password",
      description: "Create a new password for your account",
      password: "New Password",
      passwordPlaceholder: "Enter your new password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your new password",
      submit: "Reset Password",
      submitting: "Resetting...",
      success: {
        title: "Password Reset Successful",
        description: "Your password has been successfully reset.",
        backToSignin: "Back to Sign In"
      },
      errors: {
        invalidPassword: "Password must be at least 8 characters",
        requiredPassword: "Password is required",
        passwordsDontMatch: "Passwords don't match",
        invalidToken: "Invalid or expired reset link. Please try again."
      }
    },
    wechat: {
      title: "WeChat Login",
      description: "Scan with WeChat to log in",
      scanQRCode: "Please scan the QR code with WeChat",
      orUseOtherMethods: "Or use other login methods",
      loadingQRCode: "Loading QR code...",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      errors: {
        loadingFailed: "Failed to load WeChat QR code",
        networkError: "Network error, please try again"
      }
    }
  },
  admin: {
    metadata: {
      title: "TinyShip - Admin Dashboard",
      description: "Comprehensive admin dashboard for managing users, subscriptions, orders, and system analytics in your SaaS application.",
      keywords: "admin, dashboard, management, SaaS, analytics, users, subscriptions, orders"
    },
    dashboard: {
      title: "Admin Dashboard",
      accessDenied: "Access Denied",
      noPermission: "You don't have permission to access the admin dashboard",
      lastUpdated: "Last updated",
      metrics: {
        totalRevenue: "Total Revenue",
        totalRevenueDesc: "Total revenue",
        newCustomers: "New Customers",
        newCustomersDesc: "New customers this month",
        newOrders: "New Orders",
        newOrdersDesc: "New orders this month"
      },
      chart: {
        monthlyRevenueTrend: "Monthly Revenue Trend",
        revenue: "Revenue",
        orders: "Orders"
      },
      todayData: {
        title: "Today's Data",
        revenue: "Revenue",
        newUsers: "New Users",
        orders: "Orders"
      },
      monthData: {
        title: "This Month's Data",
        revenue: "Revenue",
        newUsers: "New Users",
        orders: "Orders"
      },
      recentOrders: {
        title: "Recent Orders",
        orderId: "Order ID",
        customer: "Customer",
        plan: "Plan",
        amount: "Amount",
        provider: "Payment Method",
        status: "Status",
        time: "Time",
        total: "Total"
      }
    },
    users: {
      title: "User Management",
      subtitle: "Manage users, roles, and permissions",
      actions: {
        addUser: "Add User",
        editUser: "Edit User",
        deleteUser: "Delete User",
        banUser: "Ban User",
        unbanUser: "Unban User"
      },
      table: {
        columns: {
          id: "ID",
          name: "Name",
          email: "Email",
          role: "Role",
          emailVerified: "Email Verified",
          banned: "Banned",
          createdAt: "Created At",
          updatedAt: "Updated At",
          actions: "Actions"
        },
        actions: {
          editUser: "Edit User",
          deleteUser: "Delete User"
        },
        noResults: "No users found",
        search: {
          searchBy: "Search by",
          searchPlaceholder: "Search {field}...",
          filterByRole: "Filter by role",
          allRoles: "All Roles",
          banStatus: "Ban status",
          allUsers: "All users",
          bannedUsers: "Banned",
          notBannedUsers: "Not banned",
          view: "View",
          toggleColumns: "Toggle columns"
        },
        pagination: {
          showing: "Showing {start} to {end} of {total} results",
          pageInfo: "Page {current} of {total}"
        },
        dialog: {
          banTitle: "Ban User",
          banDescription: "Are you sure you want to ban this user? They will not be able to access the application.",
          banSuccess: "User banned successfully",
          unbanSuccess: "User unbanned successfully",
          updateRoleSuccess: "User role updated successfully",
          updateRoleFailed: "Failed to update user role"
        }
      },
      banDialog: {
        title: "Ban User",
        description: "Are you sure you want to ban {userName}? They will not be able to access the application."
      },
      unbanDialog: {
        title: "Unban User",
        description: "Are you sure you want to unban {userName}? They will regain access to the application."
      },
      form: {
        title: "User Information",
        description: "Enter user details below",
        labels: {
          name: "Name",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          role: "Role",
          image: "Profile Image",
          phoneNumber: "Phone Number",
          emailVerified: "Email Verified",
          phoneVerified: "Phone Verified",
          banned: "Banned",
          banReason: "Ban Reason"
        },
        placeholders: {
          name: "Enter user's name",
          email: "Enter user's email",
          password: "Enter password (min 8 characters)",
          confirmPassword: "Confirm password",
          selectRole: "Select role",
          image: "https://example.com/avatar.jpg",
          phoneNumber: "Enter phone number",
          banReason: "Reason for banning (optional)"
        },
        validation: {
          nameRequired: "Name is required",
          emailRequired: "Email is required",
          emailInvalid: "Please enter a valid email",
          passwordRequired: "Password is required",
          passwordMinLength: "Password must be at least 8 characters",
          passwordMismatch: "Passwords do not match",
          roleRequired: "Role is required"
        }
      },
      deleteDialog: {
        title: "Delete User",
        description: "Are you absolutely sure? This action cannot be undone. This will permanently delete the user account and remove all associated data."
      },
      messages: {
        createSuccess: "User created successfully",
        updateSuccess: "User updated successfully",
        deleteSuccess: "User deleted successfully",
        deleteError: "Failed to delete user",
        fetchError: "Failed to fetch user data",
        operationFailed: "Operation failed"
      }
    },
    orders: {
      title: "Orders",
      actions: {
        createOrder: "Create Order"
      },
      messages: {
        fetchError: "Failed to load orders. Please try again."
      },
      table: {
        noResults: "No orders found.",
        search: {
          searchBy: "Search by...",
          searchPlaceholder: "Search by {field}...",
          filterByStatus: "Filter by status",
          allStatus: "All Status",
          filterByProvider: "Payment provider",
          allProviders: "All Providers",
          pending: "Pending",
          paid: "Paid",
          failed: "Failed",
          refunded: "Refunded",
          canceled: "Canceled",
          stripe: "Stripe",
          wechat: "WeChat"
        },
        columns: {
          id: "Order ID",
          user: "User",
          amount: "Amount",
          plan: "Plan",
          status: "Status",
          provider: "Provider",
          providerOrderId: "Provider Order ID",
          createdAt: "Created At",
          actions: "Actions"
        },
        actions: {
          viewOrder: "View order",
          refundOrder: "Refund order"
        }
      }
    },
    subscriptions: {
      title: "Subscriptions",
      actions: {
        createSubscription: "Create Subscription"
      },
      messages: {
        fetchError: "Failed to load subscriptions. Please try again."
      },
      table: {
        noResults: "No subscriptions found.",
        search: {
          searchBy: "Search by...",
          searchPlaceholder: "Search by {field}...",
          filterByStatus: "Filter by status",
          allStatus: "All Status",
          filterByPaymentType: "Payment type",
          allPaymentTypes: "All Types",
          active: "Active",
          canceled: "Canceled",
          pastDue: "Past Due",
          unpaid: "Unpaid",
          trialing: "Trialing",
          oneTime: "One Time",
          recurring: "Recurring"
        },
        columns: {
          id: "Subscription ID",
          user: "User",
          plan: "Plan",
          status: "Status",
          paymentType: "Payment Type",
          period: "Period",
          createdAt: "Created At",
          actions: "Actions"
        },
        actions: {
          viewSubscription: "View subscription",
          cancelSubscription: "Cancel subscription"
        }
      }
    }
  },
  pricing: {
    metadata: {
      title: "TinyShip - Pricing Plans",
      description: "Choose the perfect plan for your needs. Flexible pricing options including monthly, yearly, and lifetime subscriptions with premium features.",
      keywords: "pricing, plans, subscription, monthly, yearly, lifetime, premium, features"
    },
    title: "Pricing",
    subtitle: "Choose the plan that's right for you",
    cta: "Get started",
    plans: {
      monthly: {
        name: "Monthly Plan",
        description: "Perfect for short-term projects",
        duration: "month",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support"
        }
      },
      yearly: {
        name: "Annual Plan",
        description: "Best value for long-term use",
        duration: "year",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support",
          "两个月免费": "2 months free"
        }
      },
      lifetime: {
        name: "Lifetime",
        description: "One-time payment, lifetime access",
        duration: "lifetime",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support",
          "终身免费更新": "Free lifetime updates"
        }
      }
    }
  },
  payment: {
    metadata: {
      success: {
        title: "TinyShip - Payment Successful",
        description: "Your payment has been processed successfully. Thank you for your subscription and welcome to our premium features.",
        keywords: "payment, success, subscription, confirmation, premium"
      },
      cancel: {
        title: "TinyShip - Payment Cancelled",
        description: "Your payment was cancelled. You can retry the payment or contact our support team for assistance.",
        keywords: "payment, cancelled, retry, support, subscription"
      }
    },
    result: {
      success: {
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        actions: {
          viewSubscription: "View Subscription",
          backToHome: "Back to Home"
        }
      },
      cancel: {
        title: "Payment Cancelled",
        description: "Your payment has been cancelled.",
        actions: {
          tryAgain: "Try Again",
          contactSupport: "Contact Support",
          backToHome: "Back to Home"
        }
      },
      failed: "Payment failed, please try again"
    },
    steps: {
      initiate: "Initialize",
      initiateDesc: "Prepare payment",
      scan: "Scan",
      scanDesc: "Scan QR code",
      pay: "Pay",
      payDesc: "Confirm payment"
    },
    scanQrCode: "Please scan the QR code with WeChat to complete the payment",
    confirmCancel: "Your payment is not complete. Are you sure you want to cancel?",
    orderCanceled: "Your order has been canceled"
  },
  subscription: {
    metadata: {
      title: "TinyShip - My Subscription",
      description: "Manage your subscription plan, view billing history, and update payment methods in your subscription dashboard.",
      keywords: "subscription, billing, payment, plan, management, dashboard"
    },
    title: "My Subscription",
    overview: {
      title: "Subscription Overview",
      planType: "Plan Type",
      status: "Status",
      active: "Active",
      startDate: "Start Date",
      endDate: "End Date",
      progress: "Subscription Progress"
    },
    management: {
      title: "Subscription Management",
      help: {
        title: "Need Help?",
        description: "If you have any questions about your subscription or need assistance, please contact our support team.",
        contactSupport: "Contact Support"
      },
      stripe: {
        title: "Subscription Management",
        description: "You can manage your subscription, payment methods, and billing history in the Stripe customer portal.",
        manageSubscription: "Manage Subscription",
        viewBilling: "View Billing History",
        changePlan: "Change Plan",
        redirecting: "Redirecting..."
      },
      lifetime: {
        title: "Lifetime Membership",
        description: "You are a lifetime member and can enjoy all premium features permanently."
      }
    },
    noSubscription: {
      title: "No Active Subscription Found",
      description: "You currently don't have an active subscription plan.",
      viewPlans: "View Plans"
    }
  },
  dashboard: {
    metadata: {
      title: "TinyShip - Dashboard",
      description: "Manage your account, subscriptions, and profile settings in your personalized dashboard.",
      keywords: "dashboard, account, profile, subscription, settings, management"
    },
    title: "Dashboard",
    description: "Manage your account and subscriptions",
    profile: {
      title: "Profile Information",
      noNameSet: "No name set",
      role: "Role:",
      emailVerified: "Email verified",
      editProfile: "Edit Profile",
      updateProfile: "Update Profile",
      cancel: "Cancel",
      form: {
        labels: {
          name: "Full Name",
          email: "Email Address",
          image: "Profile Image URL"
        },
        placeholders: {
          name: "Enter your full name",
          email: "Email address",
          image: "https://example.com/your-image.jpg"
        },
        emailReadonly: "Email address cannot be modified",
        imageDescription: "Optional: Enter a URL for your profile picture"
      },
      updateSuccess: "Profile updated successfully",
      updateError: "Failed to update profile. Please try again."
    },
    subscription: {
      title: "Subscription Status",
      status: {
        lifetime: "Lifetime",
        active: "Active",
        canceled: "Canceled",
        pastDue: "Past Due",
        unknown: "Unknown",
        noSubscription: "No Subscription"
      },
      lifetimeAccess: "You have lifetime access",
      expires: "Expires:",
      noActiveSubscription: "You currently have no active subscription",
      manageSubscription: "Manage Subscription",
      viewPlans: "View Plans"
    },
    account: {
      title: "Account Details",
      memberSince: "Member since",
      phoneNumber: "Phone Number"
    },
    orders: {
      title: "Order History",
      status: {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
        canceled: "Canceled"
      },
      provider: {
        stripe: "Stripe",
        wechat: "WeChat Pay",
        creem: "Creem"
      },
      noOrders: "No orders found",
      noOrdersDescription: "You haven't placed any orders yet",
      viewAllOrders: "View All Orders",
      orderDetails: {
        orderId: "Order ID",
        amount: "Amount",
        plan: "Plan",
        status: "Status",
        provider: "Payment Method",
        createdAt: "Created"
      },
      recent: {
        title: "Recent Orders",
        showingRecent: "Showing {count} most recent orders"
      },
      page: {
        title: "All Orders",
        description: "View and manage all your orders",
        backToDashboard: "Back to Dashboard",
        totalOrders: "Total {count} orders"
      }
    },
    linkedAccounts: {
      title: "Linked Accounts",
      connected: "Connected",
      connectedAt: "Connected:",
      noLinkedAccounts: "No linked accounts",
      providers: {
        credentials: "Email & Password",
        google: "Google",
        github: "GitHub",
        facebook: "Facebook",
        apple: "Apple",
        discord: "Discord",
        wechat: "WeChat",
        phone: "Phone Number"
      }
    },
    tabs: {
      profile: {
        title: "Profile",
        description: "Manage your personal information and avatar"
      },
      account: {
        title: "Account Management",
        description: "Password changes, linked accounts and security"
      },
      security: {
        title: "Security",
        description: "Password and security settings"
      },
      subscription: {
        description: "Manage your subscription plan and features"
      },
      orders: {
        description: "View your order history and transactions"
      },
      content: {
        profile: {
          title: "Profile",
          subtitle: "This is how others will see you on the site.",
          username: {
            label: "Username",
            value: "shadcn",
            description: "This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days."
          },
          email: {
            label: "Email",
            placeholder: "Select a verified email to display",
            description: "You can manage verified email addresses in your email settings."
          }
        },
        account: {
          title: "Account Settings",
          subtitle: "Manage your account settings and preferences.",
          placeholder: "Account settings content..."
        },
        security: {
          title: "Security Settings",
          subtitle: "Manage your password and security settings.",
          placeholder: "Security settings content..."
        }
      }
    },
    quickActions: {
      title: "Quick Actions",
      editProfile: "Edit Profile",
      accountSettings: "Account Settings",
      subscriptionDetails: "Subscription Details",
      getSupport: "Get Support",
      viewDocumentation: "View Documentation"
    },
    accountManagement: {
      title: "Account Management",
      changePassword: {
        title: "Change Password",
        description: "Update your account password",
        oauthDescription: "Password management is not available for social login accounts",
        button: "Change Password",
        dialogDescription: "Please enter your current password and choose a new one",
        form: {
          currentPassword: "Current Password",
          currentPasswordPlaceholder: "Enter your current password",
          newPassword: "New Password",
          newPasswordPlaceholder: "Enter new password (minimum 8 characters)",
          confirmPassword: "Confirm New Password",
          confirmPasswordPlaceholder: "Confirm your new password",
          cancel: "Cancel",
          submit: "Update Password"
        },
        success: "Password updated successfully",
        errors: {
          required: "Please fill in all required fields",
          mismatch: "New passwords do not match",
          minLength: "Password must be at least 8 characters long",
          failed: "Failed to update password. Please try again."
        }
      },
      deleteAccount: {
        title: "Delete Account",
        description: "Permanently delete your account and all associated data",
        button: "Delete Account",
        confirmTitle: "Delete Account",
        confirmDescription: "Are you absolutely sure you want to delete your account?",
        warning: "⚠️ This action cannot be undone",
        consequences: {
          data: "All your personal data will be permanently deleted",
          subscriptions: "Active subscriptions will be cancelled",
          access: "You will lose access to all premium features"
        },
        form: {
          cancel: "Cancel",
          confirm: "Yes, Delete My Account"
        },
        success: "Account deleted successfully",
        errors: {
          failed: "Failed to delete account. Please try again."
        }
      }
    },
    roles: {
      admin: "Administrator",
      user: "User"
    }
  },
  home: {
    metadata: {
      title: "TinyShip - Modern Full-Stack SaaS Development Starter",
      description: "A modern, full-featured monorepo starter kit for building SaaS applications with support for both domestic (China) and international markets. Built with Next.js/Nuxt.js, TypeScript, and comprehensive authentication.",
      keywords: "SaaS, monorepo, starter kit, Next.js, Nuxt.js, TypeScript, authentication, i18n, China market, international"
    }
  },
  ai: {
    metadata: {
      title: "TinyShip - AI Assistant",
      description: "Interact with powerful AI models including GPT-4, Qwen, and DeepSeek. Get AI assistance for coding, writing, and problem-solving.",
      keywords: "AI, assistant, chatbot, GPT-4, artificial intelligence, machine learning, conversation"
    }
  },
  premiumFeatures: {
    metadata: {
      title: "TinyShip - Premium Features",
      description: "Explore all the premium features available with your subscription. Access advanced tools, AI assistance, and enhanced functionality.",
      keywords: "premium, features, advanced, tools, subscription, benefits, enhanced"
    }
  },
  validators: {
    user: {
      name: {
        minLength: "Name must be at least {min} characters",
        maxLength: "Name must be less than {max} characters"
      },
      email: {
        invalid: "Please enter a valid email address"
      },
      image: {
        invalidUrl: "Please enter a valid URL"
      },
      password: {
        minLength: "Password must be at least {min} characters",
        maxLength: "Password must be less than {max} characters",
        mismatch: "Passwords don't match"
      },
      countryCode: {
        required: "Please select country/region"
      },
      phoneNumber: {
        required: "Please enter phone number",
        invalid: "Invalid phone number format"
      },
      verificationCode: {
        invalidLength: "Verification code must be {length} characters"
      },
      id: {
        required: "User ID is required"
      },
      currentPassword: {
        required: "Current password is required"
      },
      confirmPassword: {
        required: "Please confirm your password"
      },
      deleteAccount: {
        confirmRequired: "You must confirm account deletion"
      }
    }
  },
  header: {
    navigation: {
      ai: "AI Demo",
      premiumFeatures: "Premium Features",
      pricing: "Pricing"
    },
    auth: {
      signIn: "Sign In",
      getStarted: "Get Started",
      signOut: "Sign Out"
    },
    userMenu: {
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      personalSettings: "Personal Settings",
      adminPanel: "Admin Panel"
    },
    language: {
      switchLanguage: "Switch Language",
      english: "English",
      chinese: "中文"
    }
  }
} as const; 