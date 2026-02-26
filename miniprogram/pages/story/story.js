// pages/story/story.js
Page({
  data: {
    currentChapter: 0,
    chapters: [
      {
        title: '第一章：健康的警醒',
        icon: '🏥',
        content: `
从前，有一个人叫小明。他年轻力壮，从不关心健康问题。

直到有一天，他突然倒下了。医院的检查结果让他震惊：多种慢性病缠身，如果不及时干预，后果不堪设想。

那一刻，他才意识到：健康不是理所当然的，而是需要用心呵护的珍宝。
        `,
        highlight: '健康是人生最大的财富，失去健康，就失去了一切。'
      },
      {
        title: '第二章：身体的语言',
        icon: '🗣️',
        content: `
医生告诉小明："其实你的身体一直在和你说话，只是你没有倾听。"

每一个不适症状，都是身体发出的警告。头痛是压力的信号，失眠是焦虑的表达，胃痛是饮食不当的抗议...

小明开始学习倾听身体的声音，理解每一个症状背后的含义。
        `,
        highlight: '身体是最好的医生，它从不撒谎，我们要学会倾听。'
      },
      {
        title: '第三章：习惯的力量',
        icon: '🔄',
        content: `
小明回顾自己多年的生活习惯：熬夜、久坐、暴饮暴食...这些看似微不足道的习惯，日积月累，最终酿成大病。

他开始明白：好习惯是健康的基石，坏习惯是疾病的温床。

改变习惯并不容易，但为了健康，他决心开始行动。
        `,
        highlight: '习惯决定命运，健康从改变每一个小习惯开始。'
      },
      {
        title: '第四章：选择的力量',
        icon: '⚡',
        content: `
在康复之路上，小明面临三个重要的选择：

第一，是否有健康意识？
第二，是否有改变决心？
第三，是否愿意学习方法？

他的每一个选择，都决定了他的健康未来。选择健康，就是选择一种负责任的生活方式。
        `,
        highlight: '生命中的每个选择都在塑造我们的未来，选择健康，选择希望。'
      },
      {
        title: '第五章：承诺的力量',
        icon: '🤝',
        content: `
为了让健康管理持续有效，小明做出了四个承诺：

第一，坚持执行健康方案
第二，按时进行健康复查
第三，认真记录健康反馈
第四，保持开放学习心态

这四个承诺，成为他健康路上的指路明灯。
        `,
        highlight: '承诺是给自己的契约，是对健康的尊重，是对生命的负责。'
      },
      {
        title: '第六章：系统战役',
        icon: '⚔️',
        content: `
健康，是一场系统性的战役。需要：

科学的认知 —— 了解身体原理
坚定的决心 —— 坚持不懈努力
正确的方法 —— 循序渐进改善
持续的监测 —— 跟踪健康变化

这不是一场短跑，而是一场马拉松。每一步都重要，每一天都珍贵。
        `,
        highlight: '健康是一场持久战，需要系统的方法和长期的坚持。'
      },
      {
        title: '第七章：健康的未来',
        icon: '🌅',
        content: `
经过一段时间的坚持，小明的健康状况明显改善。那些曾经困扰他的症状逐渐消失，取而代之的是充沛的精力和愉悦的心情。

他深深感悟：健康不是终点，而是旅程。每一天都是新的开始，每一个选择都塑造未来。

现在，他也开始帮助身边的人关注健康，传播健康的理念。
        `,
        highlight: '健康是一种责任，对自己负责，也对家人负责。让我们从今天开始，打赢这场健康战役！'
      }
    ]
  },

  onLoad() {
    // 重置到第一章
    this.setData({ currentChapter: 0 });
  },

  // 切换章节
  changeChapter(e) {
    const chapter = e.currentTarget.dataset.chapter;
    this.setData({ currentChapter: chapter });
  },

  // 上一章
  prevChapter() {
    if (this.data.currentChapter > 0) {
      this.setData({
        currentChapter: this.data.currentChapter - 1
      });
    }
  },

  // 下一章
  nextChapter() {
    if (this.data.currentChapter < this.data.chapters.length - 1) {
      this.setData({
        currentChapter: this.data.currentChapter + 1
      });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
