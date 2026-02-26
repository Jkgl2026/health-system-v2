// utils/health-data.js
// 健康数据常量 - 基于Web版health-data.ts精确转换

// 健康要素
const HEALTH_ELEMENTS = {
  awareness: {
    title: '健康观念',
    icon: '🧠',
    description: '对健康的认知和理解',
    levels: ['缺乏认知', '开始觉醒', '初步建立', '较为成熟', '非常成熟'],
  },
  habits: {
    title: '生活习惯',
    icon: '🏃',
    description: '日常生活方式和习惯',
    levels: ['非常不良', '存在较多问题', '有所改善', '良好习惯', '优秀习惯'],
  },
  diet: {
    title: '饮食习惯',
    icon: '🍽️',
    description: '饮食结构和进食方式',
    levels: ['严重失衡', '不够合理', '基本正常', '比较健康', '非常健康'],
  },
  exercise: {
    title: '运动习惯',
    icon: '💪',
    description: '运动频率和强度',
    levels: ['从不运动', '偶尔运动', '规律运动', '积极运动', '运动达人'],
  },
  sleep: {
    title: '睡眠质量',
    icon: '😴',
    description: '睡眠时间和质量',
    levels: ['严重失眠', '睡眠较差', '时好时坏', '睡眠良好', '睡眠极佳'],
  },
  emotion: {
    title: '情绪管理',
    icon: '😊',
    description: '情绪调节和心理状态',
    levels: ['情绪失控', '容易波动', '偶尔波动', '较为稳定', '非常稳定'],
  },
  environment: {
    title: '环境因素',
    icon: '🌍',
    description: '生活和工作环境',
    levels: ['环境恶劣', '存在污染', '一般环境', '良好环境', '优质环境'],
  },
  immunity: {
    title: '免疫力',
    icon: '🛡️',
    description: '身体抵抗疾病的能力',
    levels: ['极易生病', '抵抗力弱', '一般水平', '较强抵抗', '免疫强健'],
  },
};

// 身体症状 - 身体语言简表（100项）
const BODY_SYMPTOMS = [
  // 头部症状
  { id: 1, name: '头疼', category: '头部' },
  { id: 2, name: '头晕', category: '头部' },
  { id: 3, name: '偏头痛', category: '头部' },
  { id: 4, name: '头麻', category: '头部' },
  { id: 5, name: '脑鸣', category: '头部' },
  { id: 6, name: '失眠', category: '头部' },
  { id: 7, name: '多梦', category: '头部' },
  { id: 8, name: '健忘', category: '头部' },
  { id: 9, name: '嗜睡', category: '头部' },
  { id: 10, name: '易醒', category: '头部' },
  
  // 眼部症状
  { id: 11, name: '眼睛干涩', category: '眼部' },
  { id: 12, name: '眼睛疲劳', category: '眼部' },
  { id: 13, name: '视力模糊', category: '眼部' },
  { id: 14, name: '眼睛发红', category: '眼部' },
  { id: 15, name: '眼睛胀痛', category: '眼部' },
  { id: 16, name: '眼皮跳', category: '眼部' },
  { id: 17, name: '黑眼圈', category: '眼部' },
  { id: 18, name: '眼袋', category: '眼部' },
  { id: 19, name: '迎风流泪', category: '眼部' },
  { id: 20, name: '飞蚊症', category: '眼部' },
  
  // 耳部症状
  { id: 21, name: '耳鸣', category: '耳部' },
  { id: 22, name: '耳聋', category: '耳部' },
  { id: 23, name: '耳痛', category: '耳部' },
  { id: 24, name: '耳朵痒', category: '耳部' },
  { id: 25, name: '听力下降', category: '耳部' },
  
  // 鼻部症状
  { id: 26, name: '鼻塞', category: '鼻部' },
  { id: 27, name: '流鼻涕', category: '鼻部' },
  { id: 28, name: '打喷嚏', category: '鼻部' },
  { id: 29, name: '鼻子干', category: '鼻部' },
  { id: 30, name: '鼻出血', category: '鼻部' },
  
  // 口腔症状
  { id: 31, name: '口干', category: '口腔' },
  { id: 32, name: '口苦', category: '口腔' },
  { id: 33, name: '口臭', category: '口腔' },
  { id: 34, name: '口腔溃疡', category: '口腔' },
  { id: 35, name: '牙龈出血', category: '口腔' },
  { id: 36, name: '牙龈肿痛', category: '口腔' },
  { id: 37, name: '牙齿松动', category: '口腔' },
  { id: 38, name: '嘴唇干裂', category: '口腔' },
  { id: 39, name: '舌头麻木', category: '口腔' },
  { id: 40, name: '舌苔厚', category: '口腔' },
  
  // 咽喉症状
  { id: 41, name: '咽喉干', category: '咽喉' },
  { id: 42, name: '咽喉痛', category: '咽喉' },
  { id: 43, name: '咽喉痒', category: '咽喉' },
  { id: 44, name: '声音嘶哑', category: '咽喉' },
  { id: 45, name: '异物感', category: '咽喉' },
  
  // 颈部症状
  { id: 46, name: '颈椎痛', category: '颈部' },
  { id: 47, name: '颈部僵硬', category: '颈部' },
  { id: 48, name: '颈部肿块', category: '颈部' },
  { id: 49, name: '淋巴肿大', category: '颈部' },
  { id: 50, name: '甲状腺问题', category: '颈部' },
  
  // 肩部症状
  { id: 51, name: '肩痛', category: '肩部' },
  { id: 52, name: '肩周炎', category: '肩部' },
  { id: 53, name: '肩部酸胀', category: '肩部' },
  { id: 54, name: '肩部僵硬', category: '肩部' },
  { id: 55, name: '肩膀沉重', category: '肩部' },
  
  // 胸部症状
  { id: 56, name: '胸闷', category: '胸部' },
  { id: 57, name: '胸痛', category: '胸部' },
  { id: 58, name: '心悸', category: '胸部' },
  { id: 59, name: '气短', category: '胸部' },
  { id: 60, name: '乳房胀痛', category: '胸部' },
  
  // 腹部症状
  { id: 61, name: '胃痛', category: '腹部' },
  { id: 62, name: '胃胀', category: '腹部' },
  { id: 63, name: '腹胀', category: '腹部' },
  { id: 64, name: '腹痛', category: '腹部' },
  { id: 65, name: '腹泻', category: '腹部' },
  { id: 66, name: '便秘', category: '腹部' },
  { id: 67, name: '消化不良', category: '腹部' },
  { id: 68, name: '食欲不振', category: '腹部' },
  { id: 69, name: '恶心呕吐', category: '腹部' },
  { id: 70, name: '反酸烧心', category: '腹部' },
  
  // 腰部症状
  { id: 71, name: '腰痛', category: '腰部' },
  { id: 72, name: '腰酸', category: '腰部' },
  { id: 73, name: '腰椎问题', category: '腰部' },
  { id: 74, name: '腰肌劳损', category: '腰部' },
  { id: 75, name: '腰部僵硬', category: '腰部' },
  
  // 四肢症状
  { id: 76, name: '手脚冰凉', category: '四肢' },
  { id: 77, name: '手脚麻木', category: '四肢' },
  { id: 78, name: '手脚抽筋', category: '四肢' },
  { id: 79, name: '关节疼痛', category: '四肢' },
  { id: 80, name: '关节肿胀', category: '四肢' },
  { id: 81, name: '下肢水肿', category: '四肢' },
  { id: 82, name: '静脉曲张', category: '四肢' },
  { id: 83, name: '手抖', category: '四肢' },
  { id: 84, name: '四肢无力', category: '四肢' },
  { id: 85, name: '膝关节痛', category: '四肢' },
  
  // 皮肤症状
  { id: 86, name: '皮肤干燥', category: '皮肤' },
  { id: 87, name: '皮肤瘙痒', category: '皮肤' },
  { id: 88, name: '皮肤过敏', category: '皮肤' },
  { id: 89, name: '湿疹', category: '皮肤' },
  { id: 90, name: '荨麻疹', category: '皮肤' },
  
  // 全身症状
  { id: 91, name: '疲劳乏力', category: '全身' },
  { id: 92, name: '怕冷', category: '全身' },
  { id: 93, name: '怕热', category: '全身' },
  { id: 94, name: '自汗', category: '全身' },
  { id: 95, name: '盗汗', category: '全身' },
  { id: 96, name: '免疫力低', category: '全身' },
  { id: 97, name: '容易感冒', category: '全身' },
  { id: 98, name: '体重异常', category: '全身' },
  { id: 99, name: '面色萎黄', category: '全身' },
  { id: 100, name: '精神不振', category: '全身' },
];

