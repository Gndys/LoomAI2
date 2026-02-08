import { and, count, desc, eq } from 'drizzle-orm';
import {
  db,
  generationCallLog,
  generationCallLogStatuses,
  user,
} from '@libs/database';

type GenerationStatus = (typeof generationCallLogStatuses)[keyof typeof generationCallLogStatuses];

const toStatus = (value: unknown): GenerationStatus => {
  if (value === generationCallLogStatuses.COMPLETED) return generationCallLogStatuses.COMPLETED;
  if (value === generationCallLogStatuses.FAILED) return generationCallLogStatuses.FAILED;
  if (value === generationCallLogStatuses.PROCESSING) return generationCallLogStatuses.PROCESSING;
  return generationCallLogStatuses.PENDING;
};

const toSuccess = (status: GenerationStatus): boolean | null => {
  if (status === generationCallLogStatuses.COMPLETED) return true;
  if (status === generationCallLogStatuses.FAILED) return false;
  return null;
};

const safePlainObject = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
};

export async function createGenerationLog(input: {
  userId: string;
  feature: string;
  provider?: string;
  model?: string;
  taskId?: string;
  status?: unknown;
  failureReason?: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  detail?: unknown;
}) {
  const now = new Date();
  const status = toStatus(input.status);
  const id = `glog_${crypto.randomUUID()}`;

  const [created] = await db
    .insert(generationCallLog)
    .values({
      id,
      userId: input.userId,
      feature: input.feature,
      provider: input.provider ?? null,
      model: input.model ?? null,
      taskId: input.taskId ?? null,
      status,
      success: toSuccess(status),
      failureReason: input.failureReason ?? null,
      requestPayload: safePlainObject(input.requestPayload),
      responsePayload: safePlainObject(input.responsePayload),
      detail: safePlainObject(input.detail),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function updateGenerationLogByTaskId(input: {
  userId: string;
  taskId: string;
  status?: unknown;
  failureReason?: string | null;
  responsePayload?: unknown;
  detail?: unknown;
}) {
  const status = toStatus(input.status);
  const success = toSuccess(status);

  const [updated] = await db
    .update(generationCallLog)
    .set({
      status,
      success,
      failureReason: input.failureReason ?? null,
      responsePayload: safePlainObject(input.responsePayload),
      detail: safePlainObject(input.detail),
      updatedAt: new Date(),
    })
    .where(and(eq(generationCallLog.userId, input.userId), eq(generationCallLog.taskId, input.taskId)))
    .returning();

  return updated;
}

export async function listGenerationLogs(options: {
  page?: number;
  limit?: number;
  feature?: string;
  userId?: string;
  status?: string;
}) {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.min(100, Math.max(1, Number(options.limit || 20)));
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (options.feature) conditions.push(eq(generationCallLog.feature, options.feature));
  if (options.userId) conditions.push(eq(generationCallLog.userId, options.userId));
  if (options.status) conditions.push(eq(generationCallLog.status, options.status));

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = whereClause
    ? await db
        .select({
          id: generationCallLog.id,
          userId: generationCallLog.userId,
          userName: user.name,
          userEmail: user.email,
          feature: generationCallLog.feature,
          provider: generationCallLog.provider,
          model: generationCallLog.model,
          taskId: generationCallLog.taskId,
          status: generationCallLog.status,
          success: generationCallLog.success,
          failureReason: generationCallLog.failureReason,
          requestPayload: generationCallLog.requestPayload,
          responsePayload: generationCallLog.responsePayload,
          detail: generationCallLog.detail,
          createdAt: generationCallLog.createdAt,
          updatedAt: generationCallLog.updatedAt,
        })
        .from(generationCallLog)
        .leftJoin(user, eq(generationCallLog.userId, user.id))
        .where(whereClause)
        .orderBy(desc(generationCallLog.createdAt))
        .limit(limit)
        .offset(offset)
    : await db
        .select({
          id: generationCallLog.id,
          userId: generationCallLog.userId,
          userName: user.name,
          userEmail: user.email,
          feature: generationCallLog.feature,
          provider: generationCallLog.provider,
          model: generationCallLog.model,
          taskId: generationCallLog.taskId,
          status: generationCallLog.status,
          success: generationCallLog.success,
          failureReason: generationCallLog.failureReason,
          requestPayload: generationCallLog.requestPayload,
          responsePayload: generationCallLog.responsePayload,
          detail: generationCallLog.detail,
          createdAt: generationCallLog.createdAt,
          updatedAt: generationCallLog.updatedAt,
        })
        .from(generationCallLog)
        .leftJoin(user, eq(generationCallLog.userId, user.id))
        .orderBy(desc(generationCallLog.createdAt))
        .limit(limit)
        .offset(offset);

  const totalQuery = db.select({ total: count() }).from(generationCallLog);
  const totalRows = whereClause ? await totalQuery.where(whereClause) : await totalQuery;
  const total = totalRows[0]?.total || 0;

  return {
    page,
    pageSize: limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    logs: rows,
  };
}

export async function getGenerationLogById(options: {
  id: string;
  userId?: string;
}) {
  const conditions = [eq(generationCallLog.id, options.id)];
  if (options.userId) {
    conditions.push(eq(generationCallLog.userId, options.userId));
  }

  const [row] = await db
    .select({
      id: generationCallLog.id,
      userId: generationCallLog.userId,
      userName: user.name,
      userEmail: user.email,
      feature: generationCallLog.feature,
      provider: generationCallLog.provider,
      model: generationCallLog.model,
      taskId: generationCallLog.taskId,
      status: generationCallLog.status,
      success: generationCallLog.success,
      failureReason: generationCallLog.failureReason,
      requestPayload: generationCallLog.requestPayload,
      responsePayload: generationCallLog.responsePayload,
      detail: generationCallLog.detail,
      createdAt: generationCallLog.createdAt,
      updatedAt: generationCallLog.updatedAt,
    })
    .from(generationCallLog)
    .leftJoin(user, eq(generationCallLog.userId, user.id))
    .where(and(...conditions))
    .limit(1);

  return row || null;
}
