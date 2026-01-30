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

type PromoType = 'taobao' | 'weishang';
type TextureStrength = 'low' | 'medium' | 'high';
type PromoLayout = 'collage' | 'single';

type PromoCopy = {
  title?: string;
  subtitle?: string;
  highlights?: string;
  price?: string;
  brand?: string;
  campaign?: string;
};

const DEFAULT_PROMPT = `
Create a promotional marketing image for the garment from the input flat lay image.
Requirements:
- Keep the garment details, colors, and textures accurate. Do not alter the garment.
- Compose a clean promotional layout with readable text and supportive graphics.
- Keep the garment as the main focus and avoid covering it with text.
- Use a clean background; subtle gradients or shapes are allowed.
- No watermark, UI, border, or extra products.
- If multiple garments appear, focus on the main garment and produce a single poster.
- Use Simplified Chinese copy by default unless user copy is in another language.
`.trim();

const OUTFIT_PROMPT = `
Outfit mode:
- Use a realistic model wearing the garment.
- Crop from shoulders down; no face.
- Use soft natural indoor light, neutral background, low saturation, subtle film grain.
- Add minimal editorial typography without covering the garment.
- Preserve realistic fabric texture and weave; show fine material grain and natural wrinkles.
- Avoid plastic/CGI smoothness or overly airbrushed surfaces.
`.trim();

const PROMO_STYLE_GUIDE: Record<PromoType, string> = {
  taobao: 'Taobao e-commerce listing poster: clean, bright, minimal, product-first.',
  weishang: 'WeChat/Weishang promo card: social-commerce poster, bold headline area, friendly and lively.',
};

const TEXTURE_GUIDE: Record<TextureStrength, string> = {
  low: 'Subtle fabric texture, clean product feel, minimal grain.',
  medium: 'Balanced fabric texture; visible weave and natural wrinkles.',
  high: 'Strong fabric realism; fine weave detail, micro texture, natural folds.',
};

const LAYOUT_GUIDE: Record<PromoLayout, string> = {
  collage: 'Three-panel editorial collage: left large, right top, right bottom.',
  single: 'Single-image poster; no collage or multiple panels.',
};

const OUTFIT_COLLAGE_PROMPT = `
Collage panels:
- Left panel shows the garment on hanger or flat lay, matching the reference image.
- Right panels show the model wearing the garment.
- Add minimal editorial typography without covering the garment.
`.trim();

const OUTFIT_SINGLE_PROMPT = `
Single image:
- Model wearing the garment; keep the garment centered and clear.
- No collage, no split panels.
`.trim();

const PRODUCT_COLLAGE_PROMPT = `
Collage panels:
- Left panel shows the full garment on hanger or flat lay.
- Right panels show fabric close-ups and detail shots; no model.
`.trim();

const PRODUCT_SINGLE_PROMPT = `
Single image:
- Full garment on hanger or flat lay; no model.
- Clean background, product-first composition.
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

function toOptionalPromoType(value: unknown): PromoType | undefined {
  const allowed: PromoType[] = ['taobao', 'weishang'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as PromoType) : undefined;
}

function toOptionalTextureStrength(value: unknown): TextureStrength | undefined {
  const allowed: TextureStrength[] = ['low', 'medium', 'high'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as TextureStrength) : undefined;
}

function toOptionalLayout(value: unknown): PromoLayout | undefined {
  const allowed: PromoLayout[] = ['collage', 'single'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as PromoLayout) : undefined;
}

function buildCopyLines(copy: PromoCopy | null): string[] {
  if (!copy) return [];
  const lines: string[] = [];
  const pushLine = (label: string, value?: string) => {
    if (!value || typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    lines.push(`${label}: ${trimmed}`);
  };

  pushLine('Title', copy.title);
  pushLine('Subtitle', copy.subtitle);
  pushLine('Highlights', copy.highlights);
  pushLine('Price/Offer', copy.price);
  pushLine('Brand', copy.brand);
  pushLine('Campaign', copy.campaign);
  return lines;
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

    const promoType = toOptionalPromoType(body?.promoType) ?? 'taobao';
    const size = toOptionalSize(body?.size) ?? 'auto';
    const quality = toOptionalQuality(body?.quality) ?? '2K';
    const aiOutfit = body?.aiOutfit === true;
    const textureStrength = toOptionalTextureStrength(body?.textureStrength) ?? 'medium';
    const layout = toOptionalLayout(body?.layout) ?? 'collage';

    const copyLines = buildCopyLines(body?.copy ?? null);
    const promptLines = [
      DEFAULT_PROMPT,
      `Style: ${promoType} - ${PROMO_STYLE_GUIDE[promoType]}`,
      `Texture: ${textureStrength} - ${TEXTURE_GUIDE[textureStrength]}`,
      `Layout: ${layout} - ${LAYOUT_GUIDE[layout]}`,
    ];

    if (aiOutfit) {
      promptLines.push(OUTFIT_PROMPT);
      promptLines.push(layout === 'collage' ? OUTFIT_COLLAGE_PROMPT : OUTFIT_SINGLE_PROMPT);
    } else {
      promptLines.push(layout === 'collage' ? PRODUCT_COLLAGE_PROMPT : PRODUCT_SINGLE_PROMPT);
    }

    if (copyLines.length > 0) {
      promptLines.push('Incorporate the following user-provided copy where appropriate. Keep the wording unchanged where possible:');
      promptLines.push(...copyLines);
    } else {
      promptLines.push('No user copy provided. Generate concise promotional copy based on the garment.');
    }

    const prompt = promptLines.join('\n');

    const task = await evolinkCreateImageGenerationTask({
      model: 'gemini-3-pro-image-preview',
      prompt,
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Clothes promo create task error:', error);
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
    console.error('Clothes promo get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