// 获取症状分类
const getSymptomCategories = () => {
  const categories = [...new Set(BODY_SYMPTOMS.map(s => s.category))];
  return categories;
};

// 按分类获取症状
const getSymptomsByCategory = (category) => {
  return BODY_SYMPTOMS.filter(s => s.category === category);
};

// 300项症状表（完整版）
const BODY_SYMPTOMS_300 = [
  // 头部相关
  { id: 301, name: '头疼', category: '头部', description: '经常头痛不适' },
  { id: 302, name: '头晕', category: '头部', description: '经常头晕不适' },
  { id: 303, name: '头麻', category: '头部', description: '头部麻木' },
  { id: 304, name: '脑鸣', category: '头部', description: '有脑鸣声' },
  { id: 305, name: '嗜睡', category: '头部', description: '白天精神不振，总是想睡觉' },
  { id: 306, name: '易醒', category: '头部', description: '夜间易醒' },
  { id: 307, name: '失眠', category: '头部', description: '入睡困难' },
  { id: 308, name: '多梦', category: '头部', description: '睡眠多梦' },
  { id: 309, name: '偏头痛', category: '头部', description: '一侧头痛' },
  { id: 310, name: '健忘', category: '头部', description: '记忆力下降' },
  { id: 311, name: '懒语', category: '头部', description: '说话减少' },
  { id: 312, name: '结巴', category: '头部', description: '言语不畅' },
  { id: 313, name: '晕车', category: '头部', description: '乘车时头晕恶心' },
  { id: 314, name: '晕机', category: '头部', description: '乘机时头晕恶心' },
  { id: 315, name: '头部怕冷', category: '头部', description: '头部怕冷，遇凉不适' },
  // ... 更多症状会继续添加
];

