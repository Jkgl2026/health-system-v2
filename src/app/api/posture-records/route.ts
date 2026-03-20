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

// 创建表（如果不存在）
async function ensureTables() {
  const client = await getPool().connect();
  try {
    // 用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS posture_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, phone)
      )
    `);

    // 评估记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS posture_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES posture_users(id),
        assessment_date TIMESTAMP DEFAULT NOW(),
        overall_score INTEGER,
        grade VARCHAR(1),
        
        -- 检测到的问题（JSON数组）
        issues JSONB DEFAULT '[]',
        
        -- 角度数据（JSON对象）
        angles JSONB DEFAULT '{}',
        
        -- 肌肉分析（JSON对象）
        muscles JSONB DEFAULT '{}',
        
        -- 健康风险（JSON数组）
        health_risks JSONB DEFAULT '[]',
        
        -- AI分析摘要
        ai_summary TEXT,
        
        -- AI详细分析（JSON对象）
        ai_detailed_analysis JSONB DEFAULT '{}',
        
        -- 中医分析（JSON对象）
        tcm_analysis JSONB DEFAULT '{}',
        
        -- 训练计划（JSON对象）
        training_plan JSONB DEFAULT '{}',
        
        -- 图片缩略图（Base64）
        image_front TEXT,
        image_left TEXT,
        image_right TEXT,
        image_back TEXT,
        
        -- 标注图（Base64）
        annotation_front TEXT,
        annotation_left TEXT,
        annotation_right TEXT,
        annotation_back TEXT,
        
        -- 备注
        notes TEXT,
        
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 创建索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posture_users_name ON posture_users(name);
      CREATE INDEX IF NOT EXISTS idx_posture_users_phone ON posture_users(phone);
      CREATE INDEX IF NOT EXISTS idx_posture_assessments_user_id ON posture_assessments(user_id);
      CREATE INDEX IF NOT EXISTS idx_posture_assessments_date ON posture_assessments(assessment_date);
    `);

    console.log('[PostureRecords] 表结构检查完成');
  } finally {
    client.release();
  }
}

