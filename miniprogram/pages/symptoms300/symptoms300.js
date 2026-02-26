// pages/symptoms300/symptoms300.js
const storage = require('../../utils/storage');
const healthData = require('../../utils/health-data');

Page({
  data: {
    symptoms: [],
    selectedSymptoms300: [],
    searchKeyword: '',
    filteredSymptoms: []
  },

  onLoad() {
    this.initData();
  },

  initData() {
    // 300症状表数据 - 简化版（实际需要完整数据）
    const symptoms = this.generateSymptoms300();
    const savedSymptoms = storage.getSelectedSymptoms300();

    this.setData({
      symptoms: symptoms,
      filteredSymptoms: symptoms,
      selectedSymptoms300: savedSymptoms
    });
  },

  // 生成300症状表数据
  generateSymptoms300() {
    // 实际项目中应该从health-data.js导入完整数据
    // 这里使用简化版本
    const categories = ['头部', '眼部', '耳部', '鼻部', '口腔', '颈部', '肩部', '背部', '腰部', '胸部', '腹部', '上肢', '下肢', '皮肤', '精神', '睡眠', '消化', '排泄', '生殖', '全身'];
    const symptoms = [];
    
    categories.forEach((category, catIndex) => {
      for (let i = 1; i <= 15; i++) {
        symptoms.push({
          id: 301 + catIndex * 15 + i,
          name: `${category}症状${i}`,
          category: category,
          description: `${category}相关的健康问题`
        });
      }
    });

    return symptoms;
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value.trim().toLowerCase();
    if (keyword) {
      const filtered = this.data.symptoms.filter(s => 
        s.name.toLowerCase().includes(keyword) || 
        s.category.toLowerCase().includes(keyword)
      );
      this.setData({
        filteredSymptoms: filtered,
        searchKeyword: keyword
      });
    } else {
      this.setData({
        filteredSymptoms: this.data.symptoms,
        searchKeyword: ''
      });
    }
  },

  // 切换选择
  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const selectedSymptoms300 = [...this.data.selectedSymptoms300];
    const index = selectedSymptoms300.indexOf(id);
    
    if (index > -1) {
      selectedSymptoms300.splice(index, 1);
    } else {
      selectedSymptoms300.push(id);
    }

    this.setData({ selectedSymptoms300 });
  },

  // 下一步 - 选择重点症状
  onNext() {
    storage.saveSelectedSymptoms300(this.data.selectedSymptoms300);

    wx.showToast({
      title: `已选择${this.data.selectedSymptoms300.length}项`,
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/target/target'
      });
    }, 1000);
  },

  // 跳过
  onSkip() {
    storage.saveSelectedSymptoms300(this.data.selectedSymptoms300);
    wx.navigateTo({
      url: '/pages/target/target'
    });
  }
});
