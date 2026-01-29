# 🚀 Vercel 部署快速参考

## ⚡ 5 步快速部署

### 1️⃣ 创建 GitHub 仓库
```
GitHub → New Repository → 命名为 health-system
```

### 2️⃣ 获取免费数据库
**选项 A: Vercel Postgres**
```
Vercel Dashboard → Storage → Create Database → Postgres (Hobby 免费)
```

**选项 B: Neon**
```
https://neon.tech/ → Create Project → 免费计划
```

### 3️⃣ 部署到 Vercel
```
https://vercel.com/new → Import Repository → 配置环境变量 → Deploy
```

### 4️⃣ 配置环境变量
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-random-secret-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### 5️⃣ 初始化数据库
```
访问: https://你的应用.vercel.app/api/init-db
访问: https://你的应用.vercel.app/api/init-admin
```

---

## 🎯 完成！

```
✅ 24 小时可用
✅ 全球 CDN
✅ 自动 HTTPS
✅ 完全免费
```

**再也不需要手动打开沙箱了！** 🎉

---

## 📱 以后怎么用？

### 每天早上

```
1. 打开手机浏览器
2. 访问健康系统网址
3. 开始使用
```

**就这么简单！** 不需要任何其他操作！

---

## 🔗 重要链接

- **Vercel**: https://vercel.com
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Neon**: https://neon.tech
- **详细指南**: 查看 `VERCEL_DEPLOYMENT_GUIDE.md`

---

## 💡 提示

- 使用 GitHub 账号登录 Vercel（最简单）
- 选择 "Next.js" 框架
- 免费额度足够个人使用
- 修改代码会自动部署

---

**准备开始了吗？** 🚀
