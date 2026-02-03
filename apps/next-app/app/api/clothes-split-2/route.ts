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
Extract only the outer contour from the input garment sketch.
Requirements:
- Keep a single clean outer silhouette line only.
- Remove all interior lines, seams, darts, hems, stitching, labels, text, logos, and borders.
- Output black line art on a pure white background.
- Preserve the original silhouette, proportions, and scale.
If there are multiple garments, output one outline per garment, each with a single garment.
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
    const prompt = typeof body?.prompt === 'string' && body.prompt.trim() ? body.prompt.trim() : DEFAULT_PROMPT;

    const task = await evolinkCreateImageGenerationTask({
      model: 'gemini-2.5-flash-image',
      prompt,
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Clothes split 2 create task error:', error);
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
    console.error('Clothes split 2 get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
