export default {
  pages: [
    'pages/index/index',
    'pages/check/index',
    'pages/analysis/index',
    'pages/result/index',
    'pages/my/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '健康自检',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
        text: '首页'
      },
      {
        pagePath: 'pages/check/index',
        iconPath: 'assets/icons/check.png',
        selectedIconPath: 'assets/icons/check-active.png',
        text: '自检'
      },
      {
        pagePath: 'pages/analysis/index',
        iconPath: 'assets/icons/analysis.png',
        selectedIconPath: 'assets/icons/analysis-active.png',
        text: '分析'
      },
      {
        pagePath: 'pages/my/index',
        iconPath: 'assets/icons/my.png',
        selectedIconPath: 'assets/icons/my-active.png',
        text: '我的'
      }
    ]
  }
}
