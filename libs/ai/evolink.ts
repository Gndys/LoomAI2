import { config } from '@config';

export type EvolinkImageModel =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'nano-banana-2-lite'
  | 'z-image-turbo';
export type EvolinkVideoModel = 'sora-2';
export type EvolinkImageSize =
  | 'auto'
  | '1:1'
  | '1:2'
  | '2:3'
  | '2:1'
  | '3:2'
  | '3:4'
  | '4:3'
  | '9:16'
  | '16:9'
  | `${number}x${number}`;
export type EvolinkImageQuality = '1K' | '2K' | '4K';
export type EvolinkVideoAspectRatio = '16:9' | '9:16';
export type EvolinkVideoDuration = 10 | 15;

export type EvolinkTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EvolinkImageGenerationRequest {
  model: EvolinkImageModel;
  prompt: string;
  size?: EvolinkImageSize;
  quality?: EvolinkImageQuality;
  image_urls?: string[];
  callback_url?: string;
}

export interface EvolinkImageGenerationResponse {
  created: number;
  id: string;
  model: string;
  object: 'image.generation.task';
  progress: number;
  status: EvolinkTaskStatus;
  type: 'image';
}

export interface EvolinkVideoGenerationRequest {
  model: EvolinkVideoModel;
  prompt: string;
  aspect_ratio?: EvolinkVideoAspectRatio;
  duration?: EvolinkVideoDuration;
  image_urls?: string[];
  remove_watermark?: boolean;
  callback_url?: string;
}

export interface EvolinkVideoGenerationResponse {
  created: number;
  id: string;
  model: string;
  object: 'video.generation.task';
  progress: number;
  status: EvolinkTaskStatus;
  type: 'video';
  task_info?: {
    can_cancel?: boolean;
    estimated_time?: number;
    video_duration?: number;
  };
  usage?: {
    billing_rule?: 'per_call' | 'per_token' | 'per_second';
    credits_reserved?: number;
    user_group?: string;
  };
}

export interface EvolinkTaskDetailResponse {
  created: number;
  id: string;
  model: string;
  object: 'image.generation.task' | 'video.generation.task' | 'audio.generation.task';
  progress: number;
  status: EvolinkTaskStatus;
  type: 'image' | 'video' | 'audio' | 'text';
  results?: string[];
  error?: {
    code?: number;
    message?: string;
    type?: string;
    param?: string;
    fallback_suggestion?: string;
  };
}

interface EvolinkErrorResponse {
  error?: {
    code?: number;
    message?: string;
    type?: string;
    param?: string;
    fallback_suggestion?: string;
  };
}

export class EvolinkApiError extends Error {
  status: number;
  code?: number;
  type?: string;
  param?: string;
  fallbackSuggestion?: string;

  constructor(input: {
    status: number;
    message: string;
    code?: number;
    type?: string;
    param?: string;
    fallbackSuggestion?: string;
  }) {
    super(input.message);
    this.name = 'EvolinkApiError';
    this.status = input.status;
    this.code = input.code;
    this.type = input.type;
    this.param = input.param;
    this.fallbackSuggestion = input.fallbackSuggestion;
  }
}

function getEvolinkAuthHeader(): string {
  const apiKey = config.evolink.apiKey;
  if (!apiKey) throw new Error('EVOLINK_API_KEY is not configured');
  return `Bearer ${apiKey}`;
}

async function evolinkJson<T>(input: RequestInfo | URL, init: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (res.ok) return res.json() as Promise<T>;

  const contentType = res.headers.get('content-type') || '';
  const bodyText = await res.text();

  if (contentType.includes('application/json')) {
    let parsed: EvolinkErrorResponse | null = null;
    try {
      parsed = JSON.parse(bodyText) as EvolinkErrorResponse;
    } catch {
      parsed = null;
    }

    const error = parsed?.error;
    if (error) {
      throw new EvolinkApiError({
        status: res.status,
        code: error.code,
        message: error.message || bodyText,
        type: error.type,
        param: error.param,
        fallbackSuggestion: error.fallback_suggestion,
      });
    }
  }

  throw new EvolinkApiError({
    status: res.status,
    message: bodyText,
  });
}

export async function evolinkCreateImageGenerationTask(
  requestBody: EvolinkImageGenerationRequest,
): Promise<EvolinkImageGenerationResponse> {
  const url = `${config.evolink.baseUrl}/images/generations`;
  return evolinkJson<EvolinkImageGenerationResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getEvolinkAuthHeader(),
    },
    body: JSON.stringify(requestBody),
  });
}

export async function evolinkGetTaskDetail(taskId: string): Promise<EvolinkTaskDetailResponse> {
  const url = `${config.evolink.baseUrl}/tasks/${encodeURIComponent(taskId)}`;
  return evolinkJson<EvolinkTaskDetailResponse>(url, {
    method: 'GET',
    headers: {
      Authorization: getEvolinkAuthHeader(),
    },
  });
}

export async function evolinkCreateVideoGenerationTask(
  requestBody: EvolinkVideoGenerationRequest,
): Promise<EvolinkVideoGenerationResponse> {
  const url = `${config.evolink.baseUrl}/videos/generations`;
  return evolinkJson<EvolinkVideoGenerationResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getEvolinkAuthHeader(),
    },
    body: JSON.stringify(requestBody),
  });
}
