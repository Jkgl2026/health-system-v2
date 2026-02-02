# 健康自检小程序

基于 Taro 框架开发的健康自检微信小程序，支持症状自检、健康分析等功能。

## 技术栈

- **框架**: Taro 3.6.x
- **语言**: TypeScript
- **UI**: Taro 原生组件
- **数据存储**: 本地存储（可扩展云数据库）

## 功能特性

- ✅ 症状自检（多选）
- ✅ 健康评分计算
- ✅ 健康建议展示
- ✅ 历史记录查看
- ✅ 健康趋势分析
- ✅ 微信登录
- ✅ 数据导出/导入

## 快速开始

### 1. 安装依赖

```bash
cd miniprogram/health-miniprogram
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
2. 导入项目：选择 `miniprogram/health-miniprogram/dist` 目录
3. 填写 AppID（测试用可使用测试号）
4. 点击"编译"

## 项目结构

```
src/
├── app.tsx              # 入口文件
├── app.config.ts        # 应用配置
├── app.scss             # 全局样式
├── pages/               # 页面目录
│   ├── index/           # 首页
│   ├── check/           # 症状自检
│   ├── result/          # 分析结果
│   ├── analysis/        # 健康分析
│   └── my/              # 个人中心
└── utils/               # 工具函数
    └── cloud.ts         # 数据管理器
```

## 数据存储

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

## 部署到微信小程序

### 1. 注册小程序

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册账号（个人或企业）
3. 获取 AppID

### 2. 配置 AppID

修改 `project.config.json` 中的 `appid` 字段。

### 3. 开启云开发（可选）

如果需要使用云数据库：

1. 在微信开发者工具中，点击"云开发"
2. 创建环境
3. 修改 `src/utils/cloud.ts`，启用云数据库连接

### 4. 提交审核

```bash
# 构建生产版本
pnpm run build:weapp

# 在微信开发者工具中：
# 1. 点击"上传"
# 2. 填写版本号和备注
# 3. 登录微信公众平台提交审核
```

## 扩展云开发

### 开启云数据库

在 `src/utils/cloud.ts` 中，添加云数据库初始化代码：

```typescript
import Taro from '@tarojs/taro'

// 初始化云开发
Taro.cloud.init({
  env: 'your-env-id',
  traceUser: true
})

const db = Taro.cloud.database()

// 使用云数据库
const result = await db.collection('users').add({
  data: userData
})
```

### 创建数据库集合

在云开发控制台创建以下集合：
- `users` - 用户信息
- `symptom_checks` - 症状检查记录
- `health_analysis` - 健康分析记录

## 成本估算

### 免费额度（个人小程序）

| 资源 | 免费额度 | 超出后费用 |
|------|---------|-----------|
| 数据库存储 | 2GB | ¥0.07/GB/天 |
| CDN 流量 | 5GB/月 | ¥0.21/GB |
| 云函数调用 | 42万次/月 | ¥0.0000167/次 |

### 预估费用

- **1000 用户/月**: ¥0（完全免费）
- **10000 用户/月**: ¥1.18
- **100000 用户/月**: ¥32.83

## 常见问题

### Q: 如何切换到云数据库？
A: 修改 `src/utils/cloud.ts`，将本地存储的调用替换为云数据库调用。

### Q: 如何添加新的症状？
A: 在 `src/pages/check/index.tsx` 中的 `symptoms` 数组中添加新的症状项。

### Q: 如何修改健康评分算法？
A: 在 `src/pages/result/index.tsx` 的 `calculateHealthScore` 方法中修改扣分逻辑。

## 许可证

MIT License
