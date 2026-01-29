# 健康管理系统 - 部署与运行指南

## 🎯 问题说明

### 为什么会出现 "instance_not_found" 错误？

当你早上打开健康系统网址时看到：
```json
{
  "error_code": "instance_not_found_vefaas-6274o7rx-xabygz3k7k-d5suvlo3ddi8v3g5lb3g-sandbox",
  "error_message": "user specified instance ... not found"
}
```

**原因：**
1. 开发环境沙箱在你离开后自动停止
2. 服务器进程也随之停止
3. 需要重新启动服务才能访问

**这是一个正常的开发环境行为，不是 bug！**

---

## 💡 解决方案

### 方案 1：使用生产模式运行 ⭐⭐⭐⭐⭐（推荐）

**优点：**
- ✅ 更稳定，资源占用更少
- ✅ 使用构建后的静态文件，响应更快
- ✅ 适合持续运行

**使用方法：**

```bash
# 方法 A：一键启动（推荐）
bash scripts/start-prod.sh

# 方法 B：手动启动
pnpm run build && pnpm run start
```

**查看日志：**
```bash
# 查看实时日志
tail -f /app/work/logs/bypass/prod.log

# 查看最近日志
tail -n 50 /app/work/logs/bypass/prod.log
```

**停止服务：**
```bash
pkill -f "next start"
```

---

### 方案 2：使用守护进程 ⭐⭐⭐⭐（自动重启）

**优点：**
- ✅ 自动监控服务状态
- ✅ 服务崩溃时自动重启
- ✅ 持续保证服务可用

**使用方法：**

```bash
# 启动守护进程（后台运行）
nohup bash scripts/daemon.sh > /app/work/logs/bypass/daemon.log 2>&1 &

# 查看守护进程日志
tail -f /app/work/logs/bypass/daemon.log
```

**守护进程功能：**
- 每 30 秒检查一次服务状态
- 服务停止时自动重启
- 构建失败时自动重新构建
- 最多尝试 10 次重启
- 所有操作都有日志记录

**停止守护进程：**
```bash
pkill -f "daemon.sh"
```

---

### 方案 3：开发模式（不推荐 24 小时运行）

**适用场景：**
- 开发和测试
- 需要热重载功能
- 临时调试

**使用方法：**
```bash
# 启动开发服务器
coze dev

# 或使用脚本
pnpm run dev
```

**缺点：**
- ❌ 资源占用高（内存 + CPU）
- ❌ 不适合长时间运行
- ❌ 性能不如生产模式

---

## 🚀 推荐的日常使用流程

### 第一次启动（部署模式）

```bash
# 1. 构建项目
pnpm run build

# 2. 启动生产服务器
pnpm run start

# 或使用一键脚本
bash scripts/start-prod.sh
```

### 每天早上启动

```bash
# 进入项目目录
cd /workspace/projects

# 启动守护进程（推荐）
nohup bash scripts/daemon.sh > /app/work/logs/bypass/daemon.log 2>&1 &

# 或直接启动生产服务器
bash scripts/start-prod.sh
```

### 验证服务状态

```bash
# 检查端口是否在监听
ss -lptn 'sport = :5000'

# 测试 API
curl http://localhost:5000/api/health

# 查看日志
tail -n 20 /app/work/logs/bypass/prod.log
```

---

## 📊 三种模式对比

| 特性 | 开发模式 (coze dev) | 生产模式 (start) | 守护模式 (daemon) |
|------|-------------------|-----------------|------------------|
| 启动速度 | 快 | 慢（需构建） | 慢（需构建） |
| 资源占用 | 高 | 低 | 低 |
| 响应速度 | 一般 | 快 | 快 |
| 热重载 | ✅ | ❌ | ❌ |
| 自动重启 | ❌ | ❌ | ✅ |
| 稳定性 | 一般 | 高 | 最高 |
| 适合场景 | 开发调试 | 24h运行 | 24h运行 |
| 推荐指数 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 最终建议

### 如果你需要 24 小时可用：

**方案 A（推荐）：使用守护进程**
```bash
# 一键启动守护进程
nohup bash scripts/daemon.sh > /app/work/logs/bypass/daemon.log 2>&1 &
```

**方案 B：手动启动生产服务器**
```bash
# 每天早上手动启动
bash scripts/start-prod.sh
```

### 如果只是开发和测试：
```bash
# 使用开发模式，方便调试
coze dev
```

---

## ❓ 常见问题

### Q1: 为什么不能像真正的网站一样 24 小时可用？

**A:** 沙箱环境是开发环境，不是生产环境。真正的 24 小时可用需要：
- 部署到云服务器（阿里云、腾讯云等）
- 使用 Vercel、Netlify 等托管平台
- 使用 Docker 容器化部署

### Q2: 能否设置自动启动？

**A:** 可以，将启动命令添加到沙箱的启动脚本中。但仍然需要保持沙箱运行。

### Q3: 为什么生产模式启动慢？

**A:** 生产模式需要先构建项目（`pnpm run build`），这需要一些时间。但启动后性能更好。

### Q4: 如何查看服务是否正常运行？

**A:** 使用以下命令：
```bash
# 检查端口
ss -lptn 'sport = :5000'

# 检查进程
ps aux | grep "next"

# 查看日志
tail -n 20 /app/work/logs/bypass/prod.log
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看日志文件
2. 检查服务状态
3. 参考本文档的常见问题部分

---

## 📝 更新日志

- 2026-01-28: 创建文档，添加生产模式和守护进程脚本
