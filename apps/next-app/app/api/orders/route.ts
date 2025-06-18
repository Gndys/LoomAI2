import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@libs/auth";
import { headers } from 'next/headers';
import { db } from '@libs/database';
import { order } from '@libs/database/schema/order';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 获取用户的所有订单，按创建时间降序排列
    const userOrders = await db.select({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: order.planId,
      status: order.status,
      provider: order.provider,
      providerOrderId: order.providerOrderId,
      metadata: order.metadata,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }).from(order)
      .where(eq(order.userId, session.user.id))
      .orderBy(desc(order.createdAt));

    return NextResponse.json({
      orders: userOrders,
      total: userOrders.length
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 