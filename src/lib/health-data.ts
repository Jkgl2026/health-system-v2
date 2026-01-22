// 身体语言简表100项
export const BODY_SYMPTOMS = [
  { id: 1, name: '记忆力下降', category: '神经系统' },
  { id: 2, name: '思维断电', category: '神经系统' },
  { id: 3, name: '反应迟钝', category: '神经系统' },
  { id: 4, name: '嗜睡', category: '神经系统' },
  { id: 5, name: '多梦', category: '神经系统' },
  { id: 6, name: '头晕', category: '神经系统' },
  { id: 7, name: '头疼', category: '神经系统' },
  { id: 8, name: '头麻', category: '神经系统' },
  { id: 9, name: '晕车', category: '神经系统' },
  { id: 10, name: '失眠', category: '神经系统' },
  { id: 11, name: '头面油腻', category: '皮肤' },
  { id: 12, name: '脱发', category: '皮肤' },
  { id: 13, name: '头发稀少', category: '皮肤' },
  { id: 14, name: '易打哈欠', category: '神经系统' },
  { id: 15, name: '常叹气', category: '神经系统' },
  { id: 16, name: '眼干涩', category: '五官' },
  { id: 17, name: '眼痒', category: '五官' },
  { id: 18, name: '眼痛', category: '五官' },
  { id: 19, name: '视力模糊', category: '五官' },
  { id: 20, name: '黑痣变大变多', category: '皮肤' },
  { id: 21, name: '眼怕光流泪', category: '五官' },
  { id: 22, name: '麦粒肿', category: '五官' },
  { id: 23, name: '听力下降', category: '五官' },
  { id: 24, name: '耳痒', category: '五官' },
  { id: 25, name: '耳鸣', category: '五官' },
  { id: 26, name: '耳痛', category: '五官' },
  { id: 27, name: '耳屎多', category: '五官' },
  { id: 28, name: '耳内潮湿', category: '五官' },
  { id: 29, name: '打鼾', category: '呼吸系统' },
  { id: 30, name: '鼻塞', category: '五官' },
  { id: 31, name: '爱打喷嚏', category: '呼吸系统' },
  { id: 32, name: '常流鼻涕', category: '呼吸系统' },
  { id: 33, name: '鼻炎', category: '呼吸系统' },
  { id: 34, name: '感冒时间长', category: '免疫系统' },
  { id: 35, name: '嗓子干', category: '呼吸系统' },
  { id: 36, name: '喉咙痒', category: '呼吸系统' },
  { id: 37, name: '喉咙痛', category: '呼吸系统' },
  { id: 38, name: '咳嗽', category: '呼吸系统' },
  { id: 39, name: '痰多', category: '呼吸系统' },
  { id: 40, name: '呼吸困难', category: '呼吸系统' },
  { id: 41, name: '口苦', category: '消化系统' },
  { id: 42, name: '口干', category: '消化系统' },
  { id: 43, name: '口臭', category: '消化系统' },
  { id: 44, name: '口溃疡', category: '消化系统' },
  { id: 45, name: '舌溃疡', category: '消化系统' },
  { id: 46, name: '嘴唇麻', category: '消化系统' },
  { id: 47, name: '舌硬', category: '消化系统' },
  { id: 48, name: '胸闷气短', category: '循环系统' },
  { id: 49, name: '心慌心悸', category: '循环系统' },
  { id: 50, name: '心绞痛', category: '循环系统' },
  { id: 51, name: '指甲凹陷', category: '皮肤' },
  { id: 52, name: '半月痕少', category: '皮肤' },
  { id: 53, name: '手脚脱皮', category: '皮肤' },
  { id: 54, name: '手脚出汗', category: '皮肤' },
  { id: 55, name: '手脚凉', category: '循环系统' },
  { id: 56, name: '手脚热', category: '循环系统' },
  { id: 57, name: '手足麻木', category: '循环系统' },
  { id: 58, name: '四肢乏力', category: '神经系统' },
  { id: 59, name: '静脉曲张', category: '循环系统' },
  { id: 60, name: '关节痛', category: '循环系统' },
  { id: 61, name: '肩酸痛', category: '循环系统' },
  { id: 62, name: '颈椎痛', category: '循环系统' },
  { id: 63, name: '腰酸痛', category: '循环系统' },
  { id: 64, name: '尿浑浊', category: '泌尿系统' },
  { id: 65, name: '尿多沫', category: '泌尿系统' },
  { id: 66, name: '尿有怪味', category: '泌尿系统' },
  { id: 67, name: '夜尿多', category: '泌尿系统' },
  { id: 68, name: '便秘', category: '消化系统' },
  { id: 69, name: '大便不成形', category: '消化系统' },
  { id: 70, name: '便溏不净', category: '消化系统' },
  { id: 71, name: '高血脂', category: '循环系统' },
  { id: 72, name: '高血压', category: '循环系统' },
  { id: 73, name: '高血糖', category: '循环系统' },
  { id: 74, name: '低血糖', category: '循环系统' },
  { id: 75, name: '低血压', category: '循环系统' },
  { id: 76, name: '经期头痛', category: '妇科' },
  { id: 77, name: '月经量少', category: '妇科' },
  { id: 78, name: '经期时长', category: '妇科' },
  { id: 79, name: '经期推后', category: '妇科' },
  { id: 80, name: '月经有血块', category: '妇科' },
  { id: 81, name: '乳腺增生', category: '妇科' },
  { id: 82, name: '经期腰痛', category: '妇科' },
  { id: 83, name: '经期提前', category: '妇科' },
  { id: 84, name: '月经量多', category: '妇科' },
  { id: 85, name: '不爱说话', category: '情绪' },
  { id: 86, name: '恶心', category: '消化系统' },
  { id: 87, name: '胃胀', category: '消化系统' },
  { id: 88, name: '胃酸', category: '消化系统' },
  { id: 89, name: '胃痛', category: '消化系统' },
  { id: 90, name: '消化不良', category: '消化系统' },
  { id: 91, name: '肥胖', category: '代谢' },
  { id: 92, name: '皮肤痒', category: '皮肤' },
  { id: 93, name: '湿疹', category: '皮肤' },
  { id: 94, name: '各种过敏', category: '免疫系统' },
  { id: 95, name: '痤疮', category: '皮肤' },
  { id: 96, name: '脂肪瘤', category: '代谢' },
  { id: 97, name: '身体异味', category: '代谢' },
  { id: 98, name: '淋巴肿大', category: '免疫系统' },
  { id: 99, name: '眼屎多', category: '五官' },
  { id: 100, name: '形体消瘦', category: '代谢' },
];

