import { NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * GET /api/migration/fix-health-analysis
 * 修复 health_analysis 表的 id 列类型问题
 * 将 id 从 varchar/integer 转换为正确的类型
 */
export async function GET() {
  try {
    console.log('[迁移] 开始修复 health_analysis 表...');

    // 检查表是否存在
    const tableExists = await exec_sql(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'health_analysis'
      );
    `);

    if (!tableExists[0].exists) {
      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表不存在，无需修复',
      });
    }

    // 检查 id 列的类型
    const columnInfo = await exec_sql(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'health_analysis' AND column_name = 'id';
    `);

    const currentType = columnInfo[0]?.udt_name || columnInfo[0]?.data_type;
    console.log('[迁移] 当前 id 列类型:', currentType);

    // 如果是 integer 类型，需要重建表为 varchar 类型（UUID）
    if (currentType === 'int4' || currentType === 'integer') {
      console.log('[迁移] 检测到 id 列为 integer 类型，开始转换...');

      // 备份数据
      await exec_sql(`
        CREATE TEMP TABLE health_analysis_backup AS
        SELECT * FROM health_analysis;
      `);

      // 删除旧表
      await exec_sql('DROP TABLE health_analysis CASCADE');

      // 创建新表（使用 UUID）
      await exec_sql(`
        CREATE TABLE health_analysis (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) NOT NULL,
          check_id INTEGER NOT NULL,
          qi_blood INTEGER,
          circulation INTEGER,
          toxins INTEGER,
          blood_lipids INTEGER,
          coldness INTEGER,
          immunity INTEGER,
          emotions INTEGER,
          overall_health INTEGER,
          health_status VARCHAR(50),
          analysis_report TEXT,
          analysis_date TIMESTAMP DEFAULT NOW()
        );
      `);

      // 创建索引
      await exec_sql('CREATE INDEX idx_health_analysis_user_id ON health_analysis(user_id)');
      await exec_sql('CREATE INDEX idx_health_analysis_check_id ON health_analysis(check_id)');

      // 创建触发器
      await exec_sql(`
        CREATE TRIGGER trigger_update_health_analysis_update_time
        BEFORE UPDATE ON health_analysis
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `);

      console.log('[迁移] health_analysis 表重建完成（id 列现在是 VARCHAR UUID 类型）');

      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表已成功重建为 UUID 类型',
      });
    }

    // 如果已经是 varchar 类型，检查是否需要调整
    if (currentType === 'varchar' || currentType === 'uuid') {
      console.log('[迁移] id 列已经是 varchar/uuid 类型，无需修复');

      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表结构正确，无需修复',
      });
    }

    return NextResponse.json({
      code: 200,
      message: `health_analysis 表的 id 列类型为 ${currentType}，未知的类型`,
    });

  } catch (error: any) {
    console.error('[迁移] 修复失败:', error);

    return NextResponse.json({
      code: 500,
      message: '修复失败',
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/migration/fix-health-analysis
 * 强制重建 health_analysis 表
 */
export async function POST() {
  try {
    console.log('[迁移] 强制重建 health_analysis 表...');

    // 删除旧表
    await exec_sql('DROP TABLE IF EXISTS health_analysis CASCADE');

    // 创建新表（使用 UUID）
    await exec_sql(`
      CREATE TABLE health_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        check_id INTEGER NOT NULL,
        qi_blood INTEGER,
        circulation INTEGER,
        toxins INTEGER,
        blood_lipids INTEGER,
        coldness INTEGER,
        immunity INTEGER,
        emotions INTEGER,
        overall_health INTEGER,
        health_status VARCHAR(50),
        analysis_report TEXT,
        analysis_date TIMESTAMP DEFAULT NOW()
      );
    `);

    // 创建索引
    await exec_sql('CREATE INDEX idx_health_analysis_user_id ON health_analysis(user_id)');
    await exec_sql('CREATE INDEX idx_health_analysis_check_id ON health_analysis(check_id)');

    // 创建触发器
    await exec_sql(`
      CREATE TRIGGER trigger_update_health_analysis_update_time
      BEFORE UPDATE ON health_analysis
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `);

    console.log('[迁移] health_analysis 表强制重建完成');

    return NextResponse.json({
      code: 200,
      message: 'health_analysis 表已成功强制重建',
    });

  } catch (error: any) {
    console.error('[迁移] 强制重建失败:', error);

    return NextResponse.json({
      code: 500,
      message: '强制重建失败',
      error: error.message,
    }, { status: 500 });
  }
}
