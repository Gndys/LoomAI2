/**
 * 短信服务提供商类型
 */
export type SMSProvider = 'aliyun' | 'twilio';

/**
 * 统一的短信发送选项接口
 */
export interface SMSOptions {
  to: string;               // 接收短信的手机号码
  message: string;          // 短信内容
  from?: string;           // 发送方号码（某些服务商需要）
  templateCode?: string;    // 模板代码（如果使用模板）
  templateParams?: Record<string, string>; // 模板参数
  provider?: SMSProvider;  // 服务提供商，默认为 aliyun
}

/**
 * 统一的短信发送响应接口
 */
export interface SMSResponse {
  success: boolean;        // 发送是否成功
  messageId?: string;      // 消息ID
  requestId?: string;      // 请求ID
  error?: {
    message: string;
    name: string;
    provider?: SMSProvider;
  } | null;
} 