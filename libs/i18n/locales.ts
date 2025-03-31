export const en = {
  common: {
    welcome: "Welcome to ShipEasy",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    settings: "Settings"
  },
  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    orders: "Orders",
    shipments: "Shipments",
    tracking: "Tracking"
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit"
  }
} as const

export const zhCN = {
  common: {
    welcome: "欢迎使用 ShipEasy",
    login: "登录",
    signup: "注册",
    logout: "退出登录",
    profile: "个人资料",
    settings: "设置"
  },
  navigation: {
    home: "首页",
    dashboard: "控制台",
    orders: "订单",
    shipments: "物流",
    tracking: "追踪"
  },
  actions: {
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑"
  }
} as const

export type Locale = typeof en
export type LocaleKey = keyof typeof en 