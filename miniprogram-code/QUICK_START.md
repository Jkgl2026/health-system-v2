# 健康自检小程序 - 快速开始

## 📁 项目位置

小程序代码已移动到项目根目录的 `miniprogram-code/` 文件夹。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd miniprogram-code
pnpm install
```

### 2. 开发模式

```bash
# 微信小程序
pnpm run dev:weapp

# H5 版本
pnpm run dev:h5
```

### 3. 微信开发者工具

1. 打开微信开发者工具
2. 导入项目：选择 `miniprogram-code/dist` 目录
3. 填写 AppID（测试用可使用测试号）
4. 点击"编译"

## 📱 功能特性

- ✅ 症状自检（12种症状）
- ✅ 健康评分计算（0-100分）
- ✅ 健康建议展示
- ✅ 历史记录查看
- ✅ 健康趋势分析
- ✅ 微信登录
- ✅ 数据导出/导入

## 📄 项目结构

```
miniprogram-code/
├── src/
│   ├── app.tsx                    # 应用入口
│   ├── app.config.ts              # 应用配置
│   ├── app.scss                   # 全局样式
│   ├── pages/                     # 页面目录
│   │   ├── index/                 # 首页
│   │   ├── check/                 # 自检页面
│   │   ├── result/                # 结果页面
│   │   ├── analysis/              # 分析页面
│   │   └── my/                    # 我的页面
│   └── utils/                     # 工具函数
│       └── cloud.ts               # 数据管理器
├── config/                        # Taro 配置
├── package.json                   # 依赖配置
└── project.config.json            # 微信项目配置
```

## ⚠️ 注意事项

### 需要补充的内容

1. **底部导航栏图标**

   需要在 `src/` 目录下创建以下图标文件：
   ```
   src/assets/icons/
   ├── home.png
   ├── home-active.png
   ├── check.png
   ├── check-active.png
   ├── analysis.png
   ├── analysis-active.png
   ├── my.png
   └── my-active.png
   ```

2. **微信 AppID**

   修改 `project.config.json` 中的 `appid` 字段：
   ```json
   {
     "appid": "你的微信小程序AppID"
   }
   ```

## 📊 数据存储

当前版本使用 `Taro.setStorageSync` 本地存储数据。

### 数据结构

```typescript
// 用户信息
interface UserData {
  id?: string
  nickName?: string
  avatarUrl?: string
  createTime?: number
}

// 症状检查记录
interface SymptomCheck {
  id: string
  symptoms: string[]
  score: number
  healthLevel: string
  createTime: number
}

// 健康分析记录
interface HealthAnalysis {
  id: string
  userId: string
  score: number
  symptoms: string[]
  advice: string
  createTime: number
}
```

## 🎯 下一步

### 选项 1：快速部署现有小程序
- 补全底部导航栏图标
- 配置微信 AppID
- 部署到微信小程序
- **预计时间：30分钟**

### 选项 2：升级小程序功能
- 集成 Supabase 云数据库
- 实现真实历史记录
- 与 Web 版数据同步
- **预计时间：2小时**

### 选项 3：添加更多功能
- 添加七问自检
- 添加课程推荐
- 优化用户体验
- **预计时间：4小时**

## 📝 完整文档

查看 `README.md` 获取更多详细信息。

## 🤝 技术支持

如有问题，请联系开发团队。
