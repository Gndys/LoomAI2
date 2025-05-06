import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 创建 drizzle 实例
export const db = drizzle(pool, { schema });

// 导出查询构建器
export const query = {
  user: {
    findFirst: async (params: { where: any }) => {
      const result = await db.select().from(schema.user).where(params.where).limit(1);
      return result[0];
    }
  },
  order: {
    findFirst: async (params: { where: any }) => {
      const result = await db.select().from(schema.order).where(params.where).limit(1);
      return result[0];
    }
  }
};

// 导出数据库客户端
export * from "./client";

// 导出所有模式
export * from './schema';

// 为了保持向后兼容，直接导出常用的表
export const {
  user,
  order,
  subscription,
  // 从 auth.ts 导出的表
  account,
  session,
  verification
} = schema; 