// pages/seven-questions/seven-questions.js
// 健康七问（V2新版）- 文本输入形式

const SEVEN_QUESTIONS_V2 = [
  {
    id: 1,
    question: '您的睡眠情况如何？每天大概睡多久？是否经常熬夜或睡眠质量差？',
    description: '睡眠是身体修复的黄金时间，了解您的作息规律，帮助制定改善睡眠的建议',
    category: '生活习惯',
    importance: '高',
    placeholder: '例如：我每天晚上10点半睡觉，早上6点半起床，睡眠质量很好...'
  },
  {
    id: 2,
    question: '您平时的饮食习惯是怎样的？是否按时吃饭？喜欢重口味、油腻或生冷食物？',
    description: '饮食是健康的基石，了解您的饮食习惯，帮助发现潜在的健康风险',
    category: '生活习惯',
    importance: '高',
    placeholder: '例如：我一日三餐都很规律，少油少盐，多吃蔬菜水果...'
  },
  {
    id: 3,
    question: '您每周会运动吗？一般做什么运动？每次运动多长时间？',
    description: '运动是促进气血循环、排出毒素的最佳方式，了解您的运动习惯，帮助制定合适的运动方案',
    category: '生活习惯',
    importance: '高',
    placeholder: '例如：我每周跑步3次，每次30分钟，周末还会去爬山...'
  },
  {
    id: 4,
    question: '您的工作压力大吗？每天工作多长时间？是否经常加班或感到疲劳？',
    description: '工作压力是现代人健康问题的主要来源，了解您的工作状态，帮助找到减压的方法',
    category: '生活压力',
    importance: '中',
    placeholder: '例如：工作还可以，偶尔忙的时候会加班，大部分时间能按时下班...'
  },
  {
    id: 5,
    question: '您的情绪状态如何？是否经常感到焦虑、烦躁或情绪低落？如何调节情绪？',
    description: '情绪是健康的晴雨表，了解您的情绪状况，帮助发现身心健康的隐患',
    category: '心理健康',
    importance: '中',
    placeholder: '例如：我情绪比较稳定，遇到压力会通过运动或者和朋友聊天来调节...'
  },
  {
    id: 6,
    question: '您最希望改善的健康问题是什么？为什么这个问题对您很重要？',
    description: '明确健康目标是成功改变的第一步，了解您的期望，帮助我们制定更有针对性的方案',
    category: '健康目标',
    importance: '高',
    placeholder: '例如：我最希望改善睡眠质量，因为长期失眠影响工作和生活...'
  },
  {
    id: 7,
    question: '为了改善健康，您愿意做出哪些改变？您认为最难坚持的是什么？',
    description: '改变的决心是成功的关键，了解您的准备程度和可能遇到的困难，帮助制定更可行的行动计划',
    category: '行动承诺',
    importance: '高',
    placeholder: '例如：我愿意调整作息，规律饮食，增加运动，最难的是坚持运动...'
  }
];

Page({
  data: {
    questions: SEVEN_QUESTIONS_V2,
    currentIndex: 0,
    answers: {}, // 存储所有答案 {1: '答案1', 2: '答案2', ...}
    progress: 0,
    isSubmitting: false,
    targetSymptom: '' // 目标症状名称
  },

  onLoad() {
    // 清除历史数据
    try {
      wx.removeStorageSync('sevenQuestionsAnswers');
      console.log('已清除健康七问历史数据');
    } catch (e) {
      console.error('清除数据失败:', e);
    }

    // 获取目标症状
    try {
      const targetSymptomIds = wx.getStorageSync('targetSymptoms') || [];
      if (targetSymptomIds.length > 0) {
        const healthData = require('../../utils/health-data');
        const symptom = healthData.BODY_SYMPTOMS.find(s => s.id === targetSymptomIds[0]);
        if (symptom) {
          this.setData({ targetSymptom: symptom.name });
        }
      }
    } catch (e) {
      console.error('获取目标症状失败:', e);
    }
  },

  // 输入答案
  onAnswerInput(e) {
    const value = e.detail.value;
    const currentId = this.data.questions[this.data.currentIndex].id;
    
    this.setData({
      [`answers.${currentId}`]: value
    });
  },

  // 上一题
  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      });
    }
  },

  // 下一题
  nextQuestion() {
    const currentId = this.data.questions[this.data.currentIndex].id;
    const currentAnswer = this.data.answers[currentId];
    
    // 检查当前问题是否已回答
    if (!currentAnswer || currentAnswer.trim() === '') {
      wx.showToast({
        title: '请回答当前问题',
        icon: 'none'
      });
      return;
    }

    if (this.data.currentIndex < this.data.questions.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
    }
  },

  // 跳转到指定问题
  goToQuestion(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentIndex: index });
  },

  // 提交答案
  submitAnswers() {
    const { questions, answers } = this.data;
    
    // 检查是否所有问题都已回答
    const allAnswered = questions.every(q => {
      const answer = answers[q.id];
      return answer && answer.trim() !== '';
    });

    if (!allAnswered) {
      wx.showToast({
        title: '请完成所有问题',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSubmitting: true });

    // 保存答案
    try {
      wx.setStorageSync('sevenQuestionsAnswers', answers);
      console.log('健康七问答案已保存:', answers);
    } catch (e) {
      console.error('保存答案失败:', e);
    }

    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1000
    });

    // 跳转到系统战役故事页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/story/story'
      });
    }, 1000);
  },

  // 返回上一步
  goBack() {
    wx.navigateBack();
  },

  // 持续跟进七问
  goToFollowUp() {
    // TODO: 实现持续跟进七问功能
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
