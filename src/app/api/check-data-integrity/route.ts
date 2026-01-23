import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/check-data-integrity - 检查数据完整性
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const issues: any[] = [];

    // 1. 检查孤立记录（没有关联用户的记录）
    console.log('[数据完整性检查] 检查孤立记录...');

    // 检查 requirements 表中的孤立记录
    const orphanedRequirements = await db.execute(`
      SELECT r.id, r.user_id FROM requirements r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphanedRequirements && orphanedRequirements.length > 0) {
      issues.push({
        type: 'ORPHANED_RECORD',
        severity: 'HIGH',
        table: 'requirements',
        count: orphanedRequirements.length,
        description: `${orphanedRequirements.length} 条 requirements 记录没有关联的用户`,
        data: orphanedRequirements.slice(0, 5),
      });
    }

    // 检查 symptom_checks 表中的孤立记录
    const orphanedSymptomChecks = await db.execute(`
      SELECT sc.id, sc.user_id FROM symptom_checks sc
      LEFT JOIN users u ON sc.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphanedSymptomChecks && orphanedSymptomChecks.length > 0) {
      issues.push({
        type: 'ORPHANED_RECORD',
        severity: 'HIGH',
        table: 'symptom_checks',
        count: orphanedSymptomChecks.length,
        description: `${orphanedSymptomChecks.length} 条 symptom_checks 记录没有关联的用户`,
        data: orphanedSymptomChecks.slice(0, 5),
      });
    }

    // 检查 health_analysis 表中的孤立记录
    const orphanedHealthAnalysis = await db.execute(`
      SELECT ha.id, ha.user_id FROM health_analysis ha
      LEFT JOIN users u ON ha.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphanedHealthAnalysis && orphanedHealthAnalysis.length > 0) {
      issues.push({
        type: 'ORPHANED_RECORD',
        severity: 'HIGH',
        table: 'health_analysis',
        count: orphanedHealthAnalysis.length,
        description: `${orphanedHealthAnalysis.length} 条 health_analysis 记录没有关联的用户`,
        data: orphanedHealthAnalysis.slice(0, 5),
      });
    }

    // 检查 user_choices 表中的孤立记录
    const orphanedUserChoices = await db.execute(`
      SELECT uc.id, uc.user_id FROM user_choices uc
      LEFT JOIN users u ON uc.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphanedUserChoices && orphanedUserChoices.length > 0) {
      issues.push({
        type: 'ORPHANED_RECORD',
        severity: 'HIGH',
        table: 'user_choices',
        count: orphanedUserChoices.length,
        description: `${orphanedUserChoices.length} 条 user_choices 记录没有关联的用户`,
        data: orphanedUserChoices.slice(0, 5),
      });
    }

    // 2. 检查必填字段缺失
    console.log('[数据完整性检查] 检查必填字段缺失...');

    const usersMissingFields = await db.execute(`
      SELECT id, name, phone FROM users
      WHERE name IS NULL OR name = ''
         OR phone IS NULL OR phone = ''
    `);

    if (usersMissingFields && usersMissingFields.length > 0) {
      issues.push({
        type: 'MISSING_REQUIRED_FIELD',
        severity: 'MEDIUM',
        table: 'users',
        count: usersMissingFields.length,
        description: `${usersMissingFields.length} 条用户记录缺少必填字段（name或phone）`,
        data: usersMissingFields.slice(0, 5),
      });
    }

    // 3. 检查数据一致性
    console.log('[数据完整性检查] 检查数据一致性...');

    const duplicatePhones = await db.execute(`
      SELECT phone, COUNT(*) as count
      FROM users
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone
      HAVING COUNT(*) > 1
    `);

    if (duplicatePhones && duplicatePhones.length > 0) {
      issues.push({
        type: 'DUPLICATE_DATA',
        severity: 'MEDIUM',
        table: 'users',
        field: 'phone',
        count: duplicatePhones.length,
        description: `${duplicatePhones.length} 个手机号存在重复`,
        data: duplicatePhones,
      });
    }

    // 4. 统计信息
    console.log('[数据完整性检查] 统计数据...');

    const stats = await Promise.all([
      db.execute(`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`),
      db.execute(`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NOT NULL`),
      db.execute(`SELECT COUNT(*) as count FROM requirements`),
      db.execute(`SELECT COUNT(*) as count FROM symptom_checks`),
      db.execute(`SELECT COUNT(*) as count FROM health_analysis`),
      db.execute(`SELECT COUNT(*) as count FROM user_choices`),
      db.execute(`SELECT COUNT(*) as count FROM audit_logs`),
    ]);

    const summary = {
      activeUsers: stats[0]?.[0]?.count || 0,
      deletedUsers: stats[1]?.[0]?.count || 0,
      requirementsCount: stats[2]?.[0]?.count || 0,
      symptomChecksCount: stats[3]?.[0]?.count || 0,
      healthAnalysisCount: stats[4]?.[0]?.count || 0,
      userChoicesCount: stats[5]?.[0]?.count || 0,
      auditLogsCount: stats[6]?.[0]?.count || 0,
    };

    console.log('[数据完整性检查] 完成，发现', issues.length, '个问题');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      issues: {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'HIGH').length,
        warning: issues.filter(i => i.severity === 'MEDIUM').length,
        info: issues.filter(i => i.severity === 'LOW').length,
        details: issues,
      },
      status: issues.length === 0 ? 'HEALTHY' : issues.filter(i => i.severity === 'HIGH').length > 0 ? 'CRITICAL' : 'WARNING',
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking data integrity:', error);
    return NextResponse.json(
      { error: '数据完整性检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
