import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { arrayToCSV } from '@/lib/export';

// GET /api/admin/export - 导出用户数据为 CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const includeDetails = searchParams.get('details') === 'true';

    // 获取所有用户数据
    const users = await healthDataManager.getAllUsers({ limit: 10000 });

    // 定义 CSV 列
    const headers = [
      { key: 'id', label: '用户ID' },
      { key: 'name', label: '姓名' },
      { key: 'phone', label: '手机号' },
      { key: 'email', label: '邮箱' },
      { key: 'gender', label: '性别' },
      { key: 'age', label: '年龄' },
      { key: 'weight', label: '体重(kg)' },
      { key: 'height', label: '身高(cm)' },
      { key: 'bmi', label: 'BMI' },
      { key: 'bloodPressure', label: '血压' },
      { key: 'occupation', label: '职业' },
      { key: 'address', label: '地址' },
      { key: 'createdAt', label: '注册时间' },
      { key: 'updatedAt', label: '更新时间' },
    ];

    if (includeDetails) {
      headers.push(
        { key: 'symptomCheckCount', label: '症状自检次数' },
        { key: 'healthAnalysisCount', label: '健康分析次数' },
        { key: 'userChoiceCount', label: '方案选择次数' },
        { key: 'requirementCompleted', label: '要求完成状态' }
      );
    }

    // 获取每个用户的详细数据
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const details: Record<string, any> = {
          ...user,
          createdAt: user.createdAt?.toLocaleString('zh-CN') || '',
          updatedAt: user.updatedAt?.toLocaleString('zh-CN') || '',
        };

        if (includeDetails) {
          // 获取用户的关联数据
          const symptomChecks = await healthDataManager.getSymptomChecksByUserId(user.id);
          const healthAnalysis = await healthDataManager.getHealthAnalysisByUserId(user.id);
          const userChoices = await healthDataManager.getUserChoicesByUserId(user.id);
          const requirements = await healthDataManager.getRequirementsByUserId(user.id);

          details.symptomCheckCount = symptomChecks.length;
          details.healthAnalysisCount = healthAnalysis.length;
          details.userChoiceCount = userChoices.length;
          details.requirementCompleted = requirements ? '已记录' : '未完成';
        }

        return details;
      })
    );

    // 生成 CSV
    const csvContent = arrayToCSV(usersWithDetails, headers);

    // 返回 CSV 文件
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    const encodedContent = '\ufeff' + csvContent; // 添加 BOM，确保 Excel 正确显示中文

    return new NextResponse(encodedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: '导出数据失败' },
      { status: 500 }
    );
  }
}
