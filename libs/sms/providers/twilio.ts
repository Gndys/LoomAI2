import { Twilio } from 'twilio';
import { SMSOptions, SMSResponse } from '../types';
import { config } from '@config';

const twilioConfig = config.sms.twilio;

const client = new Twilio(
  twilioConfig.accountSid,
  twilioConfig.authToken
);

/**
 * 使用Twilio发送短信
 */
export async function sendSMSByTwilio(options: SMSOptions): Promise<SMSResponse> {
  try {
    const response = await client.messages.create({
      to: options.to,
      from: options.from || twilioConfig.defaultFrom,
      body: options.message,
    });

    return {
      success: true,
      messageId: response.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: 'TwilioSMSError',
        provider: 'twilio'
      }
    };
  }
} 