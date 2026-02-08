import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import { getGenerationLogById } from '@libs/ai';
import { userRoles } from '@libs/database/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const isAdmin = session.user.role === userRoles.ADMIN;
    const log = await getGenerationLogById({
      id,
      userId: isAdmin ? undefined : session.user.id,
    });

    if (!log) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({
      log,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching generation log detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
