import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 数据库连接池
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  }
  return pool;
}

// 创建表
async function ensureTables() {
  const client = await getPool().connect();
  try {
    // 面诊用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS face_diagnosis_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        age INTEGER,
        gender VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, phone)
      )
    `);

    // 添加 age 和 gender 字段（如果不存在）
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'face_diagnosis_users' AND column_name = 'age') THEN
          ALTER TABLE face_diagnosis_users ADD COLUMN age INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'face_diagnosis_users' AND column_name = 'gender') THEN
          ALTER TABLE face_diagnosis_users ADD COLUMN gender VARCHAR(10);
        END IF;
      END $$;
    `);

    // 面诊记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS face_diagnosis_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES face_diagnosis_users(id),
        diagnosis_date TIMESTAMP DEFAULT NOW(),
        
        -- 体质类型
        constitution VARCHAR(50),
        
        -- 面色分析
        face_color TEXT,
        
        -- 面部特征（JSON）
        features JSONB DEFAULT '{}',
        
        -- 健康提示（JSON数组）
        health_hints JSONB DEFAULT '[]',
        
        -- AI详细分析
        ai_analysis TEXT,
        
        -- 建议（JSON数组）
        recommendations JSONB DEFAULT '[]',
        
        -- 图片缩略图
        image_thumbnail TEXT,
        
        -- 完整报告
        full_report TEXT,
        
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 创建索引 - 注意顺序，先确保表存在
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_face_users_name ON face_diagnosis_users(name);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_face_users_phone ON face_diagnosis_users(phone);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_face_records_user_id ON face_diagnosis_records(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_face_records_date ON face_diagnosis_records(diagnosis_date);
    `);

    console.log('[FaceDiagnosisRecords] 表结构检查完成');
  } finally {
    client.release();
  }
}

// GET /api/face-diagnosis-records
export async function GET(request: NextRequest) {
  try {
    await ensureTables();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const recordId = searchParams.get('recordId');
    const searchName = searchParams.get('name');
    const searchPhone = searchParams.get('phone');

    const client = await getPool().connect();
    
    try {
      // 获取用户列表
      if (action === 'users') {
        const result = await client.query(`
          SELECT 
            u.id, u.name, u.phone, u.age, u.gender, u.created_at,
            COUNT(r.id) as diagnosis_count,
            MAX(r.diagnosis_date) as last_diagnosis_date
          FROM face_diagnosis_users u
          LEFT JOIN face_diagnosis_records r ON u.id = r.user_id
          GROUP BY u.id, u.name, u.phone, u.age, u.gender, u.created_at
          ORDER BY u.created_at DESC
        `);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      // 搜索用户
      if (action === 'search') {
        let query = `SELECT * FROM face_diagnosis_users WHERE 1=1`;
        const params: any[] = [];
        
        if (searchName) {
          params.push(`%${searchName}%`);
          query += ` AND name ILIKE $${params.length}`;
        }
        if (searchPhone) {
          params.push(`%${searchPhone}%`);
          query += ` AND phone ILIKE $${params.length}`;
        }
        
        query += ` ORDER BY created_at DESC LIMIT 20`;
        
        const result = await client.query(query, params);
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      // 获取用户的诊断记录
      if (action === 'userRecords' && userId) {
        const result = await client.query(`
          SELECT 
            id, diagnosis_date, constitution, face_color,
            health_hints, ai_analysis
          FROM face_diagnosis_records
          WHERE user_id = $1
          ORDER BY diagnosis_date DESC
        `, [userId]);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      // 获取记录详情
      if (action === 'detail' && recordId) {
        const result = await client.query(`
          SELECT r.*, u.name, u.phone, u.age, u.gender
          FROM face_diagnosis_records r
          JOIN face_diagnosis_users u ON r.user_id = u.id
          WHERE r.id = $1
        `, [recordId]);
        
        if (result.rows.length === 0) {
          return NextResponse.json({ success: false, error: '记录不存在' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      }
      
      // 获取最近记录
      if (action === 'recent') {
        const limit = parseInt(searchParams.get('limit') || '20');
        const result = await client.query(`
          SELECT 
            r.id, r.diagnosis_date, r.constitution, r.face_color,
            r.health_hints, r.ai_analysis,
            u.id as user_id, u.name, u.phone, u.age, u.gender
          FROM face_diagnosis_records r
          JOIN face_diagnosis_users u ON r.user_id = u.id
          ORDER BY r.diagnosis_date DESC
          LIMIT $1
        `, [limit]);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[FaceDiagnosisRecords] GET错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

// POST /api/face-diagnosis-records
export async function POST(request: NextRequest) {
  try {
    await ensureTables();
    
    const body = await request.json();
    const { action, name, phone, age, gender, userId, diagnosisData } = body;

    const client = await getPool().connect();
    
    try {
      // 创建或查找用户
      if (action === 'createUser') {
        if (!name?.trim()) {
          return NextResponse.json({ success: false, error: '姓名不能为空' }, { status: 400 });
        }
        
        // 查找已有用户
        let result = await client.query(
          `SELECT * FROM face_diagnosis_users WHERE name = $1 AND (phone = $2 OR ($2 IS NULL AND phone IS NULL))`,
          [name.trim(), phone?.trim() || null]
        );
        
        if (result.rows.length > 0) {
          // 更新年龄和性别（如果提供了）
          if (age !== undefined || gender !== undefined) {
            result = await client.query(
              `UPDATE face_diagnosis_users SET age = COALESCE($1, age), gender = COALESCE($2, gender), updated_at = NOW() WHERE id = $3 RETURNING *`,
              [age || null, gender || null, result.rows[0].id]
            );
          }
          return NextResponse.json({ success: true, data: result.rows[0] });
        }
        
        // 创建新用户
        result = await client.query(
          `INSERT INTO face_diagnosis_users (name, phone, age, gender) VALUES ($1, $2, $3, $4) RETURNING *`,
          [name.trim(), phone?.trim() || null, age || null, gender || null]
        );
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      }
      
      // 保存诊断记录
      if (action === 'saveDiagnosis' && userId) {
        const {
          constitution,
          faceColor,
          features,
          healthHints,
          aiAnalysis,
          recommendations,
          imageThumbnail,
          fullReport,
        } = diagnosisData || {};
        
        const result = await client.query(`
          INSERT INTO face_diagnosis_records (
            user_id, constitution, face_color, features, health_hints,
            ai_analysis, recommendations, image_thumbnail, full_report
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          userId,
          constitution || null,
          faceColor || null,
          JSON.stringify(features || {}),
          JSON.stringify(healthHints || []),
          aiAnalysis || null,
          JSON.stringify(recommendations || []),
          imageThumbnail || null,
          fullReport || null,
        ]);
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      }
      
      // 删除记录
      if (action === 'deleteRecord' && body.recordId) {
        await client.query(`DELETE FROM face_diagnosis_records WHERE id = $1`, [body.recordId]);
        return NextResponse.json({ success: true });
      }
      
      // 删除用户及其所有记录
      if (action === 'deleteUser' && body.deleteUserId) {
        await client.query(`DELETE FROM face_diagnosis_records WHERE user_id = $1`, [body.deleteUserId]);
        await client.query(`DELETE FROM face_diagnosis_users WHERE id = $1`, [body.deleteUserId]);
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[FaceDiagnosisRecords] POST错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
