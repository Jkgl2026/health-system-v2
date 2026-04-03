/**
 * 中医养生方法数据库
 * 包含各种中医养生方法（空腹禅、辟谷、轻断食、功法、艾灸、火灸、八卦阴阳罐等）
 */

// 方法类型
export enum MethodType {
  INTERNAL = 'internal',      // 内调
  EXTERNAL = 'external',      // 外治
  MIND_BODY = 'mind_body',    // 身心
  EXERCISE = 'exercise'       // 功法训练
}

// 养生方法接口
export interface TCMMethod {
  id: string;
  name: string;
  description: string;
  type: MethodType;
  suitableConstitutions: string[];  // 适用体质
  suitableDiseases?: string[];      // 适用疾病
  suitableSymptoms?: string[];      // 适用症状
  duration?: string;                 // 推荐时长
  frequency?: string;                // 推荐频率
  precautions?: string[];           // 注意事项
  combineMethods?: string[];        // 配合方法
  benefits?: string[];              // 功效
  intensity: 'light' | 'moderate' | 'strong';  // 强度
}

// 养生方法数据库
export const TCM_METHODS_DATABASE: TCMMethod[] = [
  // ===== 内调方法 =====
  {
    id: 'empty_belly_zen',
    name: '空腹禅',
    description: '通过空腹和禅修结合，净化身心，调节代谢，改善三高',
    type: MethodType.MIND_BODY,
    suitableConstitutions: ['气郁质', '阴虚质', '痰湿质', '血瘀质', '湿热质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes', 'has_hyperlipidemia'],
    suitableSymptoms: ['头晕', '乏力', '失眠', '焦虑', '肥胖'],
    duration: '8-24小时，根据体质和疾病调整',
    frequency: '每周1-3次',
    precautions: [
      '高血压患者避免过度空腹，从12小时开始',
      '糖尿病患者密切监测血糖，从8小时开始',
      '低血糖、低血压患者慎重',
      '孕妇、经期女性避免'
    ],
    combineMethods: ['艾灸', '功法训练', '呼吸训练'],
    benefits: ['降低血压', '调节血糖', '降低血脂', '改善代谢', '净化身心'],
    intensity: 'moderate'
  },
  {
    id: 'fasting_therapy',
    name: '辟谷',
    description: '短期断食疗法，排毒净化，重启身体自愈力',
    type: MethodType.INTERNAL,
    suitableConstitutions: ['痰湿质', '血瘀质', '湿热质'],
    suitableDiseases: ['has_hyperlipidemia', 'has_hypertension'],
    suitableSymptoms: ['肥胖', '消化不良', '疲劳', '口苦'],
    duration: '3-7天短期辟谷，或每月1-2天周期性辟谷',
    frequency: '每季度1次（长期辟谷）或每月1-2天（周期性）',
    precautions: [
      '必须专业指导进行',
      '体质虚弱者不宜',
      '三高患者需医生同意',
      '初学者从短期开始'
    ],
    combineMethods: ['火灸', '八卦阴阳罐', '功法训练'],
    benefits: ['排毒净化', '改善代谢', '减轻体重', '增强免疫力'],
    intensity: 'strong'
  },
  {
    id: 'light_fasting',
    name: '轻断食',
    description: '温和的间歇性断食，适合日常保健',
    type: MethodType.INTERNAL,
    suitableConstitutions: ['平和质', '气虚质', '阴虚质'],
    suitableDiseases: ['has_hyperlipidemia', 'has_diabetes'],
    suitableSymptoms: ['食欲不振', '消化不良', '轻度肥胖'],
    duration: '12-16小时',
    frequency: '每周2-3次，或16:8断食法',
    precautions: [
      '循序渐进',
      '保持充足饮水',
      '避免过度运动',
      '饥饿感强烈时可适量补充'
    ],
    combineMethods: ['艾灸', '功法训练', '呼吸训练'],
    benefits: ['改善代谢', '控制体重', '增强免疫力', '延缓衰老'],
    intensity: 'light'
  },

  // ===== 外治方法 =====
  {
    id: 'moxibustion',
    name: '艾灸',
    description: '艾叶燃烧温热刺激穴位，温通经络，扶正祛邪',
    type: MethodType.EXTERNAL,
    suitableConstitutions: ['阳虚质', '气虚质', '寒湿质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes', 'has_hyperlipidemia'],
    suitableSymptoms: ['畏寒', '乏力', '腹痛', '关节痛'],
    duration: '每次20-30分钟',
    frequency: '每周2-3次',
    precautions: [
      '避免烫伤',
      '孕妇避免腹部艾灸',
      '发热期暂停',
      '餐后1小时内避免'
    ],
    combineMethods: ['功法训练', '手法调理', '空腹禅'],
    benefits: ['温补阳气', '散寒止痛', '调理气血', '增强免疫力'],
    intensity: 'moderate'
  },
  {
    id: 'fire_cupping',
    name: '火灸',
    description: '火罐配合艾灸，温热刺激强，祛寒除湿',
    type: MethodType.EXTERNAL,
    suitableConstitutions: ['寒湿质', '阳虚质', '痰湿质'],
    suitableDiseases: ['has_hypertension', 'has_hyperlipidemia'],
    suitableSymptoms: ['寒湿重', '关节痛', '肌肉酸痛', '肥胖'],
    duration: '每次15-20分钟',
    frequency: '每周1-2次',
    precautions: [
      '皮肤破损处避免',
      '孕妇腰腹部避免',
      '出血性疾病患者避免',
      '避免留罐过久'
    ],
    combineMethods: ['艾灸', '手法调理', '辟谷'],
    benefits: ['祛寒除湿', '疏通经络', '活血化瘀', '止痛'],
    intensity: 'strong'
  },
  {
    id: 'bagua_cupping',
    name: '八卦阴阳罐',
    description: '八卦排列的拔罐方法，调和阴阳，平衡气血',
    type: MethodType.EXTERNAL,
    suitableConstitutions: ['血瘀质', '痰湿质', '气郁质'],
    suitableDiseases: ['has_hypertension', 'has_hyperlipidemia'],
    suitableSymptoms: ['血瘀', '痰湿重', '经络不通', '疼痛'],
    duration: '每次15-20分钟',
    frequency: '每周1-2次',
    precautions: [
      '按顺序操作',
      '避免过度吸拔',
      '皮肤过敏者慎重',
      '虚证体质轻吸'
    ],
    combineMethods: ['艾灸', '手法调理', '辟谷'],
    benefits: ['调和阴阳', '疏通经络', '活血化瘀', '平衡气血'],
    intensity: 'moderate'
  },
  {
    id: 'manual_therapy',
    name: '手法调理',
    description: '中医推拿、按摩等手法调理，疏通经络，调理脏腑',
    type: MethodType.EXTERNAL,
    suitableConstitutions: ['气郁质', '血瘀质', '痰湿质'],
    suitableDiseases: ['has_hypertension', 'has_hyperlipidemia'],
    suitableSymptoms: ['经络不通', '肌肉紧张', '疼痛', '消化不良'],
    duration: '每次30-60分钟',
    frequency: '每周1-2次',
    precautions: [
      '力度适中',
      '避免在饱餐后立即进行',
      '皮肤破损处避免',
      '孕妇、经期女性避免特定部位'
    ],
    combineMethods: ['艾灸', '功法训练', '呼吸训练'],
    benefits: ['疏通经络', '缓解疼痛', '调理脏腑', '放松身心'],
    intensity: 'moderate'
  },

  // ===== 功法训练 =====
  {
    id: 'eight_section_brocade',
    name: '八段锦',
    description: '传统功法八节动作，调理全身，强身健体',
    type: MethodType.EXERCISE,
    suitableConstitutions: ['平和质', '气虚质', '阳虚质', '阴虚质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes', 'has_hyperlipidemia'],
    suitableSymptoms: ['乏力', '气短', '体质虚弱', '三高症状'],
    duration: '每次15-20分钟',
    frequency: '每日1-2次',
    precautions: [
      '动作标准',
      '循序渐进',
      '避免过度疲劳',
      '有严重疾病者咨询医生'
    ],
    combineMethods: ['艾灸', '呼吸训练', '空腹禅'],
    benefits: ['调理气血', '强健筋骨', '改善代谢', '增强免疫力'],
    intensity: 'light'
  },
  {
    id: 'tai_chi',
    name: '太极拳',
    description: '传统武术拳法，柔和缓慢，调和阴阳',
    type: MethodType.EXERCISE,
    suitableConstitutions: ['平和质', '阴虚质', '气郁质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes', 'has_hyperlipidemia'],
    suitableSymptoms: ['焦虑', '失眠', '血压不稳', '体质虚弱'],
    duration: '每次20-30分钟',
    frequency: '每日1次',
    precautions: [
      '动作缓慢均匀',
      '保持呼吸平稳',
      '避免过度劳累',
      '关节有问题者注意动作幅度'
    ],
    combineMethods: ['呼吸训练', '艾灸', '空腹禅'],
    benefits: ['调和阴阳', '改善平衡', '增强心肺功能', '缓解压力'],
    intensity: 'light'
  },
  {
    id: 'five_animal_play',
    name: '五禽戏',
    description: '模仿五种动物的功法，锻炼全身，增强体质',
    type: MethodType.EXERCISE,
    suitableConstitutions: ['气虚质', '痰湿质', '血瘀质'],
    suitableDiseases: ['has_hyperlipidemia', 'has_hypertension'],
    suitableSymptoms: ['体质虚弱', '关节僵硬', '气血不足', '三高症状'],
    duration: '每次15-20分钟',
    frequency: '每日1-2次',
    precautions: [
      '模仿到位',
      '动作流畅',
      '避免勉强',
      '循序渐进练习'
    ],
    combineMethods: ['艾灸', '手法调理', '呼吸训练'],
    benefits: ['强健五脏', '活动筋骨', '增强体质', '改善气血'],
    intensity: 'moderate'
  },
  {
    id: 'qigong',
    name: '气功',
    description: '传统气功修炼，调和气血，培元固本',
    type: MethodType.MIND_BODY,
    suitableConstitutions: ['气虚质', '阳虚质', '阴虚质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes'],
    suitableSymptoms: ['乏力', '气短', '心悸', '失眠'],
    duration: '每次20-40分钟',
    frequency: '每日1-2次',
    precautions: [
      '必须在专业指导下进行',
      '避免追求强功',
      '保持正确姿势',
      '精神专注'
    ],
    combineMethods: ['艾灸', '呼吸训练', '空腹禅'],
    benefits: ['培元固本', '调和气血', '增强免疫力', '延缓衰老'],
    intensity: 'moderate'
  },

  // ===== 身心调理 =====
  {
    id: 'meditation',
    name: '静坐冥想',
    description: '静坐冥想，静心养神，调节神经系统',
    type: MethodType.MIND_BODY,
    suitableConstitutions: ['气郁质', '阴虚质', '平和质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes'],
    suitableSymptoms: ['焦虑', '失眠', '压力大', '心悸'],
    duration: '每次15-30分钟',
    frequency: '每日1-2次',
    precautions: [
      '选择安静环境',
      '保持正确坐姿',
      '循序渐进',
      '避免过度执着'
    ],
    combineMethods: ['艾灸', '呼吸训练', '功法训练'],
    benefits: ['缓解压力', '改善睡眠', '调节血压', '增强专注力'],
    intensity: 'light'
  },
  {
    id: 'breathing_exercise',
    name: '呼吸训练',
    description: '呼吸吐纳训练，调理气机，增强肺功能',
    type: MethodType.MIND_BODY,
    suitableConstitutions: ['气虚质', '阴虚质', '气郁质'],
    suitableDiseases: ['has_hypertension', 'has_diabetes'],
    suitableSymptoms: ['气短', '胸闷', '焦虑', '失眠'],
    duration: '每次10-20分钟',
    frequency: '每日2-3次',
    precautions: [
      '呼吸自然',
      '避免过度用力',
      '环境空气清新',
      '循序渐进'
    ],
    combineMethods: ['功法训练', '冥想', '艾灸'],
    benefits: ['增强肺功能', '调理气机', '缓解焦虑', '改善睡眠'],
    intensity: 'light'
  }
];

