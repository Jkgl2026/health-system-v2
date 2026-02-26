// pages/admin/user-detail/user-detail.js
Page({
  data: {
    userId: null,
    userInfo: null,
    checkHistory: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ userId: options.id });
      this.loadUserDetail(options.id);
    }
  },

  // 加载用户详情
  loadUserDetail(userId) {
    // 模拟数据
    const userInfo = {
      id: userId,
      name: '张三',
      phone: '13812341234',
      age: 35,
      gender: '男',
      height: 175,
      weight: 72,
      bmi: 23.5,
      registerDate: '2024-01-01',
      lastCheckDate: '2024-01-15'
    };

    const checkHistory = [
      { date: '2024-01-15', score: 85, symptoms: 5, habits: 8 },
      { date: '2024-01-08', score: 82, symptoms: 6, habits: 9 },
      { date: '2024-01-01', score: 78, symptoms: 8, habits: 12 }
    ];

    this.setData({
      userInfo,
      checkHistory,
      loading: false
    });
  },

  // 拨打电话
  callUser() {
    if (this.data.userInfo && this.data.userInfo.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.userInfo.phone
      });
    }
  },

  // 查看检测详情
  viewCheckDetail(e) {
    const date = e.currentTarget.dataset.date;
    wx.showToast({
      title: `查看${date}检测详情`,
      icon: 'none'
    });
  },

  // 删除用户
  deleteUser() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复。',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        }
      }
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
