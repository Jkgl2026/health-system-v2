import { Symptom, SymptomCategory, HealthLevel, HealthAdvice } from '../types'

/**
 * 症状数据配置
 */
export const SYMPTOMS: Symptom[] = [
  // 头部症状
  {
    id: 'head_1',
    category: SymptomCategory.HEAD,
    name: '头痛',
    score: 5,
    icon: '🤯'
  },
  {
    id: 'head_2',
    category: SymptomCategory.HEAD,
    name: '头晕',
    score: 3,
    icon: '😵'
  },
  {
    id: 'head_3',
    category: SymptomCategory.HEAD,
    name: '失眠',
    score: 8,
    icon: '😴'
  },
  {
    id: 'head_4',
    category: SymptomCategory.HEAD,
    name: '眼疲劳',
    score: 3,
    icon: '👀'
  },
  {
    id: 'head_5',
    category: SymptomCategory.HEAD,
    name: '记忆力下降',
    score: 4,
    icon: '🧠'
  },

  // 睡眠症状
  {
    id: 'sleep_1',
    category: SymptomCategory.SLEEP,
    name: '入睡困难',
    score: 6,
    icon: '😰'
  },
  {
    id: 'sleep_2',
    category: SymptomCategory.SLEEP,
    name: '多梦易醒',
    score: 5,
    icon: '💭'
  },
  {
    id: 'sleep_3',
    category: SymptomCategory.SLEEP,
    name: '早醒',
    score: 4,
    icon: '⏰'
  },
  {
    id: 'sleep_4',
    category: SymptomCategory.SLEEP,
    name: '睡眠时间不足',
    score: 5,
    icon: '🌙'
  },

  // 消化症状
  {
    id: 'digestion_1',
    category: SymptomCategory.DIGESTION,
    name: '食欲不振',
    score: 4,
    icon: '🍽️'
  },
  {
    id: 'digestion_2',
    category: SymptomCategory.DIGESTION,
    name: '胃胀',
    score: 3,
    icon: '🫃'
  },
  {
    id: 'digestion_3',
    category: SymptomCategory.DIGESTION,
    name: '便秘',
    score: 4,
    icon: '💩'
  },
  {
    id: 'digestion_4',
    category: SymptomCategory.DIGESTION,
    name: '腹泻',
    score: 6,
    icon: '🚽'
  },

  // 体力症状
  {
    id: 'physical_1',
    category: SymptomCategory.PHYSICAL,
    name: '易疲劳',
    score: 5,
    icon: '😴'
  },
  {
    id: 'physical_2',
    category: SymptomCategory.PHYSICAL,
    name: '乏力',
    score: 4,
    icon: '🫠'
  },
  {
    id: 'physical_3',
    category: SymptomCategory.PHYSICAL,
    name: '体力下降',
    score: 4,
    icon: '🏃'
  },
  {
    id: 'physical_4',
    category: SymptomCategory.PHYSICAL,
    name: '腰酸背痛',
    score: 4,
    icon: '💪'
  },

  // 心理症状
  {
    id: 'psychological_1',
    category: SymptomCategory.PSYCHOLOGICAL,
    name: '焦虑',
    score: 6,
    icon: '😟'
  },
  {
    id: 'psychological_2',
    category: SymptomCategory.PSYCHOLOGICAL,
    name: '抑郁',
    score: 8,
    icon: '😔'
  },
  {
    id: 'psychological_3',
    category: SymptomCategory.PSYCHOLOGICAL,
    name: '情绪低落',
    score: 5,
    icon: '😞'
  },
  {
    id: 'psychological_4',
    category: SymptomCategory.PSYCHOLOGICAL,
    name: '烦躁易怒',
    score: 5,
    icon: '😤'
  },

  // 心脏症状
  {
    id: 'heart_1',
    category: SymptomCategory.HEART,
    name: '心慌',
    score: 7,
    icon: '💓'
  },
  {
    id: 'heart_2',
    category: SymptomCategory.HEART,
    name: '胸闷',
    score: 6,
    icon: '🫀'
  },
  {
    id: 'heart_3',
    category: SymptomCategory.HEART,
    name: '气短',
    score: 5,
    icon: '😮'
  },
  {
    id: 'heart_4',
    category: SymptomCategory.HEART,
    name: '心悸',
    score: 7,
    icon: '💗'
  }
]

/**
 * 症状分类名称映射
 */
export const CATEGORY_NAMES: Record<SymptomCategory, string> = {
  [SymptomCategory.HEAD]: '头部',
  [SymptomCategory.SLEEP]: '睡眠',
  [SymptomCategory.DIGESTION]: '消化',
  [SymptomCategory.PHYSICAL]: '体力',
  [SymptomCategory.PSYCHOLOGICAL]: '心理',
  [SymptomCategory.HEART]: '心脏'
}

/**
 * 计算健康评分
 * @param symptomIds 选中的症状ID数组
 * @returns 健康评分（基础分100 - 扣分）
 */
export function calculateHealthScore(symptomIds: string[]): number {
  const BASE_SCORE = 100
  let totalDeduct = 0

  symptomIds.forEach(id => {
    const symptom = SYMPTOMS.find(s => s.id === id)
    if (symptom) {
      totalDeduct += symptom.score
    }
  })

  return Math.max(0, BASE_SCORE - totalDeduct)
}

/**
 * 计算各维度得分
 * @param symptomIds 选中的症状ID数组
 * @returns 各维度得分（每个维度基础分100）
 */
