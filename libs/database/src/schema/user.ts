import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

// 用户角色枚举
export const userRoles = {
  ADMIN: "admin",
  USER: "user",
} as const;

// 用户表
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text("image"),
  role: text("role").default(userRoles.USER).notNull(),

  // OAuth2 相关字段
  provider: text("provider"),
  providerId: text("provider_id"),

  // 时间戳
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}); 