// 不良生活习惯清单
const BAD_HABITS_CHECKLIST = {
  饮食: [
    { id: 1, habit: '经常不吃早餐', impact: '脾胃受损，气血生化不足' },
    { id: 2, habit: '8点后吃晚饭', impact: '加重脾胃负担，影响消化' },
    { id: 3, habit: '吃夜宵', impact: '加重脾胃负担，影响消化' },
    { id: 4, habit: '吃饭过饱', impact: '脾胃功能紊乱' },
    { id: 5, habit: '吃饭过急', impact: '脾胃功能紊乱' },
    { id: 6, habit: '吃饭过快', impact: '脾胃功能紊乱' },
    { id: 7, habit: '吃饭过少', impact: '脾胃功能紊乱' },
    { id: 8, habit: '常在外面吃饭', impact: '饮食不卫生' },
    { id: 9, habit: '常点外卖', impact: '油脂过多' },
    { id: 10, habit: '常吃剩饭剩菜', impact: '亚硝酸盐摄入过多' },
    { id: 11, habit: '常吃动物内脏', impact: '胆固醇摄入过多' },
    { id: 12, habit: '常吃肉食', impact: '血脂升高' },
    { id: 13, habit: '吃菜喜油多', impact: '血液粘稠' },
    { id: 14, habit: '吃东西偏辣', impact: '刺激肠胃' },
    { id: 15, habit: '吃东西偏咸(口味重)', impact: '增加肾脏负担' },
    { id: 16, habit: '很少吃蔬菜', impact: '维生素、纤维素摄入不足' },
    { id: 17, habit: '素食者', impact: '维生素、纤维素摄入不足' },
    { id: 18, habit: '喜欢吃烫食', impact: '损伤食道和胃黏膜' },
    { id: 19, habit: '喝烫水', impact: '损伤食道和胃黏膜' },
    { id: 20, habit: '喜精米', impact: '营养单一，缺乏微量元素' },
    { id: 21, habit: '喜精面', impact: '营养单一，缺乏微量元素' },
    { id: 22, habit: '喜主食', impact: '营养单一，缺乏微量元素' },
    { id: 23, habit: '很少吃五谷杂粮', impact: '膳食纤维和B族维生素不足' },
    { id: 24, habit: '偏食', impact: '营养不均衡' },
    { id: 25, habit: '挑食', impact: '营养不均衡' },
    { id: 26, habit: '嗜吃某种食物', impact: '营养不均衡' },
    { id: 27, habit: '常喝酒', impact: '损伤肝脏，增加心血管疾病风险' },
    { id: 28, habit: '酗酒', impact: '损伤肝脏，增加心血管疾病风险' },
    { id: 29, habit: '喝冰啤酒', impact: '损伤肝脏，增加心血管疾病风险' },
    { id: 30, habit: '喜饭后吃水果', impact: '影响消化，血糖波动' },
    { id: 31, habit: '吃过量水果', impact: '影响消化，血糖波动' },
    { id: 32, habit: '爱吃反季节蔬菜', impact: '可能含有催熟剂和农药' },
    { id: 33, habit: '爱吃反季节水果', impact: '可能含有催熟剂和农药' },
    { id: 34, habit: '喜欢吃螃蟹', impact: '寒凉伤胃，影响消化' },
    { id: 35, habit: '喜欢吃柿子', impact: '寒凉伤胃，影响消化' },
    { id: 36, habit: '不吃坚果', impact: '优质脂肪摄入不足' },
    { id: 37, habit: '吃坚果过多', impact: '优质脂肪摄入过多' },
    { id: 38, habit: '常吃方便面类', impact: '高糖高盐，营养不足' },
    { id: 39, habit: '常吃甜食', impact: '高糖高盐，营养不足' },
    { id: 40, habit: '常吃油炸食品', impact: '致癌物质' },
    { id: 41, habit: '常吃腌制食品', impact: '盐分过高' },
    { id: 42, habit: '常吃果脯蜜饯', impact: '添加剂和糖分过高' },
    { id: 43, habit: '常吃罐头', impact: '添加剂和糖分过高' },
    { id: 44, habit: '喜吃冰镇水果', impact: '寒凉伤脾胃' },
    { id: 45, habit: '喜吃烧烤', impact: '致癌物质和添加剂' },
    { id: 46, habit: '喜吃零食', impact: '致癌物质和添加剂' },
    { id: 47, habit: '喜吃鸡头', impact: '致癌物质和添加剂' },
    { id: 48, habit: '烧烤+冰啤酒', impact: '寒热交替，损伤脾胃' },
    { id: 49, habit: '火锅+冰啤酒', impact: '寒热交替，损伤脾胃' },
    { id: 50, habit: '烧烤+饮料', impact: '寒热交替，损伤脾胃' },
    { id: 51, habit: '不喝水', impact: '代谢废物堆积，损伤脾胃' },
    { id: 52, habit: '很少喝水', impact: '代谢废物堆积，损伤脾胃' },
    { id: 53, habit: '常喝凉水', impact: '代谢废物堆积，损伤脾胃' },
    { id: 54, habit: '喜吃雪糕', impact: '代谢废物堆积，损伤脾胃' },
    { id: 55, habit: '喜吃冰冻甜品', impact: '代谢废物堆积，损伤脾胃' },
    { id: 56, habit: '常喝饮料', impact: '代谢废物堆积，损伤脾胃' },
    { id: 57, habit: '吃饭不分筷', impact: '增加肠胃负担' },
    { id: 58, habit: '吃饭快', impact: '增加肠胃负担' },
    { id: 59, habit: '喜喝浓茶', impact: '刺激神经，影响睡眠' },
    { id: 60, habit: '喜喝咖啡', impact: '刺激神经，影响睡眠' },
    { id: 61, habit: '饮食不规律', impact: '脾胃功能紊乱' },
    { id: 62, habit: '常吃中药', impact: '药物副作用，损伤肝肾' },
    { id: 63, habit: '常吃西药', impact: '药物副作用，损伤肝肾' },
    { id: 64, habit: '吃过减肥药', impact: '内分泌紊乱，损伤肝肾' },
    { id: 65, habit: '吃过激素药', impact: '内分泌紊乱，损伤肝肾' },
    { id: 66, habit: '常吃海鲜', impact: '可能导致过敏和痛风' },
    { id: 67, habit: '有无过敏史', impact: '需要特别关注健康状况' },
    { id: 68, habit: '既往病史', impact: '需要特别关注健康状况' },
    { id: 69, habit: '服用药物', impact: '需要特别关注健康状况' },
  ],
  睡觉: [
    { id: 70, habit: '晚11点后睡，早9点后起', impact: '违反生物钟，损伤气血' },
    { id: 71, habit: '经常上夜班(到天亮)', impact: '内分泌紊乱，免疫力下降' },
    { id: 72, habit: '睡眠不足7-8小时', impact: '身体修复时间不够' },
    { id: 73, habit: '睡软床', impact: '脊柱变形，影响气血运行' },
    { id: 74, habit: '枕高枕', impact: '脊柱变形，影响气血运行' },
    { id: 75, habit: '开空调睡觉', impact: '寒气入侵，影响睡眠' },
    { id: 76, habit: '开窗睡觉', impact: '寒气入侵，影响睡眠' },
    { id: 77, habit: '饭后立刻睡觉', impact: '影响消化，导致肥胖' },
    { id: 78, habit: '睡觉把脚放被子外', impact: '脚部受寒，影响循环' },
    { id: 79, habit: '经常过早(早5点前)起', impact: '休息不足，损伤气血' },
    { id: 80, habit: '蒙头睡觉', impact: '缺氧，影响大脑供血' },
  ],
  寒湿: [
    { id: 81, habit: '开窗户睡觉', impact: '寒气入侵' },
    { id: 82, habit: '开空调睡觉', impact: '寒气入侵' },
    { id: 83, habit: '很少晒太阳', impact: '阳气不足，免疫力下降' },
    { id: 84, habit: '长期在空调房工作', impact: '寒湿内侵' },
    { id: 85, habit: '在地下室或冷库等潮湿地方工作', impact: '寒湿严重' },
    { id: 86, habit: '早上洗头洗澡', impact: '寒气入体' },
    { id: 87, habit: '晚上11点后洗头洗澡', impact: '阳气外泄，寒气入侵' },
    { id: 88, habit: '冷水洗头洗澡', impact: '损伤阳气' },
    { id: 89, habit: '天天洗澡', impact: '损伤阳气' },
    { id: 90, habit: '洗头后不及时吹干', impact: '寒湿内侵' },
    { id: 91, habit: '运动后立即洗澡', impact: '气血运行紊乱' },
    { id: 92, habit: '冷水洗脚不擦干', impact: '脚部受寒' },
    { id: 93, habit: '喜欢光脚在地上走', impact: '寒湿从脚入' },
    { id: 94, habit: '冬天冷水洗菜', impact: '寒气入侵' },
    { id: 95, habit: '冬天冷水洗碗', impact: '寒气入侵' },
    { id: 96, habit: '冬天冷水洗衣物', impact: '寒气入侵' },
    { id: 97, habit: '下河(有严重受寒经历)', impact: '寒湿严重' },
    { id: 98, habit: '喜欢露肩', impact: '寒气入侵' },
    { id: 99, habit: '喜欢露腰', impact: '寒气入侵' },
    { id: 100, habit: '喜欢露脚踝', impact: '寒气入侵' },
    { id: 101, habit: '四季穿凉鞋', impact: '寒气入侵' },
    { id: 102, habit: '冬天穿少穿薄', impact: '寒气入侵' },
    { id: 103, habit: '女性经期碰凉', impact: '宫寒，影响妇科健康' },
    { id: 104, habit: '骑电动车没有保护', impact: '风寒入侵' },
    { id: 105, habit: '出汗时喝凉水', impact: '损伤脾胃' },
    { id: 106, habit: '生气时喝凉水', impact: '损伤脾胃' },
    { id: 107, habit: '经常喝冷水', impact: '寒气入侵' },
    { id: 108, habit: '吃冰镇食物', impact: '寒气入侵' },
  ],
  情绪: [
    { id: 109, habit: '生活有重大变故(情感)', impact: '情志内伤，影响健康' },
    { id: 110, habit: '经常生气', impact: '肝气郁结，气血上逆' },
    { id: 111, habit: '爱发脾气', impact: '肝气郁结，气血上逆' },
    { id: 112, habit: '压力大', impact: '免疫下降，内分泌紊乱' },
    { id: 113, habit: '精神紧张', impact: '免疫下降，内分泌紊乱' },
    { id: 114, habit: '愤怒', impact: '情志内伤' },
    { id: 115, habit: '憎恨', impact: '情志内伤' },
    { id: 116, habit: '内疚', impact: '情志内伤' },
    { id: 117, habit: '心事重', impact: '情志内伤' },
    { id: 118, habit: '思念', impact: '损伤脾胃，影响睡眠' },
    { id: 119, habit: '思虑', impact: '损伤脾胃，影响睡眠' },
    { id: 120, habit: '担惊受怕', impact: '损伤脾胃，影响睡眠' },
    { id: 121, habit: '遇事爱抱怨', impact: '情绪失衡' },
    { id: 122, habit: '找外因', impact: '情绪失衡' },
    { id: 123, habit: '善嫉妒', impact: '情绪失衡' },
    { id: 124, habit: '父母离异', impact: '情志内伤' },
    { id: 125, habit: '悲愤', impact: '情志内伤' },
    { id: 126, habit: '有被遗弃感', impact: '情志内伤' },
    { id: 127, habit: '丧偶', impact: '重大创伤' },
    { id: 128, habit: '丧子(女)', impact: '重大创伤' },
    { id: 129, habit: '丧父(母)', impact: '重大创伤' },
    { id: 130, habit: '没有信念', impact: '精神空虚' },
    { id: 131, habit: '不情愿忍让', impact: '气机郁结' },
    { id: 132, habit: '自己生闷气', impact: '气机郁结' },
    { id: 133, habit: '欲望得不到满足', impact: '情绪低落' },
    { id: 134, habit: '失望', impact: '情绪低落' },
    { id: 135, habit: '莫名暴躁', impact: '情志紊乱' },
    { id: 136, habit: '发脾气', impact: '情志紊乱' },
    { id: 137, habit: '抑郁', impact: '情志紊乱' },
    { id: 138, habit: '自卑', impact: '心理压力大' },
    { id: 139, habit: '软弱', impact: '心理压力大' },
    { id: 140, habit: '缺乏安全感', impact: '心理压力大' },
    { id: 141, habit: '无助', impact: '心理压力大' },
    { id: 142, habit: '生气', impact: '肝气上逆' },
    { id: 143, habit: '气愤', impact: '肝气上逆' },
    { id: 144, habit: '发怒', impact: '肝气上逆' },
    { id: 145, habit: '恼怒', impact: '肝气上逆' },
    { id: 146, habit: '盛怒', impact: '肝气上逆' },
    { id: 147, habit: '伤心', impact: '情志内伤' },
    { id: 148, habit: '难受', impact: '情志内伤' },
    { id: 149, habit: '痛苦', impact: '情志内伤' },
    { id: 150, habit: '悲痛', impact: '情志内伤' },
    { id: 151, habit: '哀痛', impact: '情志内伤' },
    { id: 152, habit: '忧虑', impact: '情志内伤' },
    { id: 153, habit: '忧愁', impact: '情志内伤' },
    { id: 154, habit: '哀愁', impact: '情志内伤' },
    { id: 155, habit: '忧郁', impact: '情志内伤' },
    { id: 156, habit: '抑郁', impact: '情志内伤' },
    { id: 157, habit: '害怕', impact: '肾气受损' },
    { id: 158, habit: '惊慌', impact: '肾气受损' },
    { id: 159, habit: '恐惧', impact: '肾气受损' },
    { id: 160, habit: '恐慌', impact: '肾气受损' },
    { id: 161, habit: '惊恐', impact: '肾气受损' },
    { id: 162, habit: '从小被打骂', impact: '情志内伤' },
    { id: 163, habit: '从小被冷落', impact: '情志内伤' },
    { id: 164, habit: '从小被嫌弃', impact: '情志内伤' },
    { id: 165, habit: '从小受刺激', impact: '情志内伤' },
    { id: 166, habit: '懒惰不上进', impact: '气血不足' },
    { id: 167, habit: '胆小怕事', impact: '心理压力大' },
    { id: 168, habit: '长时间欲而不得', impact: '心理压力大' },
    { id: 169, habit: '心浮躁', impact: '精神不安' },
    { id: 170, habit: '抱怨命运不济', impact: '负面情绪' },
    { id: 171, habit: '霉事缠身', impact: '负面情绪' },
    { id: 172, habit: '无爱好', impact: '精神空虚' },
    { id: 173, habit: '无主见', impact: '精神空虚' },
    { id: 174, habit: '生活没动力', impact: '气血不足' },
    { id: 175, habit: '生活没活力', impact: '气血不足' },
    { id: 176, habit: '空虚无助', impact: '情志内伤' },
    { id: 177, habit: '性子急', impact: '肝气上逆' },
    { id: 178, habit: '爱骂人', impact: '肝气上逆' },
    { id: 179, habit: '喜欢追剧', impact: '刺激神经，影响睡眠' },
    { id: 180, habit: '看恐怖片', impact: '刺激神经，影响睡眠' },
    { id: 181, habit: '爱攀比', impact: '情绪失衡' },
    { id: 182, habit: '气人有', impact: '情绪失衡' },
    { id: 183, habit: '笑人无', impact: '情绪失衡' },
    { id: 184, habit: '过度兴奋', impact: '耗伤气血' },
    { id: 185, habit: '激动', impact: '耗伤气血' },
    { id: 186, habit: '亢奋', impact: '耗伤气血' },
    { id: 187, habit: '总把错误归给自己', impact: '自责内疚' },
    { id: 188, habit: '逃避现实', impact: '情志内伤' },
    { id: 189, habit: '不喜欢与人交流', impact: '情志内伤' },
  ],
  运动: [
    { id: 190, habit: '早5点前运动', impact: '不符合时辰养生' },
    { id: 191, habit: '晚7点后运动', impact: '不符合时辰养生' },
    { id: 192, habit: '不运动', impact: '气血运行不畅' },
    { id: 193, habit: '少运动', impact: '气血运行不畅' },
    { id: 194, habit: '超运动', impact: '过度消耗气血' },
    { id: 195, habit: '久站', impact: '气血运行不畅' },
    { id: 196, habit: '久坐', impact: '气血运行不畅' },
    { id: 197, habit: '久伏案工作', impact: '气血运行不畅' },
    { id: 198, habit: '每天超过一万步', impact: '过度消耗气血' },
    { id: 199, habit: '长时间游泳', impact: '寒气入侵，过度消耗' },
    { id: 200, habit: '冬泳', impact: '寒气入侵，过度消耗' },
    { id: 201, habit: '体力劳动过多', impact: '过度消耗气血' },
  ],
  毒素: [
    { id: 202, habit: '爱咬手指甲', impact: '细菌病毒摄入' },
    { id: 203, habit: '咬笔杆', impact: '细菌病毒摄入' },
    { id: 204, habit: '咬筷子', impact: '细菌病毒摄入' },
    { id: 205, habit: '住房附近20公里内有化工厂', impact: '环境毒素' },
    { id: 206, habit: '住房附近20公里内有药厂', impact: '环境毒素' },
    { id: 207, habit: '住房附近20公里内有化肥厂', impact: '环境毒素' },
    { id: 208, habit: '住房附近20公里内有造纸厂', impact: '环境毒素' },
    { id: 209, habit: '住房附近20公里内有印染厂', impact: '环境毒素' },
    { id: 210, habit: '住房附近20公里内有橡胶厂', impact: '环境毒素' },
    { id: 211, habit: '住房附近20公里内有石灰厂', impact: '环境毒素' },
    { id: 212, habit: '经常接触建筑材料', impact: '甲醛等有害物质' },
    { id: 213, habit: '房屋过度装修', impact: '甲醛等有害物质' },
    { id: 214, habit: '常烫发', impact: '化学物质毒素' },
    { id: 215, habit: '染发', impact: '化学物质毒素' },
    { id: 216, habit: '涂化妆品', impact: '化学物质毒素' },
    { id: 217, habit: '涂祛斑霜', impact: '化学物质毒素' },
    { id: 218, habit: '涂指甲油', impact: '化学物质毒素' },
    { id: 219, habit: '长期吸入炒菜油烟', impact: '肺部毒素' },
    { id: 220, habit: '长期受汽车尾气困扰', impact: '肺部毒素' },
    { id: 221, habit: '长期受灰尘困扰', impact: '肺部毒素' },
    { id: 222, habit: '长期受粉尘困扰', impact: '肺部毒素' },
    { id: 223, habit: '小孩子用铅笔剃牙', impact: '化学物质接触' },
    { id: 224, habit: '小孩子常戴深色口罩', impact: '化学物质接触' },
    { id: 225, habit: '爱用84消毒液', impact: '化学物质毒素' },
    { id: 226, habit: '爱用脱色剂', impact: '化学物质毒素' },
    { id: 227, habit: '爱用强力除油剂', impact: '化学物质毒素' },
    { id: 228, habit: '爱用水果清洗剂', impact: '化学物质毒素' },
    { id: 229, habit: '不戴正规防毒面具喷洒农药', impact: '农药毒素' },
    { id: 230, habit: '不穿正规防护服喷洒农药', impact: '农药毒素' },
    { id: 231, habit: '叼着包装袋喝奶', impact: '塑料微粒摄入' },
    { id: 232, habit: '叼着包装袋喝饮料', impact: '塑料微粒摄入' },
  ],
  生活: [
    { id: 233, habit: '抽烟每天超过10根', impact: '肺部毒素，心血管疾病' },
    { id: 234, habit: '长期吸二手烟', impact: '肺部毒素，心血管疾病' },
    { id: 235, habit: '低头玩手机', impact: '颈椎问题，视力下降' },
    { id: 236, habit: '用电脑过多', impact: '颈椎问题，视力下降' },
    { id: 237, habit: '经常过度疲劳', impact: '气血消耗' },
    { id: 238, habit: '经常憋尿', impact: '毒素堆积' },
    { id: 239, habit: '不按时排便', impact: '毒素堆积' },
    { id: 240, habit: '手淫', impact: '肾精亏损' },
    { id: 241, habit: '意淫', impact: '肾精亏损' },
    { id: 242, habit: '看色情视频或资料', impact: '肾精亏损' },
    { id: 243, habit: '性生活频繁', impact: '肾精亏损或性功能问题' },
    { id: 244, habit: '性欲低', impact: '肾精亏损或性功能问题' },
    { id: 245, habit: '住变电站附近', impact: '电磁辐射' },
    { id: 246, habit: '用过抗生素消炎药', impact: '肠道菌群紊乱' },
    { id: 247, habit: '常翘二郎腿', impact: '脊柱变形，气血运行不畅' },
    { id: 248, habit: '爱躺着看电视', impact: '气血运行不畅' },
    { id: 249, habit: '爱躺着玩手机', impact: '气血运行不畅' },
    { id: 250, habit: '手机在床边充电', impact: '电磁辐射' },
    { id: 251, habit: '手机放头附近睡觉', impact: '电磁辐射' },
    { id: 252, habit: '长期减肥', impact: '营养不良' },
  ],
};

