// pages/target/target.js
const storage = require('../../utils/storage');
const healthData = require('../../utils/health-data');

Page({
  data: {
    allSymptoms: [],
    targetSymptoms: [],
    maxTargets: 3
  },

  onLoad() {
    this.initData();
  },

  initData() {
    // 获取所有已选择的症状
    const bodySymptoms = storage.getSelectedSymptoms();
    const symptoms300 = storage.getSelectedSymptoms300();
    const savedTargetSymptoms = storage.getTargetSymptoms();

    // 获取症状名称
    const allSymptoms = [];
    
    bodySymptoms.forEach(id => {
      const name = healthData.getSymptomNameById(id);
      if (name) {
        allSymptoms.push({ id, name, source: '身体语言简表' });
      }
    });

    // 添加300症状（简化处理）
    symptoms300.forEach(id => {
      allSymptoms.push({ id, name: `症状${id}`, source: '300症状表' });
    });

    this.setData({
      allSymptoms: allSymptoms,
      targetSymptoms: savedTargetSymptoms.filter(id => 
        allSymptoms.some(s => s.id === id)
      )
    });
  },

  // 切换选择
  toggleTarget(e) {
    const id = e.currentTarget.dataset.id;
    const targetSymptoms = [...this.data.targetSymptoms];
    const index = targetSymptoms.indexOf(id);
    
    if (index > -1) {
      targetSymptoms.splice(index, 1);
    } else {
      if (targetSymptoms.length >= this.data.maxTargets) {
        wx.showToast({
          title: `最多选择${this.data.maxTargets}个重点症状`,
          icon: 'none'
        });
        return;
      }
      targetSymptoms.push(id);
    }

    this.setData({ targetSymptoms });
  },

  // 下一步
  onNext() {
    storage.saveTargetSymptoms(this.data.targetSymptoms);

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/choices/choices'
      });
    }, 1000);
  },

  // 跳过
  onSkip() {
    storage.saveTargetSymptoms(this.data.targetSymptoms);
    wx.navigateTo({
      url: '/pages/choices/choices'
    });
  }
});
