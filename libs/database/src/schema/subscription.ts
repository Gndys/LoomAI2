import { pgTable, timestamp, text, numeric } from "drizzle-orm/pg-core";
import { user } from './user'
// 订阅状态枚举
export const subscriptionStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
  PAST_DUE: "past_due",
} as const;

// 付款类型枚举
export const paymentTypes = {
  ONE_TIME: "one_time",
  SUBSCRIPTION: "subscription",
} as const;

// 用户订阅表
export const subscription = pgTable("subscription", {
  // 基本信息
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull(),
  status: text("status").default(subscriptionStatus.ACTIVE).notNull(),

  // 付款类型
  paymentType: text("payment_type").default(paymentTypes.ONE_TIME).notNull(),
  
  // 有效期
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  
  // 交易信息 (用于一次性付款)
  transactionId: text("transaction_id"),
  amount: numeric("amount"), 
  currency: text("currency"),
  
  // 时间戳
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}); 