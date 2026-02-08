import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import { listGenerationLogs } from '@libs/ai';
import { userRoles } from '@libs/database/constants';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === userRoles.ADMIN;
    const page = Number(request.nextUrl.searchParams.get('page') || 1);
    const limit = Number(request.nextUrl.searchParams.get('limit') || 20);
    const feature = request.nextUrl.searchParams.get('feature') || undefined;
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const userId = request.nextUrl.searchParams.get('userId') || undefined;

    const result = await listGenerationLogs({
      page,
      limit,
      feature,
      status,
      userId: isAdmin ? userId : session.user.id,
    });

    return NextResponse.json({
      ...result,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching generation logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
