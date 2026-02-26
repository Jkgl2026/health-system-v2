// pages/seven-questions/seven-questions.js
const storage = require('../../utils/storage');

Page({
  data: {
    questions: [
      {
        id: 1,
        question: '您每天的睡眠时间是多少？',
        options: ['少于6小时', '6-7小时', '7-8小时', '超过8小时'],
        selected: null
      },
      {
        id: 2,
        question: '您每天的运动情况如何？',
        options: ['几乎不运动', '偶尔运动', '每周运动2-3次', '每天运动'],
        selected: null
      },
      {
        id: 3,
        question: '您的饮食习惯是？',
        options: ['不规律，经常外卖', '基本规律，偶尔外卖', '比较规律，自己做饭', '非常规律，注重营养'],
        selected: null
      },
      {
        id: 4,
        question: '您每天的饮水量是多少？',
        options: ['少于1000ml', '1000-1500ml', '1500-2000ml', '超过2000ml'],
        selected: null
      },
      {
        id: 5,
        question: '您的精神压力如何？',
        options: ['非常大，经常焦虑', '较大，偶尔焦虑', '一般，能自我调节', '较小，心态平和'],
        selected: null
      },
      {
        id: 6,
        question: '您是否经常熬夜？',
        options: ['经常熬夜', '偶尔熬夜', '很少熬夜', '从不熬夜'],
        selected: null
      },
      {
        id: 7,
        question: '您对健康的关注度如何？',
        options: ['很少关注', '有所关注但行动少', '比较关注并采取行动', '非常关注并坚持健康管理'],
        selected: null
      }
    ],
    currentIndex: 0,
    progress: 0
  },

  onLoad() {
    // 加载已保存的答案
    const savedAnswers = storage.getSevenQuestions();
    if (savedAnswers && savedAnswers.length === 7) {
      const questions = this.data.questions.map((q, index) => ({
        ...q,
        selected: savedAnswers[index] || null
      }));
      this.setData({ questions });
      this.updateProgress(questions);
    }
  },

  // 选择答案
  selectAnswer(e) {
    const { questionId, answer } = e.currentTarget.dataset;
    const questions = this.data.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, selected: answer };
      }
      return q;
    });

    this.setData({ questions });
    this.updateProgress(questions);

    // 自动下一题
    setTimeout(() => {
      if (this.data.currentIndex < this.data.questions.length - 1) {
        this.nextQuestion();
      }
    }, 500);
  },

  // 更新进度
  updateProgress(questions) {
    const answered = questions.filter(q => q.selected !== null).length;
    this.setData({
      progress: (answered / questions.length) * 100
    });
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
    }
  },

  // 上一题
  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      });
    }
  },

  // 提交答案
  submitAnswers() {
    const allAnswered = this.data.questions.every(q => q.selected !== null);
    if (!allAnswered) {
      wx.showToast({
        title: '请完成所有问题',
        icon: 'none'
      });
      return;
    }

    // 保存答案
    const answers = this.data.questions.map(q => q.selected);
    storage.saveSevenQuestions(answers);

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  }
});
