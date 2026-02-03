import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import { createStorageProvider, type StorageProviderType } from '@libs/storage';
import { config } from '@config';

const SUPPORTED_PROVIDERS: StorageProviderType[] = ['oss', 's3', 'r2', 'cos', 'local'];

const normalizeKey = (value: string) => {
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const url = new URL(value);
      value = url.pathname;
    }
  } catch {
    // ignore parse errors and treat as raw key
  }
  const cleaned = value.split('?')[0]?.replace(/^\/+/, '') || '';
  return cleaned;
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawKey = typeof body?.key === 'string' ? body.key : '';
    const key = normalizeKey(rawKey);

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const userPrefix = `uploads/${session.user.id}/`;
    if (!key.startsWith(userPrefix)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestedProvider = body?.provider;
    const provider: StorageProviderType =
      typeof requestedProvider === 'string' && SUPPORTED_PROVIDERS.includes(requestedProvider as StorageProviderType)
        ? (requestedProvider as StorageProviderType)
        : config.storage.defaultProvider;

    const requestedExpiresIn = Number(body?.expiresIn);
    const expiresIn = Number.isFinite(requestedExpiresIn)
      ? Math.min(Math.max(requestedExpiresIn, 60), 24 * 60 * 60)
      : 3600;

    const storage = createStorageProvider(provider);
    const signed = await storage.generateSignedUrl({
      key,
      expiresIn,
      operation: 'get',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: signed.url,
        key,
        provider,
        expiresAt: signed.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Storage signed URL error:', error);
    return NextResponse.json(
      { error: 'sign_failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
