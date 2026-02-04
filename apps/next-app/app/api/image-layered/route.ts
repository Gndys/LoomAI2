import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import { createStorageProvider } from '@libs/storage';
import { config } from '@config';
import { getApiKey } from '@libs/ai/config';

export const maxDuration = 120;

const FAL_ENDPOINT = 'https://fal.run/fal-ai/qwen-image-layered';
const RESULT_FOLDER = 'layered';
const SOURCE_FOLDER = 'layered-source';

function sanitizeBaseName(name?: string | null) {
  if (!name) return 'layer';
  const base = name.replace(/\.[^/.]+$/, '');
  const sanitized = base.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return sanitized || 'layer';
}

function inferExtensionFromContentType(contentType?: string | null) {
  const normalized = (contentType || '').toLowerCase();
  if (normalized.includes('jpeg')) return 'jpg';
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  return 'png';
}

function isUserUploadUrl(imageUrl: string, userId: string) {
  try {
    const url = new URL(imageUrl);
    return url.pathname.includes(`/uploads/${userId}/`);
  } catch {
    return false;
  }
}

function toOptionalNumLayers(value: unknown) {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return undefined;
  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 10) return undefined;
  return rounded;
}

function toOptionalGuidanceScale(value: unknown) {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return undefined;
  if (parsed < 1 || parsed > 20) return undefined;
  return Math.round(parsed * 10) / 10;
}

async function rehostSourceImage(imageUrl: string, userId: string, filename?: string | null) {
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error('Invalid image URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid image URL protocol');
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download source image (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  const baseName = sanitizeBaseName(filename);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = inferExtensionFromContentType(contentType);
  const fileName = `${baseName}-${uniqueSuffix}.${ext}`;

  const storage = createStorageProvider(config.storage.defaultProvider);
  const upload = await storage.uploadFile({
    file: buffer,
    fileName,
    contentType,
    folder: `uploads/${userId}/${SOURCE_FOLDER}`,
    metadata: {
      source: 'fal-layered-input',
      originalUrl: imageUrl,
    },
  });
  const signed = await storage.generateSignedUrl({
    key: upload.key,
    expiresIn: 3600,
    operation: 'get',
  });

  return signed.url;
}

async function persistLayerImage(
  imageUrl: string,
  userId: string,
  baseName: string,
  layerIndex: number
) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download layered image (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = inferExtensionFromContentType(contentType);
  const fileName = `${baseName}-layer-${layerIndex}-${uniqueSuffix}.${ext}`;

  const storage = createStorageProvider(config.storage.defaultProvider);
  const upload = await storage.uploadFile({
    file: buffer,
    fileName,
    contentType,
    folder: `uploads/${userId}/${RESULT_FOLDER}`,
    metadata: {
      source: 'fal-qwen-image-layered',
      layerIndex: String(layerIndex),
    },
  });
  const signed = await storage.generateSignedUrl({
    key: upload.key,
    expiresIn: 3600,
    operation: 'get',
  });

  return {
    url: signed.url,
    key: upload.key,
    provider: config.storage.defaultProvider,
    expiresAt: signed.expiresAt,
    originalImageUrl: imageUrl,
    layerIndex,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getApiKey('fal');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'missing_api_key', message: 'FAL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;
    const filename = body?.filename;
    const numLayers = toOptionalNumLayers(body?.numLayers ?? body?.num_layers);
    const guidanceScale = toOptionalGuidanceScale(body?.guidanceScale ?? body?.guidance_scale);

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'imageUrl must be http(s)' }, { status: 400 });
    }

    let sourceImageUrl = imageUrl;
    if (config.storage.defaultProvider !== 'local' && !isUserUploadUrl(imageUrl, session.user.id)) {
      sourceImageUrl = await rehostSourceImage(imageUrl, session.user.id, filename);
    }

    const requestBody: Record<string, unknown> = {
      image_url: sourceImageUrl,
    };
    if (numLayers !== undefined) {
      requestBody.num_layers = numLayers;
    }
    if (guidanceScale !== undefined) {
      requestBody.guidance_scale = guidanceScale;
    }

    const response = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`fal.ai error: ${response.status} - ${rawText}`);
    }

    const data = rawText ? JSON.parse(rawText) : {};
    const images = Array.isArray(data?.images)
      ? data.images
          .map((item: { url?: string }) => item?.url)
          .filter((url: unknown): url is string => typeof url === 'string')
      : [];

    if (!images.length) {
      return NextResponse.json(
        { error: 'no_images', message: 'No layer images returned from fal.ai' },
        { status: 500 }
      );
    }

    const baseName = sanitizeBaseName(filename);
    const persisted = await Promise.all(
      images.map((url, index) => persistLayerImage(url, session.user.id, baseName, index + 1))
    );

    return NextResponse.json({
      success: true,
      data: {
        images: persisted,
        seed: data?.seed,
        prompt: data?.prompt,
      },
    });
  } catch (error: any) {
    console.error('Image layered API error:', error);
    return NextResponse.json(
      { error: 'layered_failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