export function calculateElementScores(symptomIds: string[]): { [key: string]: number } {
  const elementScores: { [key: string]: number } = {}

  Object.values(SymptomCategory).forEach(category => {
    const categorySymptoms = SYMPTOMS.filter(s => s.category === category)
    const selectedInCategory = categorySymptoms.filter(s => symptomIds.includes(s.id))

    const totalScore = categorySymptoms.reduce((sum, s) => sum + s.score, 0)
    const selectedScore = selectedInCategory.reduce((sum, s) => sum + s.score, 0)

    elementScores[category] = Math.max(0, 100 - selectedScore)
  })

  return elementScores
}

/**
 * 根据评分获取健康等级
 * @param score 健康评分
 * @returns 健康等级
 */
export function getHealthLevel(score: number): HealthLevel {
  if (score >= 90) return HealthLevel.EXCELLENT
  if (score >= 80) return HealthLevel.GOOD
  if (score >= 70) return HealthLevel.AVERAGE
  if (score >= 60) return HealthLevel.ATTENTION
  return HealthLevel.MEDICAL
}

/**
 * 获取健康等级的显示信息
 * @param level 健康等级
 * @returns 等级信息
 */
export function getHealthLevelInfo(level: HealthLevel): { label: string; color: string; icon: string } {
  const levelMap: Record<HealthLevel, { label: string; color: string; icon: string }> = {
    [HealthLevel.EXCELLENT]: { label: '优秀', color: '#52c41a', icon: '🌟' },
    [HealthLevel.GOOD]: { label: '良好', color: '#1890ff', icon: '👍' },
    [HealthLevel.AVERAGE]: { label: '一般', color: '#faad14', icon: '😊' },
    [HealthLevel.ATTENTION]: { label: '需要关注', color: '#ff7a45', icon: '⚠️' },
    [HealthLevel.MEDICAL]: { label: '建议就医', color: '#f5222d', icon: '🏥' }
  }
  return levelMap[level]
}

/**
 * 获取健康建议
 * @param level 健康等级
 * @param symptomIds 选中的症状ID数组
 * @returns 健康建议
 */
export function getHealthAdvice(level: HealthLevel, symptomIds: string[]): HealthAdvice {
  const adviceMap: Record<HealthLevel, HealthAdvice> = {
    [HealthLevel.EXCELLENT]: {
      level,
      title: '您的身体状况非常好！',
      content: [
        '继续保持健康的生活方式',
        '适量运动，均衡饮食',
        '定期进行健康自检',
        '保持良好的作息习惯'
      ]
    },
    [HealthLevel.GOOD]: {
      level,
      title: '您的身体状况良好！',
      content: [
        '注意劳逸结合，避免过度劳累',
        '保持规律作息，充足睡眠',
        '适当增加运动量',
        '关注身体信号，及时调整'
      ]
    },
    [HealthLevel.AVERAGE]: {
      level,
      title: '您的身体状况一般，需要关注！',
      content: [
        '检查生活习惯，减少不良习惯',
        '增加休息时间，保证充足睡眠',
        '注意饮食营养均衡',
        '适当进行体育锻炼'
      ]
    },
    [HealthLevel.ATTENTION]: {
      level,
      title: '您的身体需要更多关注！',
      content: [
        '调整生活节奏，减轻压力',
        '保证充足的睡眠时间',
        '注意饮食健康，避免刺激性食物',
        '建议进行全面的健康检查'
      ]
    },
    [HealthLevel.MEDICAL]: {
      level,
      title: '建议及时就医检查！',
      content: [
        '请尽快到医院进行全面检查',
        '不要忽视身体发出的警示信号',
        '遵医嘱进行治疗和调理',
        '保持积极乐观的心态'
      ]
    }
  }

  const baseAdvice = adviceMap[level]

  // 根据具体症状添加针对性建议
  const specificAdvice: string[] = []

  symptomIds.forEach(id => {
    const symptom = SYMPTOMS.find(s => s.id === id)
    if (symptom) {
      switch (symptom.category) {
        case SymptomCategory.HEAD:
          specificAdvice.push(`针对${symptom.name}：注意休息，减少用眼时间`)
          break
        case SymptomCategory.SLEEP:
          specificAdvice.push(`针对${symptom.name}：建立规律的作息时间，睡前避免使用电子设备`)
          break
        case SymptomCategory.DIGESTION:
          specificAdvice.push(`针对${symptom.name}：注意饮食清淡，少食多餐`)
          break
        case SymptomCategory.PHYSICAL:
          specificAdvice.push(`针对${symptom.name}：适当增加运动量，注意劳逸结合`)
          break
        case SymptomCategory.PSYCHOLOGICAL:
          specificAdvice.push(`针对${symptom.name}：尝试放松技巧，必要时寻求心理咨询`)
          break
        case SymptomCategory.HEART:
          specificAdvice.push(`针对${symptom.name}：避免剧烈运动，如症状持续请及时就医`)
          break
      }
    }
  })

  // 合并建议
  return {
    level,
    title: baseAdvice.title,
    content: [...baseAdvice.content.slice(0, 2), ...specificAdvice.slice(0, 2), ...baseAdvice.content.slice(2)]
  }
}

/**
 * 根据分类获取症状列表
 * @param category 症状分类
 * @returns 症状列表
 */
export function getSymptomsByCategory(category: SymptomCategory): Symptom[] {
  return SYMPTOMS.filter(s => s.category === category)
}

/**
 * 获取所有分类
 * @returns 分类列表
 */
export function getAllCategories(): SymptomCategory[] {
  return Object.values(SymptomCategory)
}
