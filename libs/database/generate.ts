import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

/**
 * 生成数据库迁移文件
 */
async function generateMigration() {
  try {
    console.log("开始生成数据库迁移文件...");
    
    // 确保 drizzle 目录存在
    const drizzleDir = join(__dirname, '../drizzle');
    if (!fs.existsSync(drizzleDir)) {
      fs.mkdirSync(drizzleDir, { recursive: true });
    }
    
    // 执行 drizzle-kit generate 命令
    console.log("执行 drizzle-kit generate:pg 命令...");
    try {
      execSync('npx drizzle-kit generate:pg', {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
      console.log("迁移文件生成成功!");
    } catch (error) {
      console.error("生成迁移文件失败:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("生成迁移文件过程发生错误:", error);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const success = await generateMigration();
    if (success) {
      console.log("✅ 迁移文件生成完成");
    } else {
      console.error("❌ 迁移文件生成失败");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ 发生错误:", error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
}

export { generateMigration }; 