import { config } from '@config';

export type EvolinkImageModel =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'nano-banana-2-lite'
  | 'z-image-turbo';
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

export interface EvolinkTaskDetailResponse {
  created: number;
  id: string;
  model: string;
  object: 'image.generation.task' | 'video.generation.task' | 'audio.generation.task';
  progress: number;
  status: EvolinkTaskStatus;
  type: 'image' | 'video' | 'audio' | 'text';
  results?: string[];
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
    try {
      const parsed: EvolinkErrorResponse = JSON.parse(bodyText);
      const msg = parsed?.error?.message || bodyText;
      throw new Error(`Evolink API error: ${res.status} - ${msg}`);
    } catch {
      throw new Error(`Evolink API error: ${res.status} - ${bodyText}`);
    }
  }

  throw new Error(`Evolink API error: ${res.status} - ${bodyText}`);
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
