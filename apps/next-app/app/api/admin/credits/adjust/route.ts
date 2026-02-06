import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@libs/credits/service';
import { db, user } from '@libs/database';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const amount = Number(body.amount);
    const description = typeof body.description === 'string' ? body.description.trim() : undefined;

    if (!userId && !email) {
      return NextResponse.json({ error: 'User identifier is required' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json({ error: 'Amount must be a non-zero number' }, { status: 400 });
    }

    let targetUserId = userId;

    if (!targetUserId) {
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (!result.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      targetUserId = result[0].id;
    }

    const transaction = await creditService.addCredits({
      userId: targetUserId,
      amount,
      type: 'adjustment',
      description: description || 'Admin adjustment',
      metadata: { source: 'admin' }
    });

    return NextResponse.json({ ok: true, transaction });
  } catch (error) {
    console.error('Error adjusting credits:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
