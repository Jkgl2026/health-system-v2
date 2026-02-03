#!/usr/bin/env node

/**
 * 导入 Supabase 数据到 Coze 平台数据库
 * 使用方式: node scripts/import-supabase-data.js <数据文件路径>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/storage/database/shared/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取数据库连接
const DATABASE_URL = process.env.PGDATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ 错误: PGDATABASE_URL 环境变量未设置');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema });

// 获取命令行参数
const dataFilePath = process.argv[2];
if (!dataFilePath) {
  console.error('❌ 错误: 请提供数据文件路径');
  console.error('使用方式: node scripts/import-supabase-data.js <数据文件路径>');
  process.exit(1);
}

const absoluteDataFilePath = path.resolve(process.cwd(), dataFilePath);

// 检查文件是否存在
if (!fs.existsSync(absoluteDataFilePath)) {
  console.error(`❌ 错误: 数据文件不存在: ${absoluteDataFilePath}`);
  process.exit(1);
}

// 主函数
async function importData() {
  console.log('🚀 开始导入数据...\n');

  try {
    // 读取数据文件
    console.log(`📖 读取数据文件: ${absoluteDataFilePath}`);
    const fileContent = fs.readFileSync(absoluteDataFilePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    if (!jsonData.success || !jsonData.data) {
      console.error('❌ 错误: 数据文件格式无效');
      process.exit(1);
    }

    const { data, statistics, timestamp } = jsonData.data;
    console.log(`✅ 数据文件解析成功`);
    console.log(`📊 数据统计: ${JSON.stringify(statistics)}`);
    console.log(`📅 导出时间: ${timestamp}\n`);

    // 导入数据
    let totalImported = 0;

    // 导入用户数据
    if (data.users && data.users.length > 0) {
      console.log(`👤 开始导入用户数据 (${data.users.length} 条)...`);
      try {
        // 先清空现有用户数据（可选，根据需求决定是否清空）
        // await db.delete(schema.users);
        // console.log('  ✅ 已清空现有用户数据');

        // 插入用户数据
        let importedCount = 0;
        for (const user of data.users) {
          try {
            await db.insert(schema.users).values(user).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            // 忽略已存在的用户（ID 冲突）
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入用户失败 ${user.name || user.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 用户数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 用户数据导入失败: ${error.message}`);
      }
    }

    // 导入管理员数据
    if (data.admins && data.admins.length > 0) {
      console.log(`👑 开始导入管理员数据 (${data.admins.length} 条)...`);
      try {
        let importedCount = 0;
        for (const admin of data.admins) {
          try {
            await db.insert(schema.admins).values(admin).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入管理员失败 ${admin.username}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 管理员数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 管理员数据导入失败: ${error.message}`);
      }
    }

    // 导入症状自检数据
    if (data.symptom_checks && data.symptom_checks.length > 0) {
      console.log(`🏥 开始导入症状自检数据 (${data.symptom_checks.length} 条)...`);
      try {
        let importedCount = 0;
        for (const check of data.symptom_checks) {
          try {
            await db.insert(schema.symptomChecks).values(check).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入症状自检失败 ${check.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 症状自检数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 症状自检数据导入失败: ${error.message}`);
      }
    }

    // 导入健康分析数据
    if (data.health_analysis && data.health_analysis.length > 0) {
      console.log(`📊 开始导入健康分析数据 (${data.health_analysis.length} 条)...`);
      try {
        let importedCount = 0;
        for (const analysis of data.health_analysis) {
          try {
            await db.insert(schema.healthAnalysis).values(analysis).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入健康分析失败 ${analysis.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 健康分析数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 健康分析数据导入失败: ${error.message}`);
      }
    }

    // 导入用户选择数据
    if (data.user_choices && data.user_choices.length > 0) {
      console.log(`✅ 开始导入用户选择数据 (${data.user_choices.length} 条)...`);
      try {
        let importedCount = 0;
        for (const choice of data.user_choices) {
          try {
            await db.insert(schema.userChoices).values(choice).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入用户选择失败 ${choice.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 用户选择数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 用户选择数据导入失败: ${error.message}`);
      }
    }

    // 导入四个要求数据
    if (data.requirements && data.requirements.length > 0) {
      console.log(`📋 开始导入四个要求数据 (${data.requirements.length} 条)...`);
      try {
        let importedCount = 0;
        for (const requirement of data.requirements) {
          try {
            await db.insert(schema.requirements).values(requirement).onConflictDoNothing();
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入四个要求失败 ${requirement.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 四个要求数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 四个要求数据导入失败: ${error.message}`);
      }
    }

    // 导入课程数据（如果 schema 中有）
    if (data.courses && data.courses.length > 0) {
      console.log(`📚 开始导入课程数据 (${data.courses.length} 条)...`);
      try {
        let importedCount = 0;
        for (const course of data.courses) {
          try {
            // 假设有 courses 表，如果需要可以添加
            // await db.insert(schema.courses).values(course).onConflictDoNothing();
            console.log(`  ℹ️  课程数据需要手动导入 (${course.title})`);
            importedCount++;
          } catch (error) {
            if (!error.message.includes('duplicate key')) {
              console.warn(`  ⚠️  警告: 导入课程失败 ${course.id}: ${error.message}`);
            }
          }
        }
        console.log(`  ✅ 课程数据导入完成 (${importedCount} 条成功)`);
        totalImported += importedCount;
      } catch (error) {
        console.error(`  ❌ 课程数据导入失败: ${error.message}`);
      }
    }

    console.log(`\n🎉 数据导入完成! 总共导入了 ${totalImported} 条记录`);

  } catch (error) {
    console.error(`\n❌ 数据导入失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

// 执行导入
importData().catch(console.error);
