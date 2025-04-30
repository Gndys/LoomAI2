import { Resend, CreateEmailOptions } from 'resend';
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();
// 自定义类型，确保兼容性
export type ShipEasyEmailOptions = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
};

// Resend API 响应类型
export type ResendResponse = {
  id?: string;
  error?: {
    message: string;
    name: string;
  } | null;
};

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}
console.log('process.env.RESEND_API_KEY', process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailByResend(options: ShipEasyEmailOptions): Promise<ResendResponse> {
  // 转换为Resend需要的格式
  const data: CreateEmailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html
  };
  
  // 添加可选字段
  if (options.text) data.text = options.text;
  if (options.cc) data.cc = options.cc;
  if (options.bcc) data.bcc = options.bcc;
  if (options.replyTo) data.replyTo = options.replyTo;

  const { data: responseData, error } = await resend.emails.send(data);
  
  if (error) {
    console.error('Failed to send email:', error);
    return { error };
  }

  console.log('Email sent successfully:', responseData);
  return { id: responseData?.id };
} 