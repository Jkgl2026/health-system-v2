export default {
  pages: [
    'pages/index/index',
    'pages/check/index',
    'pages/result/index',
    'pages/analysis/index',
    'pages/my/index',
    'pages/admin/login/index',
    'pages/admin/dashboard/index',
    'pages/admin/user/index',
    'pages/admin/record/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTitleText: '健康自检',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#667eea',
    borderStyle: 'white',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/check/index',
        text: '自检'
      },
      {
        pagePath: 'pages/analysis/index',
        text: '分析'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的'
      }
    ]
  }
}
