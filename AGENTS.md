# AGENTS.md - 健康管理系统项目文档

## 项目概览

这是一个基于 Next.js 16 的全栈健康管理平台，整合了症状自检、AI检测、健康问卷、风险评估、体质分析等功能，提供全方位的健康评估服务。

### 核心功能模块

1. **健康评估四合一系统**（核心）
   - 路径：`/health-assessment`
   - 功能：整合健康问卷、体质问卷、健康分析、风险评估
   - 流程：个人信息 → 健康问卷 → 体质问卷 → 自动分析 → 综合结果
   - 数据表：`assessment_sessions`

2. **健康问卷系统**
   - 路径：`/health-questionnaire`
   - 数据表：`health_questionnaire_responses`

3. **体质问卷系统**
   - 路径：`/constitution-questionnaire`
   - 数据表：`constitution_questionnaire_responses`

4. **健康分析系统**
   - 路径：`/health-analysis-result`
   - 数据表：`health_analysis`

5. **风险评估系统**
   - 路径：`/risk-assessment`
   - 数据表：`risk_assessment`

6. **健康档案管理**
   - 路径：`/health-profile`
   - 数据表：`health_profiles`

7. **AI检测工具**
   - 面诊：`/face-diagnosis`
   - 舌诊：`/tongue-diagnosis`
   - 体态：`/posture-diagnosis`
   - 其他：眼健康、声音健康、手相健康等

8. **数据展示与分析**
   - 趋势分析：`/trend-analysis`
   - 综合报告：`/comprehensive-report`
   - 健康进度：`/health-progress`

### 技术栈

- **框架**: Next.js 16 (App Router)
- **核心**: React 19
- **语言**: TypeScript 5
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **包管理器**: pnpm（强制使用）

### 开发规范

#### 1. 端口与运行

- **开发端口**: 必须使用 5000 端口
- **启动命令**: `coze dev`
- **构建命令**: `pnpm run build`
- **热更新**: 代码修改会自动触发热更新（HMR）

#### 2. 目录结构

```
/workspace/projects/
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── page.tsx             # 首页
│   │   ├── health-assessment/   # 健康评估四合一
│   │   ├── api/                 # API 路由
│   │   │   └── assessment/      # 健康评估 API
│   │   └── ...                  # 其他功能页面
│   ├── components/              # React 组件
│   │   └── ui/                  # shadcn/ui 组件
│   ├── lib/                     # 工具函数和配置
│   └── storage/                 # 数据存储
│       └── database/            # 数据库相关
│           └── shared/          # 数据库 schema 和配置
├── public/                      # 静态资源
├── .coze                        # 项目配置（不可修改）
└── AGENTS.md                    # 本文档
```

#### 3. 数据库设计

##### assessment_sessions（健康评估会话表）

核心表，用于关联健康评估的四个模块：

