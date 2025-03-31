import { pool } from "./client";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { role } from "better-auth/plugins/access";

dotenv.config({ path: "../../../.env" });

/**
 * 生成随机ID
 */
function generateId(prefix: string = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * 填充测试数据
 */
async function seedDatabase() {
  try {
    console.log("正在连接数据库...");
    const client = await pool.connect();
    
    console.log("⚙️ 开始填充测试数据...");
    
    // 检查users表是否存在
    const { rows: tableCheck } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck[0].exists) {
      console.error("❌ 数据库表不存在，请先运行迁移命令");
      client.release();
      return false;
    }
    
    // 开始事务
    await client.query("BEGIN;");
    
    try {
      // 清空现有数据（可选）
      await client.query("TRUNCATE users CASCADE;");
      
      // 添加测试用户
      const testUsers = [
        {
          id: generateId("user"),
          email: "admin@example.com",
          name: "管理员",
          passwordHash: crypto.createHash("sha256").update("adminpassword123").digest("hex"),
          emailVerified: true,
          avatar: "https://i.pravatar.cc/150?u=admin@example.com",
          provider: "credentials",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateId("user"),
          email: "user@example.com",
          name: "测试用户",
          passwordHash: crypto.createHash("sha256").update("userpassword123").digest("hex"),
          emailVerified: true,
          avatar: "https://i.pravatar.cc/150?u=user@example.com",
          provider: "credentials",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateId("user"),
          email: "oauth@example.com",
          name: "OAuth用户",
          emailVerified: true,
          avatar: "https://i.pravatar.cc/150?u=oauth@example.com",
          provider: "google",
          providerId: "google_12345",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      for (const user of testUsers) {
        await client.query(`
          INSERT INTO users (
            id, email, name, password_hash, email_verified, avatar, provider, provider_id, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          );
        `, [
          user.id,
          user.email,
          user.name,
          user.passwordHash || null,
          user.emailVerified,
          user.avatar,
          user.provider,
          user.providerId || null,
          user.createdAt,
          user.updatedAt
        ]);
        console.log(`✓ 已添加用户: ${user.email}`);
      }
      
      // 添加订阅数据
      const testSubscriptions = [
        {
          id: generateId("sub"),
          userId: testUsers[0].id,
          planId: "pro",
          status: "active",
          paymentType: "subscription",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateId("sub"),
          userId: testUsers[1].id,
          planId: "basic",
          status: "active",
          paymentType: "one_time",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      for (const subscription of testSubscriptions) {
        await client.query(`
          INSERT INTO subscriptions (
            id, user_id, plan_id, status, payment_type, start_date, end_date, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          );
        `, [
          subscription.id,
          subscription.userId,
          subscription.planId,
          subscription.status,
          subscription.paymentType,
          subscription.startDate,
          subscription.endDate,
          subscription.createdAt,
          subscription.updatedAt
        ]);
        console.log(`✓ 已添加订阅: ${subscription.id} (用户: ${subscription.userId})`);
      }
      
      // 提交事务
      await client.query("COMMIT;");
      console.log("✅ 数据填充完成!");
      client.release();
      return true;
    } catch (err) {
      // 回滚事务
      await client.query("ROLLBACK;");
      console.error("❌ 数据填充失败:", err);
      client.release();
      return false;
    }
  } catch (error) {
    console.error("❌ 数据填充过程中发生错误:", error);
    return false;
  } finally {
    await pool.end();
  }
}

// 如果直接运行此文件，执行数据填充
if (require.main === module) {
  seedDatabase()
    .then((success) => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("发生错误:", error);
      process.exit(1);
    });
}

export { seedDatabase }; 