import { NextRequest, NextResponse } from 'next/server';
import { createPaymentProvider } from '@libs/payment';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const provider = searchParams.get('provider') as 'wechat' | 'stripe';

    if (!orderId || !provider) {
      return NextResponse.json({ error: 'Missing orderId or provider' }, { status: 400 });
    }

    if (provider === 'wechat') {
      const wechatProvider = createPaymentProvider('wechat');
      const result = await wechatProvider.queryOrder(orderId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  } catch (error) {
    console.error('Payment query error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
} 