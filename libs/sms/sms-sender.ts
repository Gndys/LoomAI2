import { SMSOptions, SMSResponse } from './types';
import { sendSMSByAliyun } from './providers/aliyun';
import { sendSMSByTwilio } from './providers/twilio';
import { config } from '@config';

/**
 * 发送短信的统一接口
 */
export async function sendSMS(options: SMSOptions): Promise<SMSResponse> {
  const provider = options.provider || config.sms.defaultProvider;

  switch (provider) {
    case 'aliyun':
      return sendSMSByAliyun(options);

    case 'twilio':
      return sendSMSByTwilio(options);

    default:
      return {
        success: false,
        error: {
          message: `Unsupported SMS provider: ${provider}`,
          name: 'UnsupportedProvider',
        }
      };
  }
} 