```typescript
{
  id: string (primary key, uuid)
  userId: string (用户ID)
  sessionName: string (会话名称)
  status: 'in_progress' | 'completed' | 'cancelled'
  personalInfo: JSONB (个人信息快照)
  healthQuestionnaireId: string | null (关联健康问卷)
  constitutionQuestionnaireId: string | null (关联体质问卷)
  healthAnalysisId: string | null (关联健康分析)
  riskAssessmentId: string | null (关联风险评估)
  completedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4. 代码风格指南

- **TypeScript**: 所有函数必须标注类型，禁止隐式 any
- **组件定义**: 使用函数组件，避免类组件
- **命名规范**: 驼峰命名（camelCase）
- **注释**: 关键逻辑必须添加注释
- **错误处理**: 所有 API 调用必须包含 try-catch

#### 5. Next.js 16 特殊规范

##### useSearchParams 必须使用 Suspense

在 Next.js 16 中，`useSearchParams` 必须被 `Suspense` 包裹：

```tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PageContent() {
  const searchParams = useSearchParams();
  // ... 使用 searchParams
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
```

##### 动态路由参数

在 Next.js 16 中，动态路由参数是 Promise 类型：

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 注意 await
  // ...
}
```

#### 6. API 路由规范

所有 API 路由位于 `src/app/api/` 目录下，遵循 RESTful 规范：

```typescript
// POST /api/assessment/sessions - 创建会话
// GET /api/assessment/sessions - 获取会话列表
// GET /api/assessment/sessions/:id - 获取会话详情
// PUT /api/assessment/sessions/:id - 更新会话
// DELETE /api/assessment/sessions/:id - 删除会话
```

所有 API 响应格式统一：

```typescript
{
  success: boolean;
  data?: any;          // 成功时的数据
  error?: string;      // 错误信息
  message?: string;    // 额外消息
}
```

#### 7. 测试规范

##### 代码静态检查（强制）

执行前必须检查 `package.json` 中的静态检查脚本：

```bash
pnpm lint        # ESLint 检查
pnpm ts-check    # TypeScript 类型检查
```

##### API 接口测试（强制）

当有 API 路由时，必须执行接口冒烟测试：

1. 扫描所有 API 路由：`glob_file **/app/api/**/route.ts`
2. 读取每个 route.ts，提取 HTTP 方法和参数
3. 构造 curl 命令测试
4. 验证响应内容，确保 HTTP 200 包含正确的业务数据

##### 服务健康检查（强制）

执行前检查服务状态：

```bash
curl -I http://localhost:5000
```

如果 5000 端口不存在，启动预览服务：

```bash
coze dev > /app/work/logs/bypass/dev.log 2>&1 &
```

##### 日志健康检查（强制）

交付前检查最新日志：

```bash
tail -n 50 /app/work/logs/bypass/app.log /app/work/logs/bypass/console.log 2>/dev/null | grep -iE "error|exception|warn|traceback"
```

#### 8. 构建与部署

##### 本地开发

```bash
coze dev  # 启动开发服务器（5000端口）
```

##### 生产构建

```bash
pnpm run build  # 构建生产版本
```

##### 启动生产

```bash
coze start  # 启动生产服务器
```

#### 9. 常见问题

##### 问题1：构建失败 - useSearchParams 未包裹 Suspense

**错误信息**：
```
useSearchParams() should be wrapped in a suspense boundary
```

**解决方案**：
参考"Next.js 16 特殊规范"中的 useSearchParams 示例，用 Suspense 包裹。

##### 问题2：动态路由参数类型错误

**错误信息**：
```
Type 'string' is not assignable to type 'Promise<{ id: string }>'
```

**解决方案**：
在 API 路由中，params 参数改为 `Promise<{ id: string }>`，使用 `await params` 解包。

##### 问题3：端口 5000 被占用

**解决方案**：
```bash
# 检查 5000 端口
ss -lptn 'sport = :5000'

# 如果已被占用，杀死进程
kill -9 <PID>
```

#### 10. 安全注意事项

- 所有用户输入必须进行验证和清理
- 敏感信息（密码、token）不得存储在代码中
- API 必须进行权限检查
- 数据库查询必须使用参数化查询（Drizzle ORM 自动处理）

## 快速开始

### 1. 添加新功能模块

如果需要添加新的功能模块，参考健康评估四合一的实现：

1. 创建数据库表（在 `src/storage/database/shared/schema.ts`）
2. 创建 API 路由（在 `src/app/api/` 下）
3. 创建前端页面（在 `src/app/` 下）
4. 更新首页导航（在 `src/app/page.tsx`）

### 2. 修改数据库 Schema

修改 `src/storage/database/shared/schema.ts` 后，需要：

1. 手动执行 SQL 迁移（如果已部署）
2. 或使用 Drizzle 的迁移工具（如果配置了）

### 3. 添加新的 UI 组件

使用 shadcn/ui CLI：

```bash
npx shadcn-ui@latest add <component-name>
```

组件会自动添加到 `src/components/ui/` 目录。

## 联系与支持

如有问题，请参考：
- Next.js 文档：https://nextjs.org/docs
- shadcn/ui 文档：https://ui.shadcn.com
- Drizzle 文档：https://orm.drizzle.team
