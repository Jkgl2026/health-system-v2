import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 导入数据到数据库
 * POST /api/data/import
 *
 * 请求体格式：
 * {
 *   "data": {
 *     "users": [...],
 *     "admins": [...],
 *     "courses": [...],
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({
        success: false,
        message: '缺少数据'
      }, { status: 400 });
    }

    // 连接数据库
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: process.env.PGDATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await client.connect();

    try {
      const results: Record<string, any> = {};
      const errors: string[] = [];

      // 导入用户数据
      if (data.users && Array.isArray(data.users)) {
        try {
          for (const user of data.users) {
            await client.query(`
              INSERT INTO users (id, name, phone, email, age, gender, weight, height, blood_pressure, occupation, address, bmi, created_at, updated_at, deleted_at, phone_group_id, is_latest_version)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                age = EXCLUDED.age,
                gender = EXCLUDED.gender,
                weight = EXCLUDED.weight,
                height = EXCLUDED.height,
                blood_pressure = EXCLUDED.blood_pressure,
                occupation = EXCLUDED.occupation,
                address = EXCLUDED.address,
                bmi = EXCLUDED.bmi,
                updated_at = EXCLUDED.updated_at,
                deleted_at = EXCLUDED.deleted_at,
                phone_group_id = EXCLUDED.phone_group_id,
                is_latest_version = EXCLUDED.is_latest_version
            `, [
              user.id,
              user.name,
              user.phone || null,
              user.email || null,
              user.age || null,
              user.gender || null,
              user.weight || null,
              user.height || null,
              user.blood_pressure || null,
              user.occupation || null,
              user.address || null,
              user.bmi || null,
              user.created_at || new Date().toISOString(),
              user.updated_at || null,
              user.deleted_at || null,
              user.phone_group_id || null,
              user.is_latest_version !== undefined ? user.is_latest_version : true
            ]);
          }
          results.users = `成功导入 ${data.users.length} 个用户`;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          errors.push(`导入用户失败: ${errorMsg}`);
          results.users = `导入用户失败: ${errorMsg}`;
        }
      }

      // 导入管理员数据
      if (data.admins && Array.isArray(data.admins)) {
        try {
          for (const admin of data.admins) {
            await client.query(`
              INSERT INTO admins (id, username, password_hash, full_name, status, last_login_at, last_login_ip, failed_login_attempts, locked_until, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO UPDATE SET
                username = EXCLUDED.username,
                password_hash = EXCLUDED.password_hash,
                full_name = EXCLUDED.full_name,
                status = EXCLUDED.status,
                last_login_at = EXCLUDED.last_login_at,
                last_login_ip = EXCLUDED.last_login_ip,
                failed_login_attempts = EXCLUDED.failed_login_attempts,
                locked_until = EXCLUDED.locked_until,
                updated_at = EXCLUDED.updated_at
            `, [
              admin.id,
              admin.username,
              admin.password_hash,
              admin.full_name || null,
              admin.status || 'active',
              admin.last_login_at || null,
              admin.last_login_ip || null,
              admin.failed_login_attempts || 0,
              admin.locked_until || null,
              admin.created_at || new Date().toISOString(),
              admin.updated_at || new Date().toISOString()
            ]);
          }
          results.admins = `成功导入 ${data.admins.length} 个管理员`;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          errors.push(`导入管理员失败: ${errorMsg}`);
          results.admins = `导入管理员失败: ${errorMsg}`;
        }
      }

      // 导入课程数据
      if (data.courses && Array.isArray(data.courses)) {
        try {
          for (const course of data.courses) {
            await client.query(`
              INSERT INTO courses (id, title, description, content, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                content = EXCLUDED.content,
                updated_at = EXCLUDED.updated_at
            `, [
              course.id,
              course.title,
              course.description || null,
              course.content || null,
              course.created_at || new Date().toISOString(),
              course.updated_at || new Date().toISOString()
            ]);
          }
          results.courses = `成功导入 ${data.courses.length} 个课程`;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          errors.push(`导入课程失败: ${errorMsg}`);
          results.courses = `导入课程失败: ${errorMsg}`;
        }
      }

      // 导入其他数据（如果存在）
      const otherTables = ['symptom_checks', 'health_analysis', 'user_choices', 'requirements', 'audit_logs', 'migration_history'];
      for (const tableName of otherTables) {
        if (data[tableName] && Array.isArray(data[tableName])) {
          try {
            // 这里需要根据表结构动态生成插入语句
            // 为了简化，暂时跳过
            results[tableName] = `跳过 ${tableName} (需要手动配置)`;
          } catch (error) {
            errors.push(`导入 ${tableName} 失败`);
          }
        }
      }

      return NextResponse.json({
        success: errors.length === 0,
        message: errors.length === 0 ? '数据导入成功' : '数据导入部分成功',
        data: {
          results: results,
          errors: errors,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '导入数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * GET /api/data/import
 * 获取导入状态
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '数据导入 API 已就绪',
    data: {
      status: 'ready',
      instructions: '使用 POST 方法导入数据',
      supportedTables: ['users', 'admins', 'courses', 'symptom_checks', 'health_analysis', 'user_choices', 'requirements', 'audit_logs', 'migration_history']
    }
  });
}