// 获取习惯分类
const getHabitCategories = () => {
  return Object.keys(BAD_HABITS_CHECKLIST);
};

// 按分类获取习惯
const getHabitsByCategory = (category) => {
  return BAD_HABITS_CHECKLIST[category] || [];
};

// 获取所有习惯
const getAllHabits = () => {
  const allHabits = [];
  Object.keys(BAD_HABITS_CHECKLIST).forEach(category => {
    allHabits.push(...BAD_HABITS_CHECKLIST[category]);
  });
  return allHabits;
};

// 发心感召内容
const HEART_INSPIRATION = {
  title: '为什么做健康行业',
  content: `我曾经看到太多人因为不懂得健康，把辛苦挣来的钱都送给了医院，最后人财两空。也看到太多人因为缺乏健康知识，小病拖成大病，后悔莫及。

我深知健康对于一个家庭的重要性。一个人生病，全家受累。不仅身体痛苦，经济负担也重。如果每个家庭都有一个懂健康的人，很多悲剧是可以避免的。

做健康行业的初衷，不是为了赚多少钱，而是希望：
1. 帮助更多的人少生病、不生病
2. 让每个家庭都有一个懂健康的人
3. 把健康的观念传递给更多的人
4. 让更多人明白预防大于治疗的重要性

我知道这条路不容易，但我相信只要坚持下去，一定能够帮助更多的人。每一个被帮助的人，又可以帮助更多的人，这样就能形成一个健康的循环。

健康不是一个人的事，而是一个家庭、一个社会的事。让我们一起努力，把健康带给每个家庭！`,
};

