import { z } from 'zod';
import { userRoles } from '../database/constants';

// 手机号码数据类型
export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  phoneLength: number[];
  format?: string;
}

// 常用国家/地区代码
export const countryCodes: CountryCode[] = [
  { code: '+86', name: '中国', flag: '🇨🇳', phoneLength: [11], format: 'XXX XXXX XXXX' },
  { code: '+1', name: '美国', flag: '🇺🇸', phoneLength: [10], format: 'XXX XXX XXXX' },
  { code: '+44', name: '英国', flag: '🇬🇧', phoneLength: [10, 11], format: 'XXXX XXX XXXX' },
  { code: '+81', name: '日本', flag: '🇯🇵', phoneLength: [10, 11], format: 'XX XXXX XXXX' },
  { code: '+82', name: '韩国', flag: '🇰🇷', phoneLength: [10, 11], format: 'XX XXXX XXXX' },
  { code: '+65', name: '新加坡', flag: '🇸🇬', phoneLength: [8], format: 'XXXX XXXX' },
  { code: '+852', name: '香港', flag: '🇭🇰', phoneLength: [8], format: 'XXXX XXXX' },
  { code: '+853', name: '澳门', flag: '🇲🇴', phoneLength: [8], format: 'XXXX XXXX' },
  { code: '+61', name: '澳大利亚', flag: '🇦🇺', phoneLength: [9], format: 'XXX XXX XXX' },
  { code: '+33', name: '法国', flag: '🇫🇷', phoneLength: [10], format: 'X XX XX XX XX' },
  { code: '+49', name: '德国', flag: '🇩🇪', phoneLength: [10, 11], format: 'XXX XXXXXXX' },
  { code: '+91', name: '印度', flag: '🇮🇳', phoneLength: [10], format: 'XXXXX XXXXX' },
  { code: '+60', name: '马来西亚', flag: '🇲🇾', phoneLength: [9, 10], format: 'XX XXXX XXXX' },
  { code: '+66', name: '泰国', flag: '🇹🇭', phoneLength: [9], format: 'X XXXX XXXX' },
];

// 根据手机号长度和国家代码验证手机号
function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const country = countryCodes.find(c => c.code === countryCode);
  if (!country) return false;
  
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '');
  return country.phoneLength.includes(cleanPhone.length);
}

// 基础用户验证器
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().url().nullable().optional(),
  role: z.enum([userRoles.ADMIN, userRoles.USER]).default(userRoles.USER),
  phoneNumber: z.string().nullable().optional(),
  phoneNumberVerified: z.boolean().default(false),
  banned: z.boolean().default(false),
  banReason: z.string().nullable().optional(),
});

// 邮箱注册验证器
export const emailSignUpSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// 扩展的注册表单验证器（包含可选的图片URL）
export const signupFormSchema = emailSignUpSchema.extend({
  image: z.string().url().optional().or(z.literal('')),
});

// 邮箱登录验证器
export const emailSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// 扩展的登录表单验证器（包含记住我选项）
export const loginFormSchema = emailSignInSchema.extend({
  remember: z.boolean().default(false),
});

// 手机号注册验证器
export const phoneSignUpSchema = z.object({
  countryCode: z.string().min(1, '请选择国家/地区'),
  phoneNumber: z.string().min(1, '请输入手机号'),
  code: z.string().length(4),
}).refine((data) => validatePhoneNumber(data.phoneNumber, data.countryCode), {
  message: "手机号格式不正确",
  path: ["phoneNumber"],
});

// 手机号登录第一步验证器（发送验证码）
export const phoneLoginSchema = z.object({
  countryCode: z.string().min(1, '请选择国家/地区'),
  phone: z.string().min(1, '请输入手机号'),
}).refine((data) => validatePhoneNumber(data.phone, data.countryCode), {
  message: "手机号格式不正确",
  path: ["phone"],
});

// 手机号登录第二步验证器（验证验证码）
export const phoneVerifySchema = z.object({
  countryCode: z.string().min(1),
  phone: z.string().min(1),
  code: z.string().length(4),
});

// 更新用户验证器 - 所有字段都是可选的
export const updateUserSchema = userSchema.partial();

// 用户ID验证器
export const userIdSchema = z.object({
  id: z.string().min(1),
});

// 忘记密码验证器
export const forgetPasswordSchema = z.object({
  email: z.string().email(),
});

// 重置密码验证器
export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}); 