import { z } from 'zod';
import { userRoles } from '../database/constants';

// 基础用户验证器
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().url().nullable().optional(),
  role: z.enum([userRoles.ADMIN, userRoles.USER]).default(userRoles.USER),
  phoneNumber: z.string().nullable().optional(),
  phoneNumberVerified: z.boolean().default(false),  banned: z.boolean().default(false),
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

// 手机号注册验证器 手机号登录验证器
export const phoneSignUpSchema = z.object({
  phoneNumber: z.string().min(11).max(11),
  code: z.string().length(4),
});

// 手机号登录第一步验证器（发送验证码）
export const phoneLoginSchema = z.object({
  phone: z.string().min(11).max(11),
});

// 手机号登录第二步验证器（验证验证码）
export const phoneVerifySchema = z.object({
  phone: z.string().min(11).max(11),
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