// 根据体质、疾病、症状匹配养生方法
export function matchTCMMethods(params: {
  constitution?: string;
  diseases?: string[];
  symptoms?: string[];
  age?: number;
  intensity?: 'light' | 'moderate' | 'strong';
}): TCMMethod[] {
  const { constitution, diseases = [], symptoms = [], age, intensity = 'moderate' } = params;

  let matchedMethods = TCM_METHODS_DATABASE.filter(method => {
    // 体质匹配
    if (constitution && !method.suitableConstitutions.includes(constitution)) {
      // 如果体质不匹配，但方法适用平和质，也可以推荐
      if (!method.suitableConstitutions.includes('平和质')) {
        return false;
      }
    }

    // 疾病匹配（可选）
    if (diseases.length > 0 && method.suitableDiseases) {
      const hasMatchingDisease = diseases.some(disease =>
        method.suitableDiseases?.includes(disease)
      );
      if (!hasMatchingDisease) {
        return false;
      }
    }

    // 症状匹配（可选）
    if (symptoms.length > 0 && method.suitableSymptoms) {
      const hasMatchingSymptom = symptoms.some(symptom =>
        method.suitableSymptoms?.includes(symptom)
      );
      if (!hasMatchingSymptom) {
        return false;
      }
    }

    // 年龄调整（老年人推荐轻度方法）
    if (age && age > 65) {
      return method.intensity === 'light' || method.intensity === 'moderate';
    }

    // 强度匹配
    return true;
  });

  // 根据强度筛选
  if (intensity) {
    matchedMethods = matchedMethods.filter(method => {
      if (intensity === 'light') {
        return method.intensity === 'light';
      } else if (intensity === 'moderate') {
        return method.intensity === 'light' || method.intensity === 'moderate';
      }
      return true;
    });
  }

  // 按类型分类并排序
  const internalMethods = matchedMethods.filter(m => m.type === MethodType.INTERNAL);
  const externalMethods = matchedMethods.filter(m => m.type === MethodType.EXTERNAL);
  const mindBodyMethods = matchedMethods.filter(m => m.type === MethodType.MIND_BODY);
  const exerciseMethods = matchedMethods.filter(m => m.type === MethodType.EXERCISE);

  // 优先推荐：内调 > 外治 > 身心 > 功法
  return [
    ...internalMethods.slice(0, 2),
    ...externalMethods.slice(0, 3),
    ...mindBodyMethods.slice(0, 2),
    ...exerciseMethods.slice(0, 2)
  ].slice(0, 6); // 总共推荐最多6个方法
}

