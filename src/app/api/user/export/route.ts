import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

// 强制动态渲染，因为访问了数据库
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword') || '';
    const gender = searchParams.get('gender') || 'all';

    // 构建查询条件
    let whereClause = '';
    const params: any[] = [];

    if (keyword) {
      whereClause += ` AND (name ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`;
      params.push(`%${keyword}%`);
    }

    if (gender && gender !== 'all') {
      whereClause += ` AND gender = $${params.length + 1}`;
      params.push(gender);
    }

    // 获取用户数据
    const userRecords = await exec_sql(
      `SELECT
        user_id,
        name,
        phone,
        email,
        gender,
        age,
        height,
        weight,
        bmi,
        waistline,
        hipline,
        blood_pressure_high,
        blood_pressure_low,
        blood_sugar,
        blood_fat,
        heart_rate,
        sleep_hours,
        exercise_hours,
        smoking,
        drinking,
        diet,
        chronic_disease,
        medication,
        family_history,
        symptoms,
        occupation,
        address,
        health_status,
        health_score,
        self_check_completed,
        self_check_time,
        create_time,
        update_time
      FROM sys_user
      WHERE 1=1 ${whereClause}
      ORDER BY create_time DESC`,
      params
    );

    // 生成CSV内容
    const headers = [
      '用户ID',
      '姓名',
      '手机号',
      '邮箱',
      '性别',
      '年龄',
      '身高',
      '体重',
      'BMI',
      '腰围',
      '臀围',
      '血压(高)',
      '血压(低)',
      '血糖',
      '血脂',
      '心率',
      '睡眠时长',
      '运动时长',
      '吸烟',
      '饮酒',
      '饮食',
      '慢性病',
      '用药情况',
      '家族病史',
      '症状',
      '职业',
      '地址',
      '健康状态',
      '健康分数',
      '自检完成',
      '自检时间',
      '创建时间',
      '更新时间',
    ];

    const csvRows = [
      headers.join(','),
      ...userRecords.map((user: any) => [
        user.user_id,
        user.name || '',
        user.phone || '',
        user.email || '',
        user.gender || '',
        user.age || '',
        user.height || '',
        user.weight || '',
        user.bmi || '',
        user.waistline || '',
        user.hipline || '',
        user.blood_pressure_high || '',
        user.blood_pressure_low || '',
        user.blood_sugar || '',
        user.blood_fat || '',
        user.heart_rate || '',
        user.sleep_hours || '',
        user.exercise_hours || '',
        user.smoking || '',
        user.drinking || '',
        user.diet || '',
        user.chronic_disease || '',
        user.medication || '',
        user.family_history || '',
        // 处理可能包含逗号和换行的字段
        `"${(user.symptoms || '').replace(/"/g, '""')}"`,
        user.occupation || '',
        user.address || '',
        user.health_status || '',
        user.health_score || '',
        user.self_check_completed ? '是' : '否',
        user.self_check_time || '',
        user.create_time,
        user.update_time,
      ].join(',')),
    ];

    const csvContent = csvRows.join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM，确保Excel正确显示中文

    // 设置响应头
    const headers_response = new Headers();
    headers_response.set('Content-Type', 'text/csv; charset=utf-8');
    headers_response.set('Content-Disposition', `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: headers_response,
    });
  } catch (error) {
    console.error('导出CSV失败:', error);
    return NextResponse.json(
      { code: 500, message: '导出失败', error: String(error) },
      { status: 500 }
    );
  }
}
