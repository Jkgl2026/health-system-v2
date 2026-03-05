import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { symptomChecks, requirements, healthAnalysis, users, userChoices } from '@/storage/database/shared/schema';
import { desc, eq, and, gte, lte, sql, inArray } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';
import { BODY_SYMPTOMS, BODY_SYMPTOMS_300, BAD_HABITS_CHECKLIST } from '@/lib/health-data';

// 症状分类定义
const SYMPTOM_CATEGORIES: Record<string, { name: string; keywords: string[] }> = {
  '脾胃': { name: '脾胃', keywords: ['胃', '脾', '消化', '腹胀', '便', '口苦', '口臭', '食欲', '恶心'] },
  '气血': { name: '气血', keywords: ['气', '血', '头晕', '乏力', '疲劳', '心悸', '面色', '唇', '指甲'] },
  '睡眠': { name: '睡眠', keywords: ['睡眠', '失眠', '多梦', '嗜睡', '入睡', '早醒'] },
  '免疫': { name: '免疫', keywords: ['感冒', '过敏', '免疫', '抵抗力', '发热'] },
  '循环': { name: '循环', keywords: ['心', '血压', '循环', '胸闷', '静脉', '血管'] },
  '情绪': { name: '情绪', keywords: ['情绪', '抑郁', '焦虑', '易怒', '烦躁', '心情'] },
  '寒湿': { name: '寒湿', keywords: ['寒', '湿', '冷', '凉', '手脚冰', '关节痛'] },
  '其他': { name: '其他', keywords: [] },
};

// 根据症状名称匹配分类
function categorizeSymptom(symptomName: string): string {
  for (const [category, config] of Object.entries(SYMPTOM_CATEGORIES)) {
    if (category === '其他') continue;
    if (config.keywords.some(keyword => symptomName.includes(keyword))) {
      return category;
    }
  }
  return '其他';
}

// GET /api/admin/analytics - 获取数据分析
export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview'; // overview, symptom, constitution, plan
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const gender = searchParams.get('gender') || '';
    const ageRange = searchParams.get('ageRange') || '';

    const db = await getDb();

    // 构建时间条件
    const timeConditions = [];
    if (startDate) {
      timeConditions.push(gte(users.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      timeConditions.push(lte(users.createdAt, endDateTime));
    }

    // 构建用户筛选条件
    const userConditions = [...timeConditions];
    if (gender) {
      userConditions.push(eq(users.gender, gender));
    }
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(Number);
      if (minAge) userConditions.push(gte(users.age, minAge));
      if (maxAge) userConditions.push(lte(users.age, maxAge));
    }

    switch (type) {
      case 'symptom':
        return await getSymptomAnalysis(db, userConditions);
      case 'constitution':
        return await getConstitutionAnalysis(db, userConditions);
      case 'plan':
        return await getPlanAnalysis(db, userConditions);
      case 'overview':
      default:
        return await getOverviewAnalysis(db, userConditions);
    }
  } catch (error) {
    console.error('[Analytics] 获取数据分析失败:', error);
    return NextResponse.json(
      { error: '获取数据分析失败' },
      { status: 500 }
    );
  }
}

