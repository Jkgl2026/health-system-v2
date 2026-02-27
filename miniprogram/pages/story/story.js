// pages/story/story.js
// 系统战役故事页面 - 1:1复刻Web版

const SYSTEM_CAMPAIGN_STORY = {
  title: '系统战役故事',
  content: [
    {
      section: '战场保障',
      text: '想要保证军队与敌人的战斗能正常进行，有两个保障必须完成：一个是有足够的粮食弹药和兵源，另一个要保障战场及时打扫，也就是尸体要得到及时的清理。'
    },
    {
      section: '身体保障',
      text: '我们的身体想要维持正常的新陈代谢和生命活动，也要有两个保障：一个是营养能进得来，第二个是毒素垃圾能出得去。'
    },
    {
      section: '后勤基地',
      text: '影响战斗进行的因素：\n1. 粮食弹药和兵员数量不够，会不会影响战斗？\n2. 运输车不够，运力不足，会不会影响？\n3. 运输的道路不通，会不会影响？\n4. 如果运输车上装满了垃圾，没有足够的空间运输粮食弹药和兵源会不会影响？\n5. 如果天气太冷，道路结冰会不会影响运输？\n6. 战场上尸体不能够及时运出，腐烂发臭会不会影响战斗？\n7. 战士们心情不好会不会影响战斗？'
    },
    {
      section: '身体对应',
      text: '其实这跟我们的身体是一样的：\n1. 粮食弹药和兵源相当于我们的营养。\n2. 运输车的运力相当于我们气血的输送能力。\n3. 运输的道路相当于我们的循环系统。\n4. 运输车上的垃圾相当于我们血液里的油脂。\n5. 天气太冷，相当于身体里的寒湿气比较重。\n6. 战场上的尸体相当于我们体内新陈代谢产生的垃圾毒素。\n7. 战士们的心情相当于我们自己的情绪。\n8. 整体的战斗力相当于我们身体的免疫力。'
    },
    {
      section: '结论',
      text: '其中任何一个要素出现了问题，都会对我们的免疫力和健康造成影响。只有所有要素都处于良好状态，身体才能保持健康。'
    }
  ]
};

const KEY_QUESTION = {
  question: '关键问题：我们要如何保证身体的两个保障都能正常进行？',
  answer: '答案：从影响战斗的七个要素入手，逐个排查和改善。'
};

const HEALTH_ELEMENTS = {
  '气血': {
    name: '气血',
    description: '营养的输送能力',
    story: '战备物资的故事',
    principle: '血液把营养带进来，再把垃圾带出去。如果气血不足，细胞、组织和器官的功能就会受到影响。',
    symptoms: ['记忆力下降', '思维断电', '反应迟钝', '嗜睡', '多梦', '头晕', '头疼', '眼干涩', '手脚凉', '指甲凹陷', '月经量少']
  },
  '循环': {
    name: '循环',
    description: '微循环系统的通畅程度',
    story: '公路堵车的故事',
    principle: '微循环是血液和组织细胞之间进行物质交换的场所，如果微循环堵塞，营养进不去，垃圾出不来。',
    symptoms: ['胸闷气短', '心慌心悸', '手足麻木', '静脉曲张', '关节痛', '肩酸痛', '颈椎痛', '腰酸痛']
  },
  '毒素': {
    name: '毒素',
    description: '体内垃圾毒素的积累',
    story: '蓄水池的故事',
    principle: '体内垃圾毒素的积累会从轻微症状到严重疾病逐步发展，影响整体健康。',
    symptoms: ['口苦', '口臭', '便秘', '大便不成形', '身体异味', '皮肤痒', '湿疹']
  },
  '血脂': {
    name: '血脂',
    description: '血液中的油脂含量',
    story: '泥沙堵塞管道的故事',
    principle: '血液中的油脂过多会粘附在血管壁上，使血管变窄、变硬，影响血液循环。',
    symptoms: ['头面油腻', '肥胖', '脂肪瘤', '高血压', '高血脂']
  },
  '寒凉': {
    name: '寒凉',
    description: '体内的寒湿气程度',
    story: '道路结冰的故事',
    principle: '寒湿气过重会影响气血运行和毒素排出，导致身体功能下降。',
    symptoms: ['手脚凉', '手脚出汗', '关节痛', '腰酸痛', '四肢乏力']
  },
  '免疫': {
    name: '免疫',
    description: '身体的自我防护能力',
    story: '城墙守卫的故事',
    principle: '免疫力是身体的防护系统，负责识别和清除入侵的外来物质和异常细胞。',
    symptoms: ['感冒时间长', '各种过敏', '皮肤痒', '湿疹', '淋巴肿大']
  },
  '情绪': {
    name: '情绪',
    description: '心理状态和情绪管理',
    story: '心灵花园的故事',
    principle: '情绪会影响神经系统和内分泌系统，进而影响整体健康状况。',
    symptoms: ['不爱说话', '胸闷气短', '心慌心悸', '恶心']
  }
};

const ELEMENT_ICONS = {
  '气血': '🔥',
  '循环': '❤️',
  '毒素': '💧',
  '血脂': '🛡️',
  '寒凉': '❄️',
  '免疫': '✨',
  '情绪': '😊'
};

const ELEMENT_COLORS = {
  '气血': { bg: '#ef4444', text: '#dc2626', gradient: 'from-red-500 to-red-600' },
  '循环': { bg: '#3b82f6', text: '#2563eb', gradient: 'from-blue-500 to-blue-600' },
  '毒素': { bg: '#eab308', text: '#ca8a04', gradient: 'from-yellow-500 to-yellow-600' },
  '血脂': { bg: '#f97316', text: '#ea580c', gradient: 'from-orange-500 to-orange-600' },
  '寒凉': { bg: '#06b6d4', text: '#0891b2', gradient: 'from-cyan-500 to-cyan-600' },
  '免疫': { bg: '#22c55e', text: '#16a34a', gradient: 'from-green-500 to-green-600' },
  '情绪': { bg: '#a855f7', text: '#9333ea', gradient: 'from-purple-500 to-purple-600' }
};

Page({
  data: {
    story: SYSTEM_CAMPAIGN_STORY,
    keyQuestion: KEY_QUESTION,
    elements: HEALTH_ELEMENTS,
    elementKeys: Object.keys(HEALTH_ELEMENTS),
    activeElement: '气血',
    elementIcons: ELEMENT_ICONS,
    elementColors: ELEMENT_COLORS,
    showFullStory: false,
    expandedSections: [true, true, true, true, true] // 默认展开所有章节
  },

  onLoad() {
    // 清除历史数据
    try {
      wx.removeStorageSync('storyData');
    } catch (e) {
      console.error('清除数据失败:', e);
    }
  },

  // 切换健康要素Tab
  switchElement(e) {
    const element = e.currentTarget.dataset.element;
    this.setData({ activeElement: element });
  },

  // 切换完整故事显示
  toggleFullStory() {
    this.setData({
      showFullStory: !this.data.showFullStory
    });
  },

  // 展开/收起章节
  toggleSection(e) {
    const index = e.currentTarget.dataset.index;
    const expandedSections = this.data.expandedSections;
    expandedSections[index] = !expandedSections[index];
    this.setData({ expandedSections });
  },

  // 跳转到健康七问
  goToQuestions() {
    wx.navigateTo({
      url: '/pages/requirements/requirements'
    });
  },

  // 返回上一步
  goBack() {
    wx.navigateBack();
  }
});
