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

type LineWeight = 'thin' | 'medium' | 'thick';
type DetailLevel = 'light' | 'normal' | 'strong';
type SketchVariant = 'with-wrinkles' | 'no-wrinkles' | 'wrinkles-only';

const DEFAULT_PROMPT = `
Create a clean technical flat sketch (line drawing) of the garment from the input flat lay image.
Requirements:
- Output black line art on a pure white background.
- No color, no shading, no texture, no fabric rendering.
- Preserve the original silhouette, proportions, and construction details.
- Include seam lines, topstitching, darts, panels, waistline, and hems where visible.
- No text, labels, watermark, logos, or borders.
If there are multiple garments, output one sketch per garment, each with a single garment.
`.trim();

const WRINKLES_ONLY_PROMPT = `
Extract only the wrinkle or fold lines from the garment in the input image.
Requirements:
- Output black line art on a transparent background.
- Do NOT include the outer silhouette, seams, stitching, hems, darts, panels, or construction lines.
- Keep the wrinkle lines in the same position and scale as the original garment.
- No shading, texture, color, or fill.
If no wrinkles are visible, return an empty transparent image.
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

function toOptionalLineWeight(value: unknown): LineWeight | undefined {
  const allowed: LineWeight[] = ['thin', 'medium', 'thick'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as LineWeight) : undefined;
}

function toOptionalDetailLevel(value: unknown): DetailLevel | undefined {
  const allowed: DetailLevel[] = ['light', 'normal', 'strong'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as DetailLevel) : undefined;
}

function toOptionalVariant(value: unknown): SketchVariant | undefined {
  const allowed: SketchVariant[] = ['with-wrinkles', 'no-wrinkles', 'wrinkles-only'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as SketchVariant) : undefined;
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
    const lineWeight = toOptionalLineWeight(body?.lineWeight);
    const detailLevel = toOptionalDetailLevel(body?.detailLevel);
    const includeBackView = body?.includeBackView === true;
    const variant = toOptionalVariant(body?.variant);
    const basePrompt = typeof body?.prompt === 'string' && body.prompt.trim()
      ? body.prompt.trim()
      : variant === 'wrinkles-only'
        ? WRINKLES_ONLY_PROMPT
        : DEFAULT_PROMPT;
    const promptLines = [basePrompt];

    if (detailLevel) {
      promptLines.push(`Line detail level: ${detailLevel}.`);
    }

    if (lineWeight) {
      promptLines.push(`Line weight: ${lineWeight}.`);
    }

    if (includeBackView) {
      promptLines.push('Generate both front and back technical sketches. Prefer two separate images; if not possible, place front and back views side-by-side in one image.');
    }

    if (variant === 'with-wrinkles') {
      promptLines.push('Include visible wrinkle or fold lines as thin line art.');
    }
    if (variant === 'no-wrinkles') {
      promptLines.push('Exclude wrinkle or fold lines; keep only construction and seam lines.');
    }
    if (variant === 'wrinkles-only') {
      promptLines.push('Do not include any garment outline or construction details—only wrinkle or fold lines.');
    }

    const prompt = promptLines.join('\n');

    const task = await evolinkCreateImageGenerationTask({
      model: 'gemini-2.5-flash-image',
      prompt,
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Clothes sketch create task error:', error);
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
    console.error('Clothes sketch get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
