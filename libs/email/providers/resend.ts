import { Resend } from 'resend';
import { EmailOptions, EmailResponse } from '../types';
import { config } from '@config';

const resend = new Resend(config.email.resend.apiKey);

/**
 * 使用Resend发送邮件
 */
export async function sendEmailByResend(options: EmailOptions): Promise<EmailResponse> {
  try {
    const { data: responseData, error } = await resend.emails.send({
      from: options.from || config.email.defaultFrom!,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: {
          message: error.message,
          name: 'ResendError',
          provider: 'resend'
        }
      };
    }

    return {
      success: true,
      id: responseData?.id,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: 'ResendError',
        provider: 'resend'
      }
    };
  }
} 