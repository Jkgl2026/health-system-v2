// pages/choices/choices.js
const storage = require('../../utils/storage');

Page({
  data: {
    choices: [
      {
        id: 'choice1',
        title: '选择一：健康意识',
        question: '您是否意识到健康的重要性？',
        options: [
          { value: 'a', label: '非常重视，已经采取行动', desc: '健康是第一财富' },
          { value: 'b', label: '有所认识，但行动不足', desc: '知易行难' },
          { value: 'c', label: '不够重视，需要提醒', desc: '亡羊补牢' }
        ],
        selected: null
      },
      {
        id: 'choice2',
        title: '选择二：改变决心',
        question: '您是否有决心改变目前的不良习惯？',
        options: [
          { value: 'a', label: '决心很大，立即行动', desc: '千里之行始于足下' },
          { value: 'b', label: '有决心，但需要支持', desc: '独行快，众行远' },
          { value: 'c', label: '犹豫不决，需要引导', desc: '选择决定命运' }
        ],
        selected: null
      },
      {
        id: 'choice3',
        title: '选择三：方法路径',
        question: '您是否愿意学习正确的健康方法？',
        options: [
          { value: 'a', label: '主动学习，持续改进', desc: '学无止境' },
          { value: 'b', label: '愿意学习，需要指导', desc: '三人行必有我师' },
          { value: 'c', label: '被动接受，需要系统化方案', desc: '方法论很重要' }
        ],
        selected: null
      }
    ],
    currentIndex: 0,
    animating: false
  },

  onLoad() {
    // 加载已保存的选择
    const savedChoices = storage.getThreeChoices();
    if (savedChoices && savedChoices.length === 3) {
      const choices = this.data.choices.map((choice, index) => ({
        ...choice,
        selected: savedChoices[index] || null
      }));
      this.setData({ choices });
    }
  },

  // 选择选项
  selectOption(e) {
    const { choiceId, value } = e.currentTarget.dataset;
    const choices = this.data.choices.map(choice => {
      if (choice.id === choiceId) {
        return { ...choice, selected: value };
      }
      return choice;
    });

    this.setData({ choices });

    // 自动下一步
    setTimeout(() => {
      if (this.data.currentIndex < this.data.choices.length - 1) {
        this.nextChoice();
      }
    }, 500);
  },

  // 下一个选择
  nextChoice() {
    if (this.data.animating) return;
    
    const currentChoice = this.data.choices[this.data.currentIndex];
    if (!currentChoice.selected) {
      wx.showToast({
        title: '请做出选择',
        icon: 'none'
      });
      return;
    }

    this.setData({ animating: true });

    // 动画效果
    setTimeout(() => {
      this.setData({
        currentIndex: this.data.currentIndex + 1,
        animating: false
      });
    }, 300);
  },

  // 上一个选择
  prevChoice() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      });
    }
  },

  // 下一步
  onNext() {
    const allSelected = this.data.choices.every(c => c.selected);
    if (!allSelected) {
      wx.showToast({
        title: '请完成所有选择',
        icon: 'none'
      });
      return;
    }

    // 保存选择
    const choicesData = this.data.choices.map(c => c.selected);
    storage.saveThreeChoices(choicesData);

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/requirements/requirements'
      });
    }, 1000);
  }
});
