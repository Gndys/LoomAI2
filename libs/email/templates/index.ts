import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { translations, defaultLocale, type SupportedLocale } from '@libs/i18n';
import { VERIFICATION_TEMPLATE, RESET_PASSWORD_TEMPLATE } from './templates';

// 邮件模板类型定义
export interface EmailTemplate {
  subject: string;
  html: string;
}

// 验证邮件所需变量类型
export interface VerificationEmailParams {
  name: string;
  verification_url: string;
  expiry_hours: number;
  locale?: string; // 指定使用哪种语言
}

// 重置密码邮件所需变量类型
export interface ResetPasswordEmailParams {
  name: string;
  reset_url: string;
  expiry_hours: number;
  locale?: string; // 指定使用哪种语言
}

// 获取当前年份，用于版权信息
const getCurrentYear = () => new Date().getFullYear().toString();

/**
 * 为Handlebars模板准备翻译数据
 */
function prepareTranslationData(params: VerificationEmailParams | ResetPasswordEmailParams, template: 'verification' | 'resetPassword') {
  const locale = params.locale && params.locale in translations ? params.locale as SupportedLocale : defaultLocale;
  const localeTranslations = translations[locale];
  
  // 处理特殊的格式化变量
  const year = getCurrentYear();
  const expiry = localeTranslations.email[template].expiry.replace(
    '{{expiry_hours}}', 
    params.expiry_hours.toString()
  );
  const greeting = localeTranslations.email[template].greeting.replace(
    '{{name}}', 
    params.name
  );
  
  // 返回处理后的翻译对象
  return {
    translations: {
      ...localeTranslations,
      email: {
        ...localeTranslations.email,
        [template]: {
          ...localeTranslations.email[template],
          expiry,
          greeting,
          copyright: localeTranslations.email[template].copyright.replace('{{year}}', year)
        }
      }
    }
  };
}

/**
 * 生成验证邮件模板
 */
export function generateVerificationEmail(params: VerificationEmailParams): EmailTemplate {
  // 准备翻译数据
  const translationData = prepareTranslationData(params, 'verification');
  
  // 编译MJML为HTML
  const { html: mjmlHtml } = mjml2html(VERIFICATION_TEMPLATE);
  
  // 使用Handlebars替换变量
  const template = Handlebars.compile(mjmlHtml);
  const html = template({
    ...params,
    ...translationData
  });
  
  // 获取对应语言的主题
  const locale = params.locale && params.locale in translations ? params.locale as SupportedLocale : defaultLocale;
  const subject = translations[locale].email.verification.subject;
  
  return {
    subject,
    html
  };
}

/**
 * 生成重置密码邮件模板
 */
export function generateResetPasswordEmail(params: ResetPasswordEmailParams): EmailTemplate {
  // 准备翻译数据
  const translationData = prepareTranslationData(params, 'resetPassword');
  
  // 编译MJML为HTML
  const { html: mjmlHtml } = mjml2html(RESET_PASSWORD_TEMPLATE);
  
  // 使用Handlebars替换变量
  const template = Handlebars.compile(mjmlHtml);
  const html = template({
    ...params,
    ...translationData
  });
  
  // 获取对应语言的主题
  const locale = params.locale && params.locale in translations ? params.locale as SupportedLocale : defaultLocale;
  const subject = translations[locale].email.resetPassword.subject;
  
  return {
    subject,
    html
  };
}

// 导出所有模板函数
export const templates = {
  verification: generateVerificationEmail,
  resetPassword: generateResetPasswordEmail
}; 