// 健康要素分类
export const HEALTH_ELEMENTS = {
 气血: {
    id: 'qixue',
    name: '气血',
    description: '营养的输送能力',
    symptoms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 16, 17, 18, 19, 23, 24, 25, 26, 34, 41, 35, 43, 44, 45, 48, 50, 51, 52, 53, 54, 55, 56, 74, 75, 85, 68, 90, 87, 91, 92, 94, 93],
    story: '战备物资的故事',
    principle: '血液把营养带进来，再把垃圾带出去。如果气血不足，细胞、组织和器官的功能就会受到影响。',
  },
  循环: {
    id: 'xunhuan',
    name: '循环',
    description: '微循环系统的通畅程度',
    symptoms: [46, 47, 48, 49, 55, 56, 57, 59, 60, 61, 62, 63, 71, 72, 73, 75, 76, 77, 78, 79, 80],
    story: '公路堵车的故事',
    principle: '微循环是血液和组织细胞之间进行物质交换的场所，如果微循环堵塞，营养进不去，垃圾出不来。',
  },
  毒素: {
    id: 'dusu',
    name: '毒素',
    description: '体内垃圾毒素的积累',
    symptoms: [41, 42, 43, 44, 45, 46, 47, 68, 69, 70, 97],
    story: '蓄水池的故事',
    principle: '体内垃圾毒素的积累会从轻微症状到严重疾病逐步发展，影响整体健康。',
  },
  血脂: {
    id: 'xuezhi',
    name: '血脂',
    description: '血液中的油脂含量',
    symptoms: [11, 71, 72, 73, 91, 96],
    story: '泥沙堵塞管道的故事',
    principle: '血液中的油脂过多会粘附在血管壁上，使血管变窄、变硬，影响血液循环。',
  },
  寒凉: {
    id: 'hanliang',
    name: '寒凉',
    description: '体内的寒湿气程度',
    symptoms: [55, 59, 60, 61, 62, 63, 54, 58],
    story: '道路结冰的故事',
    principle: '寒湿气过重会影响气血运行和毒素排出，导致身体功能下降。',
  },
  免疫: {
    id: 'mianyi',
    name: '免疫',
    description: '身体的自我防护能力',
    symptoms: [34, 92, 93, 94, 98],
    story: '城墙守卫的故事',
    principle: '免疫力是身体的防护系统，负责识别和清除入侵的外来物质和异常细胞。',
  },
  情绪: {
    id: 'qingxu',
    name: '情绪',
    description: '心理状态和情绪管理',
    symptoms: [85, 48, 49, 86],
    story: '心灵花园的故事',
    principle: '情绪会影响神经系统和内分泌系统，进而影响整体健康状况。',
  },
};

