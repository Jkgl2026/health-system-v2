import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET - 导出数据（支持 URL 直接访问）
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const details = searchParams.get('details') === 'true';
    const format = searchParams.get('format') || 'csv';
    const userIdsParam = searchParams.get('userIds');
    
    const db = await getDb();
    
    // 获取用户列表
    let usersData;
    if (userIdsParam) {
      const userIds = userIdsParam.split(',');
      usersData = await db.select().from(users).where(inArray(users.id, userIds));
    } else {
      // 导出所有用户
      usersData = await db.select().from(users);
    }

    if (!usersData || usersData.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可导出的用户数据' },
        { status: 400 }
      );
    }

    let exportData: any[] = [];

    if (!details) {
      // 摘要模式：只导出基本信息和最新状态
      for (const user of usersData) {
        // 获取最新健康分析
        const latestAnalysis = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id))
          .orderBy(desc(healthAnalysis.analyzedAt))
          .limit(1);

        // 获取最新症状检查
        const latestSymptom = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id))
          .orderBy(desc(symptomChecks.checkedAt))
          .limit(1);

        exportData.push({
          id: user.id,
          姓名: user.name || '-',
          手机号: user.phone || '-',
          邮箱: user.email || '-',
          年龄: user.age || '-',
          性别: user.gender || '-',
          身高: user.height || '-',
          体重: user.weight || '-',
          BMI: user.bmi || '-',
          职业: user.occupation || '-',
          综合健康分: latestAnalysis[0]?.overallHealth || '-',
          气血: latestAnalysis[0]?.qiAndBlood || '-',
          循环: latestAnalysis[0]?.circulation || '-',
          毒素: latestAnalysis[0]?.toxins || '-',
          血脂: latestAnalysis[0]?.bloodLipids || '-',
          寒凉: latestAnalysis[0]?.coldness || '-',
          免疫: latestAnalysis[0]?.immunity || '-',
          情绪: latestAnalysis[0]?.emotions || '-',
          症状数量: Array.isArray(latestSymptom[0]?.checkedSymptoms) ? (latestSymptom[0]?.checkedSymptoms as any[]).length : 0,
          检测时间: latestAnalysis[0]?.analyzedAt 
            ? new Date(latestAnalysis[0].analyzedAt).toLocaleString('zh-CN') 
            : '-',
          注册时间: new Date(user.createdAt).toLocaleString('zh-CN'),
        });
      }
    } else {
      // 详细模式：包含所有历史记录
      for (const user of usersData) {
        const analyses = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id));

        const symptoms = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id));

        const choices = await db
          .select()
          .from(userChoices)
          .where(eq(userChoices.userId, user.id));

        exportData.push({
          用户信息: {
            id: user.id,
            姓名: user.name || '-',
            手机号: user.phone || '-',
            邮箱: user.email || '-',
            年龄: user.age || '-',
            性别: user.gender || '-',
            身高: user.height || '-',
            体重: user.weight || '-',
            BMI: user.bmi || '-',
            职业: user.occupation || '-',
            注册时间: new Date(user.createdAt).toLocaleString('zh-CN'),
          },
          健康分析记录: analyses.map(a => ({
            时间: new Date(a.analyzedAt).toLocaleString('zh-CN'),
            综合健康分: a.overallHealth,
            气血: a.qiAndBlood,
            循环: a.circulation,
            毒素: a.toxins,
            血脂: a.bloodLipids,
            寒凉: a.coldness,
            免疫: a.immunity,
            情绪: a.emotions,
          })),
          症状检查记录: symptoms.map(s => ({
            时间: new Date(s.checkedAt).toLocaleString('zh-CN'),
            症状数量: Array.isArray(s.checkedSymptoms) ? (s.checkedSymptoms as any[]).length : 0,
            总分: s.totalScore,
          })),
          方案选择记录: choices.map(c => ({
            时间: new Date(c.selectedAt).toLocaleString('zh-CN'),
            方案类型: c.planType,
            方案描述: c.planDescription,
          })),
        });
      }
    }

    // 根据格式返回数据
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        mode: details ? 'detailed' : 'summary',
        generatedAt: new Date().toISOString(),
      });
    } else {
      // CSV 格式导出
      if (details) {
        // 详细模式导出为 JSON
        return NextResponse.json({
          success: true,
          data: exportData,
          mode: 'detailed',
          message: '详细模式仅支持 JSON 格式',
          generatedAt: new Date().toISOString(),
        });
      }

      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(h => `"${row[h] || ''}"`).join(',')
        )
      ].join('\n');

      return new NextResponse('\ufeff' + csvRows, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="health_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json(
      { success: false, error: '导出数据失败' },
      { status: 500 }
    );
  }
}

