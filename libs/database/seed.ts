import * as dotenv from "dotenv";
import * as path from "path";
import { auth } from "@libs/auth";
import { db } from "./client";
import { user, account } from "./schema";
import { eq } from "drizzle-orm";

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 生成用户ID
 */
function generateUserId(): string {
  return `user_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 生成账户ID
 */
function generateAccountId(): string {
  return `account_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 填充测试数据
 */
async function seedDatabase() {
  try {
    console.log("⚙️ 开始填充测试数据...");
    
    // 获取 Better Auth 上下文以使用密码哈希功能
    const ctx = await auth.$context;
    
    // 创建管理员用户
    console.log("创建管理员用户...");
    try {
      // 检查管理员是否已存在
      const existingAdmin = await db.select().from(user).where(eq(user.email, "admin@example.com")).limit(1);
      
      if (existingAdmin.length > 0) {
        console.log("✓ 管理员用户已存在: admin@example.com");
      } else {
        // 生成密码哈希
        const adminPasswordHash = await ctx.password.hash("admin123");
        const adminUserId = generateUserId();
        
        // 插入管理员用户
        await db.insert(user).values({
          id: adminUserId,
          email: "admin@example.com",
          name: "管理员",
          emailVerified: true,
          role: "admin"
        });
        
        // 插入密码账户记录
        await db.insert(account).values({
          id: generateAccountId(),
          accountId: generateAccountId(),
          providerId: "credential",
          userId: adminUserId,
          password: adminPasswordHash,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log("✓ 已创建管理员用户: admin@example.com");
      }
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint") || error.code === "23505") {
        console.log("✓ 管理员用户已存在: admin@example.com");
      } else {
        console.error("❌ 创建管理员失败:", error.message || error);
        return false;
      }
    }

    // 创建普通用户
    console.log("创建普通用户...");
    try {
      // 检查普通用户是否已存在
      const existingUser = await db.select().from(user).where(eq(user.email, "user@example.com")).limit(1);
      
      if (existingUser.length > 0) {
        console.log("✓ 普通用户已存在: user@example.com");
      } else {
        // 生成密码哈希
        const userPasswordHash = await ctx.password.hash("user123456");
        const normalUserId = generateUserId();
        
        // 插入普通用户
        await db.insert(user).values({
          id: normalUserId,
          email: "user@example.com",
          name: "测试用户",
          emailVerified: true,
          role: "user"
        });
        
        // 插入密码账户记录
        await db.insert(account).values({
          id: generateAccountId(),
          accountId: generateAccountId(),
          providerId: "credential",
          userId: normalUserId,
          password: userPasswordHash,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log("✓ 已创建普通用户: user@example.com");
      }
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint") || error.code === "23505") {
        console.log("✓ 普通用户已存在: user@example.com");
      } else {
        console.error("❌ 创建普通用户失败:", error.message || error);
        return false;
      }
    }
    
    console.log("\n✅ 数据填充完成!");
    console.log("测试账户信息:");
    console.log("管理员 - 邮箱: admin@example.com, 密码: admin123");
    console.log("普通用户 - 邮箱: user@example.com, 密码: user123456");
    
    return true;
  } catch (error) {
    console.error("❌ 数据填充过程中发生错误:", error);
    return false;
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