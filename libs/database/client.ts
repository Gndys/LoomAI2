import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
import { config } from '@config';

const { Pool } = pg;

// 创建连接池
export const pool = new Pool({
  connectionString: config.database.url,
});

// 创建 Drizzle 客户端
export const db = drizzle(pool); 