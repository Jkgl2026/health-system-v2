// 症状分类映射 - 用于图表统计
// 基于 BODY_SYMPTOMS 中的 category 字段进行归类

// 详细分类（按身体系统）
export const SYMPTOM_CATEGORIES_DETAIL = {
  '神经系统': { color: '#8b5cf6', symptoms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 58, 85] },
  '皮肤': { color: '#ec4899', symptoms: [11, 12, 13, 20, 51, 52, 53, 54, 92, 93, 95] },
  '五官': { color: '#06b6d4', symptoms: [16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 30, 99] },
  '呼吸系统': { color: '#3b82f6', symptoms: [29, 31, 32, 33, 35, 36, 37, 38, 39, 40] },
  '消化系统': { color: '#f59e0b', symptoms: [41, 42, 43, 44, 45, 46, 47, 68, 69, 70, 86, 87, 88, 89, 90] },
  '循环系统': { color: '#ef4444', symptoms: [48, 49, 50, 55, 56, 57, 59, 60, 61, 62, 63, 71, 72, 73, 74, 75] },
  '泌尿系统': { color: '#14b8a6', symptoms: [64, 65, 66, 67] },
  '妇科': { color: '#f97316', symptoms: [76, 77, 78, 79, 80, 81, 82, 83, 84] },
  '情绪': { color: '#a855f7', symptoms: [85] },
  '代谢': { color: '#84cc16', symptoms: [91, 96, 97, 100] },
  '免疫系统': { color: '#10b981', symptoms: [34, 94, 98] },
};

// 简化分类（用于图表展示，将详细分类合并为更直观的分组）
export const SYMPTOM_CATEGORIES_SIMPLE = {
  '头部': { color: '#8b5cf6', symptoms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15] },
  '面部': { color: '#06b6d4', symptoms: [11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 99] },
  '胸部': { color: '#ef4444', symptoms: [48, 49, 50] },
  '腹部': { color: '#f59e0b', symptoms: [41, 42, 43, 44, 45, 46, 47, 86, 87, 88, 89, 90] },
  '四肢': { color: '#ec4899', symptoms: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63] },
  '全身': { color: '#10b981', symptoms: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 91, 92, 93, 94, 95, 96, 97, 98, 100] },
};

// 预定义标签（统一管理）
export const PREDEFINED_TAGS = {
  health: [
    { id: 'high-risk', name: '高风险用户', color: '#ef4444', description: '健康评分低于40分' },
    { id: 'needs-attention', name: '需关注', color: '#f97316', description: '健康评分40-60分' },
    { id: 'good-health', name: '健康良好', color: '#10b981', description: '健康评分60分以上' },
    { id: 'chronic', name: '慢性问题', color: '#8b5cf6', description: '长期存在健康问题' },
    { id: 'improving', name: '持续改善', color: '#06b6d4', description: '健康评分持续上升' },
  ],
  behavior: [
    { id: 'active', name: '活跃用户', color: '#3b82f6', description: '近7天有登录' },
    { id: 'inactive', name: '不活跃', color: '#6b7280', description: '30天未登录' },
    { id: 'new', name: '新用户', color: '#84cc16', description: '注册7天内' },
    { id: 'vip', name: 'VIP用户', color: '#f59e0b', description: '付费用户' },
  ],
};

// 扁平化的预定义标签（供前端组件使用）
export const PREDEFINED_TAGS_FLAT = [
  ...PREDEFINED_TAGS.health.map(tag => ({ ...tag, category: 'health' })),
  ...PREDEFINED_TAGS.behavior.map(tag => ({ ...tag, category: 'behavior' })),
];

// 根据症状ID列表获取分类统计
export function getSymptomCategoryStats(symptomIds: number[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const [category, config] of Object.entries(SYMPTOM_CATEGORIES_SIMPLE)) {
    const count = symptomIds.filter(id => config.symptoms.includes(id)).length;
    if (count > 0) {
      stats[category] = count;
    }
  }
  
  return stats;
}

// 根据健康评分自动生成标签
export function autoGenerateTags(healthScore: number | null, existingTags: string[] = []): string[] {
  const tags = [...existingTags];
  
  if (healthScore !== null) {
    if (healthScore < 40) {
      if (!tags.includes('high-risk')) tags.push('high-risk');
    } else if (healthScore < 60) {
      if (!tags.includes('needs-attention')) tags.push('needs-attention');
    } else {
      if (!tags.includes('good-health')) tags.push('good-health');
    }
  }
  
  return tags;
}
