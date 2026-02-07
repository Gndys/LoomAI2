import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import {
  ApimartApiError,
  EvolinkApiError,
  apimartCreateSora2VideoTask,
  apimartGetTaskStatus,
  evolinkCreateVideoGenerationTask,
  evolinkGetTaskDetail,
  type ApimartSora2Model,
  type EvolinkVideoAspectRatio,
  type EvolinkVideoDuration,
} from '@libs/ai';

export const maxDuration = 60;

type VideoModel = 'sora-2' | 'sora-2-vip' | 'sora-2-pro';
type VideoProvider = 'evolink' | 'apimart';

const DEFAULT_MODEL: VideoModel = 'sora-2';
const DEFAULT_DURATION: EvolinkVideoDuration = 10;
const DEFAULT_ASPECT_RATIO: EvolinkVideoAspectRatio = '9:16';

const TEMPLATE_PROMPT = [
  'Create a short ecommerce product video for clothing.',
  'Keep product shape, color, fabric texture and logo consistent with the reference image.',
  'Clean studio-like scene, stable lighting, smooth camera motion, premium but conversion-oriented.',
  'Show key selling points clearly and avoid over-stylization.',
  'No watermark, no subtitles, no extra logos, no collage, no obvious artifacts.',
].join(' ');

const MODEL_PROVIDER_MAP: Record<VideoModel, VideoProvider> = {
  'sora-2': 'evolink',
  'sora-2-vip': 'apimart',
  'sora-2-pro': 'apimart',
};

const toOptionalAspectRatio = (value: unknown): EvolinkVideoAspectRatio | undefined => {
  return value === '16:9' || value === '9:16' ? value : undefined;
};

const toOptionalDuration = (value: unknown): number | undefined => {
  return value === 10 || value === 15 || value === 25 ? value : undefined;
};

const toOptionalHttpsUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

const toOptionalModel = (value: unknown): VideoModel | undefined => {
  return value === 'sora-2' || value === 'sora-2-vip' || value === 'sora-2-pro' ? value : undefined;
};

const normalizeCreateResponse = (input: {
  provider: VideoProvider;
  model: VideoModel;
  taskId: string;
  status: string;
  progress?: number;
}) => {
  return {
    provider: input.provider,
    model: input.model,
    id: input.taskId,
    status: input.status,
    progress: input.progress ?? 0,
  };
};

const normalizeTaskResponse = (input: { provider: VideoProvider; detail: any }) => {
  if (input.provider === 'apimart') {
    const data = input.detail?.data;
    const videoUrl = data?.result?.videos?.[0]?.url?.[0];
    const thumbnailUrl = data?.result?.thumbnail_url;
    const estimatedTime = typeof data?.estimated_time === 'number' ? data.estimated_time : undefined;

    return {
      provider: 'apimart' as const,
      id: data?.id,
      status: data?.status,
      progress: typeof data?.progress === 'number' ? data.progress : 0,
      results: typeof videoUrl === 'string' ? [videoUrl] : [],
      task_info: {
        estimated_time: estimatedTime,
      },
      thumbnail_url: typeof thumbnailUrl === 'string' ? thumbnailUrl : undefined,
      error:
        data?.error && typeof data.error === 'object'
          ? {
              code: data.error.code,
              message: data.error.message,
              type: data.error.type,
            }
          : undefined,
    };
  }

  return {
    provider: 'evolink' as const,
    ...input.detail,
  };
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const promptInput = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    const prompt = promptInput || TEMPLATE_PROMPT;
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'prompt is too long', message: 'prompt max length is 5000 characters' },
        { status: 400 },
      );
    }

    const model = toOptionalModel(body?.model) ?? DEFAULT_MODEL;
    const provider = MODEL_PROVIDER_MAP[model];
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const aspectRatio = toOptionalAspectRatio(body?.aspectRatio) ?? DEFAULT_ASPECT_RATIO;
    const duration = toOptionalDuration(body?.duration) ?? DEFAULT_DURATION;

    if (duration === 25 && model !== 'sora-2-pro') {
      return NextResponse.json(
        { error: 'invalid_duration', message: '25-second duration is only supported for sora-2-pro' },
        { status: 400 },
      );
    }

    const removeWatermark = body?.removeWatermark !== false;
    const callbackUrl = toOptionalHttpsUrl(body?.callbackUrl);

    if (provider === 'evolink') {
      const task = await evolinkCreateVideoGenerationTask({
        model: 'sora-2',
        prompt,
        aspect_ratio: aspectRatio,
        duration: duration === 15 ? 15 : 10,
        image_urls: imageUrl ? [imageUrl] : undefined,
        remove_watermark: removeWatermark,
        callback_url: callbackUrl,
      });

      return NextResponse.json({
        success: true,
        data: normalizeCreateResponse({
          provider,
          model,
          taskId: task.id,
          status: task.status,
          progress: task.progress,
        }),
      });
    }

    const privateMode = body?.privateMode === true;
    const withThumbnail = body?.withThumbnail === true;
    const style = typeof body?.style === 'string' && body.style.trim() ? body.style.trim() : undefined;
    const storyboard = body?.storyboard === true;

    const task = await apimartCreateSora2VideoTask({
      model: model as ApimartSora2Model,
      prompt,
      aspect_ratio: aspectRatio,
      duration,
      image_urls: imageUrl ? [imageUrl] : undefined,
      watermark: !removeWatermark,
      private: privateMode,
      thumbnail: withThumbnail,
      style,
      storyboard,
    });

    const taskId = task?.data?.[0]?.task_id;
    const taskStatus = task?.data?.[0]?.status;

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        { error: 'create_task_failed', message: 'Task created but task_id missing in provider response' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeCreateResponse({
        provider,
        model,
        taskId,
        status: typeof taskStatus === 'string' ? taskStatus : 'submitted',
      }),
    });
  } catch (error: unknown) {
    console.error('Video generate create task error:', error);

    if (error instanceof EvolinkApiError || error instanceof ApimartApiError) {
      return NextResponse.json(
        {
          error: 'create_task_failed',
          message: error.message,
          type: error.type,
        },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'create_task_failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = request.nextUrl.searchParams.get('taskId');
    const model = toOptionalModel(request.nextUrl.searchParams.get('model')) ?? DEFAULT_MODEL;
    const provider = MODEL_PROVIDER_MAP[model];

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    if (provider === 'evolink') {
      const detail = await evolinkGetTaskDetail(taskId);
      return NextResponse.json({ success: true, data: normalizeTaskResponse({ provider, detail }) });
    }

    const detail = await apimartGetTaskStatus(taskId);
    return NextResponse.json({ success: true, data: normalizeTaskResponse({ provider, detail }) });
  } catch (error: unknown) {
    console.error('Video generate get task error:', error);

    if (error instanceof EvolinkApiError || error instanceof ApimartApiError) {
      return NextResponse.json(
        {
          error: 'get_task_failed',
          message: error.message,
          type: error.type,
        },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'get_task_failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
