# 🚀 Vercel 部署分步指南

## 📋 开始部署前，请先准备以下信息

### 必需账号：
- [ ] GitHub 账号（如果没有：https://github.com/signup）
- [ ] Vercel 账号（如果没有：https://vercel.com/signup）

---

## 🎯 完整部署流程（两种方法）

### 方法 A：使用沙箱直接推送（推荐）⭐⭐⭐⭐⭐

**优点：** 不需要下载文件，直接在沙箱中操作

**步骤：**

#### 1️⃣ 在 GitHub 上创建仓库

1. 打开浏览器，访问：https://github.com/new
2. 登录你的 GitHub 账号
3. 填写仓库信息：
   - **Repository name**: `health-system`
   - **Description**: `健康自我管理系统`
   - **Public**: 选择 Public（或 Private）
   - **不要勾选** "Add a README file"
   - **不要勾选** "Add .gitignore"
4. 点击 "Create repository"

5. 创建成功后，复制仓库 URL（格式：`https://github.com/你的用户名/health-system.git`）

#### 2️⃣ 在沙箱中配置并推送代码

在沙箱中执行以下命令（告诉我你的 GitHub 用户名，我会帮你生成完整命令）：

```bash
# 进入项目目录
cd /workspace/projects

# 添加远程仓库（需要替换你的用户名）
git remote add origin https://github.com/你的用户名/health-system.git

# 推送代码到 GitHub
git push -u origin main
```

**如果遇到权限问题，需要配置 SSH 或 Personal Access Token。**

#### 3️⃣ 设置数据库

**选择 Vercel Postgres（推荐）：**

1. 访问：https://vercel.com/dashboard
2. 登录 Vercel 账号（可以使用 GitHub 账号登录）
3. 点击左侧菜单的 "Storage"
4. 点击 "Create Database"
5. 选择 "Postgres"
6. 选择 "Hobby" 计划（免费）
7. 数据库名称：`health-system-db`
8. 点击 "Create"
9. 创建后，会显示连接信息，复制 `POSTGRES_URL`

#### 4️⃣ 部署到 Vercel

1. 访问：https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 `health-system` 仓库
4. 点击 "Continue"

**配置项目：**

- **Framework Preset**: 选择 `Next.js`
- **Environment Variables**:
  ```
  DATABASE_URL=粘贴刚才复制的 POSTGRES_URL
  JWT_SECRET=生成一个随机字符串（如：health-system-secret-key-2024）
  NEXT_PUBLIC_SITE_URL=https://health-system.vercel.app
  ```
- **Root Directory**: 留空
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`

5. 点击 "Deploy"
6. 等待 3-5 分钟
7. 部署成功后会显示 URL

#### 5️⃣ 初始化数据库

1. 访问：`https://你的应用URL.vercel.app/api/init-db`
2. 等待初始化完成
3. 访问：`https://你的应用URL.vercel.app/api/init-admin`

#### 6️⃣ 验证部署

1. 访问：`https://你的应用URL.vercel.app`
2. 应该可以看到健康系统首页
3. 测试功能是否正常

---

### 方法 B：下载代码到本地推送

**适用情况：** 方法 A 无法使用时

**步骤：**

#### 1️⃣ 下载代码

1. 在沙箱文件管理器中找到：`/workspace/projects/health-system-code.tar.gz`
2. 下载这个文件到你的电脑
3. 解压到文件夹 `health-system`

#### 2️⃣ 在 GitHub 创建仓库

同方法 A 步骤 1

#### 3️⃣ 在本地推送代码

在你的电脑上执行：

```bash
# 进入代码文件夹
cd health-system

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/health-system.git

# 推送
git branch -M main
git push -u origin main
```

#### 4️⃣ 后续步骤

同方法 A 步骤 3-6

---

## 🔧 常见问题

### Q1: Git 推送时出现 "Permission denied"

**解决方案：**

使用 Personal Access Token：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 点击 "Generate token"
5. 复制生成的 token
6. 推送时使用 token：
   ```bash
   git push https://你的token@github.com/你的用户名/health-system.git main
   ```

### Q2: Vercel 构建失败

**检查清单：**
- [ ] 确认 package.json 中有 `"build": "bash ./scripts/build.sh"`
- [ ] 确认环境变量已正确配置
- [ ] 检查 DATABASE_URL 格式是否正确

### Q3: 数据库连接失败

**解决方案：**
- 检查 DATABASE_URL 是否正确
- 确认数据库服务器可访问
- 尝试使用 SSL 模式

---

## 📱 部署成功后

### 以后的使用方式

**每天早上：**
```
1. 打开手机浏览器
2. 访问健康系统 URL
3. 开始使用 ✅
```

**再也不需要打开沙箱了！**

---

## 🎉 准备好了吗？

**选择一个方法开始：**
- **方法 A**（推荐）：告诉我你的 GitHub 用户名，我帮你生成命令
- **方法 B**：下载代码到本地，按照步骤操作

**有问题随时告诉我！** 🚀