// 关键问题
const KEY_QUESTION = {
  question: '我想问你一个问题，在我给你做这个资检表之前，你知不知道你有这么多的症状？如果病因没有找到，也没有去掉的话，症状会不会越来越多，会不会越来越重？',
  answer: `很多人在填写身体语言简表之前，都没有意识到自己有这么多症状。这些症状都是身体给我们的信号，提醒我们身体出了问题。

如果病因没有找到，也没有去掉，症状确实会越来越多，越来越重。就像房子漏水，如果不去修补漏洞，只是不断地拖地，水还是会漏进来，而且可能会越来越大，最终导致房子倒塌。

同样的道理，如果我们只是缓解症状，而不解决根本原因，身体的问题就会越来越严重。小病拖成大病，大病拖成重病。

这就是为什么我们强调"找病因"的重要性。只有找到病因，从根源上解决问题，才能真正恢复健康，避免疾病反复发作。`,
};

// 恢复速度八要素
const RECOVERY_SPEED_FACTORS = {
  title: '恢复的速度由八个要素决定',
  intro: '客户买完产品，要主动沟通这个内容："你马上就开始正式调理了，有一个事情我必须跟你交代一下，因为这件事情决定了你的恢复速度。你有没有发现，为什么同样的调理，有的人恢复快，有的人恢复慢?那快慢是由哪些要素决定的呢?我们来一起看一个图："',
  factors: [
    {
      id: 1,
      question: '年龄大的和年龄小的哪一个人恢复的速度快?',
      answer: '年龄小的人恢复速度更快。因为年龄小的人身体机能、新陈代谢、细胞再生能力都更强。',
      principle: '年龄越小，身体自我修复能力越强，恢复速度越快。',
    },
    {
      id: 2,
      question: '一个人得病二十年另一个人得病2年，哪个人容易恢复?',
      answer: '得病2年的人更容易恢复。因为病程短，身体的损伤还没有积累到很严重的程度。',
      principle: '病程越短，身体的损伤越小，恢复越容易。',
    },
    {
      id: 3,
      question: '我们都知道是药三分毒，药都有副作用，那长期吃药对身体的伤害大不大?那你说是吃药时间长的好调，还是吃药时间短的好调?',
      answer: '吃药时间短的好调。长期吃药会损伤肝肾功能，影响身体的自我修复能力。',
      principle: '药物副作用会损伤身体，吃药时间越长，对身体伤害越大，恢复越困难。',
    },
    {
      id: 4,
      question: '关于生活习惯我给你讲一个故事：你花钱请我给你盖房子，我正在努力的帮你砌墙，可是你自己却在拆墙，请问我要多久能给你把墙砌好?那你让我帮你调理身体，可是导致你得病的生活习惯你一个都不改，就相当于我砌墙你拆墙，什么时候能调好?所以改变坏习惯的速度也决定了恢复的速度。',
      answer: '如果坏习惯不改，永远调不好。改变坏习惯的速度越快，恢复速度越快。',
      principle: '不改坏习惯相当于一边调理一边伤害，必须改掉坏习惯才能真正恢复。',
    },
    {
      id: 5,
      question: '手术伤不伤元气?要是把脏器切了，会不会更伤元气?还有激素对人体的伤害大不大?那做过这些和没做过的哪个更容易恢复?',
      answer: '没做过的人更容易恢复。手术、切除脏器、激素治疗都会严重损伤身体元气。',
      principle: '手术、脏器切除、激素治疗会损伤身体元气，增加恢复难度。',
    },
    {
      id: 6,
      question: '免疫力强不强、体质好不好、气血足不足能不能影响恢复的速度?',
      answer: '免疫力强、体质好、气血足的人恢复速度更快。这些是身体自我修复的基础。',
      principle: '免疫力、体质、气血是身体自我修复的基础条件，越好恢复越快。',
    },
    {
      id: 7,
      question: '按时按量使用产品和三天打鱼两天晒网，哪个恢复快?',
      answer: '按时按量使用产品的人恢复更快。调理需要连续性，断断续续会严重影响效果。',
      principle: '调理需要持续性和规律性，按时按量使用才能保证最佳效果。',
    },
    {
      id: 8,
      question: '一个人经常闹情绪，经常生气上火，会不会影响恢复的速度?',
      answer: '经常闹情绪、生气上火的人恢复更慢。情绪会影响身体的内分泌和免疫系统。',
      principle: '情绪会影响内分泌和免疫系统，负面情绪会延缓恢复速度。',
    },
  ],
  conclusion: '所以，想要恢复得快需要我们之间做好配合才行!',
};

