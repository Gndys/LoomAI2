import * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import dysmsapi from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';

if (!process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || !process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET) {
  throw new Error('Missing ALIBABA_CLOUD_ACCESS_KEY_ID or ALIBABA_CLOUD_ACCESS_KEY_SECRET environment variable');
}

const config = new $OpenApi.Config({
  accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
});
config.endpoint = 'dysmsapi.aliyuncs.com';
// https://github.com/aliyun/alibabacloud-typescript-sdk/issues/30
// @ts-ignore
const Client = dysmsapi.default as typeof dysmsapi
const client = new Client(config);
const runtime = new $Util.RuntimeOptions({});

export interface SendSMSOptions {
  phoneNumber: string;          // 接收短信的手机号码
  signName: string;            // 短信签名名称
  templateCode: string;        // 短信模板ID
  templateParam?: Record<string, string>; // 模板参数，JSON格式
}

export async function sendSMSByAliyun({
  phoneNumber,
  signName,
  templateCode,
  templateParam,
}: SendSMSOptions) {
  try {
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: signName,
      templateCode: templateCode,
      templateParam: templateParam ? JSON.stringify(templateParam) : undefined,
    });

    const response = await client.sendSmsWithOptions(sendSmsRequest, runtime);

    if (!response.body) {
      throw new Error('Empty response from SMS service');
    }

    if (response.body.code !== 'OK') {
      throw new Error(`SMS send failed: ${response.body.message || 'Unknown error'}`);
    }

    return {
      messageId: response.body.bizId || '',
      requestId: response.body.requestId || '',
      code: response.body.code || '',
      message: response.body.message || '',
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
} 