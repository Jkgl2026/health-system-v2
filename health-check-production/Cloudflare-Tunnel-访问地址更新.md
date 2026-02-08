# Cloudflare Tunnel - 访问地址更新

## ✅ 问题已修复！

Cloudflare Tunnel 已成功重新启动，可以正常访问了！

---

## 🌐 新的访问地址

**重要说明：Cloudflare Quick Tunnel 每次重启都会生成新的随机域名。**

### 当前可用地址（最新）

| 页面 | 访问地址 |
|------|---------|
| **管理后台** | https://shield-approximate-actions-selective.trycloudflare.com/admin/dashboard |
| **登录页面** | https://shield-approximate-actions-selective.trycloudflare.com/admin/login |
| **用户管理** | https://shield-approximate-actions-selective.trycloudflare.com/admin/users |
| **用户详情** | https://shield-approximate-actions-selective.trycloudflare.com/admin/user/detail?userId=1 |
| **首页** | https://shield-approximate-actions-selective.trycloudflare.com/ |

### 系统账号
- 用户名：`admin`
- 密码：`123456`

### 隧道密码
**不需要！直接访问！** ✅

---

## ❌ 旧地址说明

| 旧地址 | 状态 |
|--------|------|
| https://pull-leon-yet-salem.trycloudflare.com | ❌ 已失效 |
| https://stopped-wrist-crystal-bless.trycloudflare.com | ❌ 已失效 |

**失效原因**：Cloudflare Quick Tunnel 的域名是随机生成的，每次重启 Tunnel 都会生成新的域名。旧域名对应的 Tunnel 已经停止运行，所以无法访问。

---

## 🔧 隧道管理

### 查看当前访问地址
```bash
bash health-check-production/cloudflare-tunnel/manage-tunnel.sh url
```

### 查看隧道状态
```bash
bash health-check-production/cloudflare-tunnel/manage-tunnel.sh status
```

### 重启隧道（会生成新域名）
```bash
bash health-check-production/cloudflare-tunnel/manage-tunnel.sh restart
```

### 查看日志
```bash
tail -f /workspace/projects/health-check-production/cloudflare-tunnel/cloudflare-tunnel.log
```

---

## ⚠️ 关于随机域名

### Cloudflare Quick Tunnel 特点

| 特性 | 说明 |
|------|------|
| **随机域名** | 每次重启 Tunnel 都会生成新的随机域名 |
| **无需账户** | 不需要 Cloudflare 账户 |
| **完全免费** | 无流量限制、无连接限制 |
| **无限并发** | 支持无限并发连接 |
| **全球 CDN** | Cloudflare 全球 CDN 加速 |
| **DDoS 防护** | 自动启用 DDoS 防护 |

### 如何避免域名变化？

**方案1：保持 Tunnel 运行**
- Tunnel 不重启，域名就不会变
- 避免意外重启，保持长期运行

**方案2：配置标准隧道（需要 Cloudflare 账户）**
- 登录 Cloudflare 账户
- 创建命名隧道
- 绑定自己的域名
- 域名固定不变

**方案3：使用其他内网穿透工具**
- ngrok（需要账户）
- frp（需要服务器）
- 贝锐花生壳（国内）

---

## 📊 服务状态

| 服务 | 状态 |
|------|------|
| Next.js 服务（5000端口） | ✅ 正常运行 |
| PostgreSQL 数据库 | ✅ 正常运行 |
| Cloudflare Tunnel | ✅ 正常运行（PID: 546） |
| 公网访问 | ✅ 正常 |
| HTTPS 加密 | ✅ HTTP/2 |
| CDN 加速 | ✅ Cloudflare CDN |

---

## 🎯 立即访问

点击下方链接，立即开始使用：

### 🌐 管理后台
https://shield-approximate-actions-selective.trycloudflare.com/admin/dashboard

### 🔐 登录页面
https://shield-approximate-actions-selective.trycloudflare.com/admin/login

### 👥 用户管理
https://shield-approximate-actions-selective.trycloudflare.com/admin/users

---

## 💡 使用建议

1. **保存书签**：将当前访问地址保存到浏览器书签
2. **避免重启**：尽量避免重启 Tunnel，保持域名稳定
3. **检查状态**：如果无法访问，先运行 `./manage-tunnel.sh status` 检查状态
4. **定期检查**：定期检查 Tunnel 是否正常运行

---

## 🆘 故障排查

### 如果无法访问

1. **检查 Tunnel 状态**
   ```bash
   bash health-check-production/cloudflare-tunnel/manage-tunnel.sh status
   ```

2. **如果 Tunnel 未运行**
   ```bash
   bash health-check-production/cloudflare-tunnel/manage-tunnel.sh start
   ```

3. **获取新的访问地址**
   ```bash
   bash health-check-production/cloudflare-tunnel/manage-tunnel.sh url
   ```

4. **查看日志**
   ```bash
   tail -f /workspace/projects/health-check-production/cloudflare-tunnel/cloudflare-tunnel.log
   ```

---

## 📞 常见问题

**Q：为什么域名会变？**
A：Cloudflare Quick Tunnel 使用随机域名，每次重启都会生成新域名。

**Q：如何固定域名？**
A：需要配置标准隧道，登录 Cloudflare 账户并绑定自己的域名。

**Q：旧地址还能用吗？**
A：不能。旧域名对应的 Tunnel 已停止，需要使用新地址。

**Q：多久会变一次？**
A：只要不重启 Tunnel，域名就不会变。保持 Tunnel 长期运行即可。

**Q：有流量限制吗？**
A：没有！Cloudflare Quick Tunnel 完全免费，无流量限制。

---

## ✅ 验证测试

```bash
# 测试访问
curl -I https://shield-approximate-actions-selective.trycloudflare.com/admin/dashboard

# 预期结果
# HTTP/2 307
# location: /admin/login
```

---

## 🎉 总结

- ✅ Cloudflare Tunnel 已成功重新启动
- ✅ 新的访问地址可以正常使用
- ✅ HTTPS 加密、CDN 加速、DDoS 防护全部启用
- ✅ 无需隧道密码，直接访问
- ✅ 完全免费，无流量限制

**请使用新的访问地址访问系统！**

---

## 更新时间

2026-02-08 09:53:05
