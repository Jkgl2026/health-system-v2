// pages/story/story.js
Page({
  data: {
    chapters: [
      {
        id: 1,
        title: '身体的智慧',
        content: '每个人的身体都是一个精密的系统，它通过各种信号与我们对话。症状不是敌人，而是身体在向我们发出求救信号。当我们学会倾听身体的语言，就能找到健康的钥匙。',
        expanded: false
      },
      {
        id: 2,
        title: '疾病的意义',
        content: '疾病不是单纯的生理异常，而是身心失衡的表现。它提醒我们需要调整生活方式、情绪状态和生活环境。中医认为，疾病的发生是正气与邪气斗争的结果，调理身体的本质是扶正祛邪。',
        expanded: false
      },
      {
        id: 3,
        title: '自愈的力量',
        content: '人体具有强大的自愈能力。当我们将身体的垃圾清理干净，补充足够的营养，调整好生活节奏，身体的自愈系统就会自动启动，修复受损的组织，恢复健康状态。',
        expanded: false
      },
      {
        id: 4,
        title: '艾灸的奥秘',
        content: '艾灸是中医调理的重要手段。艾草性温，通过燃烧产生的热量和药性，能够温通经络、散寒除湿、扶助阳气。艾灸不仅调理身体，还能调和心灵，让身心回归平衡状态。',
        expanded: false
      },
      {
        id: 5,
        title: '健康的责任',
        content: '健康是我们对自己最大的责任。没有人能够代替我们承担这份责任。当我们主动学习健康知识，积极配合调理，坚持健康的生活方式，就是对自己最好的投资。',
        expanded: false
      },
      {
        id: 6,
        title: '战役的胜利',
        content: '每一次克服症状的过程，都是一场小战役。当我们积累了足够的经验和信心，就能打赢更大的战役。健康是一生的修行，让我们在每一次战役中成长，最终获得全面的胜利。',
        expanded: false
      }
    ]
  },

  toggleChapter(e) {
    const id = e.currentTarget.dataset.id;
    const chapters = this.data.chapters.map(ch => {
      if (ch.id === id) {
        return { ...ch, expanded: !ch.expanded };
      }
      return ch;
    });
    this.setData({ chapters });
  },

  goToQuestions() {
    wx.navigateTo({ url: '/pages/questions/questions' });
  }
});
