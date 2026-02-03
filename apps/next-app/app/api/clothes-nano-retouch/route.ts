import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import {
  evolinkCreateImageGenerationTask,
  evolinkGetTaskDetail,
  type EvolinkImageQuality,
  type EvolinkImageSize,
} from '@libs/ai';

export const maxDuration = 60;

const DEFAULT_PROMPT = `
Retouch the input image based on the user's instructions.
Requirements:
- Keep the main subject, pose, and composition consistent unless requested.
- Make clean, realistic edits with natural lighting and colors.
- Do not add text, watermarks, borders, or UI elements.
- Output a single high-quality image.
`.trim();

function toOptionalSize(value: unknown): EvolinkImageSize | undefined {
  const allowed: EvolinkImageSize[] = [
    'auto',
    '1:1',
    '2:3',
    '3:2',
    '3:4',
    '4:3',
    '9:16',
    '16:9',
  ];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as EvolinkImageSize) : undefined;
}

function toOptionalQuality(value: unknown): EvolinkImageQuality | undefined {
  const allowed: EvolinkImageQuality[] = ['1K', '2K', '4K'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as EvolinkImageQuality) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const size = toOptionalSize(body?.size) ?? 'auto';
    const quality = toOptionalQuality(body?.quality) ?? '2K';
    const userPrompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const prompt = userPrompt ? `${DEFAULT_PROMPT}\nUser instructions: ${userPrompt}` : DEFAULT_PROMPT;

    const task = await evolinkCreateImageGenerationTask({
      model: 'gemini-2.5-flash-image',
      prompt,
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Nano retouch create task error:', error);
    return NextResponse.json(
      { error: 'create_task_failed', message: error?.message || 'Unknown error' },
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
  } catch (error: any) {
    console.error('Nano retouch get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