// POST - 导出数据（支持多种格式）
export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { userIds, mode, format } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择要导出的用户' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取用户数据
    const usersData = await db.select().from(users).where(inArray(users.id, userIds));

    let exportData: any[] = [];

    if (mode === 'summary') {
      // 摘要模式：只导出基本信息和最新状态
      for (const user of usersData) {
        // 获取最新健康分析
        const latestAnalysis = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id))
          .orderBy(healthAnalysis.analyzedAt)
          .limit(1);

        // 获取最新症状检查
        const latestSymptom = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id))
          .orderBy(symptomChecks.checkedAt)
          .limit(1);

        exportData.push({
          id: user.id,
          姓名: user.name || '-',
          手机号: user.phone || '-',
          邮箱: user.email || '-',
          年龄: user.age || '-',
          性别: user.gender || '-',
          身高: user.height || '-',
          体重: user.weight || '-',
          BMI: user.bmi || '-',
          职业: user.occupation || '-',
          综合健康分: latestAnalysis[0]?.overallHealth || '-',
          气血: latestAnalysis[0]?.qiAndBlood || '-',
          循环: latestAnalysis[0]?.circulation || '-',
          毒素: latestAnalysis[0]?.toxins || '-',
          血脂: latestAnalysis[0]?.bloodLipids || '-',
          寒凉: latestAnalysis[0]?.coldness || '-',
          免疫: latestAnalysis[0]?.immunity || '-',
          情绪: latestAnalysis[0]?.emotions || '-',
          症状数量: Array.isArray(latestSymptom[0]?.checkedSymptoms) ? (latestSymptom[0]?.checkedSymptoms as any[]).length : 0,
          检测时间: latestAnalysis[0]?.analyzedAt 
            ? new Date(latestAnalysis[0].analyzedAt).toLocaleString('zh-CN') 
            : '-',
          注册时间: new Date(user.createdAt).toLocaleString('zh-CN'),
        });
      }
    } else if (mode === 'detailed') {
      // 详细模式：包含所有历史记录
      for (const user of usersData) {
        const analyses = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id));

        const symptoms = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id));

        const choices = await db
          .select()
          .from(userChoices)
          .where(eq(userChoices.userId, user.id));

        exportData.push({
          用户信息: {
            id: user.id,
            姓名: user.name || '-',
            手机号: user.phone || '-',
            邮箱: user.email || '-',
            年龄: user.age || '-',
            性别: user.gender || '-',
            身高: user.height || '-',
            体重: user.weight || '-',
            BMI: user.bmi || '-',
            职业: user.occupation || '-',
            注册时间: new Date(user.createdAt).toLocaleString('zh-CN'),
          },
          健康分析记录: analyses.map(a => ({
            时间: new Date(a.analyzedAt).toLocaleString('zh-CN'),
            综合健康分: a.overallHealth,
            气血: a.qiAndBlood,
            循环: a.circulation,
            毒素: a.toxins,
            血脂: a.bloodLipids,
            寒凉: a.coldness,
            免疫: a.immunity,
            情绪: a.emotions,
          })),
          症状检查记录: symptoms.map(s => ({
            时间: new Date(s.checkedAt).toLocaleString('zh-CN'),
            症状数量: Array.isArray(s.checkedSymptoms) ? (s.checkedSymptoms as any[]).length : 0,
            总分: s.totalScore,
          })),
          方案选择记录: choices.map(c => ({
            时间: new Date(c.selectedAt).toLocaleString('zh-CN'),
            方案类型: c.planType,
            方案描述: c.planDescription,
          })),
        });
      }
    } else if (mode === 'report') {
      // 报告模式：生成适合打印的健康报告数据
      for (const user of usersData) {
        const latestAnalysis = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id))
          .orderBy(healthAnalysis.analyzedAt)
          .limit(1);

        const latestSymptom = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id))
          .orderBy(symptomChecks.checkedAt)
          .limit(1);

        const analysis = latestAnalysis[0];
        const symptom = latestSymptom[0];

        // 生成健康建议
        const recommendations: string[] = [];
        
        if (analysis) {
          if (analysis.qiAndBlood && analysis.qiAndBlood < 50) {
            recommendations.push('建议增加补气血食物，如红枣、桂圆、枸杞等');
          }
          if (analysis.circulation && analysis.circulation < 50) {
            recommendations.push('建议增加有氧运动，促进血液循环');
          }
          if (analysis.toxins && analysis.toxins < 50) {
            recommendations.push('建议多喝水，增加排毒食物摄入');
          }
          if (analysis.immunity && analysis.immunity < 50) {
            recommendations.push('建议保证充足睡眠，增强免疫力');
          }
          if (analysis.emotions && analysis.emotions < 50) {
            recommendations.push('建议进行放松活动，保持良好心态');
          }
        }

        exportData.push({
          报告标题: '健康自检报告',
          生成时间: new Date().toLocaleString('zh-CN'),
          用户基本信息: {
            姓名: user.name || '-',
            手机号: user.phone || '-',
            年龄: user.age || '-',
            性别: user.gender || '-',
            身高: user.height || '-',
            体重: user.weight || '-',
            BMI: user.bmi || '-',
          },
          健康评分: {
            综合健康分: analysis?.overallHealth || '-',
            检测时间: analysis?.analyzedAt 
              ? new Date(analysis.analyzedAt).toLocaleString('zh-CN') 
              : '-',
            各维度评分: {
              气血: analysis?.qiAndBlood || '-',
              循环: analysis?.circulation || '-',
              毒素: analysis?.toxins || '-',
              血脂: analysis?.bloodLipids || '-',
              寒凉: analysis?.coldness || '-',
              免疫: analysis?.immunity || '-',
              情绪: analysis?.emotions || '-',
            },
          },
          症状统计: {
            症状总数: Array.isArray(symptom?.checkedSymptoms) ? (symptom?.checkedSymptoms as any[]).length : 0,
            检测时间: symptom?.checkedAt 
              ? new Date(symptom.checkedAt).toLocaleString('zh-CN') 
              : '-',
          },
          健康建议: recommendations.length > 0 ? recommendations : ['健康状况良好，继续保持健康的生活方式'],
        });
      }
    }

    // 根据格式返回数据
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        mode,
        generatedAt: new Date().toISOString(),
      });
    } else if (format === 'csv') {
      // 简单CSV导出（仅摘要模式支持）
      if (mode !== 'summary') {
        return NextResponse.json(
          { success: false, error: 'CSV格式仅支持摘要模式' },
          { status: 400 }
        );
      }

      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(h => `"${row[h]}"`).join(',')
        )
      ].join('\n');

      return new NextResponse('\ufeff' + csvRows, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="health_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // PDF格式返回标记，前端将使用打印功能
      return NextResponse.json({
        success: true,
        data: exportData,
        mode,
        format: 'pdf',
        message: '请使用浏览器的打印功能生成PDF',
        generatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json(
      { success: false, error: '导出数据失败' },
      { status: 500 }
    );
  }
}