// 身体语言自检表结构
const BODY_LANGUAGE_CHECK_FORM = {
  title: '身体语言自检表',
  subtitle: '一张表格就是一个生命，请您认真对待!',
  fields: {
    profession: {
      label: '您的职业',
      placeholder: '请填写您的职业',
      note: '职业可能影响生活习惯和健康风险',
    },
    currentHealth: {
      label: '目前身体状况(顾客自述)',
      placeholder: '请描述您目前的身体状况',
      note: '简要描述您目前的整体健康状况',
    },
    mainSymptoms: {
      label: '您目前最想解决的症状',
      placeholder: '请列出您最想解决的症状，可多选',
      note: '选择3-5个最困扰您的症状',
    },
    remarks: {
      label: '备注',
      placeholder: '其他需要补充说明的情况',
      note: '可以补充其他相关信息',
    },
  },
  disclaimer: '*注：本表只作为参考，如果您有任何身体不适，请尽快咨询医生。紧急情况，请遵医嘱。',
  formula: '疾病=坏习惯+时间  健康=好习惯+时间  养成一个好习惯可以抵消一些坏习惯',
};

// 系统战役故事
const SYSTEM_CAMPAIGN_STORY = {
  title: '系统战役故事',
  content: [
    {
      section: '战场保障',
      text: '想要保证军队与敌人的战斗能正常进行，有两个保障必须完成：一个是有足够的粮食弹药和兵源，另一个要保障战场及时打扫，也就是尸体要得到及时的清理。',
    },
    {
      section: '身体保障',
      text: '我们的身体想要维持正常的新陈代谢和生命活动，也要有两个保障：一个是营养能进得来，第二个是毒素垃圾能出得去。',
    },
    {
      section: '后勤基地',
      text: '影响战斗进行的因素：\n1. 粮食弹药和兵员数量不够，会不会影响战斗？\n2. 运输车不够，运力不足，会不会影响？\n3. 运输的道路不通，会不会影响？\n4. 如果运输车上装满了垃圾，没有足够的空间运输粮食弹药和兵源会不会影响？\n5. 如果天气太冷，道路结冰会不会影响运输？\n6. 战场上尸体不能够及时运出，腐烂发臭会不会影响战斗？\n7. 战士们心情不好会不会影响战斗？',
    },
    {
      section: '身体对应',
      text: '其实这跟我们的身体是一样的：\n1. 粮食弹药和兵源相当于我们的营养。\n2. 运输车的运力相当于我们气血的输送能力。\n3. 运输的道路相当于我们的循环系统。\n4. 运输车上的垃圾相当于我们血液里的油脂。\n5. 天气太冷，相当于身体里的寒湿气比较重。\n6. 战场上的尸体相当于我们体内新陈代谢产生的垃圾毒素。\n7. 战士们的心情相当于我们自己的情绪。\n8. 整体的战斗力相当于我们身体的免疫力。',
    },
    {
      section: '结论',
      text: '其中任何一个要素出现了问题，都会对我们的免疫力和健康造成影响。只有所有要素都处于良好状态，身体才能保持健康。',
    },
  ],
};

