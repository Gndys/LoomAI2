import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@libs/database';
import { creditTransaction, creditTransactionTypes, user } from '@libs/database/schema';

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedUserId = searchParams.get('userId') || undefined;

    const now = new Date();
    const todayStart = startOfDay(now);
    const sevenDayStart = startOfDay(addDays(now, -6));
    const thirtyDayStart = startOfDay(addDays(now, -29));
    const ninetyDayStart = startOfDay(addDays(now, -89));

    const baseConditions = [
      eq(creditTransaction.type, creditTransactionTypes.CONSUMPTION),
    ];

    if (selectedUserId) {
      baseConditions.push(eq(creditTransaction.userId, selectedUserId));
    }

    const [summaryRow] = await db
      .select({
        totalConsumed: sql<string>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
        consumedToday: sql<string>`COALESCE(SUM(CASE WHEN ${creditTransaction.createdAt} >= ${todayStart} THEN ABS(${creditTransaction.amount}) ELSE 0 END), 0)`,
        consumed7d: sql<string>`COALESCE(SUM(CASE WHEN ${creditTransaction.createdAt} >= ${sevenDayStart} THEN ABS(${creditTransaction.amount}) ELSE 0 END), 0)`,
        consumed30d: sql<string>`COALESCE(SUM(CASE WHEN ${creditTransaction.createdAt} >= ${thirtyDayStart} THEN ABS(${creditTransaction.amount}) ELSE 0 END), 0)`,
        transactions30d: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransaction.createdAt} >= ${thirtyDayStart} THEN 1 ELSE 0 END), 0)::int`,
        activeUsers30d: sql<number>`COUNT(DISTINCT CASE WHEN ${creditTransaction.createdAt} >= ${thirtyDayStart} THEN ${creditTransaction.userId} ELSE NULL END)::int`,
      })
      .from(creditTransaction)
      .where(and(...baseConditions));

    const trendRows = await db
      .select({
        date: sql<string>`DATE(${creditTransaction.createdAt})::text`,
        consumed: sql<string>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
      })
      .from(creditTransaction)
      .where(
        and(
          ...baseConditions,
          gte(creditTransaction.createdAt, ninetyDayStart)
        )
      )
      .groupBy(sql`DATE(${creditTransaction.createdAt})`)
      .orderBy(asc(sql`DATE(${creditTransaction.createdAt})`));

    const trendMap = new Map<string, number>(
      trendRows.map((item) => [item.date, toNumber(item.consumed)])
    );

    const dailyTrend: Array<{ date: string; consumed: number }> = [];
    for (let i = 0; i < 90; i++) {
      const date = addDays(ninetyDayStart, i);
      const key = date.toISOString().slice(0, 10);
      dailyTrend.push({
        date: key,
        consumed: trendMap.get(key) || 0,
      });
    }

    const topUsers = await db
      .select({
        userId: creditTransaction.userId,
        userEmail: user.email,
        userName: user.name,
        consumed: sql<string>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
      })
      .from(creditTransaction)
      .leftJoin(user, eq(creditTransaction.userId, user.id))
      .where(
        and(
          ...baseConditions,
          gte(creditTransaction.createdAt, thirtyDayStart)
        )
      )
      .groupBy(creditTransaction.userId, user.email, user.name)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`))
      .limit(5);

    const topDescriptions = await db
      .select({
        description: creditTransaction.description,
        consumed: sql<string>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
      })
      .from(creditTransaction)
      .where(
        and(
          ...baseConditions,
          gte(creditTransaction.createdAt, thirtyDayStart)
        )
      )
      .groupBy(creditTransaction.description)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`))
      .limit(5);

    const filterUsers = await db
      .select({
        userId: creditTransaction.userId,
        userEmail: user.email,
        userName: user.name,
        consumed: sql<string>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
      })
      .from(creditTransaction)
      .leftJoin(user, eq(creditTransaction.userId, user.id))
      .where(
        and(
          eq(creditTransaction.type, creditTransactionTypes.CONSUMPTION),
          gte(creditTransaction.createdAt, ninetyDayStart)
        )
      )
      .groupBy(creditTransaction.userId, user.email, user.name)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`))
      .limit(100);

    let selectedUserInfo: { userId: string; userEmail: string | null; userName: string | null } | null = null;
    if (selectedUserId) {
      const inList = filterUsers.find((item) => item.userId === selectedUserId);
      if (inList) {
        selectedUserInfo = {
          userId: inList.userId,
          userEmail: inList.userEmail,
          userName: inList.userName,
        };
      } else {
        const [selectedUser] = await db
          .select({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
          })
          .from(user)
          .where(eq(user.id, selectedUserId))
          .limit(1);

        if (selectedUser) {
          selectedUserInfo = selectedUser;
        }
      }
    }

    const consumed30d = toNumber(summaryRow?.consumed30d);

    return NextResponse.json({
      summary: {
        totalConsumed: toNumber(summaryRow?.totalConsumed),
        consumedToday: toNumber(summaryRow?.consumedToday),
        consumed7d: toNumber(summaryRow?.consumed7d),
        consumed30d,
        avgDaily30d: consumed30d / 30,
        transactions30d: toNumber(summaryRow?.transactions30d),
        activeUsers30d: toNumber(summaryRow?.activeUsers30d),
      },
      dailyTrend,
      topUsers: topUsers.map((item) => ({
        userId: item.userId,
        userEmail: item.userEmail,
        userName: item.userName,
        consumed: toNumber(item.consumed),
      })),
      topDescriptions: topDescriptions.map((item) => ({
        description: item.description || 'unknown',
        consumed: toNumber(item.consumed),
      })),
      filterUsers: filterUsers.map((item) => ({
        userId: item.userId,
        userEmail: item.userEmail,
        userName: item.userName,
      })),
      selectedUserId: selectedUserId || null,
      selectedUserInfo,
    });
  } catch (error) {
    console.error('Error fetching credit stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
