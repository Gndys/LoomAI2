import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';

export const maxDuration = 60;

function parseNumber(value: unknown, fallback: number) {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
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

    const serviceUrl = process.env.PNG_TO_DXF_ENDPOINT;
    if (!serviceUrl) {
      return NextResponse.json(
        {
          error: 'service_not_configured',
          message: 'PNG_TO_DXF_ENDPOINT is not configured',
        },
        { status: 501 },
      );
    }

    const payload = {
      imageUrl,
      unit: body?.unit === 'cm' ? 'cm' : 'mm',
      dxfVersion: body?.dxfVersion === 'R2000' ? 'R2000' : 'R12',
      threshold: parseNumber(body?.threshold, 60),
      invert: Boolean(body?.invert),
      lineWidth: parseNumber(body?.lineWidth, 0.3),
    };

    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: 'create_task_failed', message: data?.message || 'Service error' },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('PNG to DXF create task error:', error);
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

    const serviceUrl = process.env.PNG_TO_DXF_ENDPOINT;
    if (!serviceUrl) {
      return NextResponse.json(
        {
          error: 'service_not_configured',
          message: 'PNG_TO_DXF_ENDPOINT is not configured',
        },
        { status: 501 },
      );
    }

    const response = await fetch(`${serviceUrl}?taskId=${encodeURIComponent(taskId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: 'get_task_failed', message: data?.message || 'Service error' },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('PNG to DXF get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
