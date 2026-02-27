// pages/healing/healing.js
// 好转反应页面逻辑 - 1:1复刻Web版

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

  // 继续按钮 - 跳转到恢复速度8要素
  handleContinue() {
    wx.redirectTo({
      url: '/pages/recovery-speed/recovery-speed'
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
