// pages/my-solution/my-solution.js
// 个性化健康管理方案页面逻辑 - 1:1复刻Web版

const healthData = require('../../utils/health-data');
const historyManager = require('../../utils/history-manager');

// 课程库 - 按健康要素分类
const COURSE_LIBRARY = {
  // 气血相关课程
  气血: [
    { id: 1, season: 1, episode: 39, title: '《气血平衡，可以让你的生活变得"更"》', duration: '10分钟' },
    { id: 2, season: 1, episode: 46, title: '《温度解百病》', duration: '10分钟' },
    { id: 3, season: 2, episode: 25, title: '《会坐"月子"能去病》', duration: '10分钟' },
    { id: 4, season: 1, episode: 40, title: '《恢复健康的速度，由你自己的七个要素决定！》', duration: '10分钟' },
    { id: 5, season: 2, episode: 17, title: '《身体与信用卡一样，一旦透支就叫过劳死》', duration: '10分钟' }
  ],
  
  // 循环相关课程（微循环、心脑血管）
  循环: [
    { id: 6, season: 1, episode: 9, title: '《大病查出来为什么到晚期？》（上）', duration: '10分钟' },
    { id: 7, season: 1, episode: 10, title: '《大病查出来为什么到晚期？》（下）', duration: '10分钟' },
    { id: 8, season: 1, episode: 6, title: '《一个成语拯救2.5亿个家庭》', duration: '10分钟' },
    { id: 9, season: 1, episode: 7, title: '《如何让你家人远离心脑血管疾病》', duration: '10分钟' },
    { id: 10, season: 1, episode: 8, title: '《如何让家人远离心脑血管疾病》', duration: '10分钟' },
    { id: 11, season: 1, episode: 32, title: '《对您一生的影响——中西医区别之七》', duration: '10分钟' }
  ],
  
  // 毒素相关课程（排毒）
  毒素: [
    { id: 12, season: 1, episode: 18, title: '《如何解读排毒反应》', duration: '10分钟' },
    { id: 13, season: 1, episode: 26, title: '《你知道身体有哪八个救命的排毒口吗》', duration: '10分钟' },
    { id: 14, season: 1, episode: 27, title: '《排毒的四大好处》（上）', duration: '10分钟' },
    { id: 15, season: 1, episode: 28, title: '《排毒的四大好处》（下）', duration: '10分钟' },
    { id: 16, season: 1, episode: 23, title: '《让家人远离大病的秘密》', duration: '10分钟' },
    { id: 17, season: 3, episode: 37, title: '智疗课《你欠身体的账还的越早，风险越小》', duration: '15分钟' }
  ],
  
  // 血脂相关课程
  血脂: [
    { id: 18, season: 1, episode: 7, title: '《如何让你与家人远离心脑血管疾病》', duration: '10分钟' },
    { id: 19, season: 1, episode: 9, title: '《大病查出来为什么到晚期？》（上）', duration: '10分钟' },
    { id: 20, season: 1, episode: 10, title: '《大病查出来为什么到晚期？》（下）', duration: '10分钟' },
    { id: 21, season: 1, episode: 52, title: '《解读糖尿病的七个误区，你有可能救人一命》', duration: '10分钟' },
    { id: 22, season: 2, episode: 16, title: '《别把"并"发症当成"病"发症》', duration: '10分钟' }
  ],
  
  // 寒凉相关课程（寒湿）
  寒凉: [
    { id: 23, season: 1, episode: 25, title: '《预防流感的五个要素》', duration: '10分钟' },
    { id: 24, season: 1, episode: 46, title: '《温度解百病》', duration: '10分钟' },
    { id: 25, season: 2, episode: 25, title: '《会坐"月子"能去病》', duration: '10分钟' },
    { id: 26, season: 1, episode: 47, title: '《解读中西文化的差异，别走入温度的误区》', duration: '10分钟' }
  ],
  
  // 免疫相关课程
  免疫: [
    { id: 27, season: 1, episode: 11, title: '《这个世界上没有治百病的药，但是有调百病的方法》（上）', duration: '10分钟' },
    { id: 28, season: 1, episode: 12, title: '《这个世界上没有治百病的药，但是有调百病的方法》（中）', duration: '10分钟' },
    { id: 29, season: 1, episode: 13, title: '《这个世界上没有治百病的药，但是有调百病的方法》（下）', duration: '10分钟' },
    { id: 30, season: 4, episode: 1, title: '《我们的免疫力，为什么比十年前下降了？》', duration: '10分钟' },
    { id: 31, season: 2, episode: 35, title: '智疗课《父母体质好，孩子生病少》', duration: '15分钟' }
  ],
  
  // 情绪相关课程（身心灵健康）
  情绪: [
    { id: 32, season: 2, episode: 26, title: '《如何快速放下痛苦》', duration: '10分钟' },
    { id: 33, season: 2, episode: 22, title: '《让身心灵，只需要一杆"秤"》', duration: '10分钟' },
    { id: 34, season: 2, episode: 50, title: '《幸福也是一种"能力"，需要训练》', duration: '10分钟' },
    { id: 35, season: 3, episode: 20, title: '《是谁在折磨你，就是自己的性格》', duration: '10分钟' },
    { id: 36, season: 3, episode: 29, title: '智疗课《我们的身体需要一个家，叫做"善良"》', duration: '15分钟' }
  ],
  
  // 通用必修课程（所有人都推荐）
  通用: [
    { id: 37, season: 1, episode: 1, title: '《人不是死于疾病，而是死于无知》', duration: '10分钟' },
    { id: 38, season: 1, episode: 2, title: '《疾病为什么会反复》', duration: '10分钟' },
    { id: 39, season: 1, episode: 3, title: '《如何用两个字解读疾病》', duration: '10分钟' },
    { id: 40, season: 1, episode: 4, title: '《如何用因果解决疾病》', duration: '10分钟' },
    { id: 41, season: 1, episode: 5, title: '《一个害了四代人的矛盾理论，却无人解读》', duration: '10分钟' },
    { id: 42, season: 2, episode: 18, title: '《找到病因就能去根》', duration: '10分钟' }
  ]
};

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
    // 检查是否需要保存历史记录（从恢复速度页面跳转过来时保存）
    const shouldSave = wx.getStorageSync('shouldSaveHistory');
    if (shouldSave) {
      // 清除标记
      wx.removeStorageSync('shouldSaveHistory');
      // 保存历史记录
      const saved = historyManager.saveHistoryRecord();
      if (saved) {
        wx.showToast({
          title: '记录已保存',
          icon: 'success',
          duration: 1500
        });
      }
    }
    
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
      color: 'linear-gradient(135deg, #22c55e, #10b981)',
      description: '传统药王配方产品，针对性调理您的健康问题',
      matchScore: 90,
      reasons: ['天然药材，安全有效', '传统配方', '标本兼治', '个性化定制']
    });

    return products.slice(0, 6);
  },

  // 获取推荐课程 - 根据健康要素匹配
  getRecommendedCourses(primaryElements) {
    const elementNames = primaryElements.map(el => el.name);
    const selectedCourses = [];
    const addedCourseIds = new Set();

    // 1. 根据用户的健康要素，从对应分类中选取课程
    elementNames.forEach(elementName => {
      const categoryCourses = COURSE_LIBRARY[elementName];
      if (categoryCourses) {
        // 每个要素取前3门课程
        categoryCourses.slice(0, 3).forEach(course => {
          if (!addedCourseIds.has(course.id)) {
            addedCourseIds.add(course.id);
            selectedCourses.push({
              ...course,
              element: elementName,
              relevance: 'high',
              displayTitle: `第${course.season}季第${course.episode}课 ${course.title}`
            });
          }
        });
      }
    });

    // 2. 添加通用必修课程
    COURSE_LIBRARY.通用.slice(0, 4).forEach(course => {
      if (!addedCourseIds.has(course.id)) {
        addedCourseIds.add(course.id);
        selectedCourses.push({
          ...course,
          element: '通用',
          relevance: 'medium',
          displayTitle: `第${course.season}季第${course.episode}课 ${course.title}`
        });
      }
    });

    // 3. 按重要性排序（high在前，然后是medium）
    selectedCourses.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.relevance] - order[a.relevance];
    });

    // 4. 最多返回12门课程
    return selectedCourses.slice(0, 12);
  },

  goBack() {
    wx.navigateBack();
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  goToStory() {
    wx.navigateTo({ url: '/pages/story/story' });
  }
});
