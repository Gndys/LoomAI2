import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import OpenApiUtil from '@alicloud/openapi-util';
import * as $Util from '@alicloud/tea-util';
import { createStorageProvider } from '@libs/storage';
import { config } from '@config';

export const maxDuration = 60;

const IMAGESEG_VERSION = '2019-12-30';
const IMAGESEG_ENDPOINT = process.env.ALIYUN_IMAGESEG_ENDPOINT || 'imageseg.cn-shanghai.aliyuncs.com';
const IMAGESEG_REGION = process.env.ALIYUN_IMAGESEG_REGION || 'cn-shanghai';
const RESULT_FOLDER = 'segmented';
const SEGMENT_ACTION = 'SegmentHDCommonImage';

const runtime = new $Util.RuntimeOptions({});

let cachedClient: OpenApi | null = null;

function getImagesegClient(): OpenApi {
  if (cachedClient) return cachedClient;

  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;

  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Missing ALIYUN_ACCESS_KEY_ID or ALIYUN_ACCESS_KEY_SECRET for Aliyun Vision.');
  }

  cachedClient = new OpenApi(
    new $OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint: IMAGESEG_ENDPOINT,
      regionId: IMAGESEG_REGION,
    })
  );

  return cachedClient;
}

async function callImageseg(action: string, query: Record<string, string>) {
  const client = getImagesegClient();
  const request = new $OpenApi.OpenApiRequest({
    query: OpenApiUtil.query(query),
  });
  const params = new $OpenApi.Params({
    action,
    version: IMAGESEG_VERSION,
    protocol: 'HTTPS',
    pathname: '/',
    method: 'POST',
    authType: 'AK',
    style: 'RPC',
    reqBodyType: 'formData',
    bodyType: 'json',
  });
  const response = await client.callApi(params, request, runtime);
  return response?.body ?? response;
}

function safeJsonParse(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractImageUrl(payload: any) {
  const data = payload?.Data || payload?.data;
  if (data?.ImageUrl) return data.ImageUrl as string;
  const parsed = safeJsonParse(data?.Result || data?.result);
  return parsed?.ImageUrl || parsed?.imageUrl || null;
}

function sanitizeBaseName(name?: string | null) {
  if (!name) return 'cutout';
  const base = name.replace(/\.[^/.]+$/, '');
  const sanitized = base.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return sanitized || 'cutout';
}

async function persistResultImage(
  imageUrl: string,
  userId: string,
  filename?: string | null
) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download segmented image (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  const baseName = sanitizeBaseName(filename);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${baseName}-${uniqueSuffix}.png`;

  const storage = createStorageProvider(config.storage.defaultProvider);
  const upload = await storage.uploadFile({
    file: buffer,
    fileName,
    contentType,
    folder: `uploads/${userId}/${RESULT_FOLDER}`,
    metadata: {
      source: 'aliyun-imageseg',
      originalName: filename || '',
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
    expiresAt: signed.expiresAt,
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

    const body = await request.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;
    const segmentType = body?.segmentType;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }
    if (segmentType && segmentType !== SEGMENT_ACTION) {
      return NextResponse.json({ error: 'Only SegmentHDCommonImage is supported' }, { status: 400 });
    }

    const action = SEGMENT_ACTION;
    const query: Record<string, string> = {
      ImageUrl: imageUrl,
      ImageURL: imageUrl,
    };
    const result = await callImageseg(action, query);

    const immediateImageUrl = extractImageUrl(result);
    if (immediateImageUrl) {
      const persisted = await persistResultImage(immediateImageUrl, session.user.id, body?.filename);
      return NextResponse.json({
        success: true,
        data: {
          status: 'PROCESS_SUCCESS',
          imageUrl: persisted.url,
          originalImageUrl: immediateImageUrl,
          expiresAt: persisted.expiresAt,
        },
      });
    }

    const jobId = result?.RequestId || result?.requestId;
    if (!jobId) {
      return NextResponse.json(
        { error: 'create_task_failed', message: 'Missing RequestId in response.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { jobId } });
  } catch (error: any) {
    console.error('Image segmentation create task error:', error);
    return NextResponse.json(
      { error: 'create_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 }
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

    const jobId = request.nextUrl.searchParams.get('jobId');
    const filename = request.nextUrl.searchParams.get('filename');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const result = await callImageseg('GetAsyncJobResult', {
      JobId: jobId,
    });

    const data = result?.Data || result?.data || {};
    const status = data?.Status || data?.status;
    const errorMessage = data?.ErrorMessage || data?.errorMessage;
    const parsedResult = safeJsonParse(data?.Result || data?.result);
    const rawImageUrl = parsedResult?.ImageUrl || parsedResult?.imageUrl;

    if (status === 'PROCESS_SUCCESS') {
      if (!rawImageUrl) {
        return NextResponse.json({
          success: true,
          data: {
            status,
            jobId,
            errorMessage: 'Missing result image URL.',
          },
        });
      }
      const persisted = await persistResultImage(rawImageUrl, session.user.id, filename);
      return NextResponse.json({
        success: true,
        data: {
          status,
          jobId,
          imageUrl: persisted.url,
          originalImageUrl: rawImageUrl,
          expiresAt: persisted.expiresAt,
        },
      });
    }

    if (status === 'PROCESS_FAILED') {
      return NextResponse.json({
        success: true,
        data: {
          status,
          jobId,
          errorMessage: errorMessage || 'Segmentation failed.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: status || 'PROCESSING',
        jobId,
      },
    });
  } catch (error: any) {
    console.error('Image segmentation get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
