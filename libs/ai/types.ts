import type { DeepSeekProviderSettings } from '@ai-sdk/deepseek';
import type { OpenAIProviderSettings } from '@ai-sdk/openai';
import type { UIMessage } from 'ai';

// All supported providers
export type AllProviderName = 'qwen' | 'openai' | 'deepseek' | 'fal';

// Chat-capable providers (excludes fal which is image-only)
export type ChatProviderName = 'qwen' | 'openai' | 'deepseek';

// Legacy alias for backwards compatibility
export type ProviderName = ChatProviderName;

// Provider configurations
export type QwenConfig = {
  apiKey: string;
  baseURL?: string;
};
export type OpenAIConfig = OpenAIProviderSettings;
export type DeepSeekConfig = DeepSeekProviderSettings;
export type FalConfig = {
  apiKey?: string;  // Optional: uses FAL_API_KEY env var by default
};

export type ProviderConfig = {
  qwen: QwenConfig;
  openai: OpenAIConfig;
  deepseek: DeepSeekConfig;
  fal: FalConfig;
};

export interface AIConfig {
  provider: ProviderName;
  config: ProviderConfig[ProviderName];
}

export interface ChatRequestOptions {
  messages: UIMessage[];
  extra?: {
    provider?: ProviderName;
    model?: string;
  };
}

// Image Generation Provider Types
export type ImageProviderName = 'qwen' | 'fal' | 'openai';

export type QwenImageSize = '1664*928' | '1472*1104' | '1328*1328' | '1104*1472' | '928*1664';
export type OpenAIImageSize = '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
export type FalAspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '9:21';

export interface ImageGenerationOptions {
  prompt: string;
  provider: ImageProviderName;
  model?: string;
  negativePrompt?: string;
  size?: string;
  aspectRatio?: string;
  seed?: number;
  // Qwen-specific options
  promptExtend?: boolean;
  watermark?: boolean;
  // Fal-specific options
  numInferenceSteps?: number;
  guidanceScale?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  width?: number;
  height?: number;
  provider: ImageProviderName;
  model: string;
  seed?: number;
}

// Qwen Image API Types
export interface QwenImageRequest {
  model: string;
  input: {
    messages: Array<{
      role: 'user';
      content: Array<{ text: string }>;
    }>;
  };
  parameters?: {
    negative_prompt?: string;
    prompt_extend?: boolean;
    watermark?: boolean;
    size?: string;
    seed?: number;
    n?: number;
  };
}

export interface QwenImageResponse {
  output: {
    choices: Array<{
      finish_reason: string;
      message: {  // Note: singular "message", not "messages"
        role: string;
        content: Array<{ image: string }>;
      };
    }>;
    task_metric?: {
      TOTAL: number;
      SUCCEEDED: number;
      FAILED: number;
    };
  };
  usage: {
    image_count: number;
    width: number;
    height: number;
  };
  request_id: string;
  code?: string;
  message?: string;
}
