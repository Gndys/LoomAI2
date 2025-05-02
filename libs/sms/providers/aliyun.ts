import * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import Dysmsapi from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import { SMSOptions, SMSResponse } from '../types';
import { config } from '@config';

const aliyunConfig = config.sms.aliyun;

const client = new Dysmsapi(new $OpenApi.Config({
  accessKeyId: aliyunConfig.accessKeyId,
  accessKeySecret: aliyunConfig.accessKeySecret,
  endpoint: aliyunConfig.endpoint,
}));

const runtime = new $Util.RuntimeOptions({});

/**
 * 使用阿里云发送短信
 */
export async function sendSMSByAliyun(options: SMSOptions): Promise<SMSResponse> {
  try {
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: options.to,
      signName: aliyunConfig.signName,
      templateCode: options.templateCode,
      templateParam: options.templateParams ? JSON.stringify(options.templateParams) : undefined,
    });

    const response = await client.sendSmsWithOptions(sendSmsRequest, runtime);

    if (!response.body) {
      throw new Error('Empty response from SMS service');
    }

    if (response.body.code !== 'OK') {
      return {
        success: false,
        requestId: response.body.requestId || '',
        error: {
          message: response.body.message || 'Unknown error',
          name: 'AliyunSMSError',
          provider: 'aliyun'
        }
      };
    }

    return {
      success: true,
      messageId: response.body.bizId || '',
      requestId: response.body.requestId || '',
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: 'AliyunSMSError',
        provider: 'aliyun'
      }
    };
  }
} 