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
Create a flat lay product photo of the clothing item from the input image.
Requirements:
- Remove everything except the garment (no person, hands, face, body).
- No UI elements, text, watermark, logos, borders.
- No background objects (no hangers, accessories, room).
- Clean pure white background, top view, centered, professional studio lighting.
- Preserve the original garment shape, seams, texture, pattern, and colors. Do not invent details.
If there are multiple garments, output one image per garment, each with a single garment.
`.trim();

function toOptionalSize(value: unknown): EvolinkImageSize | undefined {
  const allowed: EvolinkImageSize[] = [
    'auto',
    '1:1',
    '2:3',
    '3:2',
    '3:4',
    '4:3',
    '4:5',
    '5:4',
    '9:16',
    '16:9',
    '21:9',
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
      model: 'gemini-3-pro-image-preview',
      prompt,
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Clothes split create task error:', error);
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
    console.error('Clothes split get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

