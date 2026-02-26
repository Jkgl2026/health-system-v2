// pages/requirements/requirements.js
const storage = require('../../utils/storage');

Page({
  data: {
    requirements: [
      {
        id: 1,
        title: '要求一：坚持执行',
        icon: '🎯',
        desc: '健康管理需要长期坚持，不能三天打鱼两天晒网。您是否承诺坚持执行健康方案？',
        options: [
          { value: 'agree', label: '我承诺坚持执行' },
          { value: 'try', label: '我会尽力尝试' }
        ],
        selected: null
      },
      {
        id: 2,
        title: '要求二：按时复查',
        icon: '📅',
        desc: '定期复查是健康管理的重要环节。您是否同意按时进行健康复查？',
        options: [
          { value: 'agree', label: '我同意按时复查' },
          { value: 'try', label: '看情况再说' }
        ],
        selected: null
      },
      {
        id: 3,
        title: '要求三：记录反馈',
        icon: '📝',
        desc: '记录健康变化和反馈有助于调整方案。您是否愿意记录并反馈健康状况？',
        options: [
          { value: 'agree', label: '我愿意记录反馈' },
          { value: 'try', label: '偶尔记录一下' }
        ],
        selected: null
      },
      {
        id: 4,
        title: '要求四：开放心态',
        icon: '💡',
        desc: '保持开放的学习心态，接受科学的健康理念。您是否愿意开放心态学习？',
        options: [
          { value: 'agree', label: '我保持开放心态' },
          { value: 'try', label: '选择性接受' }
        ],
        selected: null
      }
    ],
    allAgreed: false
  },

  onLoad() {
    // 加载已保存的要求
    const savedRequirements = storage.getFourRequirements();
    if (savedRequirements && savedRequirements.length === 4) {
      const requirements = this.data.requirements.map((req, index) => ({
        ...req,
        selected: savedRequirements[index] || null
      }));
      this.setData({ 
        requirements,
        allAgreed: requirements.every(r => r.selected === 'agree')
      });
    }
  },

  // 选择选项
  selectOption(e) {
    const { reqId, value } = e.currentTarget.dataset;
    const requirements = this.data.requirements.map(req => {
      if (req.id === reqId) {
        return { ...req, selected: value };
      }
      return req;
    });

    this.setData({
      requirements,
      allAgreed: requirements.every(r => r.selected === 'agree')
    });
  },

  // 全部同意
  agreeAll() {
    const requirements = this.data.requirements.map(req => ({
      ...req,
      selected: 'agree'
    }));

    this.setData({
      requirements,
      allAgreed: true
    });
  },

  // 下一步
  onNext() {
    const allSelected = this.data.requirements.every(r => r.selected);
    if (!allSelected) {
      wx.showToast({
        title: '请完成所有要求',
        icon: 'none'
      });
      return;
    }

    // 保存要求
    const requirementsData = this.data.requirements.map(r => r.selected);
    storage.saveFourRequirements(requirementsData);

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/health-result/health-result'
      });
    }, 1000);
  },

  // 查看故事
  onViewStory() {
    wx.navigateTo({
      url: '/pages/story/story'
    });
  }
});
