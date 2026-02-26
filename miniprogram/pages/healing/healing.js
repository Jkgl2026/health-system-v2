// pages/healing/healing.js
// 好转反应页面逻辑

Page({
  data: {
    // 数据
  },

  onLoad() {
    // 页面加载
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 继续按钮
  handleContinue() {
    // 跳转到恢复速度八要素页面或其他页面
    wx.redirectTo({
      url: '/pages/story/story'
    });
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '健康自检 - 好转反应',
      path: '/pages/index/index'
    };
  }
});
