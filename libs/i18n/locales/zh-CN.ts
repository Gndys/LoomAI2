import type { Locale } from './types'

export const zhCN: Locale = {
  common: {
    welcome: "欢迎使用 TinyShip",
    siteName: "TinyShip",
    login: "登录",
    signup: "注册",
    logout: "退出登录",
    profile: "个人资料",
    settings: "设置",
    and: "和",
    loading: "加载中...",
    unexpectedError: "发生了意外错误",
    notAvailable: "不可用",
    viewPlans: "查看计划",
    yes: "是",
    no: "否",
    theme: {
      light: "浅色主题",
      dark: "深色主题",
      system: "系统主题",
      toggle: "切换主题",
      appearance: "外观设置",
      colorScheme: "配色方案",
      themes: {
        default: "默认主题",
        claude: "Claude主题",
        "cosmic-night": "宇宙之夜",
        "modern-minimal": "现代简约",
        "ocean-breeze": "海洋微风"
      }
    }
  },
  navigation: {
    home: "首页",
    dashboard: "仪表盘",
    orders: "订单",
    shipments: "发货",
    tracking: "追踪",
    admin: {
      dashboard: "仪表盘",
      users: "用户管理",
      subscriptions: "订阅管理",
      orders: "订单管理",
      credits: "积分管理",
      application: "应用程序"
    }
  },
  actions: {
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑",
    tryAgain: "重试",
    createAccount: "创建账户",
    sendCode: "发送验证码",
    verify: "验证",
    backToList: "返回用户列表",
    saveChanges: "保存更改",
    createUser: "创建用户",
    deleteUser: "删除用户",
    back: "返回",
    resendCode: "重新发送",
    resendVerificationEmail: "重新发送验证邮件",
    upload: "上传",
    previous: "上一页",
    next: "下一页"
  },
  email: {
    verification: {
      subject: "验证您的 TinyShip 账号",
      title: "请验证您的邮箱地址",
      greeting: "您好 {{name}}，",
      message: "感谢您注册 TinyShip。要完成注册，请点击下方按钮验证您的电子邮箱地址。",
      button: "验证邮箱地址",
      alternativeText: "或者，您可以复制并粘贴以下链接到浏览器中：",
      expiry: "此链接将在 {{expiry_hours}} 小时后过期。",
      disclaimer: "如果您没有请求此验证，请忽略此邮件。",
      signature: "祝您使用愉快，TinyShip 团队",
      copyright: "© {{year}} TinyShip. 保留所有权利。"
    },
    resetPassword: {
      subject: "重置您的 TinyShip 密码",
      title: "重置您的密码",
      greeting: "您好 {{name}}，",
      message: "我们收到了重置您密码的请求。请点击下方按钮创建新密码。如果您没有提出此请求，可以安全地忽略此邮件。",
      button: "重置密码",
      alternativeText: "或者，您可以复制并粘贴以下链接到浏览器中：",
      expiry: "此链接将在 {{expiry_hours}} 小时后过期。",
      disclaimer: "如果您没有请求重置密码，无需进行任何操作。",
      signature: "祝您使用愉快，TinyShip 团队",
      copyright: "© {{year}} TinyShip. 保留所有权利。"
    }
  },
  auth: {
    metadata: {
      signin: {
        title: "TinyShip - 登录",
        description: "登录您的 TinyShip 账户，访问仪表板、管理订阅并使用高级功能。",
        keywords: "登录, 账户登录, 身份验证, 访问账户, 仪表板"
      },
      signup: {
        title: "TinyShip - 创建账户",
        description: "创建您的 TinyShip 账户，开始使用我们全面的脚手架构建出色的 SaaS 应用程序。",
        keywords: "注册, 创建账户, 新用户, 开始使用, 账户注册"
      },
      forgotPassword: {
        title: "TinyShip - 重置密码",
        description: "安全地重置您的 TinyShip 账户密码。输入您的邮箱以接收密码重置说明。",
        keywords: "忘记密码, 重置密码, 密码恢复, 账户恢复"
      },
      resetPassword: {
        title: "TinyShip - 创建新密码",
        description: "为您的 TinyShip 账户创建新的安全密码。选择强密码来保护您的账户。",
        keywords: "新密码, 密码重置, 安全密码, 账户安全"
      },
      phone: {
        title: "TinyShip - 手机登录",
        description: "使用手机号登录 TinyShip。通过短信验证进行快速安全的身份验证。",
        keywords: "手机登录, 短信验证, 移动端认证, 手机号码"
      },
      wechat: {
        title: "TinyShip - 微信登录",
        description: "使用微信账户登录 TinyShip。为中国用户提供便捷的身份验证。",
        keywords: "微信登录, WeChat登录, 社交登录, 中国认证"
      }
    },
    signin: {
      title: "登录您的账户",
      welcomeBack: "欢迎回来",
      socialLogin: "使用您喜欢的社交账号登录",
      continueWith: "或继续使用",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      password: "密码",
      forgotPassword: "忘记密码？",
      rememberMe: "记住我",
      submit: "登录",
      submitting: "登录中...",
      noAccount: "还没有账户？",
      signupLink: "注册",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      socialProviders: {
        google: "Google",
        github: "GitHub",
        apple: "Apple",
        wechat: "微信",
        phone: "手机号码"
      },
      errors: {
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        requiredPassword: "请输入密码",
        invalidCredentials: "邮箱或密码错误",
        captchaRequired: "请完成验证码验证",
        emailNotVerified: {
          title: "需要邮箱验证",
          description: "请检查您的邮箱并点击验证链接。如果您没有收到邮件，可以点击下方按钮重新发送。",
          resendSuccess: "验证邮件已重新发送，请检查您的邮箱。",
          resendError: "重发验证邮件失败，请稍后重试。",
          dialogTitle: "重新发送验证邮件",
          dialogDescription: "请完成验证码验证后重新发送验证邮件",
          emailLabel: "邮箱地址",
          sendButton: "发送验证邮件",
          sendingButton: "发送中...",
          waitButton: "等待 {seconds}s"
        }
      }
    },
    signup: {
      title: "注册 TinyShip",
      createAccount: "创建账户",
      socialSignup: "使用您喜欢的社交账号注册",
      continueWith: "或继续使用",
      name: "姓名",
      namePlaceholder: "请输入您的姓名",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      password: "密码",
      passwordPlaceholder: "创建密码",
      imageUrl: "头像图片链接",
      imageUrlPlaceholder: "https://example.com/your-image.jpg",
      optional: "可选",
      submit: "创建账户",
      submitting: "创建账户中...",
      haveAccount: "已有账户？",
      signinLink: "登录",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      verification: {
        title: "需要验证",
        sent: "我们已经发送验证邮件到",
        checkSpam: "找不到邮件？请检查垃圾邮件文件夹。",
        spamInstruction: "如果仍然没有收到，"
      },
      errors: {
        invalidName: "请输入有效的姓名",
        requiredName: "请输入姓名",
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        invalidPassword: "请输入有效的密码",
        requiredPassword: "请输入密码",
        invalidImage: "请输入有效的图片链接",
        captchaRequired: "请完成验证码验证",
        captchaError: "验证码验证失败，请重试",
        captchaExpired: "验证码已过期，请重新验证"
      }
    },
    phone: {
      title: "手机号登录",
      description: "输入您的手机号以接收验证码",
      phoneNumber: "手机号",
      phoneNumberPlaceholder: "请输入您的手机号",
      countryCode: "国家/地区",
      verificationCode: "验证码",
      enterCode: "输入验证码",
      sendingCode: "发送验证码中...",
      verifying: "验证中...",
      codeSentTo: "已发送验证码到",
      resendIn: "重新发送",
      seconds: "秒",
      resendCode: "重新发送",
      resendCountdown: "秒后可重新发送",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      errors: {
        invalidPhone: "请输入有效的手机号",
        requiredPhone: "请输入手机号",
        requiredCountryCode: "请选择国家/地区",
        invalidCode: "请输入有效的验证码",
        requiredCode: "请输入验证码",
        captchaRequired: "请完成验证码验证"
      }
    },
    forgetPassword: {
      title: "忘记密码",
      description: "重置密码并重新获得账户访问权限",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      submit: "发送重置链接",
      submitting: "发送中...",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      verification: {
        title: "检查您的邮箱",
        sent: "我们已经发送重置密码链接到",
        checkSpam: "找不到邮件？请检查垃圾邮件文件夹。"
      },
      errors: {
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        captchaRequired: "请完成验证码验证"
      }
    },
    resetPassword: {
      title: "重置密码",
      description: "为您的账户创建新密码",
      password: "新密码",
      passwordPlaceholder: "请输入新密码",
      confirmPassword: "确认密码",
      confirmPasswordPlaceholder: "请再次输入新密码",
      submit: "重置密码",
      submitting: "重置中...",
      success: {
        title: "密码重置成功",
        description: "您的密码已经成功重置。",
        backToSignin: "返回登录",
        goToSignIn: "返回登录"
      },
      errors: {
        invalidPassword: "密码长度至少为8个字符",
        requiredPassword: "请输入密码",
        passwordsDontMatch: "两次输入的密码不一致",
        invalidToken: "重置链接无效或已过期，请重试。"
      }
    },
    wechat: {
      title: "微信登录",
      description: "使用微信扫码登录",
      scanQRCode: "请使用微信扫描二维码",
      orUseOtherMethods: "或使用其他登录方式",
      loadingQRCode: "加载二维码中...",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      errors: {
        loadingFailed: "微信二维码加载失败",
        networkError: "网络错误，请重试"
      }
    },
    // Better Auth 1.4 错误代码映射
    authErrors: {
      // 用户相关错误
      USER_NOT_FOUND: "未找到该邮箱对应的账户",
      USER_ALREADY_EXISTS: "该邮箱已被注册",
      USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "用户已存在，请使用其他邮箱",
      USER_EMAIL_NOT_FOUND: "未找到用户邮箱",
      FAILED_TO_CREATE_USER: "创建用户失败",
      FAILED_TO_UPDATE_USER: "更新用户失败",
      
      // 认证错误
      INVALID_EMAIL: "邮箱地址无效",
      INVALID_PASSWORD: "密码无效",
      INVALID_EMAIL_OR_PASSWORD: "邮箱或密码错误",
      INVALID_CREDENTIALS: "提供的凭据无效",
      INVALID_TOKEN: "无效或已过期的令牌",
      PASSWORD_TOO_SHORT: "密码过短",
      PASSWORD_TOO_LONG: "密码过长",
      
      // 邮箱验证错误
      EMAIL_NOT_VERIFIED: "请先验证您的邮箱地址",
      EMAIL_ALREADY_VERIFIED: "邮箱已验证",
      EMAIL_MISMATCH: "邮箱不匹配",
      EMAIL_CAN_NOT_BE_UPDATED: "邮箱无法更新",
      VERIFICATION_EMAIL_NOT_ENABLED: "验证邮件功能未启用",
      
      // 会话错误
      SESSION_EXPIRED: "您的会话已过期，请重新登录",
      SESSION_NOT_FRESH: "会话不是最新的，请重新认证",
      FAILED_TO_CREATE_SESSION: "创建会话失败",
      FAILED_TO_GET_SESSION: "获取会话失败",
      
      // 账户错误
      ACCOUNT_NOT_FOUND: "账户未找到",
      ACCOUNT_BLOCKED: "您的账户已被临时冻结",
      CREDENTIAL_ACCOUNT_NOT_FOUND: "凭证账户未找到",
      SOCIAL_ACCOUNT_ALREADY_LINKED: "社交账户已关联",
      LINKED_ACCOUNT_ALREADY_EXISTS: "关联账户已存在",
      FAILED_TO_UNLINK_LAST_ACCOUNT: "无法解除最后一个账户的关联",
      USER_ALREADY_HAS_PASSWORD: "用户已设置密码",
      
      // 手机号错误
      PHONE_NUMBER_ALREADY_EXISTS: "该手机号已被注册",
      INVALID_PHONE_NUMBER: "手机号格式无效",
      OTP_EXPIRED: "验证码已过期",
      INVALID_OTP: "验证码错误",
      OTP_TOO_MANY_ATTEMPTS: "验证尝试次数过多，请重新获取验证码",
      
      // 提供商错误
      PROVIDER_NOT_FOUND: "提供商未找到",
      ID_TOKEN_NOT_SUPPORTED: "不支持 ID Token",
      FAILED_TO_GET_USER_INFO: "获取用户信息失败",
      
      // 安全错误
      CAPTCHA_REQUIRED: "请完成验证码验证",
      CAPTCHA_INVALID: "验证码验证失败",
      TOO_MANY_REQUESTS: "请求过于频繁，请稍后重试",
      CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: "跨站导航登录被阻止",
      INVALID_ORIGIN: "无效的来源",
      MISSING_OR_NULL_ORIGIN: "来源缺失或无效",
      
      // 回调 URL 错误
      INVALID_CALLBACK_URL: "无效的回调 URL",
      INVALID_REDIRECT_URL: "无效的重定向 URL",
      INVALID_ERROR_CALLBACK_URL: "无效的错误回调 URL",
      INVALID_NEW_USER_CALLBACK_URL: "无效的新用户回调 URL",
      CALLBACK_URL_REQUIRED: "需要回调 URL",
      
      // 验证错误
      VALIDATION_ERROR: "验证错误",
      MISSING_FIELD: "缺少必填字段",
      FIELD_NOT_ALLOWED: "不允许的字段",
      ASYNC_VALIDATION_NOT_SUPPORTED: "不支持异步验证",
      
      // 系统错误
      FAILED_TO_CREATE_VERIFICATION: "创建验证失败",
      EMAIL_SEND_FAILED: "邮件发送失败，请稍后重试",
      SMS_SEND_FAILED: "短信发送失败，请稍后重试",
      UNKNOWN_ERROR: "发生未知错误"
    }
  },
  admin: {
    metadata: {
      title: "TinyShip - 管理后台",
      description: "全面的管理仪表板，用于管理用户、订阅、订单和系统分析，为您的SaaS应用提供强大的管理功能。",
      keywords: "管理后台, 仪表板, 管理, SaaS, 分析, 用户, 订阅, 订单"
    },
    dashboard: {
      title: "管理员仪表板",
      accessDenied: "访问被拒绝",
      noPermission: "您没有权限访问管理员仪表板",
      lastUpdated: "最后更新",
      metrics: {
        totalRevenue: "总收入",
        totalRevenueDesc: "历史总收入",
        newCustomers: "本月新客户",
        newCustomersDesc: "本月新增客户数",
        newOrders: "本月新订单",
        newOrdersDesc: "本月新增订单数",
        fromLastMonth: "较上月"
      },
      chart: {
        monthlyRevenueTrend: "月度收入趋势",
        revenue: "收入",
        orders: "订单数"
      },
      todayData: {
        title: "今日数据",
        revenue: "收入",
        newUsers: "新用户",
        orders: "订单数"
      },
      monthData: {
        title: "本月数据",
        revenue: "本月收入",
        newUsers: "本月新用户",
        orders: "本月订单数"
      },
      recentOrders: {
        title: "最近订单",
        orderId: "订单ID",
        customer: "客户",
        plan: "计划",
        amount: "金额",
        provider: "支付方式",
        status: "状态",
        time: "时间",
        total: "总计"
      }
    },
    users: {
      title: "用户管理",
      subtitle: "管理用户、角色和权限",
      createUser: "创建用户",
      editUser: "编辑用户",
      actions: {
        addUser: "添加用户",
        editUser: "编辑用户",
        deleteUser: "删除用户",
        banUser: "封禁用户",
        unbanUser: "解封用户"
      },
      table: {
        columns: {
          id: "ID",
          name: "姓名",
          email: "邮箱",
          role: "角色",
          phoneNumber: "手机号",
          emailVerified: "邮箱验证",
          banned: "封禁状态",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          actions: "操作"
        },
        actions: {
          editUser: "编辑用户",
          deleteUser: "删除用户",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        },
        noResults: "未找到用户",
        search: {
          searchBy: "搜索字段",
          searchPlaceholder: "搜索 {field}...",
          filterByRole: "按角色筛选",
          allRoles: "所有角色",
          banStatus: "封禁状态",
          allUsers: "所有用户",
          bannedUsers: "已封禁",
          notBannedUsers: "未封禁",
          view: "视图",
          toggleColumns: "切换列显示"
        },
        pagination: {
          showing: "显示第 {start} 到 {end} 条，共 {total} 条结果",
          pageInfo: "第 {current} 页，共 {total} 页"
        },
        dialog: {
          banTitle: "封禁用户",
          banDescription: "您确定要封禁此用户吗？他们将无法访问应用程序。",
          banSuccess: "用户封禁成功",
          unbanSuccess: "用户解封成功",
          updateRoleSuccess: "用户角色更新成功",
          updateRoleFailed: "用户角色更新失败"
        }
      },
      banDialog: {
        title: "封禁用户",
        description: "您确定要封禁 {userName} 吗？他们将无法访问应用程序。"
      },
      unbanDialog: {
        title: "解封用户",
        description: "您确定要解封 {userName} 吗？他们将重新获得访问权限。"
      },
      form: {
        title: "用户信息",
        description: "请在下方输入用户详细信息",
        labels: {
          name: "姓名",
          email: "邮箱",
          password: "密码",
          confirmPassword: "确认密码",
          role: "角色",
          image: "头像",
          phoneNumber: "手机号",
          emailVerified: "邮箱已验证",
          phoneVerified: "手机已验证",
          banned: "已封禁",
          banReason: "封禁原因"
        },
        placeholders: {
          name: "请输入用户姓名",
          email: "请输入用户邮箱",
          password: "请输入密码（至少8位）",
          confirmPassword: "请确认密码",
          selectRole: "请选择角色",
          image: "https://example.com/avatar.jpg",
          phoneNumber: "请输入手机号",
          banReason: "封禁原因（可选）"
        },
        validation: {
          nameRequired: "姓名不能为空",
          emailRequired: "邮箱不能为空",
          emailInvalid: "请输入有效的邮箱地址",
          passwordRequired: "密码不能为空",
          passwordMinLength: "密码至少需要8位字符",
          passwordMismatch: "两次输入的密码不一致",
          roleRequired: "请选择角色"
        }
      },
      deleteDialog: {
        title: "删除用户",
        description: "您确定要删除此用户吗？此操作无法撤销，将永久删除用户账户和所有相关数据。"
      },
      messages: {
        createSuccess: "用户创建成功",
        updateSuccess: "用户更新成功",
        deleteSuccess: "用户删除成功",
        fetchError: "获取用户信息失败",
        operationFailed: "操作失败",
        deleteError: "删除用户失败"
      }
    },
    orders: {
      title: "订单管理",
      actions: {
        createOrder: "创建订单"
      },
      messages: {
        fetchError: "加载订单失败，请重试。"
      },
      table: {
        noResults: "未找到订单。",
        search: {
          searchBy: "搜索条件...",
          searchPlaceholder: "按{field}搜索...",
          filterByStatus: "按状态筛选",
          allStatus: "所有状态",
          filterByProvider: "支付方式",
          allProviders: "所有支付方式",
          pending: "待支付",
          paid: "已支付",
          failed: "支付失败",
          refunded: "已退款",
          canceled: "已取消",
          stripe: "Stripe",
          wechat: "微信支付",
          creem: "Creem",
          alipay: "支付宝"
        },
        columns: {
          id: "订单ID",
          user: "用户",
          amount: "金额",
          plan: "计划",
          status: "状态",
          provider: "支付方式",
          providerOrderId: "支付平台订单ID",
          createdAt: "创建时间",
          actions: "操作"
        },
        actions: {
          viewOrder: "查看订单",
          refundOrder: "退款",
          openMenu: "打开菜单",
          actions: "操作",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        }
      },
      status: {
        pending: "待支付",
        paid: "已支付",
        failed: "支付失败",
        refunded: "已退款",
        canceled: "已取消"
      }
    },
    credits: {
      title: "积分交易记录",
      subtitle: "查看所有用户的积分收入和消耗记录",
      messages: {
        fetchError: "加载积分交易记录失败，请重试。"
      },
      adjustment: {
        action: "调整积分",
        title: "调整积分",
        description: "通过邮箱或用户ID为用户增加或扣减积分。",
        emailLabel: "用户邮箱",
        emailPlaceholder: "输入用户邮箱（可选）",
        userIdLabel: "用户ID",
        userIdPlaceholder: "输入用户ID（可选）",
        amountLabel: "调整数量",
        amountPlaceholder: "正数增加，负数扣减",
        noteLabel: "备注",
        notePlaceholder: "可选，填写本次调整说明",
        submit: "确认调整",
        success: "积分调整成功。",
        validationUser: "请填写邮箱或用户ID。",
        validationAmount: "请输入非零的调整数量。"
      },
      table: {
        noResults: "未找到积分交易记录。",
        search: {
          searchBy: "搜索条件...",
          searchPlaceholder: "按{field}搜索...",
          filterByType: "按类型筛选",
          allTypes: "所有类型",
          purchase: "购买",
          consumption: "消耗",
          refund: "退款",
          bonus: "奖励",
          adjustment: "调整"
        },
        columns: {
          id: "交易ID",
          user: "用户",
          type: "类型",
          amount: "金额",
          balance: "余额",
          description: "描述",
          createdAt: "创建时间",
          metadata: "元数据"
        },
        actions: {
          clickToCopy: "点击复制",
          viewDetails: "查看详情"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        },
        pagination: {
          showing: "显示第 {start} 到 {end} 条，共 {total} 条结果",
          pageInfo: "第 {current} 页，共 {total} 页"
        }
      },
      type: {
        purchase: "购买",
        consumption: "消耗",
        refund: "退款",
        bonus: "奖励",
        adjustment: "调整"
      }
    },
    subscriptions: {
      title: "订阅管理",
      description: "管理用户订阅和账单",
      actions: {
        createSubscription: "创建订阅"
      },
      messages: {
        fetchError: "加载订阅失败，请重试。"
      },
      table: {
        showing: "显示第 {from} 到 {to} 项，共 {total} 项结果",
        noResults: "未找到订阅。",
        rowsPerPage: "每页行数",
        page: "第",
        of: "页，共",
        view: "查看",
        toggleColumns: "切换列",
        goToFirstPage: "转到第一页",
        goToPreviousPage: "转到上一页", 
        goToNextPage: "转到下一页",
        goToLastPage: "转到最后一页",
        search: {
          searchLabel: "搜索订阅",
          searchField: "搜索字段",
          statusLabel: "状态",
          providerLabel: "提供商",
          search: "搜索",
          clear: "清除",
          allStatuses: "所有状态",
          allProviders: "所有提供商",
          stripe: "Stripe",
          creem: "Creem",
          wechat: "微信支付",
          alipay: "支付宝",
          userEmail: "用户邮箱",
          subscriptionId: "订阅ID",
          userId: "用户ID",
          planId: "计划ID",
          stripeSubscriptionId: "Stripe订阅ID",
          creemSubscriptionId: "Creem订阅ID",
          placeholders: {
            userEmail: "输入用户邮箱...",
            subscriptionId: "输入订阅ID...",
            userId: "输入用户ID...",
            planId: "输入计划ID...",
            stripeSubscriptionId: "输入Stripe订阅ID...",
            creemSubscriptionId: "输入Creem订阅ID...",
            default: "输入搜索词..."
          },
          searchBy: "搜索条件...",
          searchPlaceholder: "按{field}搜索...",
          filterByStatus: "按状态筛选",
          filterByProvider: "按提供商筛选",
          allStatus: "所有状态",
          filterByPaymentType: "支付类型",
          allPaymentTypes: "所有类型",
          active: "活跃",
          canceled: "已取消",
          expired: "已过期",
          trialing: "试用中",
          inactive: "未激活",
          oneTime: "一次性",
          recurring: "循环订阅"
        },
        columns: {
          id: "订阅ID",
          user: "客户",
          plan: "计划",
          status: "状态",
          paymentType: "支付类型",
          provider: "提供商",
          periodStart: "开始时间",
          periodEnd: "结束时间",
          cancelAtPeriodEnd: "将取消",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          metadata: "元数据",
          period: "周期",
          actions: "操作"
        },
        actions: {
          openMenu: "打开菜单",
          actions: "操作",
          viewSubscription: "查看订阅",
          cancelSubscription: "取消订阅",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        }
      },
      status: {
        active: "活跃",
        trialing: "试用中",
        canceled: "已取消",
        cancelled: "已取消",
        expired: "已过期",
        inactive: "未激活"
      },
      paymentType: {
        one_time: "一次性",
        recurring: "循环订阅"
      }
    }
  },
  pricing: {
    metadata: {
      title: "TinyShip - 定价方案",
      description: "选择最适合您需求的完美方案。灵活的定价选项包括月度、年度和终身订阅，享受高级功能。",
              keywords: "定价, 方案, 订阅, 月度, 年度, 终身, 高级, 功能"
    },
    title: "定价",
    subtitle: "选择最适合您的方案",
    description: "支持传统按时间订阅（月付/年付/终身）与 AI 时代流行的积分模式。订阅无限畅享，或充值积分按需消费。",
    cta: "立即开始",
    recommendedBadge: "推荐选择",
    lifetimeBadge: "一次购买，终身使用",
    creditsBadge: "积分包",
    creditsUnit: "积分",
    tabs: {
      subscription: "订阅套餐",
      credits: "积分充值"
    },
    features: {
      securePayment: {
        title: "多渠道安全支付",
        description: "支持微信支付、Stripe、Creem 等多种企业级安全支付方式"
      },
      flexibleSubscription: {
        title: "灵活付费模式",
        description: "传统订阅或 AI 时代积分制，任你选择"
      },
      globalCoverage: {
        title: "全球支付覆盖",
        description: "多币种和地区支付方式，为全球用户提供便捷支付体验"
      }
    },
    plans: {
      monthly: {
        name: "月度订阅",
        description: "灵活管理，按月付费",
        duration: "月",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持"
        }
      },
      yearly: {
        name: "年度订阅",
        description: "年付更优惠",
        duration: "年",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持",
          "两个月免费": "两个月免费"
        }
      },
      lifetime: {
        name: "终身会员",
        description: "一次付费，永久使用",
        duration: "终身",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持",
          "终身免费更新": "终身免费更新"
        }
      }
    }
  },
  payment: {
    metadata: {
      success: {
        title: "TinyShip - 支付成功",
        description: "您的支付已成功处理。感谢您的订阅，欢迎使用我们的高级功能。",
        keywords: "支付, 成功, 订阅, 确认, 高级功能"
      },
      cancel: {
        title: "TinyShip - 支付已取消",
        description: "您的支付已被取消。您可以重新尝试支付或联系我们的客服团队获取帮助。",
        keywords: "支付, 取消, 重试, 客服, 订阅"
      }
    },
    result: {
      success: {
        title: "支付成功",
        description: "您的支付已成功处理。",
        actions: {
          viewSubscription: "查看订阅",
          backToHome: "返回首页"
        }
      },
      cancel: {
        title: "支付已取消",
        description: "您的支付已被取消。",
        actions: {
          tryAgain: "重试",
          contactSupport: "联系客服",
          backToHome: "返回首页"
        }
      },
      failed: "支付失败，请重试"
    },
    steps: {
      initiate: "初始化",
      initiateDesc: "准备支付",
      scan: "扫码",
      scanDesc: "请扫描二维码",
      pay: "支付",
      payDesc: "确认支付"
    },
    scanQrCode: "请使用微信扫描二维码完成支付",
    confirmCancel: "您的支付尚未完成，确定要取消吗？",
    orderCanceled: "您的订单已取消"
  },
  subscription: {
    metadata: {
      title: "TinyShip - 我的订阅",
      description: "在您的订阅仪表板中管理订阅计划、查看账单历史和更新付款方式。",
              keywords: "订阅, 账单, 支付, 计划, 管理, 仪表板"
    },
    title: "我的订阅",
    overview: {
      title: "订阅概览",
      planType: "计划类型",
      status: "状态",
      active: "已激活",
      startDate: "开始日期",
      endDate: "结束日期",
      progress: "订阅进度"
    },
    management: {
      title: "订阅管理",
      description: "通过客户门户管理您的订阅、查看账单历史和更新付款方式。",
      manageSubscription: "管理订阅",
      changePlan: "更改计划",
      redirecting: "正在跳转..."
    },
    noSubscription: {
      title: "未找到有效订阅",
      description: "您当前没有活跃的订阅计划。",
      viewPlans: "查看订阅计划"
    }
  },
  dashboard: {
    metadata: {
      title: "TinyShip - 仪表盘",
      description: "在您的个性化仪表盘中管理账户、订阅和个人资料设置。",
              keywords: "仪表盘, 账户, 个人资料, 订阅, 设置, 管理"
    },
    title: "仪表盘",
    description: "管理您的账户和订阅",
    profile: {
      title: "个人信息",
      noNameSet: "未设置姓名",
      role: "角色:",
      emailVerified: "邮箱已验证",
      editProfile: "编辑个人资料",
      updateProfile: "更新个人资料",
      cancel: "取消",
      form: {
        labels: {
          name: "姓名",
          email: "邮箱地址",
          image: "头像图片链接"
        },
        placeholders: {
          name: "请输入您的姓名",
          email: "邮箱地址",
          image: "https://example.com/your-image.jpg"
        },
        emailReadonly: "邮箱地址无法修改",
        imageDescription: "可选：输入您的头像图片链接"
      },
      updateSuccess: "个人资料更新成功",
      updateError: "更新个人资料失败，请重试"
    },
    subscription: {
      title: "订阅状态",
      status: {
        lifetime: "终身会员",
        active: "有效",
        canceled: "已取消",
        cancelAtPeriodEnd: "期末取消",
        pastDue: "逾期",
        unknown: "未知",
        noSubscription: "无订阅"
      },
      paymentType: {
        recurring: "循环订阅",
        oneTime: "一次性"
      },
      lifetimeAccess: "您拥有终身访问权限",
      expires: "到期时间:",
      cancelingNote: "您的订阅将不会续订，并将在以下时间结束:",
      noActiveSubscription: "您当前没有有效的订阅",
      manageSubscription: "管理订阅",
      viewPlans: "查看套餐"
    },
    credits: {
      title: "积分余额",
      available: "可用积分",
      totalPurchased: "累计获得",
      totalConsumed: "累计消耗",
      recentTransactions: "最近交易",
      buyMore: "购买更多积分",
      types: {
        purchase: "充值",
        bonus: "赠送",
        consumption: "消耗",
        refund: "退款",
        adjustment: "调整"
      },
      descriptions: {
        ai_chat: "AI 对话",
        ai_image_generation: "AI 图像生成",
        image_generation: "图片生成",
        document_processing: "文档处理",
        purchase: "积分充值",
        bonus: "赠送积分",
        refund: "积分退款",
        adjustment: "管理员调整"
      },
      table: {
        type: "类型",
        description: "描述",
        amount: "数量",
        time: "时间"
      }
    },
    account: {
      title: "账户信息",
      memberSince: "注册时间",
      phoneNumber: "手机号码"
    },
    orders: {
      title: "订单历史",
      status: {
        pending: "待支付",
        paid: "已支付",
        failed: "支付失败",
        refunded: "已退款",
        canceled: "已取消"
      },
      provider: {
        stripe: "Stripe",
        wechat: "微信支付",
        creem: "Creem",
        alipay: "支付宝"
      },
      noOrders: "没有找到订单",
      noOrdersDescription: "您还没有下过任何订单",
      viewAllOrders: "查看所有订单",
      orderDetails: {
        orderId: "订单ID",
        amount: "金额",
        plan: "计划",
        status: "状态",
        provider: "支付方式",
        createdAt: "创建时间"
      },
      recent: {
        title: "最近订单",
        showingRecent: "显示最近 {count} 个订单"
      },
      page: {
        title: "所有订单",
        description: "查看和管理您的所有订单",
        backToDashboard: "返回仪表盘",
        totalOrders: "共 {count} 个订单"
      }
    },
    linkedAccounts: {
      title: "关联账户",
      connected: "已连接",
      connectedAt: "关联时间:",
      noLinkedAccounts: "暂无关联账户",
      providers: {
        credential: "邮箱密码",
        google: "Google",
        github: "GitHub",
        facebook: "Facebook",
        apple: "Apple",
        discord: "Discord",
        wechat: "微信",
        "phone-number": "手机号"
      }
    },
    tabs: {
      profile: {
        title: "个人资料",
        description: "管理您的个人信息和头像"
      },
      account: {
        title: "账户管理",
        description: "密码修改、关联账户和账户安全"
      },
      security: {
        title: "安全设置",
        description: "密码和安全设置"
      },
      subscription: {
        description: "管理您的订阅计划和付费功能"
      },
      credits: {
        title: "积分",
        description: "查看积分余额和交易记录"
      },
      orders: {
        description: "查看您的订单历史和交易记录"
      },
      content: {
        profile: {
          title: "个人资料",
          subtitle: "这是您在网站上向其他人展示的信息。",
          username: {
            label: "用户名",
            value: "shadcn",
            description: "这是您的公开显示名称。可以是您的真实姓名或昵称。您只能每30天更改一次。"
          },
          email: {
            label: "邮箱",
            placeholder: "选择要显示的已验证邮箱",
            description: "您可以在邮箱设置中管理已验证的邮箱地址。"
          }
        },
        account: {
          title: "账户设置",
          subtitle: "管理您的账户设置和偏好。",
          placeholder: "账户设置内容..."
        },
        security: {
          title: "安全设置",
          subtitle: "管理您的密码和安全设置。",
          placeholder: "安全设置内容..."
        }
      }
    },
    quickActions: {
      title: "快速操作",
      editProfile: "编辑资料",
      accountSettings: "账户设置",
      subscriptionDetails: "订阅详情",
      getSupport: "获取帮助",
      viewDocumentation: "查看文档"
    },
    accountManagement: {
      title: "账户管理",
      changePassword: {
        title: "更改密码",
        description: "更新您的账户密码",
        oauthDescription: "社交登录账户无法更改密码",
        button: "更改密码",
        dialogDescription: "请输入您当前的密码并选择新密码",
        form: {
          currentPassword: "当前密码",
          currentPasswordPlaceholder: "请输入当前密码",
          newPassword: "新密码",
          newPasswordPlaceholder: "请输入新密码（至少8个字符）",
          confirmPassword: "确认新密码",
          confirmPasswordPlaceholder: "请再次输入新密码",
          cancel: "取消",
          submit: "更新密码"
        },
        success: "密码更新成功",
        errors: {
          required: "请填写所有必填字段",
          mismatch: "两次输入的新密码不一致",
          minLength: "密码长度至少为8个字符",
          failed: "密码更新失败，请重试"
        }
      },
      deleteAccount: {
        title: "删除账户",
        description: "永久删除您的账户及所有相关数据",
        button: "删除账户",
        confirmTitle: "删除账户",
        confirmDescription: "您确定要删除您的账户吗？",
        warning: "⚠️ 此操作无法撤销",
        consequences: {
          data: "您的所有个人数据将被永久删除",
          subscriptions: "活跃订阅将被取消",
          access: "您将失去所有高级功能的访问权限"
        },
        form: {
          cancel: "取消",
          confirm: "是的，删除我的账户"
        },
        success: "账户删除成功",
        errors: {
          failed: "删除账户失败，请重试"
        }
      }
    },
    roles: {
      admin: "管理员",
      user: "普通用户"
    }
  },
  premiumFeatures: {
    metadata: {
      title: "TinyShip - 高级功能",
      description: "探索您的订阅包含的所有高级功能。访问高级工具、AI 助手和增强功能。",
      keywords: "高级功能, 功能, 高级, 工具, 订阅, 权益, 增强"
    },
    title: "高级功能",
    description: "感谢您的订阅！以下是您现在可以使用的所有高级功能。",
    loading: "加载中...",
    subscription: {
      title: "您的订阅",
      description: "当前订阅状态和详细信息",
      status: "订阅状态",
      type: "订阅类型",
      expiresAt: "到期时间",
      active: "已激活",
      inactive: "未激活",
      lifetime: "终身会员",
      recurring: "周期性订阅"
    },
    badges: {
      lifetime: "终身会员"
    },
    demoNotice: {
      title: "🎯 SaaS 模板演示页面",
      description: "这是一个用于测试路由保护的演示页面。只有付费用户才能访问此页面，展示了如何在您的 SaaS 应用中实现订阅级别的访问控制。"
    },
    features: {
      userManagement: {
        title: "高级用户管理",
        description: "完整的用户档案管理和自定义设置"
      },
      aiAssistant: {
        title: "AI 智能助手",
        description: "先进的人工智能功能，提升工作效率"
      },
      documentProcessing: {
        title: "无限文档处理",
        description: "处理任意数量和大小的文档文件"
      },
      dataAnalytics: {
        title: "详细数据分析",
        description: "深入的数据分析和可视化报表"
      }
    },
    actions: {
      accessFeature: "访问功能"
    }
  },
  ai: {
    metadata: {
      title: "TinyShip - AI 助手",
      description: "与强大的 AI 模型互动，包括 GPT-4、通义千问和 DeepSeek。获得编程、写作和问题解决的 AI 帮助。",
              keywords: "AI, 助手, 聊天机器人, GPT-4, 人工智能, 机器学习, 对话"
    },
    chat: {
      title: "AI 助手",
      description: "一个大模型对话简单实现，可扩展设计，使用了最新的技术 ai-sdk / ai-elements / streamdown 实现非常丝滑的聊天效果，可以按需求扩展为更复杂的功能",
      placeholder: "需要我帮什么忙？",
      sending: "发送中...",
      thinking: "AI 正在思考...",
      noMessages: "开始与 AI 助手对话",
      welcomeMessage: "你好！我是你的 AI 助手。今天我能为你做些什么？",
      toolCall: "工具调用",
      providers: {
        title: "AI 提供商",
        openai: "OpenAI",
        qwen: "通义千问",
        deepseek: "DeepSeek",
        devdove: "开朗斗笠菇"
      },
      models: {
        "gpt-5": "GPT-5",
        "gpt-5-codex": "GPT-5 Codex",
        "gpt-5-pro": "GPT-5 Pro",
        "qwen-max": "通义千问-Max",
        "qwen-plus": "通义千问-Plus", 
        "qwen-turbo": "通义千问-Turbo",
        "deepseek-chat": "DeepSeek 对话",
        "deepseek-coder": "DeepSeek 编程",
        "gemini-2.5-flash": "开朗斗笠菇"
      },
      actions: {
        send: "发送",
        copy: "复制",
        copied: "已复制！",
        retry: "重试",
        dismiss: "关闭",
        newChat: "新对话",
        clearHistory: "清空历史"
      },
      errors: {
        failedToSend: "发送消息失败，请重试。",
        networkError: "网络错误，请检查网络连接。",
        invalidResponse: "AI 响应无效，请重试。",
        rateLimited: "请求过于频繁，请稍后再试。",
        subscriptionRequired: "AI 功能需要有效订阅",
        subscriptionRequiredDescription: "升级到付费计划以使用 AI 聊天功能",
        insufficientCredits: "积分不足",
        insufficientCreditsDescription: "使用 AI 聊天需要积分或订阅，请购买积分以继续使用。"
      },
      history: {
        title: "聊天记录",
        empty: "暂无聊天记录",
        today: "今天",
        yesterday: "昨天",
        thisWeek: "本周",
        older: "更早"
      }
    },
    image: {
      metadata: {
        title: "TinyShip - AI 图像生成",
        description: "使用 AI 生成精美图像。支持通义千问图像、fal.ai Flux 和 OpenAI DALL-E。",
        keywords: "AI, 图像生成, DALL-E, Flux, 通义千问, 文生图, 艺术, 创意"
      },
      title: "AI 图像生成",
      description: "使用多种 AI 提供商从文本提示生成精美图像",
      defaultPrompt: "一只黄色拉布拉多带着黑色金色圆墨镜在成都的场馆和两只黄白猫喝茶",
      prompt: "提示词",
      promptPlaceholder: "描述您想要生成的图像...",
      negativePrompt: "负面提示词",
      negativePromptPlaceholder: "描述您不希望在图像中出现的内容...",
      negativePromptHint: "描述需要避免在生成图像中出现的元素",
      generate: "生成",
      generating: "生成中...",
      generatedSuccessfully: "图像生成成功！",
      download: "下载",
      result: "结果",
      idle: "空闲",
      preview: "预览",
      json: "JSON",
      whatNext: "接下来您想做什么？",
      costInfo: "本次请求将花费",
      perMegapixel: "每百万像素",
      credits: "积分",
      providers: {
        title: "提供商",
        qwen: "阿里云百炼",
        fal: "fal.ai",
        openai: "OpenAI"
      },
      models: {
        "qwen-image-plus": "通义千问图像 Plus",
        "qwen-image-max": "通义千问图像 Max",
        "fal-ai/qwen-image-2512/lora": "Qwen Image 2512 Lora",
        "fal-ai/nano-banana-pro": "Nano Banana Pro",
        "fal-ai/flux/dev": "Flux Dev",
        "fal-ai/recraft/v3/text-to-image": "Recraft V3 Text to Image",
        "fal-ai/flux-pro/kontext": "Flux Pro Kontext",
        "fal-ai/bytedance/seedream/v3/text-to-image": "Bytedance Seedream V3 Text to Image",
        "dall-e-3": "DALL-E 3",
        "dall-e-2": "DALL-E 2"
      },
      settings: {
        title: "附加设置",
        showMore: "更多",
        showLess: "收起",
        imageSize: "图像尺寸",
        imageSizeHint: "选择宽高比和分辨率",
        numInferenceSteps: "推理步数",
        numInferenceStepsHint: "步数越多质量越高，但速度越慢",
        guidanceScale: "引导强度",
        guidanceScaleHint: "控制生成图像与提示词的匹配程度",
        seed: "种子",
        seedHint: "使用相同的种子可以复现结果",
        random: "随机",
        randomize: "随机生成",
        promptExtend: "提示词扩展",
        promptExtendHint: "AI 将增强和扩展您的提示词",
        watermark: "水印",
        watermarkHint: "在生成的图像上添加通义千问水印",
        syncMode: "同步模式",
        syncModeHint: "返回 base64 数据而非 URL"
      },
      errors: {
        generationFailed: "图像生成失败",
        invalidPrompt: "请输入有效的提示词",
        insufficientCredits: "积分不足",
        insufficientCreditsDescription: "生成图像需要积分，请购买积分以继续。",
        networkError: "网络错误，请检查您的连接。",
        unknownError: "发生未知错误"
      }
    }
  },
  home: {
    metadata: {
      title: "LoomAI - AI驱动的服装设计智能平台",
      description: "专为服装设计师打造的AI工具平台。一键生成专业平铺图，智能转换线稿为CAD制版图，让设计效率提升10倍。",
      keywords: "服装设计, AI设计工具, 平铺图生成, 线稿转CAD, 制版图, 服装AI, 设计师工具"
    },
    hero: {
      title: "让AI成为你的设计助手",
      titlePrefix: "让",
      titleHighlight: "AI",
      titleSuffix: "成为你的设计助手",
      subtitle: "专为服装设计师打造的AI工具平台。从灵感到成品，从草图到制版，AI让设计更高效、更专业。",
      buttons: {
        purchase: "开始使用",
        demo: "查看演示"
      },
      features: {
        lifetime: "30秒生成专业平铺图",
        earlyBird: "智能识别，精准转换"
      }
    },
    features: {
      title: "专业工具，极致效率",
      subtitle: "从灵感捕捉到制版输出，AI驱动的完整设计工作流，让你的创意快速落地。",
      items: [
        {
          title: "智能平铺图生成",
          description: "上传服装照片，AI自动去除背景、调整角度，30秒生成专业级平铺图。支持批量处理，效率提升10倍。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "线稿转CAD制版",
          description: "手绘线稿一键转换为精确的CAD制版图。自动识别版型部件、提取尺寸标注、生成矢量轮廓，支持DXF/SVG/PDF多格式导出。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "AI款式识别",
          description: "智能识别服装款式、版型、工艺细节。自动标注肩宽、胸围、衣长等专业术语，生成详细的款式分析报告。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "面料智能分析",
          description: "AI识别面料材质、纹理和质感，推测成分含量，提供改色建议和配色方案，让设计更专业。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "对话式交互",
          description: "像和设计师对话一样使用AI。描述你的想法，AI帮你生成设计稿、调整细节、优化版型。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "批量处理",
          description: "一次上传多个文件，自动排队处理。整套服装设计一键完成，大幅提升工作效率。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "专业术语内置",
          description: "内置服装行业专业术语库和提示词模板，让AI输出更精准、更符合行业标准。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "质量智能检查",
          description: "自动检查尺寸合理性、轮廓完整性、对称性等，发现问题并给出优化建议。",
          className: "col-span-1 row-span-1"
        }
      ],
      techStack: {
        title: "基于先进AI技术构建",
        items: [
          "Google Gemini AI",
          "智能图像识别",
          "矢量化处理",
          "专业术语库",
          "批量处理引擎",
          "多格式导出",
          "实时预览编辑"
        ]
      }
    },
    applicationFeatures: {
      title: "核心功能",
      subtitle: "三大核心功能，覆盖服装设计全流程，让专业工作变得简单高效。",
      items: [
        {
          title: "服装平铺图生成",
          subtitle: "30秒生成专业平铺图",
          description: "上传任意服装照片，AI自动识别并去除背景、调整角度、优化光影。生成符合电商标准的专业平铺图，支持批量处理。传统手工需要2小时，现在只需30秒，效率提升240倍。",
          highlights: [
            "自动去背景",
            "智能角度调整",
            "专业光影优化",
            "批量处理"
          ],
          imageTitle: "平铺图生成"
        },
        {
          title: "线稿转CAD制版图",
          subtitle: "手绘秒变专业制版图",
          description: "手绘线稿或拍照上传，AI智能识别版型部件、自动提取尺寸标注、生成精确矢量轮廓。自动添加缝份线、对位记号、纱向标识。支持DXF/SVG/PDF/PLT多格式导出，直接对接工厂生产。",
          highlights: [
            "智能识别版型",
            "自动提取尺寸",
            "矢量化处理",
            "多格式导出"
          ],
          imageTitle: "制版图转换"
        },
        {
          title: "AI设计助手",
          subtitle: "像和设计师对话一样使用AI",
          description: "对话式交互，描述你的设计想法，AI帮你生成款式图、分析面料、提供配色建议。内置服装行业专业术语库，让AI输出更精准、更专业。支持款式识别、面料分析、改色建议等智能功能。",
          highlights: [
            "对话式设计",
            "款式智能识别",
            "面料分析",
            "配色建议"
          ],
          imageTitle: "AI设计助手"
        }
      ]
    },
    roadmap: {
      title: "产品路线图",
      subtitle: "持续迭代，不断创新。我们致力于为服装设计师提供更智能、更高效的AI设计工具。",
      items: [
        {
          title: "核心功能上线",
          description: "完成平铺图生成、线稿转CAD、AI设计助手三大核心功能。支持多格式导出、批量处理、实时预览编辑等基础功能。",
          timeline: "2026 Q1",
          status: "completed",
          statusText: "已完成",
          features: ["平铺图生成", "线稿转CAD", "AI设计助手", "批量处理", "多格式导出"]
        },
        {
          title: "智能优化升级",
          description: "提升AI识别精度，优化处理速度。增强面料分析、款式识别能力，支持更多服装品类和复杂工艺的识别。",
          timeline: "2026 Q2",
          status: "in-progress",
          statusText: "开发中",
          features: ["识别精度提升", "处理速度优化", "更多品类支持", "复杂工艺识别"]
        },
        {
          title: "3D虚拟试穿",
          description: "基于AI的3D建模技术，实现虚拟试穿功能。上传人体照片和服装设计，即可预览穿着效果，大幅降低打样成本。",
          timeline: "2026 Q3",
          status: "planned",
          statusText: "计划中",
          features: ["3D建模", "虚拟试穿", "多角度预览", "尺码推荐"]
        },
        {
          title: "智能改版建议",
          description: "AI分析现有款式，基于流行趋势和市场数据，提供智能改版建议。包括版型优化、配色调整、工艺改进等。",
          timeline: "2026 Q4",
          status: "planned",
          statusText: "计划中",
          features: ["趋势分析", "版型优化", "配色建议", "工艺改进"]
        },
        {
          title: "协作与分享",
          description: "团队协作功能，支持设计稿分享、评论、版本管理。建立设计师社区，分享作品和经验，共同成长。",
          timeline: "2027 Q1",
          status: "planned",
          statusText: "计划中",
          features: ["团队协作", "版本管理", "设计师社区", "作品分享"]
        },
        {
          title: "供应链对接",
          description: "打通设计到生产的完整链路。对接面料供应商、打样工厂、生产工厂，实现从设计到成衣的一站式服务。",
          timeline: "2027 Q2",
          status: "planned",
          statusText: "计划中",
          features: ["面料库对接", "工厂对接", "在线打样", "订单管理"]
        }
      ],
      footer: "持续更新中，敬请期待更多功能..."
    },
    stats: {
      title: "值得信赖的选择",
      items: [
        {
          value: "1000",
          suffix: "+",
          label: "设计师用户"
        },
        {
          value: "240",
          suffix: "倍",
          label: "效率提升"
        },
        {
          value: "90",
          suffix: "%",
          label: "识别准确率"
        },
        {
          value: "30",
          suffix: "秒",
          label: "平均处理时间"
        }
      ]
    },
    testimonials: {
      title: "设计师真实反馈",
      items: [
        {
          quote: "以前做平铺图要2小时，现在30秒就搞定！批量处理功能太实用了，一次能处理整个系列。",
          author: "张设计",
          role: "独立服装设计师"
        },
        {
          quote: "线稿转CAD功能简直是神器！手绘稿直接变成制版图，省去了大量重复劳动，可以把更多时间放在创意上。",
          author: "李制版",
          role: "制版师"
        },
        {
          quote: "AI识别很准确，面料分析和配色建议都很专业。对我这种刚入行的新人来说，就像有个老师傅在旁边指导。",
          author: "王小白",
          role: "服装设计新人"
        }
      ]
    },
    finalCta: {
      title: "让AI成为你的设计助手",
      subtitle: "加入1000+服装设计师的行列，用AI工具让设计更高效、更专业。从灵感到成品，AI助你一臂之力。",
      buttons: {
        purchase: "开始使用",
        demo: "查看演示"
      }
    },
    footer: {
      copyright: "© {year} TinyShip. All rights reserved.",
      description: "TinyShip"
    },
    common: {
      demoInterface: "功能演示界面",
      techArchitecture: "企业级技术架构，生产环境验证",
      learnMore: "了解更多"
    }
  },
  validators: {
    user: {
      name: {
        minLength: "姓名至少需要{min}个字符",
        maxLength: "姓名不能超过{max}个字符"
      },
      email: {
        invalid: "请输入有效的邮箱地址"
      },
      image: {
        invalidUrl: "请输入有效的链接地址"
      },
      password: {
        minLength: "密码至少需要{min}个字符",
        maxLength: "密码不能超过{max}个字符",
        mismatch: "两次输入的密码不一致"
      },
      countryCode: {
        required: "请选择国家/地区"
      },
      phoneNumber: {
        required: "请输入手机号",
        invalid: "手机号格式不正确"
      },
      verificationCode: {
        invalidLength: "验证码必须是{length}位数字"
      },
      id: {
        required: "用户ID不能为空"
      },
      currentPassword: {
        required: "请输入当前密码"
      },
      confirmPassword: {
        required: "请确认密码"
      },
      deleteAccount: {
        confirmRequired: "您必须确认删除账户"
      }
    }
  },
  countries: {
    china: "中国",
    usa: "美国", 
    uk: "英国",
    japan: "日本",
    korea: "韩国",
    singapore: "新加坡",
    hongkong: "香港",
    macau: "澳门",
    australia: "澳大利亚",
    france: "法国",
    germany: "德国",
    india: "印度",
    malaysia: "马来西亚",
    thailand: "泰国"
  },
  header: {
    navigation: {
      ai: "AI 功能演示",
      aiImageTools: "AI 图片生成",
      clothes: "服装",
      patterns: "版型",
      newFeatures: "新功能",
      premiumFeatures: "高级会员功能",
      pricing: "定价",
      upload: "文件上传",
      demos: "功能演示",
      demosDescription: "探索示例功能"
    },
    demos: {
      ai: {
        title: "AI 对话",
        description: "大模型对话实现，可扩展设计，支持多个 Provider，需要购买积分使用"
      },
      aiImage: {
        title: "AI 图像生成",
        description: "AI 图像生成实现，可扩展设计，支持多个 Provider，需要购买积分使用"
      },
      aiImageTools: {
        title: "AI 图片生成",
        description: "上传图片生成平铺图或线稿，需要登录访问"
      },
      premium: {
        title: "高级会员功能",
        description: "路由保护演示页面，只有订阅付费用户才能访问此页面"
      },
      upload: {
        title: "文件上传",
        description: "文件上传实现，可扩展设计，支持多个 Provider，需要登录访问"
      },
      cardBoundary: {
        title: "卡片边界对比",
        description: "对比卡片边框与阴影清晰度，确定最终视觉方案"
      },
      playground: {
        title: "交互演示",
        description: "提示词悬停与上传框高亮的动效对比"
      },
      clothesSplit: {
        title: "衣服拆分",
        description: "上传服装图片并生成干净的衣服平铺图，需要登录访问"
      },
      clothesSketch: {
        title: "制作画稿",
        description: "上传平铺图生成工艺线稿（含缝线/腰线），需要登录访问"
      },
      clothesOriginalSketch: {
        title: "原图转线稿",
        description: "上传原图自动生成工艺线稿，方便后续拆解与导出"
      },
      clothesNanoRetouch: {
        title: "nano 修图",
        description: "选择历史生成或上传图片，简单描述后智能修图，需要登录访问"
      },
      clothesPromo: {
        title: "宣发图制作",
        description: "将平铺图生成淘宝/微商宣发图，需要登录访问"
      },
      virtualTryOn: {
        title: "3D 虚拟试穿",
        description: "将生成的纸样自动穿到虚拟模特上，预览版型效果。"
      }
    },
    patterns: {
      patternMaking: {
        title: "版型拆解",
        description: "基于服装图片生成纸样拆解思路。"
      },
      pngToDxf: {
        title: "PNG 转 DXF",
        description: "将线稿 PNG 转为可编辑的 DXF 纸样文件。"
      }
    },
    auth: {
      signIn: "登录",
      getStarted: "开始使用",
      signOut: "退出登录"
    },
    userMenu: {
      dashboard: "控制台",
      profile: "个人资料",
      settings: "设置",
      personalSettings: "个人设置",
      adminPanel: "管理后台"
    },
    language: {
      switchLanguage: "切换语言",
      english: "English",
      chinese: "中文"
    },
    mobile: {
      themeSettings: "主题设置",
      languageSelection: "语言选择"
    }
  },
  footer: {
    description: "TinyShip",
    copyright: "© {year} TinyShip. 保留所有权利。",
    sections: {
      about: {
        title: "关于",
        links: {
          demos: "功能演示",
          pricing: "定价",
          premium: "高级会员功能",
          updates: "新功能"
        }
      },
      tools: {
        title: "工具",
        links: {
          aiImageTools: "AI 图片生成",
          aiImage: "AI 图像生成",
          clothesSplit: "衣服拆分",
          clothesSketch: "制作画稿"
        }
      }
    }
  },
  aiGenerate: {
    title: "AI 图片生成",
    description: "上传图片，填写提示词，快速生成专业效果",
    badge: "AI 生成",
    preview: {
      title: "效果预览",
      description: "生成前后的对比预期",
      before: "之前",
      after: "之后",
      caption: "光影变化 · 材质优化 · 轮廓清晰"
    },
    upload: {
      title: "上传图片",
      description: "支持 PNG、JPG 格式，最大 10MB",
      hint: "拖拽图片到这里或点击上传",
      formats: "支持 PNG、JPG 格式，最大 10MB",
      fileTooLarge: "文件大小不能超过 10MB",
      examples: {
        flatLay: "模特图转平铺图",
        sketch: "平铺图转线稿",
        promo: "生成宣传场景图"
      }
    },
    hints: [
      "生成干净的商品平铺图",
      "生成清晰的服装技术线稿",
      "生成用于宣传的场景图",
      "拆解版型结构与细节",
      "将成衣拆分为纸样图"
    ],
    hoverHint: "请先上传图像",
    prompt: {
      title: "描述提示词",
      description: "描述你想要的效果，或使用预设模板",
      positiveLabel: "正向提示词",
      positivePlaceholder: "描述你想要的效果...",
      negativeToggleShow: "+ 负面提示词",
      negativeToggleHide: "- 隐藏负面提示词",
      random: "随机提示词",
      clear: "清除",
      negativeLabel: "负面提示词",
      negativeHint: "（描述你不想要的元素）",
      negativePlaceholder: "person, model, human, hands, face..."
    },
    params: {
      title: "参数设置",
      description: "调整生成参数以获得最佳效果",
      sizeLabel: "图片尺寸",
      sizePlaceholder: "选择尺寸",
      styleLabel: "服装类型",
      stylePlaceholder: "选择服装类型",
      colorLabel: "配色方案",
      colorPlaceholder: "选择配色",
      fabricLabel: "面料材质",
      fabricPlaceholder: "选择面料",
      viewLabel: "展示方式",
      viewPlaceholder: "选择视角",
      fitLabel: "版型设计",
      fitPlaceholder: "选择版型",
      elementLabel: "设计元素",
      elementPlaceholder: "选择元素",
      genderLabel: "目标人群",
      genderPlaceholder: "选择人群",
      ageLabel: "年龄段",
      agePlaceholder: "选择年龄",
      sceneLabel: "使用场景",
      scenePlaceholder: "选择场景",
      seasonLabel: "季节",
      seasonPlaceholder: "选择季节",
      advancedLabel: "高级设置",
      advancedToggleShow: "高级设置",
      advancedToggleHide: "收起高级设置",
      modelLabel: "AI 模型",
      modelPlaceholder: "选择模型",
      options: {
        size: {
          Auto: "Auto",
          "1:1": "1:1 正方形",
          "16:9": "16:9 横屏",
          "9:16": "9:16 竖屏",
          custom: "自定义"
        },
        style: {
          none: "无风格",
          casual: "休闲装",
          formal: "正装",
          sports: "运动装",
          street: "街头风",
          vintage: "复古风",
          minimal: "极简风",
          punk: "朋克风",
          couture: "高定"
        },
        color: {
          none: "无配色",
          morandi: "莫兰迪色系",
          earth: "大地色系",
          mono: "黑白灰",
          contrast: "撞色搭配",
          gradient: "渐变色",
          seasonal: "季节色彩",
          custom: "自定义色板"
        },
        fabric: {
          none: "无材质",
          cotton: "棉质",
          silk: "丝绸",
          denim: "牛仔",
          leather: "皮革",
          knit: "针织",
          chiffon: "雪纺",
          linen: "麻料",
          tech: "功能面料"
        },
        view: {
          none: "无视角",
          flat_lay: "平铺图",
          front: "正面视图",
          back: "背面视图",
          side: "侧面视图",
          detail: "细节特写",
          on_model: "上身效果",
          hanging: "悬挂展示",
          turntable: "360°旋转视图"
        },
        fit: {
          none: "无版型",
          slim: "修身",
          loose: "宽松",
          regular: "直筒",
          oversized: "廓形",
          a_line: "A字型",
          h_line: "H字型",
          x_line: "X字型"
        },
        element: {
          none: "无元素",
          pattern: "印花图案",
          embroidery: "刺绣",
          patchwork: "拼接",
          pleats: "褶皱",
          pockets: "口袋设计",
          collar: "领型",
          sleeve: "袖型"
        },
        gender: {
          none: "无人群",
          male: "男装",
          female: "女装",
          kids: "童装"
        },
        age: {
          none: "无年龄",
          "18-25": "18-25",
          "26-35": "26-35",
          "36-45": "36-45"
        },
        scene: {
          none: "无场景",
          commute: "通勤",
          date: "约会",
          sport: "运动",
          home: "居家"
        },
        season: {
          none: "无季节",
          spring_summer: "春夏",
          autumn_winter: "秋冬"
        },
        model: {
          "loom-pro": "Loom Pro"
        }
      }
    },
    generate: {
      button: "生成图片",
      generating: "生成中...",
      credits: "（消耗 {credits} 积分）"
    },
    result: {
      title: "生成结果",
      description: "AI 生成的图片将显示在这里",
      generating: "生成中...",
      eta: "预计还需 30 秒",
      waiting: "等待生成...",
      download: "下载",
      regenerate: "重新生成"
    },
    comparison: {
      title: "生成对比",
      description: "对比生成前后的视觉效果",
      reference: "参考图",
      empty: "未上传图片"
    },
    promptsUsed: {
      title: "使用的提示词：",
      negativeTitle: "负面提示词："
    },
    buttons: {
      addImage: "添加图片",
      changeImage: "更换图片",
      reupload: "重新上传"
    },
    toasts: {
      uploadSuccess: "图片上传成功",
      clearedUpload: "已清除上传图片",
      clearedAll: "已清除所有设置",
      needUploadPrompt: "请先上传图片并填写提示词",
      generateSuccess: "生成成功！",
      generateFailed: "生成失败，请重试"
    }
  },
  imageSplit: {
    title: "图片拆分",
    description: "将单张图片切分成多张小图，便于拼贴或布局。",
    upload: {
      title: "上传图片",
      description: "上传需要拆分的图片。",
      hint: "拖拽图片到这里或点击上传",
      browse: "选择图片"
    },
    settings: {
      title: "拆分设置",
      description: "设置行列数，实时预览切分效果。",
      rows: "行数",
      columns: "列数",
      tip: "切分数量过多可能影响清晰度，请根据需要调整。"
    },
    results: {
      title: "拆分结果",
      description: "预览切分效果并下载所有分片。",
      downloadAll: "下载全部",
      empty: "请先上传图片。",
      original: "原图",
      tiles: "切分图片",
      tileLabel: "第 {index} 张",
      download: "下载",
      count: "共 {count} 张"
    },
    status: {
      processing: "正在拆分...",
      downloading: "正在下载..."
    },
    errors: {
      maxFiles: "只能上传 1 张图片",
      imageOnly: "仅支持图片文件",
      fileTooLarge: "图片大小必须小于 15MB",
      splitFailed: "图片拆分失败，请重试"
    }
  },
  imageHistory: {
    title: "图片历史",
    description: "查看最近生成的图片与参数。",
    empty: "暂无历史记录",
    imageAlt: "历史生成图片",
    actions: {
      clear: "清空记录"
    },
    fields: {
      prompt: "提示词",
      model: "模型",
      feature: "功能",
      provider: "渠道商",
      createdAt: "生成时间"
    },
    features: {
      imageGenerate: "图片生成",
      clothesSplit: "服装平铺图",
      clothesSketch: "服装线稿",
      clothesNanoRetouch: "智能修图",
      clothesPromo: "宣发图",
      patternMaking: "版型拆解",
      unknown: "未知功能"
    }
  },
  docs: {
    home: {
      title: "TinyShip Docs",
      subtitle: "基于 Fumadocs 构建",
      description: "基于 Fumadocs 的静态站点项目，适用于文档、博客和静态页面。",
      cta: {
        docs: "阅读文档",
        blog: "访问博客"
      }
    },
    nav: {
      docs: "文档",
      blog: "博客"
    },
    blog: {
      title: "博客",
      description: "来自 TinyShip 团队的最新文章和动态",
      allPosts: "所有文章",
      previousPage: "← 上一页",
      nextPage: "下一页 →",
      back: "← 返回博客",
      noPosts: "暂无文章"
    }
  },
  upload: {
    title: "上传文件",
    description: "上传图片到云存储",
    providerTitle: "存储服务商",
    providerDescription: "选择您偏好的云存储服务商",
    providers: {
      oss: "阿里云 OSS",
      ossDescription: "国内优化存储",
      s3: "Amazon S3",
      s3Description: "全球云存储",
      r2: "Cloudflare R2",
      r2Description: "零出口费用",
      cos: "腾讯云 COS",
      cosDescription: "国内云存储"
    },
    uploadTitle: "上传图片",
    uploadDescription: "拖拽图片或点击浏览。最大 1MB。",
    dragDrop: "拖拽文件到这里",
    orClick: "或点击浏览（最大 1MB）",
    browseFiles: "浏览文件",
    clearAll: "清除全部",
    uploadedTitle: "已上传文件",
    uploadedDescription: "成功上传 {count} 个文件",
    uploading: "上传中...",
    viewFile: "查看",
    uploaded: "已上传",
    errors: {
      maxFiles: "只能上传 1 个文件",
      imageOnly: "只允许上传图片文件",
      fileTooLarge: "文件大小必须小于 1MB"
    }
  }
} as const; 