// 大扫除故事
const CLEANING_STORY = {
  title: '大扫除的故事',
  content: `快过年的时候做过大扫除吗？

彻底大扫除要把垃圾从死角清理出去一共分两步：

第一步是把犄角旮旯里的垃圾：比如空调、油烟机里的垃圾清理出来，暂时先放在房间里。

第二步是再把房间里的垃圾都清理到外面。

如果在第一步清理的时候，你来检查，房间看起来会不会更脏、更乱、空气更加难闻？

那这个时候你应不应该阻止我？

为什么？

其实呢，因为你非常清楚，只要说再坚持一会儿这个房间就彻底干净了。

我们的身体健康也是一样，我们的细胞脏器里的毒素往外排，其实也是分两步的。第一步呢就是我们要把这个细胞和脏器里的毒素，首先清理出来，它会一开始放在哪里呢？是进入到我们的血液当中，这是第一步。第二步呢就是血液里的垃圾，在慢慢的清理到我们的身体外面。

如果说在细胞脏器的毒素清理到血液里的时候，你说人会不会更难受呢？会的。因为血液里突然多了这么多的垃圾毒素，那人肯定是难受。那假如说去医院检查指标会不会升高？会。

那你说这个时候你能制止我吗？你说你别别弄了，这个太难受了，这个身体都都出现变化了，这个这个赶紧停吧，能不能？不能。因为你现在清楚了。因为通过刚才大扫除的故事，你明白，只有说我们在坚持一段时间，让这些垃圾毒素彻底清出去，我们的身体才能够好转。`,
};