// 生成综合调理方案
export function generateComprehensiveRegimen(params: {
  constitution?: string;
  diseases?: string[];
  symptoms?: string[];
  age?: number;
}): {
  internalMethods: TCMMethod[];
  externalMethods: TCMMethod[];
  mindBodyMethods: TCMMethod[];
  exerciseMethods: TCMMethod[];
  summary: string;
} {
  const matchedMethods = matchTCMMethods(params);

  const internalMethods = matchedMethods.filter(m => m.type === MethodType.INTERNAL);
  const externalMethods = matchedMethods.filter(m => m.type === MethodType.EXTERNAL);
  const mindBodyMethods = matchedMethods.filter(m => m.type === MethodType.MIND_BODY || m.type === MethodType.EXERCISE);

  const summary = generateRegimenSummary(params, matchedMethods);

  return {
    internalMethods,
    externalMethods,
    mindBodyMethods,
    exerciseMethods: matchedMethods.filter(m => m.type === MethodType.EXERCISE),
    summary
  };
}

// 生成调理方案摘要
function generateRegimenSummary(params: any, methods: TCMMethod[]): string {
  const { constitution, diseases } = params;

  let summary = '';

  // 基于体质的摘要
  if (constitution) {
    switch (constitution) {
      case '气虚质':
        summary += '气虚体质，宜温补气血，推荐艾灸和温和功法。';
        break;
      case '阳虚质':
        summary += '阳虚体质，宜温阳散寒，推荐火灸和温补功法。';
        break;
      case '阴虚质':
        summary += '阴虚体质，宜滋阴养液，推荐空腹禅和清凉功法。';
        break;
      case '痰湿质':
        summary += '痰湿体质，宜祛湿化痰，推荐辟谷和拔罐调理。';
        break;
      case '血瘀质':
        summary += '血瘀体质，宜活血化瘀，推荐八卦阴阳罐和活血功法。';
        break;
      case '湿热质':
        summary += '湿热体质，宜清热祛湿，推荐轻断食和清热功法。';
        break;
      case '气郁质':
        summary += '气郁体质，宜疏肝解郁，推荐空腹禅和疏导功法。';
        break;
      default:
        summary += '平和体质，宜平衡调理，推荐综合养生方法。';
    }
  }

  // 基于疾病的摘要
  if (diseases && diseases.length > 0) {
    const hasThreeHighs = diseases.includes('has_hypertension') ||
                          diseases.includes('has_diabetes') ||
                          diseases.includes('has_hyperlipidemia');

    if (hasThreeHighs) {
      summary += ' 针对三高症状，特别推荐空腹禅调理，配合艾灸和功法训练，内外兼治。';
    }
  }

  return summary;
}
