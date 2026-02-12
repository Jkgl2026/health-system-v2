// 症状映射表 - 将症状ID转换为症状名称
// 注意：这是一个示例映射，需要根据实际的300个症状表进行补充

// 身体语言简表症状（1-20）
const BODY_LANGUAGE_SYMPTOMS: Record<number, string> = {
  1: '面色苍白',
  2: '面色潮红',
  3: '面色晦暗',
  4: '眼圈发黑',
  5: '眼睛干涩',
  6: '眼睛红肿',
  7: '视力模糊',
  8: '耳鸣',
  9: '听力下降',
  10: '口干舌燥',
  11: '口苦',
  12: '口臭',
  13: '舌苔厚腻',
  14: '舌苔发黄',
  15: '舌苔发白',
  16: '牙龈出血',
  17: '咽喉肿痛',
  18: '声音嘶哑',
  19: '颈部僵硬',
  20: '淋巴结肿大',
};

// 不良生活习惯症状（21-40）
const BAD_HABITS_SYMPTOMS: Record<number, string> = {
  21: '经常熬夜',
  22: '睡眠不足',
  23: '作息不规律',
  24: '久坐不动',
  25: '运动量少',
  26: '暴饮暴食',
  27: '饮食不规律',
  28: '喜食辛辣',
  29: '喜食油腻',
  30: '吸烟',
  31: '饮酒',
  32: '过度使用手机',
  33: '过度用眼',
  34: '压力过大',
  35: '焦虑不安',
  36: '情绪抑郁',
  37: '易怒易燥',
  38: '缺乏社交',
  39: '过度劳累',
  40: '缺乏休息',
};

// 重点症状（41-60）
const KEY_SYMPTOMS: Record<number, string> = {
  41: '头痛头晕',
  42: '胸闷气短',
  43: '心慌心悸',
  44: '呼吸困难',
  45: '咳嗽咳痰',
  46: '胸痛胸闷',
  47: '腹胀腹痛',
  48: '恶心呕吐',
  49: '食欲不振',
  50: '消化不良',
  51: '便秘',
  52: '腹泻',
  53: '尿频尿急',
  54: '尿痛',
  55: '下肢水肿',
  56: '关节疼痛',
  57: '肌肉酸痛',
  58: '疲劳乏力',
  59: '体重下降',
  60: '体重增加',
};

// 其他症状（61-100）示例
const OTHER_SYMPTOMS: Record<number, string> = {
  61: '盗汗',
  62: '自汗',
  63: '手足发凉',
  64: '手脚发热',
  65: '皮肤瘙痒',
  66: '皮疹',
  67: '脱发',
  68: '指甲变脆',
  69: '记忆力减退',
  70: '注意力不集中',
  71: '失眠多梦',
  72: '早醒',
  73: '嗜睡',
  74: '反酸烧心',
  75: '吞咽困难',
  76: '牙龈出血',
  77: '口角炎',
  78: '鼻出血',
  79: '流鼻涕',
  80: '鼻塞',
  81: '打喷嚏',
  82: '眼睛发红',
  83: '眼睛流泪',
  84: '眼睑浮肿',
  85: '视力下降',
  86: '复视',
  87: '畏光',
  88: '声音嘶哑',
  89: '喉咙异物感',
  90: '吞咽困难',
  91: '颈部酸痛',
  92: '肩背酸痛',
  93: '腰酸背痛',
  94: '膝盖疼痛',
  95: '脚跟疼痛',
  96: '手脚麻木',
  97: '手脚颤抖',
  98: '关节肿胀',
  99: '关节僵硬',
  100: '活动受限',
};

// 合并所有症状映射
export const SYMPTOM_MAP: Record<number, string> = {
  ...BODY_LANGUAGE_SYMPTOMS,
  ...BAD_HABITS_SYMPTOMS,
  ...KEY_SYMPTOMS,
  ...OTHER_SYMPTOMS,
};

// 根据症状ID获取症状名称
export function getSymptomName(symptomId: number): string {
  return SYMPTOM_MAP[symptomId] || `症状${symptomId}`;
}

// 根据症状ID数组获取症状名称列表
export function getSymptomNames(symptomIds: number[]): string[] {
  return symptomIds.map(id => getSymptomName(id));
}

// 根据症状分类获取症状列表
export function getSymptomsByCategory(category: 'body_language' | 'bad_habits' | 'key' | 'other'): string[] {
  const categoryMap = {
    body_language: BODY_LANGUAGE_SYMPTOMS,
    bad_habits: BAD_HABITS_SYMPTOMS,
    key: KEY_SYMPTOMS,
    other: OTHER_SYMPTOMS,
  };
  return Object.values(categoryMap[category]);
}

// 获取症状分类名称
export function getSymptomCategoryName(symptomId: number): string {
  if (symptomId >= 1 && symptomId <= 20) return '身体语言简表';
  if (symptomId >= 21 && symptomId <= 40) return '不良生活习惯';
  if (symptomId >= 41 && symptomId <= 60) return '重点症状';
  if (symptomId >= 61 && symptomId <= 100) return '其他症状';
  return '未知分类';
}
