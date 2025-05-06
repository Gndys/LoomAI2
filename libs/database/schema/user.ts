import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { userRoles } from "../constants";

// 用户表
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean('email_verified').notNull(),
  image: text("image"),
  role: text("role").default(userRoles.USER).notNull(),
  // 时间戳
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  // 手机相关
  phoneNumber: text("phone_number"),
  phoneNumberVerified: boolean("phone_number_verified").default(false),

  // 支付相关
  stripeCustomerId: text("stripe_customer_id"),
  // better-auth admin  https://www.better-auth.com/docs/plugins/admin#schema
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: numeric('ban_expires')
}); 

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;