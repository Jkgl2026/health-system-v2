// pages/choices/choices.js
// 三个选择，四个要求页面逻辑 - Web版精确复刻

const { THREE_CHOICES, FOUR_REQUIREMENTS } = require('../../utils/health-data');

Page({
  data: {
    selectedChoice: null,
    choices: THREE_CHOICES,
    requirements: FOUR_REQUIREMENTS,
    acceptedRequirements: {
      1: false,
      2: false,
      3: false,
      4: false
    },
    canContinue: false,
    isSaving: false
  },

  onLoad(options) {
    // 如果有传入的选择，恢复状态
    if (options.choice) {
      this.setData({ selectedChoice: options.choice });
      this.updateCanContinue();
    }
    
    // 如果有传入的已接受要求，恢复状态
    if (options.accepted) {
      try {
        const accepted = JSON.parse(options.accepted);
        this.setData({ acceptedRequirements: accepted });
        this.updateCanContinue();
      } catch (e) {
        console.error('解析已接受要求失败', e);
      }
    }
  },

  // 选择某个方案
  selectChoice(e) {
    const choice = e.currentTarget.dataset.choice;
    const currentChoice = this.data.selectedChoice;
    
    // 如果点击已选中的，取消选择
    if (currentChoice === choice) {
      this.setData({ 
        selectedChoice: null,
        acceptedRequirements: { 1: false, 2: false, 3: false, 4: false }
      });
    } else {
      this.setData({ 
        selectedChoice: choice,
        // 切换方案时重置要求勾选状态
        acceptedRequirements: { 1: false, 2: false, 3: false, 4: false }
      });
    }
    
    this.updateCanContinue();
  },

  // 切换要求勾选状态
  toggleRequirement(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const key = `acceptedRequirements.${id}`;
    
    this.setData({
      [key]: !this.data.acceptedRequirements[id]
    });
    
    this.updateCanContinue();
  },

  // 更新是否可以继续
  updateCanContinue() {
    const { selectedChoice, acceptedRequirements } = this.data;
    
    // 如果选择了方案3，需要满足所有四个要求
    if (selectedChoice === 'choice3') {
      const allAccepted = acceptedRequirements[1] && 
                         acceptedRequirements[2] && 
                         acceptedRequirements[3] && 
                         acceptedRequirements[4];
      this.setData({ canContinue: allAccepted });
    } else if (selectedChoice) {
      // 选择方案1或2，无需勾选要求，直接可以继续
      this.setData({ canContinue: true });
    } else {
      this.setData({ canContinue: false });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 处理继续按钮
  handleContinue() {
    if (!this.data.canContinue || this.data.isSaving) {
      return;
    }

    const { selectedChoice, acceptedRequirements } = this.data;
    
    this.setData({ isSaving: true });

    // 先保存选择到全局和本地存储
    const app = getApp();
    const choiceData = {
      selectedChoice,
      acceptedRequirements: selectedChoice === 'choice3' ? acceptedRequirements : null,
      selectedAt: new Date().toISOString()
    };

    // 更新全局数据
    app.globalData.choiceData = choiceData;
    
    // 保存到本地存储
    wx.setStorageSync('choiceData', choiceData);

    // 根据选择跳转到不同页面
    setTimeout(() => {
      this.setData({ isSaving: false });

      if (selectedChoice === 'choice3') {
        // 方案3：跳转到四个要求详细任务页
        wx.redirectTo({
          url: '/pages/requirements/requirements'
        });
      } else {
        // 方案1或2：跳转到好转反应页面
        wx.redirectTo({
          url: '/pages/healing/healing'
        });
      }
    }, 300);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '健康自检 - 选择调理方案',
      path: '/pages/index/index'
    };
  }
});
