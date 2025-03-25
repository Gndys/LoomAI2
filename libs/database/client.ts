import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();
console.log('process.env.DATABASE_URL', process.env.DATABASE_URL);
// 获取数据库连接字符串
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL 环境变量未设置");
}

const { Pool } = pg;
// 创建连接池
export const pool = new Pool({
  connectionString,
});

// 创建 Drizzle 客户端
export const db = drizzle(pool); 