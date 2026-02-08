import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';

export const generationCallLogStatuses = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const generationCallLog = pgTable('generation_call_log', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  feature: text('feature').notNull(),
  provider: text('provider'),
  model: text('model'),
  taskId: text('task_id'),
  status: text('status').notNull(),
  success: boolean('success'),
  failureReason: text('failure_reason'),
  requestPayload: jsonb('request_payload'),
  responsePayload: jsonb('response_payload'),
  detail: jsonb('detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type GenerationCallLog = InferSelectModel<typeof generationCallLog>;
export type NewGenerationCallLog = InferInsertModel<typeof generationCallLog>;