// GET /api/posture-records - 查询用户和记录
export async function GET(request: NextRequest) {
  try {
    await ensureTables();
    
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const userId = searchParams.get('userId');
    const recordId = searchParams.get('recordId');
    
    const pool = getPool();
    
    // 列出所有用户
    if (action === 'users') {
      const result = await pool.query(`
        SELECT 
          u.id, u.name, u.phone, u.created_at,
          COUNT(a.id) as assessment_count,
          MAX(a.assessment_date) as last_assessment_date,
          AVG(a.overall_score) as avg_score
        FROM posture_users u
        LEFT JOIN posture_assessments a ON u.id = a.user_id
        GROUP BY u.id, u.name, u.phone, u.created_at
        ORDER BY u.created_at DESC
      `);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    }
    
    // 按名字查询用户
    if (action === 'search' && name) {
      const result = await pool.query(`
        SELECT 
          u.id, u.name, u.phone, u.created_at,
          COUNT(a.id) as assessment_count,
          MAX(a.assessment_date) as last_assessment_date
        FROM posture_users u
        LEFT JOIN posture_assessments a ON u.id = a.user_id
        WHERE u.name ILIKE $1
        GROUP BY u.id, u.name, u.phone, u.created_at
        ORDER BY u.created_at DESC
      `, [`%${name}%`]);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    }
    
    // 按电话查询用户
    if (action === 'search' && phone) {
      const result = await pool.query(`
        SELECT 
          u.id, u.name, u.phone, u.created_at,
          COUNT(a.id) as assessment_count,
          MAX(a.assessment_date) as last_assessment_date
        FROM posture_users u
        LEFT JOIN posture_assessments a ON u.id = a.user_id
        WHERE u.phone LIKE $1
        GROUP BY u.id, u.name, u.phone, u.created_at
        ORDER BY u.created_at DESC
      `, [`%${phone}%`]);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    }
    
    // 获取用户的所有评估记录
    if (action === 'records' && userId) {
      const result = await pool.query(`
        SELECT 
          id, assessment_date, overall_score, grade,
          issues, ai_summary,
          image_front, annotation_front
        FROM posture_assessments
        WHERE user_id = $1
        ORDER BY assessment_date DESC
      `, [userId]);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    }
    
    // 获取单条记录详情
    if (action === 'detail' && recordId) {
      const result = await pool.query(`
        SELECT * FROM posture_assessments WHERE id = $1
      `, [recordId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '记录不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    }
    
    // 获取统计信息
    if (action === 'stats') {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(a.id) as total_assessments,
          AVG(a.overall_score) as avg_score,
          MAX(a.assessment_date) as last_assessment_date
        FROM posture_users u
        LEFT JOIN posture_assessments a ON u.id = a.user_id
      `);
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    }
    
    // 默认：列出最近的评估记录
    const result = await pool.query(`
      SELECT 
        a.id, a.user_id, a.assessment_date, a.overall_score, a.grade,
        a.issues, a.ai_summary,
        u.name, u.phone
      FROM posture_assessments a
      JOIN posture_users u ON a.user_id = u.id
      ORDER BY a.assessment_date DESC
      LIMIT 50
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
    });
    
  } catch (error) {
    console.error('[PostureRecords] GET 错误:', error);
    return NextResponse.json(
      { success: false, error: '查询失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/posture-records - 创建用户或保存评估记录
export async function POST(request: NextRequest) {
  try {
    await ensureTables();
    
    const body = await request.json();
    const { action, name, phone, userId, assessmentData } = body;
    
    const pool = getPool();
    
    // 创建或查找用户
    if (action === 'createUser') {
      if (!name) {
        return NextResponse.json(
          { success: false, error: '姓名不能为空' },
          { status: 400 }
        );
      }
      
      // 检查用户是否已存在
      const existingUser = await pool.query(
        'SELECT * FROM posture_users WHERE name = $1 AND (phone = $2 OR ($2 IS NULL AND phone IS NULL))',
        [name, phone || null]
      );
      
      if (existingUser.rows.length > 0) {
        return NextResponse.json({
          success: true,
          data: existingUser.rows[0],
          message: '用户已存在',
        });
      }
      
      // 创建新用户
      const result = await pool.query(
        'INSERT INTO posture_users (name, phone) VALUES ($1, $2) RETURNING *',
        [name, phone || null]
      );
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: '用户创建成功',
      });
    }
    
    // 保存评估记录
    if (action === 'saveAssessment') {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: '用户ID不能为空' },
          { status: 400 }
        );
      }
      
      const {
        overallScore,
        grade,
        issues,
        angles,
        muscles,
        healthRisks,
        aiSummary,
        aiDetailedAnalysis,
        tcmAnalysis,
        trainingPlan,
        images,
        annotations,
        notes,
      } = assessmentData || {};
      
      const result = await pool.query(`
        INSERT INTO posture_assessments (
          user_id, overall_score, grade,
          issues, angles, muscles, health_risks,
          ai_summary, ai_detailed_analysis, tcm_analysis, training_plan,
          image_front, image_left, image_right, image_back,
          annotation_front, annotation_left, annotation_right, annotation_back,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        userId,
        overallScore || 0,
        grade || 'C',
        JSON.stringify(issues || []),
        JSON.stringify(angles || {}),
        JSON.stringify(muscles || {}),
        JSON.stringify(healthRisks || []),
        aiSummary || '',
        JSON.stringify(aiDetailedAnalysis || {}),
        JSON.stringify(tcmAnalysis || {}),
        JSON.stringify(trainingPlan || {}),
        images?.front || null,
        images?.left || null,
        images?.right || null,
        images?.back || null,
        annotations?.front || null,
        annotations?.left || null,
        annotations?.right || null,
        annotations?.back || null,
        notes || '',
      ]);
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: '评估记录保存成功',
      });
    }
    
    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('[PostureRecords] POST 错误:', error);
    return NextResponse.json(
      { success: false, error: '操作失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posture-records - 删除记录
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('recordId');
    const userId = searchParams.get('userId');
    
    const pool = getPool();
    
    if (recordId) {
      // 删除单条记录
      await pool.query('DELETE FROM posture_assessments WHERE id = $1', [recordId]);
      return NextResponse.json({
        success: true,
        message: '记录已删除',
      });
    }
    
    if (userId) {
      // 删除用户及其所有记录
      await pool.query('DELETE FROM posture_assessments WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM posture_users WHERE id = $1', [userId]);
      return NextResponse.json({
        success: true,
        message: '用户及其所有记录已删除',
      });
    }
    
    return NextResponse.json(
      { success: false, error: '缺少参数' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('[PostureRecords] DELETE 错误:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
