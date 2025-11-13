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
    resendVerificationEmail: "重新发送验证邮件"
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
    // Better Auth 错误代码映射
    authErrors: {
      USER_ALREADY_EXISTS: "该邮箱已被注册",
      INVALID_EMAIL_OR_PASSWORD: "邮箱或密码错误",
      EMAIL_NOT_VERIFIED: "请先验证您的邮箱地址",
      USER_NOT_FOUND: "未找到该邮箱对应的账户",
      INVALID_CREDENTIALS: "提供的凭据无效",
      ACCOUNT_BLOCKED: "您的账户已被临时冻结",
      TOO_MANY_REQUESTS: "登录尝试次数过多，请稍后重试",
      INVALID_TOKEN: "无效或已过期的令牌",
      SESSION_EXPIRED: "您的会话已过期，请重新登录",
      PHONE_NUMBER_ALREADY_EXISTS: "该手机号已被注册",
      INVALID_PHONE_NUMBER: "手机号格式无效",
      OTP_EXPIRED: "验证码已过期",
      INVALID_OTP: "验证码错误",
      OTP_TOO_MANY_ATTEMPTS: "验证尝试次数过多，请重新获取验证码",
      CAPTCHA_REQUIRED: "请完成验证码验证",
      CAPTCHA_INVALID: "验证码验证失败",
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
        totalRevenueDesc: "总收入",
        newCustomers: "新客户",
        newCustomersDesc: "本月新客户",
        newOrders: "新订单",
        newOrdersDesc: "本月新订单"
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
        revenue: "收入",
        newUsers: "新用户",
        orders: "订单数"
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
          creem: "Creem"
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
    description: "选择最适合你的方案，开始你的 TinyShip 之旅。支持多种支付方式，灵活的计费模式，为全球用户提供安全便捷的支付体验。",
    cta: "立即开始",
    recommendedBadge: "推荐选择",
    lifetimeBadge: "一次购买，终身使用",
    features: {
      securePayment: {
        title: "多渠道安全支付",
        description: "支持微信支付、Stripe、Creem 等多种企业级安全支付方式"
      },
      flexibleSubscription: {
        title: "灵活计费模式",
        description: "支持单次付费和订阅付费两种模式，满足不同需求"
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
        creem: "Creem"
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
        credentials: "邮箱密码",
        google: "Google",
        github: "GitHub",
        facebook: "Facebook",
        apple: "Apple",
        discord: "Discord",
        wechat: "微信",
        phone: "手机号"
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
        deepseek: "DeepSeek"
      },
      models: {
        "gpt-5": "GPT-5",
        "gpt-5-codex": "GPT-5 Codex",
        "gpt-5-pro": "GPT-5 Pro",
        "qwen-max": "通义千问-Max",
        "qwen-plus": "通义千问-Plus", 
        "qwen-turbo": "通义千问-Turbo",
        "deepseek-chat": "DeepSeek 对话",
        "deepseek-coder": "DeepSeek 编程"
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
        subscriptionRequiredDescription: "升级到付费计划以使用 AI 聊天功能"
      },
      history: {
        title: "聊天记录",
        empty: "暂无聊天记录",
        today: "今天",
        yesterday: "昨天",
        thisWeek: "本周",
        older: "更早"
      }
    }
  },
  home: {
    metadata: {
      title: "TinyShip - 现代化全栈 SaaS 开发启动器",
      description: "现代化、功能齐全的 monorepo 启动套件，用于构建支持国内外双市场的 SaaS 应用程序。基于 Next.js/Nuxt.js、TypeScript 和完整认证系统构建。",
      keywords: "SaaS, monorepo, 启动套件, Next.js, Nuxt.js, TypeScript, 认证, 国际化, 中国市场, 国际市场"
    },
    hero: {
      title: "虽然是小船，也能载你远航",
      titlePrefix: "虽然是",
      titleHighlight: "小船",
      titleSuffix: "，也能载你远航",
      subtitle: "现代化全栈 SaaS 开发平台，支持国内外双市场。一次购买，终身使用，快速构建你的商业项目。",
      buttons: {
        purchase: "立即购买",
        demo: "查看演示"
      },
      features: {
        lifetime: "一次购买终身使用",
        earlyBird: "早鸟价限时优惠"
      }
    },
    features: {
      title: "全栈 SaaS 开发平台",
      subtitle: "从双框架支持到 AI 集成，从全球化到本土化，TinyShip 为你的商业项目提供完整的现代化技术解决方案。",
      items: [
        {
          title: "双框架支持",
          description: "灵活选择 Next.js 或 Nuxt.js，React 和 Vue 开发者都能找到熟悉的技术栈，同时享受相同的强大后端能力。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "全面身份认证",
          description: "基于 Better-Auth 的企业级认证系统，支持邮箱/手机/OAuth 登录，2FA 多因子认证，会话管理等完整认证体系。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "全球化 + 本土化",
          description: "既支持国际市场的 Stripe、OAuth 登录，也深度适配中国本土市场的微信登录、微信支付，双市场无缝覆盖。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "现代化技术栈",
          description: "采用最新技术：TailwindCSS v4、shadcn/ui、Magic UI、TypeScript、Zod 类型安全验证，开发体验极佳。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "无厂商锁定架构",
          description: "开放式 Monorepo 架构，libs 抽象接口设计，可自由选择任何云服务商、数据库、支付提供商，避免技术绑定。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "通信服务集成",
          description: "多渠道通信支持：邮件服务（Resend/SendGrid）、短信服务（阿里云/Twilio），全球化通信无障碍。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "AI 开发就绪",
          description: "集成 Vercel AI SDK，支持多 AI 提供商，内置 Cursor 开发规则，AI 辅助开发，智能化构建应用。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "主题系统",
          description: "基于 shadcn/ui 的现代化主题系统，支持暗黑模式，深度定制和品牌化，让应用拥有独特视觉体验。",
          className: "col-span-1 row-span-1"
        }
      ],
      techStack: {
        title: "基于现代化技术栈构建",
        items: [
          "Next.js / Nuxt.js",
          "TailwindCSS v4",
          "Better-Auth",
          "Vercel AI SDK",
          "TypeScript + Zod",
          "shadcn/ui + Magic UI",
          "Drizzle ORM + PostgreSQL"
        ]
      }
    },
    applicationFeatures: {
      title: "核心应用特性",
      subtitle: "从国内外双体系支持到 AI 集成，TinyShip 为你的商业项目提供完整的技术解决方案。",
      items: [
        {
          title: "国内外双体系支持",
          subtitle: "一套代码，双市场覆盖",
          description: "完美适配国内外不同市场需求。国内支持微信登录、手机号登录、微信支付等本土化功能；国外支持主流 OAuth 登录（Google、GitHub、Apple）、Stripe 和 Creem 支付体系。一套代码，双市场覆盖。",
          highlights: [
            "微信登录 & 手机号登录",
            "OAuth 登录（Google、GitHub、Apple）",
            "微信支付 & Stripe & Creem",
            "国内外无缝切换"
          ],
          imageTitle: "双体系架构"
        },
        {
          title: "内置 Admin Panel",
          subtitle: "企业级管理后台，开箱即用",
          description: "开箱即用的管理后台，提供轻量级的用户管理、订阅管理、订单管理等功能。基于现代化 UI 组件库构建，支持角色权限控制、实时数据监控等功能。让你专注于业务逻辑，而非重复的管理界面开发。",
          highlights: [
            "用户管理",
            "订阅管理",
            "角色权限控制",
            "订单管理"
          ],
          imageTitle: "管理后台"
        },
        {
          title: "AI Ready 集成",
          subtitle: "基于 Vercel AI SDK，即插即用",
          description: "基于 Vercel AI SDK 构建的完整 AI 解决方案。内置简易的 AI Chat 页面，支持多种 AI 模型切换（OpenAI、Claude、Gemini 等），让你的应用瞬间具备 AI 能力。",
          highlights: [
            "Vercel AI SDK 集成",
            "多模型支持（OpenAI、Claude、Gemini 等）",
            "流式响应",
          ],
          imageTitle: "AI 集成"
        }
      ]
    },
    roadmap: {
      title: "产品路线图",
      subtitle: "持续迭代，不断创新。我们致力于为开发者提供更强大、更灵活的 SaaS 开发解决方案。",
      items: [
        {
          title: "核心平台搭建",
          description: "完成 TinyShip 核心平台的开发，包括双框架支持、身份认证、支付集成、国际化等基础功能模块。",
          timeline: "2025 Q3",
          status: "completed",
          statusText: "已完成",
          features: ["双框架支持", "身份认证系统", "支付集成", "国际化支持", "AI 开发就绪", "内置 Admin Panel"]
        },
        {
          title: "主题系统升级",
          description: "推出全新的主题系统，提供多种精美的 UI 主题和布局选择。支持深度定制和品牌化，让你的应用拥有独特的视觉体验。",
          timeline: "2025 Q3",
          status: "completed",
          statusText: "已完成",
          features: ["多套 UI 主题", "深色模式支持", "组件库扩展"]
        },
        {
          title: "第三方服务扩展",
          description: "大幅扩展第三方服务支持，覆盖更多云服务商和 SaaS 工具。通过统一的接口设计，让你轻松切换和集成各种服务提供商。",
          timeline: "2025 Q4",
          status: "in-progress",
          statusText: "开发中",
          features: ["更多支付网关", "云存储服务", "更多短信服务商"]
        },
        {
          title: "博客/文档系统",
          description: "内置完整的博客和文档管理系统，支持 Markdown 编辑、SEO 优化、评论系统等功能。让你的 SaaS 产品拥有完整的内容营销能力。",
          timeline: "2026 Q1",
          status: "planned",
          statusText: "计划中",
          features: ["博客系统", "文档系统", "知识库搜索"]
        },

        {
          title: "视频教程体系",
          description: "制作完整的视频教程系列，从基础使用到高级定制，帮助开发者快速掌握 TinyShip 的各项功能和最佳实践。",
          timeline: "2026 Q3",
          status: "planned",
          statusText: "计划中",
          features: ["入门教程", "进阶开发", "部署指南", "实战案例"]
        },
        {
          title: "行业模板库",
          description: "针对不同行业和应用场景，提供开箱即用的项目模板。每个模板都包含完整的业务逻辑、UI 设计和最佳实践，让你快速启动项目。作为基础版本的扩展包，需要单独购买，但基础版本用户享受大力度优惠。",
          timeline: "2026 Q4",
          status: "planned",
          statusText: "计划中",
          features: ["SaaS 应用模板", "软件售卖模板", "AI 项目模板", "电商平台模板", "企业官网模板", "基础版用户专享优惠"]
        }
      ],
      footer: "持续更新中，敬请期待更多功能..."
    },
    stats: {
      title: "值得信赖的选择",
      items: [
        {
          value: "10000",
          suffix: "+",
          label: "用户选择"
        },
        {
          value: "2",
          suffix: "",
          label: "前端框架支持"
        },
        {
          value: "50",
          suffix: "+",
          label: "内置功能模块"
        },
        {
          value: "99",
          suffix: "%",
          label: "用户满意度"
        }
      ]
    },
    testimonials: {
      title: "用户真实反馈",
      items: [
        {
          quote: "早鸟价太值了！完整的源码和终身更新，帮我快速搭建了自己的 SaaS 项目，一个月就回本了。",
          author: "张伟",
          role: "独立开发者"
        },
        {
          quote: "技术支持很给力，遇到问题都能快速解决。双框架支持让团队可以选择熟悉的技术栈。",
          author: "李小明",
          role: "创业公司 CTO"
        },
        {
          quote: "出海功能特别实用，国际化和支付都配置好了，省了我们大量的开发时间。",
          author: "王芳",
          role: "产品经理"
        }
      ]
    },
    finalCta: {
      title: "准备好开始你的远航了吗？",
      subtitle: "加入数千名用户的行列，用 TinyShip 快速构建你的下一个商业项目。虽然是小船，但足以载你驶向成功的彼岸。早鸟价仅限前 100 名用户！",
      buttons: {
        purchase: "立即抢购 ¥299",
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
      premiumFeatures: "高级会员功能",
      pricing: "定价"
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
  }
} as const; 