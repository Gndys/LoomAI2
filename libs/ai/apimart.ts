import { config } from '@config';

export type ApimartSora2Model = 'sora-2' | 'sora-2-vip' | 'sora-2-pro';
export type ApimartSora2AspectRatio = '16:9' | '9:16';
export type ApimartSora2Duration = 10 | 15 | 25;
export type ApimartTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'submitted';

export interface ApimartSora2VideoGenerationRequest {
  model: ApimartSora2Model;
  prompt: string;
  duration?: ApimartSora2Duration;
  aspect_ratio?: ApimartSora2AspectRatio;
  image_urls?: string[];
  watermark?: boolean;
  thumbnail?: boolean;
  private?: boolean;
  style?: string;
  storyboard?: boolean;
  character_url?: string;
  character_timestamps?: string;
}

export interface ApimartCreateTaskDataItem {
  status: ApimartTaskStatus;
  task_id: string;
}

export interface ApimartCreateTaskResponse {
  code: number;
  data: ApimartCreateTaskDataItem[];
}

export interface ApimartTaskStatusResponse {
  code: number;
  data: {
    id: string;
    status: ApimartTaskStatus;
    progress?: number;
    result?: {
      images?: Array<{ url?: string[]; expires_at?: number }>;
      videos?: Array<{ url?: string[]; expires_at?: number }>;
      thumbnail_url?: string;
    };
    created?: number;
    completed?: number;
    estimated_time?: number;
    actual_time?: number;
    error?: {
      code?: number;
      message?: string;
      type?: string;
    };
  };
}

interface ApimartErrorResponse {
  error?: {
    code?: number;
    message?: string;
    type?: string;
  };
}

export class ApimartApiError extends Error {
  status: number;
  code?: number;
  type?: string;

  constructor(input: { status: number; message: string; code?: number; type?: string }) {
    super(input.message);
    this.name = 'ApimartApiError';
    this.status = input.status;
    this.code = input.code;
    this.type = input.type;
  }
}

function getApimartAuthHeader(): string {
  const apiKey = config.apimart.apiKey;
  if (!apiKey) throw new Error('APIMART_API_KEY is not configured');
  return `Bearer ${apiKey}`;
}

async function apimartJson<T>(input: RequestInfo | URL, init: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';

  if (res.ok) {
    return res.json() as Promise<T>;
  }

  const bodyText = await res.text();

  if (contentType.includes('application/json')) {
    let parsed: ApimartErrorResponse | null = null;
    try {
      parsed = JSON.parse(bodyText) as ApimartErrorResponse;
    } catch {
      parsed = null;
    }

    const error = parsed?.error;
    if (error) {
      throw new ApimartApiError({
        status: res.status,
        code: error.code,
        message: error.message || bodyText,
        type: error.type,
      });
    }
  }

  throw new ApimartApiError({
    status: res.status,
    message: bodyText,
  });
}

export async function apimartCreateSora2VideoTask(
  requestBody: ApimartSora2VideoGenerationRequest,
): Promise<ApimartCreateTaskResponse> {
  const url = `${config.apimart.baseUrl}/videos/generations`;
  return apimartJson<ApimartCreateTaskResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApimartAuthHeader(),
    },
    body: JSON.stringify(requestBody),
  });
}

export async function apimartGetTaskStatus(taskId: string): Promise<ApimartTaskStatusResponse> {
  const url = `${config.apimart.baseUrl}/tasks/${encodeURIComponent(taskId)}?language=en`;
  return apimartJson<ApimartTaskStatusResponse>(url, {
    method: 'GET',
    headers: {
      Authorization: getApimartAuthHeader(),
    },
  });
}