// 三个选择
const THREE_CHOICES = {
  title: '三个选择',
  subtitle: '请认真思考并做出您的选择',
  choices: [
    {
      id: 1,
      title: '健康意识',
      question: '你是想继续保持现状，还是想改变?',
      options: [
        { value: 'keep', label: '保持现状', description: '我接受现在的健康状况，不想改变' },
        { value: 'change', label: '想要改变', description: '我想改善我的健康状况' },
      ],
    },
    {
      id: 2,
      title: '改变决心',
      question: '如果选择改变，你是想试试看，还是下决心?',
      options: [
        { value: 'try', label: '试试看', description: '我想先尝试一下' },
        { value: 'determined', label: '下决心', description: '我已经下定决心要改变' },
      ],
    },
    {
      id: 3,
      title: '方法路径',
      question: '如果下决心改变，你是想找偏方，还是找方法?',
      options: [
        { value: 'shortcut', label: '找偏方', description: '我想找快速见效的方法' },
        { value: 'method', label: '找方法', description: '我想找到科学系统的健康方法' },
      ],
    },
  ],
};

// 四个要求
const FOUR_REQUIREMENTS = {
  title: '四个要求',
  subtitle: '为了达到最好的调理效果，请您遵守以下要求',
  requirements: [
    {
      id: 1,
      title: '坚持执行',
      description: '调理是一个过程，需要您坚持执行。三天打鱼两天晒网是无法取得好效果的。',
      icon: '💪',
    },
    {
      id: 2,
      title: '按时复查',
      description: '按时进行复查，让我们了解您的调理效果，及时调整方案。',
      icon: '📅',
    },
    {
      id: 3,
      title: '记录反馈',
      description: '请记录您的身体变化和感受，这些反馈对调整方案非常重要。',
      icon: '📝',
    },
    {
      id: 4,
      title: '开放心态',
      description: '保持开放的心态，相信身体的自我修复能力，积极配合调理。',
      icon: '🧘',
    },
  ],
};

// 健康七问（V2版本）
const HEALTH_SEVEN_QUESTIONS = {
  title: '健康七问',
  subtitle: '请认真回答以下问题，帮助我们更好地了解您的健康状况',
  version: 'V2',
  questions: [
    {
      id: 1,
      question: '您每天的睡眠时间是多少小时？',
      description: '请选择最接近您实际情况的选项',
      options: [
        { value: 'less6', label: '少于6小时' },
        { value: '6-7', label: '6-7小时' },
        { value: '7-8', label: '7-8小时（推荐）' },
        { value: 'more8', label: '8小时以上' },
      ],
    },
    {
      id: 2,
      question: '您每天喝多少杯水（约250ml/杯）？',
      description: '水是最好的营养，也是最好的排毒剂',
      options: [
        { value: 'less4', label: '少于4杯' },
        { value: '4-6', label: '4-6杯' },
        { value: '6-8', label: '6-8杯（推荐）' },
        { value: 'more8', label: '8杯以上' },
      ],
    },
    {
      id: 3,
      question: '您每周运动几次（每次30分钟以上）？',
      description: '生命在于运动，适度运动有益健康',
      options: [
        { value: '0', label: '从不运动' },
        { value: '1-2', label: '1-2次' },
        { value: '3-4', label: '3-4次（推荐）' },
        { value: 'more5', label: '5次以上' },
      ],
    },
    {
      id: 4,
      question: '您每天吃早餐吗？',
      description: '早餐是一天中最重要的一餐',
      options: [
        { value: 'never', label: '从不吃早餐' },
        { value: 'sometimes', label: '偶尔吃' },
        { value: 'often', label: '经常吃' },
        { value: 'always', label: '每天按时吃（推荐）' },
      ],
    },
    {
      id: 5,
      question: '您晚上几点睡觉？',
      description: '晚上11点前入睡有利于肝脏排毒和身体修复',
      options: [
        { value: 'before11', label: '11点前（推荐）' },
        { value: '11-12', label: '11-12点' },
        { value: '12-1', label: '12点-凌晨1点' },
        { value: 'after1', label: '凌晨1点以后' },
      ],
    },
    {
      id: 6,
      question: '您每天看手机/电脑的时间有多长？',
      description: '过度使用电子设备会影响视力和颈椎健康',
      options: [
        { value: 'less2', label: '少于2小时' },
        { value: '2-4', label: '2-4小时' },
        { value: '4-6', label: '4-6小时' },
        { value: 'more6', label: '6小时以上' },
      ],
    },
    {
      id: 7,
      question: '您有定期体检的习惯吗？',
      description: '预防胜于治疗，定期体检有助于早期发现问题',
      options: [
        { value: 'never', label: '从不体检' },
        { value: 'sometimes', label: '偶尔体检' },
        { value: 'yearly', label: '每年体检（推荐）' },
        { value: 'halfyear', label: '每半年体检' },
      ],
    },
  ],
};

module.exports = {
  // 健康要素
  HEALTH_ELEMENTS,
  
  // 身体症状
  BODY_SYMPTOMS,
  getSymptomCategories,
  getSymptomsByCategory,
  BODY_SYMPTOMS_300,
  
  // 不良习惯
  BAD_HABITS_CHECKLIST,
  getHabitCategories,
  getHabitsByCategory,
  getAllHabits,
  
  // 发心感召
  HEART_INSPIRATION,
  KEY_QUESTION,
  
  // 恢复要素
  RECOVERY_SPEED_FACTORS,
  
  // 表单结构
  BODY_LANGUAGE_CHECK_FORM,
  
  // 故事内容
  SYSTEM_CAMPAIGN_STORY,
  CLEANING_STORY,
  
  // 选择和要求
  THREE_CHOICES,
  FOUR_REQUIREMENTS,
  
  // 健康七问
  HEALTH_SEVEN_QUESTIONS,
};
