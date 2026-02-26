// pages/personal-info/personal-info.js
const storage = require('../../utils/storage');

Page({
  data: {
    userInfo: {
      name: '',
      phone: '',
      age: '',
      gender: '',
      height: '',
      weight: ''
    },
    genderOptions: ['男', '女'],
    genderIndex: 0
  },

  onLoad() {
    // 加载已保存的用户信息
    const savedInfo = storage.getUserInfo();
    if (savedInfo) {
      const genderIndex = savedInfo.gender === '女' ? 1 : 0;
      this.setData({
        userInfo: {
          name: savedInfo.name || '',
          phone: savedInfo.phone || '',
          age: savedInfo.age ? String(savedInfo.age) : '',
          gender: savedInfo.gender || '男',
          height: savedInfo.height ? String(savedInfo.height) : '',
          weight: savedInfo.weight ? String(savedInfo.weight) : ''
        },
        genderIndex: genderIndex
      });
    }
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`userInfo.${field}`]: value
    });
  },

  // 性别选择
  onGenderChange(e) {
    const index = e.detail.value;
    this.setData({
      genderIndex: index,
      'userInfo.gender': this.data.genderOptions[index]
    });
  },

  // 下一步
  onNext() {
    const { name, phone, age, gender, height, weight } = this.data.userInfo;

    // 验证
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }

    // 保存用户信息
    const userInfo = {
      name: name.trim(),
      phone: phone.trim(),
      age: age ? parseInt(age) : null,
      gender: gender,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      bmi: (height && weight) ? this.calculateBMI(height, weight) : null
    };

    storage.saveUserInfo(userInfo);

    // 跳转到身体语言简表页面
    wx.navigateTo({
      url: '/pages/check/check'
    });
  },

  // 计算BMI
  calculateBMI(height, weight) {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    if (heightM > 0 && weightKg > 0) {
      return (weightKg / (heightM * heightM)).toFixed(2);
    }
    return null;
  },

  // 跳过
  onSkip() {
    wx.navigateTo({
      url: '/pages/check/check'
    });
  }
});