// 症状分类占比分析
async function getSymptomAnalysis(db: any, userConditions: any[]) {
  // 获取所有症状自检记录
  const allSymptomChecks = await db
    .select({
      userId: symptomChecks.userId,
      checkedSymptoms: symptomChecks.checkedSymptoms,
      checkedAt: symptomChecks.checkedAt,
    })
    .from(symptomChecks)
    .innerJoin(users, eq(symptomChecks.userId, users.id))
    .where(userConditions.length > 0 ? and(...userConditions) : undefined)
    .orderBy(desc(symptomChecks.checkedAt));

  // 统计症状分类
  const categoryCount: Record<string, number> = {};
  const symptomDetailCount: Record<string, number> = {};

  for (const check of allSymptomChecks) {
    const symptomIds = check.checkedSymptoms as number[];
    if (!Array.isArray(symptomIds)) continue;

    for (const id of symptomIds) {
      // 查找症状名称
      const symptom = BODY_SYMPTOMS.find(s => s.id === id) || 
                      BODY_SYMPTOMS_300.find(s => s.id === id);
      
      if (symptom) {
        const symptomName = symptom.name;
        const category = categorizeSymptom(symptomName);
        
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        symptomDetailCount[symptomName] = (symptomDetailCount[symptomName] || 0) + 1;
      }
    }
  }

  // 转换为图表数据
  const totalSymptoms = Object.values(categoryCount).reduce((a, b) => a + b, 0);
  const chartData = Object.entries(categoryCount)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSymptoms > 0 ? ((value / totalSymptoms) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.value - a.value);

  // 症状详情top20
  const topSymptoms = Object.entries(symptomDetailCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return NextResponse.json({
    success: true,
    data: {
      chartData,
      topSymptoms,
      totalSymptoms,
      totalRecords: allSymptomChecks.length,
    },
  });
}

// 体质分布分析
async function getConstitutionAnalysis(db: any, userConditions: any[]) {
  // 获取所有健康分析记录
  const allAnalysis = await db
    .select({
      userId: healthAnalysis.userId,
      qiAndBlood: healthAnalysis.qiAndBlood,
      circulation: healthAnalysis.circulation,
      toxins: healthAnalysis.toxins,
      bloodLipids: healthAnalysis.bloodLipids,
      coldness: healthAnalysis.coldness,
      immunity: healthAnalysis.immunity,
      emotions: healthAnalysis.emotions,
      overallHealth: healthAnalysis.overallHealth,
      analyzedAt: healthAnalysis.analyzedAt,
    })
    .from(healthAnalysis)
    .innerJoin(users, eq(healthAnalysis.userId, users.id))
    .where(userConditions.length > 0 ? and(...userConditions) : undefined)
    .orderBy(desc(healthAnalysis.analyzedAt));

  // 获取用户信息用于交叉分析
  const usersInfo = await db
    .select({
      id: users.id,
      gender: users.gender,
      age: users.age,
    })
    .from(users)
    .where(userConditions.length > 0 ? and(...userConditions) : undefined);

  const userInfoMap = new Map<string, { id: string; gender: string | null; age: number | null }>(usersInfo.map((u: { id: string; gender: string | null; age: number | null }) => [u.id, u]));

  // 根据健康要素分析体质（简化版）
  const constitutionCount: Record<string, number> = {
    '平和质': 0,
    '气虚质': 0,
    '阳虚质': 0,
    '阴虚质': 0,
    '血瘀质': 0,
    '痰湿质': 0,
    '湿热质': 0,
    '气郁质': 0,
    '特禀质': 0,
  };

  // 性别分布
  const genderConstitution: Record<string, Record<string, number>> = {
    '男': { ...constitutionCount },
    '女': { ...constitutionCount },
  };

  // 年龄段分布
  const ageConstitution: Record<string, Record<string, number>> = {};

  for (const analysis of allAnalysis) {
    const userInfo = userInfoMap.get(analysis.userId);
    let constitution = '平和质';

    // 简化体质判断逻辑
    const avgScore = (
      (analysis.qiAndBlood || 0) +
      (analysis.circulation || 0) +
      (analysis.toxins || 0) +
      (analysis.bloodLipids || 0) +
      (analysis.coldness || 0) +
      (analysis.immunity || 0) +
      (analysis.emotions || 0)
    ) / 7;

    if (avgScore < 30) {
      constitution = '气虚质';
    } else if (avgScore < 40) {
      constitution = analysis.coldness && analysis.coldness < 40 ? '阳虚质' : '阴虚质';
    } else if (avgScore < 50) {
      constitution = analysis.toxins && analysis.toxins < 40 ? '痰湿质' : '气郁质';
    } else if (avgScore < 60) {
      constitution = '湿热质';
    }

    constitutionCount[constitution]++;

    // 性别交叉分析
    if (userInfo?.gender) {
      const gender = userInfo.gender === '男' ? '男' : '女';
      if (genderConstitution[gender]) {
        genderConstitution[gender][constitution]++;
      }
    }

    // 年龄段交叉分析
    if (userInfo?.age) {
      let ageGroup = '未知';
      if (userInfo.age < 30) ageGroup = '30岁以下';
      else if (userInfo.age < 40) ageGroup = '30-40岁';
      else if (userInfo.age < 50) ageGroup = '40-50岁';
      else if (userInfo.age < 60) ageGroup = '50-60岁';
      else ageGroup = '60岁以上';

      if (!ageConstitution[ageGroup]) {
        ageConstitution[ageGroup] = { ...constitutionCount };
        Object.keys(ageConstitution[ageGroup]).forEach(k => ageConstitution[ageGroup][k] = 0);
      }
      ageConstitution[ageGroup][constitution]++;
    }
  }

  // 转换为图表数据
  const chartData = Object.entries(constitutionCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return NextResponse.json({
    success: true,
    data: {
      chartData,
      genderConstitution: Object.entries(genderConstitution).map(([gender, counts]) => ({
        gender,
        ...counts,
      })),
      ageConstitution: Object.entries(ageConstitution).map(([age, counts]) => ({
        age,
        ...counts,
      })),
      totalRecords: allAnalysis.length,
    },
  });
}

// 调理方案使用率分析
async function getPlanAnalysis(db: any, userConditions: any[]) {
  // 获取所有方案选择记录
  const allChoices = await db
    .select({
      userId: userChoices.userId,
      planType: userChoices.planType,
      planDescription: userChoices.planDescription,
      selectedAt: userChoices.selectedAt,
    })
    .from(userChoices)
    .innerJoin(users, eq(userChoices.userId, users.id))
    .where(userConditions.length > 0 ? and(...userConditions) : undefined)
    .orderBy(desc(userChoices.selectedAt));

  // 获取用户信息
  const usersInfo = await db
    .select({
      id: users.id,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(userConditions.length > 0 ? and(...userConditions) : undefined);

  const userInfoMap = new Map<string, { id: string; createdAt: Date }>(usersInfo.map((u: { id: string; createdAt: Date }) => [u.id, u]));

  // 统计方案使用
  const planCount: Record<string, { count: number; users: Set<string> }> = {};

  // 时间维度统计
  const dailyCount: Record<string, Record<string, number>> = {};
  const weeklyCount: Record<string, Record<string, number>> = {};

  // 新老用户统计
  const newUserPlans: Record<string, number> = {};
  const oldUserPlans: Record<string, number> = {};

  for (const choice of allChoices) {
    const planType = choice.planType || '未选择';
    
    if (!planCount[planType]) {
      planCount[planType] = { count: 0, users: new Set() };
    }
    planCount[planType].count++;
    planCount[planType].users.add(choice.userId);

    // 按日期统计
    const date = new Date(choice.selectedAt).toISOString().split('T')[0];
    if (!dailyCount[date]) dailyCount[date] = {};
    dailyCount[date][planType] = (dailyCount[date][planType] || 0) + 1;

    // 新老用户判断（注册7天内为新用户）
    const userInfo = userInfoMap.get(choice.userId);
    if (userInfo) {
      const daysSinceRegister = Math.floor(
        (new Date(choice.selectedAt).getTime() - new Date(userInfo.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceRegister <= 7) {
        newUserPlans[planType] = (newUserPlans[planType] || 0) + 1;
      } else {
        oldUserPlans[planType] = (oldUserPlans[planType] || 0) + 1;
      }
    }
  }

  // 转换为图表数据
  const chartData = Object.entries(planCount)
    .map(([name, data]) => ({
      name,
      count: data.count,
      userCount: data.users.size,
    }))
    .sort((a, b) => b.count - a.count);

  // 近7天趋势
  const last7Days = Object.entries(dailyCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }));

  return NextResponse.json({
    success: true,
    data: {
      chartData,
      last7Days,
      newUserPlans: Object.entries(newUserPlans).map(([name, count]) => ({ name, count })),
      oldUserPlans: Object.entries(oldUserPlans).map(([name, count]) => ({ name, count })),
      totalRecords: allChoices.length,
    },
  });
}

// 总览分析
async function getOverviewAnalysis(db: any, userConditions: any[]) {
  // 用户统计
  const userStats = await db
    .select({
      total: sql<number>`count(*)`,
      today: sql<number>`count(*) filter (where ${users.createdAt} >= current_date)`,
      male: sql<number>`count(*) filter (where ${users.gender} = '男')`,
      female: sql<number>`count(*) filter (where ${users.gender} = '女')`,
    })
    .from(users)
    .where(userConditions.length > 0 ? and(...userConditions) : undefined);

  // 自检统计
  const checkStats = await db
    .select({
      total: sql<number>`count(*)`,
      today: sql<number>`count(*) filter (where ${symptomChecks.checkedAt} >= current_date)`,
    })
    .from(symptomChecks);

  // 健康分析统计
  const analysisStats = await db
    .select({
      total: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${healthAnalysis.overallHealth})`,
      excellent: sql<number>`count(*) filter (where ${healthAnalysis.overallHealth} >= 80)`,
      good: sql<number>`count(*) filter (where ${healthAnalysis.overallHealth} >= 60 and ${healthAnalysis.overallHealth} < 80)`,
      fair: sql<number>`count(*) filter (where ${healthAnalysis.overallHealth} >= 40 and ${healthAnalysis.overallHealth} < 60)`,
      poor: sql<number>`count(*) filter (where ${healthAnalysis.overallHealth} < 40)`,
    })
    .from(healthAnalysis);

  return NextResponse.json({
    success: true,
    data: {
      users: userStats[0] || { total: 0, today: 0, male: 0, female: 0 },
      checks: checkStats[0] || { total: 0, today: 0 },
      analysis: analysisStats[0] || { total: 0, avgScore: 0, excellent: 0, good: 0, fair: 0, poor: 0 },
    },
  });
}
