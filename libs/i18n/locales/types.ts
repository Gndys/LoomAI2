export type Locale = {
  common: {
    welcome: string
    login: string
    signup: string
    logout: string
    profile: string
    settings: string
    and: string
    loading: string
    unexpectedError: string
  }
  navigation: {
    home: string
    dashboard: string
    orders: string
    shipments: string
    tracking: string
  }
  actions: {
    save: string
    cancel: string
    confirm: string
    delete: string
    edit: string
    tryAgain: string
    createAccount: string
    sendCode: string
    verify: string
  }
  auth: {
    signin: {
      title: string
      welcomeBack: string
      socialLogin: string
      continueWith: string
      email: string
      emailPlaceholder: string
      password: string
      forgotPassword: string
      rememberMe: string
      submit: string
      submitting: string
      noAccount: string
      signupLink: string
      termsNotice: string
      termsOfService: string
      privacyPolicy: string
      socialProviders: {
        google: string
        github: string
        apple: string
        wechat: string
        phone: string
      }
      errors: {
        invalidEmail: string
        requiredEmail: string
        requiredPassword: string
        invalidCredentials: string
      }
    }
    signup: {
      title: string
      createAccount: string
      socialSignup: string
      continueWith: string
      name: string
      namePlaceholder: string
      email: string
      emailPlaceholder: string
      password: string
      passwordPlaceholder: string
      imageUrl: string
      imageUrlPlaceholder: string
      optional: string
      submit: string
      submitting: string
      haveAccount: string
      signinLink: string
      termsNotice: string
      termsOfService: string
      privacyPolicy: string
      verification: {
        title: string
        sent: string
        checkSpam: string
        spamInstruction: string
      }
      errors: {
        invalidName: string
        requiredName: string
        invalidEmail: string
        requiredEmail: string
        invalidPassword: string
        requiredPassword: string
        invalidImage: string
      }
    }
    phone: {
      title: string
      description: string
      phoneNumber: string
      phoneNumberPlaceholder: string
      verificationCode: string
      sendingCode: string
      verifying: string
      termsNotice: string
      termsOfService: string
      privacyPolicy: string
      errors: {
        invalidPhone: string
        requiredPhone: string
        invalidCode: string
        requiredCode: string
      }
    }
    forgetPassword: {
      title: string
      description: string
      email: string
      emailPlaceholder: string
      submit: string
      submitting: string
      termsNotice: string
      termsOfService: string
      privacyPolicy: string
      verification: {
        title: string
        sent: string
        checkSpam: string
      }
      errors: {
        invalidEmail: string
        requiredEmail: string
      }
    }
    resetPassword: {
      title: string
      description: string
      password: string
      passwordPlaceholder: string
      confirmPassword: string
      confirmPasswordPlaceholder: string
      submit: string
      submitting: string
      success: {
        title: string
        description: string
        backToSignin: string
      }
      errors: {
        invalidPassword: string
        requiredPassword: string
        passwordsDontMatch: string
        invalidToken: string
      }
    }
    wechat: {
      title: string
      description: string
      scanQRCode: string
      orUseOtherMethods: string
      loadingQRCode: string
      errors: {
        loadingFailed: string
        networkError: string
      }
    }
  }
} 
 