// 持续跟进落实健康的七问
export const SEVEN_QUESTIONS = [
  {
    id: 1,
    question: '多长时间犯一次？',
    description: '了解症状的发生频率，判断问题的持续性和规律性',
  },
  {
    id: 2,
    question: '一次要多久？',
    description: '了解症状的持续时间，判断症状的严重程度',
  },
  {
    id: 3,
    question: '具体表现是什么？',
    description: '详细描述症状的具体表现，帮助准确识别问题',
  },
  {
    id: 4,
    question: '用了哪些方法干预？',
    description: '了解已经尝试过的解决方法，评估效果并避免重复无效的方法',
  },
  {
    id: 5,
    question: '这个症状从什么时候开始的？当时发生了什么事？（你是做什么工作的？是否与症状相关？）一般什么情况下会加重或复发？什么情况下会减轻？',
    description: '追溯症状的起源和诱因，找出问题根源和规律',
  },
  {
    id: 6,
    question: '什么情况下会减轻？',
    description: '了解缓解因素，找到有效的应对方法',
  },
  {
    id: 7,
    question: '最近一次出现是什么时候，发生了什么？',
    description: '了解最近一次发作的情况，判断问题的当前状态',
  },
];

// 三个选择
export const THREE_CHOICES = {
  choice1: {
    title: '选择一：继续现状',
    description: '不进行任何改变，继续忍受健康问题，症状可能逐渐加重，最终演变成严重的疾病。',
    consequence: '大病检查出来一般都是中晚期，早期症状被忽视，错失最佳调理时机。',
  },
  choice2: {
    title: '选择二：去医院治疗',
    description: '去医院进行检查和治疗，使用药物或手术来缓解症状。',
    consequence: '医生给出的结论可能是"正常"，但仍然感到不适。药物治疗可能只缓解症状，不解决根本原因。',
  },
  choice3: {
    title: '选择三：学习健康自我管理',
    description: '了解症状背后的真正原因，学习如何通过改善生活习惯和使用天然方法来恢复健康。',
    consequence: '让老百姓少花钱甚至不花钱解决问题，把健康把握在自己手里。',
  },
};

// 四个要求
export const FOUR_REQUIREMENTS = {
  requirement1: {
    title: '按时按量使用产品',
    description: '严格按照指导使用，不随意增减用量，确保最佳效果',
  },
  requirement2: {
    title: '填写不良生活习惯表',
    description: '诚实地记录日常生活中的不良习惯，找出问题根源',
  },
  requirement3: {
    title: '每月填写全面质检表',
    description: '连续三个月每月填写一次，跟踪身体变化，评估调理效果',
  },
  requirement4: {
    title: '每天好习惯打卡',
    description: '记录每天坚持的健康习惯，养成良好生活方式',
  },
};

// 系统战役故事
export const SYSTEM_CAMPAIGN_STORY = {
  title: '系统战役模型',
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
export const CLEANING_STORY = {
  title: '大扫除的故事',
  content: '逢年过节我们都要做大扫除，但是我们想要把这个犄角旮旯里的灰尘清理到外面，一共分两步。\n\n第一步：把这个空调啊抽油烟机里面的这些垃圾要清理出来，放到房间里。\n\n第二步：才是把整体的这些垃圾都清理到房间外面。\n\n假如说我在第一步的时候，就是把这些犄角旮旯的垃圾清理到房间的时候，这时候来检查这个房间会不会更乱更脏？会的，空气会更难闻。\n\n那你说我这个时候你能不能制止，我就别别打扫了，这个太脏了，能不能制止啊？其实呢因为你非常清楚，只要说再坚持一会儿这个房间就彻底干净了。\n\n我们的身体健康也是一样，我们的细胞脏器里的毒素往外排，其实也是分两步的。第一步呢就是我们要把这个细胞和脏器里的毒素，首先清理出来，它会一开始进入到我们的血液当中，这是第一步。第二步呢就是血液里的垃圾，在慢慢的清理到我们的身体外面。\n\n如果说在细胞脏器的毒素清理到血液里的时候，你说人会不会更难受呢？会的。因为血液里突然多了这么多的垃圾毒素，那人肯定是难受。那假如说去医院检查指标会不会升高？会。\n\n那你说这个时候你能制止我吗？你说你别别弄了，这个太难受了，这个身体都都出现变化了，这个这个赶紧停吧，能不能？不能。因为你现在清楚了。因为通过刚才大扫除的故事，你明白，只有说我们在坚持一段时间，让这些垃圾毒素彻底清出去，我们的身体才能够好转。',
};

export type Symptom = typeof BODY_SYMPTOMS[0];
export type HealthElementKey = keyof typeof HEALTH_ELEMENTS;
export type HealthElement = typeof HEALTH_ELEMENTS[HealthElementKey];
