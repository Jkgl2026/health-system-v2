// pages/questions/questions.js
Page({
  data: {
    currentIndex: 0,
    questions: [
      {
        id: 'sleep',
        question: '您每天的睡眠时间是多少？',
        options: [
          { label: '少于6小时', value: 'less_6' },
          { label: '6-7小时', value: '6_7' },
          { label: '7-8小时', value: '7_8' },
          { label: '超过8小时', value: 'more_8' }
        ]
      },
      {
        id: 'exercise',
        question: '您每周运动几次？',
        options: [
          { label: '几乎不运动', value: 'never' },
          { label: '1-2次', value: '1_2' },
          { label: '3-4次', value: '3_4' },
          { label: '5次以上', value: 'more_5' }
        ]
      },
      {
        id: 'water',
        question: '您每天喝多少水？',
        options: [
          { label: '少于4杯', value: 'less_4' },
          { label: '4-6杯', value: '4_6' },
          { label: '6-8杯', value: '6_8' },
          { label: '超过8杯', value: 'more_8' }
        ]
      },
      {
        id: 'diet',
        question: '您的饮食习惯如何？',
        options: [
          { label: '经常暴饮暴食', value: 'overeat' },
          { label: '饮食不规律', value: 'irregular' },
          { label: '基本规律', value: 'regular' },
          { label: '非常健康', value: 'healthy' }
        ]
      },
      {
        id: 'stress',
        question: '您的压力程度如何？',
        options: [
          { label: '压力很大', value: 'high' },
          { label: '有一定压力', value: 'medium' },
          { label: '压力较小', value: 'low' },
          { label: '几乎没有压力', value: 'none' }
        ]
      },
      {
        id: 'emotion',
        question: '您的情绪状态如何？',
        options: [
          { label: '经常焦虑或抑郁', value: 'anxious' },
          { label: '情绪起伏较大', value: 'unstable' },
          { label: '情绪基本稳定', value: 'stable' },
          { label: '心情愉快', value: 'happy' }
        ]
      },
      {
        id: 'screen',
        question: '您每天使用电子设备的时间？',
        options: [
          { label: '超过10小时', value: 'more_10' },
          { label: '6-10小时', value: '6_10' },
          { label: '3-6小时', value: '3_6' },
          { label: '少于3小时', value: 'less_3' }
        ]
      }
    ],
    answers: {}
  },

  onLoad() {
    const answers = wx.getStorageSync('healthAnswers') || {};
    this.setData({ answers });
  },

  selectAnswer(e) {
    const { id, value } = e.currentTarget.dataset;
    this.setData({ [`answers.${id}`]: value });
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
  },

  nextQuestion() {
    const { currentIndex, questions, answers } = this.data;
    if (!answers[questions[currentIndex].id]) {
      wx.showToast({ title: '请选择答案', icon: 'none' });
      return;
    }
    
    if (currentIndex < questions.length - 1) {
      this.setData({ currentIndex: currentIndex + 1 });
    } else {
      wx.setStorageSync('healthAnswers', answers);
      wx.showToast({ title: '提交成功', icon: 'success' });
    }
  },

  goToResult() {
    wx.redirectTo({ url: '/pages/health-result/health-result' });
  }
});
