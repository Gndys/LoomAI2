import { NextResponse } from 'next/server';
import { createPaymentProvider } from '@libs/payment';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  const provider = url.searchParams.get('provider');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  try {
    if (provider === 'wechat') {
      // 创建微信支付提供商实例并调用取消订单方法
      const wechatProvider = createPaymentProvider('wechat');
      const success = await wechatProvider.closeOrder(orderId);

      if (success) {
        return NextResponse.json({ success: true, message: 'Order canceled successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
      }
    } else if (provider === 'stripe') {
      // TODO: 实现Stripe取消订单逻辑
      return NextResponse.json({ error: 'Canceling Stripe orders is not supported yet' }, { status: 501 });
    } else {
      return NextResponse.json({ error: 'Unsupported payment provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error canceling order:', error);
    return NextResponse.json({ error: 'An error occurred while canceling the order' }, { status: 500 });
  }
} 