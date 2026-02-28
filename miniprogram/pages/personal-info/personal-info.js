// pages/personal-info/personal-info.js
// 个人信息页逻辑 - 基于Web版精确转换

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      phone: '',
      gender: '',
      age: '',
      weight: '',
      height: '',
      bloodPressure: '',
      occupation: '',
      address: ''
    },
    
    // 性别选项
    genderOptions: ['男', '女'],
    genderIndex: -1,
    
    // BMI相关
    bmi: null,
    bmiCategory: '',
    bmiColorClass: '',
    bmiPosition: 0,
    
    // 状态
    isSaving: false,
    lastSaveTime: null,
    error: null,
    errorSuggestion: ''
  },

  onLoad() {
    this.loadSavedData();
  },

  // 加载已保存的数据 - 不再自动加载历史数据，每次都是全新填写
  loadSavedData() {
    // 清除所有历史数据，确保每次填写都是新的开始
    try {
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('selectedSymptoms');
      wx.removeStorageSync('targetSymptoms');
      console.log('已清除所有历史数据，开始全新填写');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  },

  // 输入处理
  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    // 如果是身高或体重，计算BMI
    if (field === 'height' || field === 'weight') {
      const { height, weight } = this.data.formData;
      const currentHeight = field === 'height' ? value : height;
      const currentWeight = field === 'weight' ? value : weight;
      
      if (currentHeight && currentWeight) {
        this.calculateBMI(currentWeight, currentHeight);
      }
    }
    
    // 自动保存
    this.autoSave();
  },

  // 性别选择 - 按钮形式直接选择
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'formData.gender': gender
    });
    this.autoSave();
  },

  // 计算BMI
  calculateBMI(weight, height) {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100; // 转换为米
    
    if (weightNum > 0 && heightNum > 0) {
      const bmi = weightNum / (heightNum * heightNum);
      const roundedBMI = Math.round(bmi * 10) / 10;
      
      let category = '';
      let colorClass = '';
      let position = 0;
      
      if (roundedBMI < 18.5) {
        category = '偏瘦';
        colorClass = 'bmi-thin';
        position = Math.max(5, Math.min(25, roundedBMI / 18.5 * 25));
      } else if (roundedBMI < 24) {
        category = '正常';
        colorClass = 'bmi-normal';
        position = 25 + ((roundedBMI - 18.5) / 5.5) * 25;
      } else if (roundedBMI < 28) {
        category = '超重';
        colorClass = 'bmi-overweight';
        position = 50 + ((roundedBMI - 24) / 4) * 25;
      } else {
        category = '肥胖';
        colorClass = 'bmi-obese';
        position = Math.min(95, 75 + ((roundedBMI - 28) / 12) * 25);
      }
      
      this.setData({
        bmi: roundedBMI,
        bmiCategory: category,
        bmiColorClass: colorClass,
        bmiPosition: position
      });
    }
  },

  // 自动保存
  autoSave() {
    // 使用防抖，延迟保存
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.saveToStorage();
    }, 1000);
  },

  // 保存到本地存储
  saveToStorage() {
    try {
      const userInfo = {
        ...this.data.formData,
        bmi: this.data.bmi
      };
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ lastSaveTime: Date.now() });
    } catch (error) {
      console.error('保存失败:', error);
    }
  },

  // 提交表单
  handleSubmit() {
    const { formData } = this.data;
    
    // 验证必填字段
    if (!formData.name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!formData.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' });
      return;
    }
    if (!formData.age) {
      wx.showToast({ title: '请输入年龄', icon: 'none' });
      return;
    }
    if (!formData.height) {
      wx.showToast({ title: '请输入身高', icon: 'none' });
      return;
    }
    if (!formData.weight) {
      wx.showToast({ title: '请输入体重', icon: 'none' });
      return;
    }
    
    this.setData({ isSaving: true, error: null });
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 模拟API请求（实际应调用后端API）
    setTimeout(() => {
      this.setData({ isSaving: false });
      
      // 跳转到身体语言简表页
      wx.navigateTo({
        url: '/pages/check/check'
      });
    }, 500);
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 获取错误建议
  getErrorSuggestion(error) {
    if (error.status === 0) {
      return '网络请求失败，请检查网络连接或刷新页面重试。';
    } else if (error.status === 400) {
      return '请求参数错误，请检查填写的信息是否完整和正确。';
    } else if (error.status === 500) {
      return '服务器内部错误，请稍后重试。';
    } else {
      return '发生未知错误，请联系技术支持。';
    }
  }
});
