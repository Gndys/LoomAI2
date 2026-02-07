import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import {
  EvolinkApiError,
  evolinkCreateVideoGenerationTask,
  evolinkGetTaskDetail,
  type EvolinkVideoAspectRatio,
  type EvolinkVideoDuration,
} from '@libs/ai';

export const maxDuration = 60;

const DEFAULT_MODEL = 'sora-2' as const;
const DEFAULT_DURATION: EvolinkVideoDuration = 10;
const DEFAULT_ASPECT_RATIO: EvolinkVideoAspectRatio = '9:16';

const TEMPLATE_PROMPT = [
  'Create a short ecommerce product video for clothing.',
  'Keep product shape, color, fabric texture and logo consistent with the reference image.',
  'Clean studio-like scene, stable lighting, smooth camera motion, premium but conversion-oriented.',
  'Show key selling points clearly and avoid over-stylization.',
  'No watermark, no subtitles, no extra logos, no collage, no obvious artifacts.',
].join(' ');

const toOptionalAspectRatio = (value: unknown): EvolinkVideoAspectRatio | undefined => {
  return value === '16:9' || value === '9:16' ? value : undefined;
};

const toOptionalDuration = (value: unknown): EvolinkVideoDuration | undefined => {
  return value === 10 || value === 15 ? value : undefined;
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

    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const aspectRatio = toOptionalAspectRatio(body?.aspectRatio) ?? DEFAULT_ASPECT_RATIO;
    const duration = toOptionalDuration(body?.duration) ?? DEFAULT_DURATION;
    const removeWatermark = body?.removeWatermark !== false;
    const callbackUrl = toOptionalHttpsUrl(body?.callbackUrl);

    const task = await evolinkCreateVideoGenerationTask({
      model: DEFAULT_MODEL,
      prompt,
      aspect_ratio: aspectRatio,
      duration,
      image_urls: imageUrl ? [imageUrl] : undefined,
      remove_watermark: removeWatermark,
      callback_url: callbackUrl,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    console.error('Video generate create task error:', error);

    if (error instanceof EvolinkApiError) {
      return NextResponse.json(
        {
          error: 'create_task_failed',
          message: error.message,
          type: error.type,
          param: error.param,
          fallbackSuggestion: error.fallbackSuggestion,
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
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const detail = await evolinkGetTaskDetail(taskId);
    return NextResponse.json({ success: true, data: detail });
  } catch (error: unknown) {
    console.error('Video generate get task error:', error);

    if (error instanceof EvolinkApiError) {
      return NextResponse.json(
        {
          error: 'get_task_failed',
          message: error.message,
          type: error.type,
          param: error.param,
          fallbackSuggestion: error.fallbackSuggestion,
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
