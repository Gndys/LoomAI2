import { createPaymentProvider } from '@libs/payment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    // Creem 不使用签名，但我们可以传递空字符串作为占位符
    const signature = '';
    
    const provider = createPaymentProvider('creem');
    const result = await provider.handleWebhook(rawBody, signature);
    
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Creem webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 