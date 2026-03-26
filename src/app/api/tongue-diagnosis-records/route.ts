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

// 创建表 - 使用 UUID 以与 migrate-diagnosis-tables 保持一致
async function ensureTables() {
  const client = await getPool().connect();
  try {
    // 舌诊用户表 - 使用 INTEGER 主键（与远端数据库一致）
    await client.query(`
      CREATE TABLE IF NOT EXISTS tongue_diagnosis_users (
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

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tongue_users_name ON tongue_diagnosis_users(name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tongue_users_phone ON tongue_diagnosis_users(phone)`);

    // 舌诊记录表 - 使用 INTEGER 主键（与远端数据库一致）
    await client.query(`
      CREATE TABLE IF NOT EXISTS tongue_diagnosis_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES tongue_diagnosis_users(id) ON DELETE CASCADE,
        image_url TEXT,
        score INTEGER,
        tongue_body JSONB,
        tongue_coating JSONB,
        constitution JSONB,
        organ_status JSONB,
        suggestions JSONB,
        full_report TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // 创建索引（注意：远端数据库中的表可能没有 score 字段）
    await client.query(`CREATE INDEX IF NOT EXISTS tongue_diagnosis_records_user_id_idx ON tongue_diagnosis_records(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS tongue_diagnosis_records_created_at_idx ON tongue_diagnosis_records(created_at)`);

    console.log('[TongueDiagnosisRecords] 表结构检查完成');
  } finally {
    client.release();
  }
}

// GET /api/tongue-diagnosis-records
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
            MAX(r.created_at) as last_diagnosis_date
          FROM tongue_diagnosis_users u
          LEFT JOIN tongue_diagnosis_records r ON u.id = r.user_id
          GROUP BY u.id, u.name, u.phone, u.age, u.gender, u.created_at
          ORDER BY u.created_at DESC
        `);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      // 搜索用户
      if (action === 'search') {
        let query = `SELECT * FROM tongue_diagnosis_users WHERE 1=1`;
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
            id, created_at as diagnosis_date, constitution, tongue_body, tongue_coating,
            suggestions, full_report, score
          FROM tongue_diagnosis_records
          WHERE user_id = $1
          ORDER BY created_at DESC
        `, [userId]);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      // 获取记录详情
      if (action === 'detail' && recordId) {
        const result = await client.query(`
          SELECT r.*, u.name, u.phone, u.age, u.gender
          FROM tongue_diagnosis_records r
          JOIN tongue_diagnosis_users u ON r.user_id = u.id
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
            r.id, r.created_at as diagnosis_date, r.tongue_body, r.tongue_coating,
            r.constitution, r.suggestions, r.full_report, r.score,
            u.id as user_id, u.name, u.phone, u.age, u.gender
          FROM tongue_diagnosis_records r
          JOIN tongue_diagnosis_users u ON r.user_id = u.id
          ORDER BY r.created_at DESC
          LIMIT $1
        `, [limit]);
        
        return NextResponse.json({ success: true, data: result.rows });
      }
      
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[TongueDiagnosisRecords] GET错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

// POST /api/tongue-diagnosis-records
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
          `SELECT * FROM tongue_diagnosis_users WHERE name = $1 AND (phone = $2 OR ($2 IS NULL AND phone IS NULL))`,
          [name.trim(), phone?.trim() || null]
        );
        
        if (result.rows.length > 0) {
          // 更新年龄和性别（如果提供了）
          if (age !== undefined || gender !== undefined) {
            result = await client.query(
              `UPDATE tongue_diagnosis_users SET age = COALESCE($1, age), gender = COALESCE($2, gender), updated_at = NOW() WHERE id = $3 RETURNING *`,
              [age || null, gender || null, result.rows[0].id]
            );
          }
          return NextResponse.json({ success: true, data: result.rows[0] });
        }
        
        // 创建新用户（UUID 会自动生成）
        result = await client.query(
          `INSERT INTO tongue_diagnosis_users (name, phone, age, gender) VALUES ($1, $2, $3, $4) RETURNING *`,
          [name.trim(), phone?.trim() || null, age || null, gender || null]
        );
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      }
      
      // 保存诊断记录
      if (action === 'saveDiagnosis' && userId) {
        const {
          imageUrl,
          score,
          tongueBody,
          tongueCoating,
          constitution,
          organStatus,
          suggestions,
          fullReport,
        } = diagnosisData || {};
        
        const result = await client.query(`
          INSERT INTO tongue_diagnosis_records (
            user_id, image_url, score, tongue_body, tongue_coating,
            constitution, organ_status, suggestions, full_report
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          userId,
          imageUrl || null,
          score || null,
          tongueBody || null,
          tongueCoating || null,
          constitution || null,
          organStatus || null,
          suggestions || null,
          fullReport || null,
        ]);
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      }
      
      // 删除记录
      if (action === 'deleteRecord' && body.recordId) {
        await client.query(`DELETE FROM tongue_diagnosis_records WHERE id = $1`, [body.recordId]);
        return NextResponse.json({ success: true });
      }
      
      // 删除用户及其所有记录
      if (action === 'deleteUser' && body.deleteUserId) {
        await client.query(`DELETE FROM tongue_diagnosis_records WHERE user_id = $1`, [body.deleteUserId]);
        await client.query(`DELETE FROM tongue_diagnosis_users WHERE id = $1`, [body.deleteUserId]);
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[TongueDiagnosisRecords] POST错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
