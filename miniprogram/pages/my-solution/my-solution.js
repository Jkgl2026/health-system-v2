// pages/my-solution/my-solution.js
// 个性化健康管理方案页面逻辑 - 1:1复刻Web版

const healthData = require('../../utils/health-data');

Page({
  data: {
    symptomCount: 0,
    symptomPercent: 0,
    targetSymptoms: [],
    primaryElements: [],
    selectedChoice: '',
    choiceName: '',
    products: [],
    courses: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    // 获取存储的数据
    const selectedSymptoms = wx.getStorageSync('selectedSymptoms') || [];
    const targetIds = wx.getStorageSync('targetSymptoms') || [];
    const selectedChoice = wx.getStorageSync('selectedChoice') || '';

    // 计算症状统计
    const symptomCount = selectedSymptoms.length;
    const symptomPercent = Math.min(symptomCount * 2, 100);

    // 获取重点症状详情
    const targetSymptoms = targetIds.map(id => {
      const s = healthData.BODY_SYMPTOMS.find(s => s.id === id);
      return s ? { id: s.id, name: s.name } : null;
    }).filter(s => s);

    // 计算主要健康要素分布
    const primaryElements = this.calculatePrimaryElements(selectedSymptoms);

    // 获取选择方案名称
    const choiceName = this.getChoiceName(selectedChoice);

    // 获取推荐产品
    const products = this.getRecommendedProducts(primaryElements);

    // 获取推荐课程
    const courses = this.getRecommendedCourses(primaryElements);

    this.setData({
      symptomCount,
      symptomPercent,
      targetSymptoms,
      primaryElements,
      selectedChoice,
      choiceName,
      products,
      courses
    });
  },

  // 计算主要健康要素
  calculatePrimaryElements(selectedSymptoms) {
    const elements = [
      { name: '气血', symptoms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 16, 17, 18, 19, 23, 24, 25, 26, 34, 41, 35, 43, 44, 45, 48, 50, 51, 52, 53, 54, 55, 56, 74, 75, 85, 68, 90, 87, 91, 92, 94, 93] },
      { name: '循环', symptoms: [46, 47, 48, 49, 55, 56, 57, 59, 60, 61, 62, 63, 71, 72, 73, 75, 76, 77, 78, 79, 80] },
      { name: '毒素', symptoms: [41, 42, 43, 44, 45, 46, 47, 68, 69, 70, 97] },
      { name: '血脂', symptoms: [71, 72, 73, 74, 75] },
      { name: '寒凉', symptoms: [55, 63] },
      { name: '免疫', symptoms: [34, 94, 98] },
      { name: '情绪', symptoms: [85] }
    ];

    const colors = [
      'linear-gradient(90deg, #ef4444, #dc2626)',
      'linear-gradient(90deg, #3b82f6, #2563eb)',
      'linear-gradient(90deg, #eab308, #ca8a04)',
      'linear-gradient(90deg, #f97316, #ea580c)',
      'linear-gradient(90deg, #06b6d4, #0891b2)',
      'linear-gradient(90deg, #22c55e, #16a34a)',
      'linear-gradient(90deg, #a855f7, #9333ea)'
    ];

    const counts = elements.map((el, index) => {
      const count = el.symptoms.filter(id => selectedSymptoms.includes(id)).length;
      return {
        name: el.name,
        count: count,
        color: colors[index]
      };
    }).filter(el => el.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);

    // 计算百分比
    const maxCount = counts.length > 0 ? counts[0].count : 1;
    counts.forEach(el => {
      el.percent = Math.round((el.count / maxCount) * 100);
    });

    return counts;
  },

  // 获取选择方案名称
  getChoiceName(choice) {
    const names = {
      'choice1': '自我调理',
      'choice2': '产品调理',
      'choice3': '系统调理'
    };
    return names[choice] || '';
  },

  // 获取推荐产品
  getRecommendedProducts(primaryElements) {
    const elementNames = primaryElements.map(el => el.name);
    const products = [];

    // 艾灸调理
    if (elementNames.includes('气血') || elementNames.includes('寒凉') || elementNames.includes('循环')) {
      products.push({
        name: '艾灸调理',
        icon: '🔥',
        color: 'linear-gradient(135deg, #f97316, #ef4444)',
        description: '通过艾灸穴位，温通经络，调和气血，驱寒除湿',
        matchScore: 85,
        reasons: ['温通经络，促进气血运行', '驱寒除湿，改善寒凉体质', '增强免疫力', '调理慢性炎症']
      });
    }

    // 火灸调理
    if (elementNames.includes('气血') || elementNames.includes('毒素') || elementNames.includes('循环')) {
      products.push({
        name: '火灸调理',
        icon: '🔥',
        background: 'linear-gradient(135deg, #ef4444, #f97316)',
        color: 'linear-gradient(135deg, #ef4444, #f97316)',
        description: '以火之力，温阳散寒，活血化瘀，祛除体内毒素',
        matchScore: 80,
        reasons: ['强力活血化瘀', '温阳补气', '祛除毒素', '改善循环']
      });
    }

    // 经络调理
    if (elementNames.includes('循环') || elementNames.includes('气血') || elementNames.includes('毒素')) {
      products.push({
        name: '经络调理',
        icon: '⚡',
        background: 'linear-gradient(135deg, #eab308, #f97316)',
        color: 'linear-gradient(135deg, #eab308, #f97316)',
        description: '通过疏通经络，促进气血运行，清除淤堵',
        matchScore: 75,
        reasons: ['疏通经络', '清除淤堵', '调和脏腑功能', '缓解疼痛']
      });
    }

    // 空腹禅调理
    if (elementNames.includes('情绪') || elementNames.includes('毒素') || elementNames.includes('气血')) {
      products.push({
        name: '空腹禅调理',
        icon: '❤️',
        background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
        color: 'linear-gradient(135deg, #22c55e, #14b8a6)',
        description: '通过空腹禅修，净化身心，清理毒素，调和气血',
        matchScore: 70,
        reasons: ['净化身心', '调和气血', '平衡情绪', '改善睡眠']
      });
    }

    // 药王产品 - 始终推荐
    products.push({
      name: '药王产品',
      icon: '💧',
      background: 'linear-gradient(135deg, #22c55e, #10b981)',
      color: 'linear-gradient(135deg, #22c55e, #10b981)',
      description: '传统药王配方产品，针对性调理您的健康问题',
      matchScore: 90,
      reasons: ['天然药材，安全有效', '传统配方', '标本兼治', '个性化定制']
    });

    return products.slice(0, 6);
  },

  // 获取推荐课程
  getRecommendedCourses(primaryElements) {
    const elementNames = primaryElements.map(el => el.name);
    
    const allCourses = [
      { id: 1, title: '第1课：为什么得病不容易', duration: '10分钟', content: '得病需要十几年甚至几十年的时间累积，所以去病也需要时间，不要急于求成。' },
      { id: 2, title: '第2课：医院和健康行业的区别', duration: '10分钟', content: '医院负责抢救生命，健康行业负责预防和康复，两者互补。' },
      { id: 3, title: '第3课：什么是病因', duration: '10分钟', content: '真正的病因都在生活里，只有找到病因才能从根本上解决问题。' },
      { id: 4, title: '第4课：健康七要素', duration: '15分钟', content: '详细讲解影响健康的七个核心要素：气血、循环、毒素、血脂、寒凉、免疫、情绪。' },
      { id: 5, title: '第5课：系统战役故事', duration: '10分钟', content: '通过军事战役的比喻，理解健康系统的运作原理。' },
      { id: 6, title: '第6课：大扫除的故事', duration: '10分钟', content: '理解排毒过程中的好转反应，不要轻易放弃。' },
      { id: 7, title: '第7课：身体语言简表的意义', duration: '10分钟', content: '学会读懂身体的信号，早期发现健康问题。' },
      { id: 8, title: '第8课：七问法', duration: '10分钟', content: '通过七个问题深入了解症状，找出根本原因。' },
      { id: 9, title: '第9课：气血的重要性', duration: '10分钟', content: '气血是健康的根本，如何补充和养护气血。' }
    ];

    // 根据健康要素标记重点课程
    const courses = allCourses.map(course => {
      let relevance = 'medium';
      
      if (elementNames.includes('气血') && course.title.includes('气血')) {
        relevance = 'high';
      } else if (elementNames.includes('循环') && course.title.includes('循环')) {
        relevance = 'high';
      } else if (elementNames.includes('毒素') && (course.title.includes('毒素') || course.title.includes('大扫除'))) {
        relevance = 'high';
      } else if (course.id <= 5) {
        relevance = 'high';
      }
      
      return { ...course, relevance };
    });

    // 按重要性排序
    courses.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.relevance] - order[a.relevance];
    });

    return courses.slice(0, 9);
  },

  goBack() {
    wx.navigateBack();
  },

  goToCourses() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  goToStory() {
    wx.navigateTo({ url: '/pages/story/story' });
  }
});
