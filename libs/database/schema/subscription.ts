import { pgTable, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { user } from "./user";

// 订阅状态枚举
export const subscriptionStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
  CANCELLED: "canceled", // Alias for compatibility
  PAST_DUE: "past_due",
  UNPAID: "unpaid",
  TRIALING: "trialing",
  INACTIVE: "inactive"
} as const;

// 支付类型枚举
export const paymentTypes = {
  ONE_TIME: "one_time",
  RECURRING: "recurring"
} as const;

// 订阅表
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  planId: text("plan_id").notNull(), // 对应 config.payment.plans 中的 id
  status: text("status").notNull(), // active, canceled, past_due, unpaid, trialing
  paymentType: text("payment_type").notNull(), // one_time, recurring
  
  // Stripe 相关字段
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Creem 相关字段
  creemCustomerId: text("creem_customer_id"),
  creemSubscriptionId: text("creem_subscription_id"),
  
  // 订阅周期
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),

  // 元数据
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); 