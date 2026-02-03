# 依赖安装说明

## 需要安装的新增依赖

登录系统需要以下依赖包，请根据包管理器执行对应命令。

### 使用 pnpm（推荐）
```bash
pnpm add bcryptjs jsonwebtoken pg
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

### 使用 npm
```bash
npm install bcryptjs jsonwebtoken pg
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 使用 yarn
```bash
yarn add bcryptjs jsonwebtoken pg
yarn add -D @types/bcryptjs @types/jsonwebtoken
```

## 依赖说明

### 生产依赖

1. **bcryptjs** - 密码加密库
   - 用于管理员密码加密存储
   - 版本建议：^2.4.3

2. **jsonwebtoken** - JWT令牌生成和校验
   - 用于登录后生成Token
   - 版本建议：^9.0.2

3. **pg** - PostgreSQL客户端
   - 用于数据库连接和操作
   - 版本建议：^8.11.3

### 开发依赖

1. **@types/bcryptjs** - bcryptjs的TypeScript类型定义
   - 版本建议：^2.4.6

2. **@types/jsonwebtoken** - jsonwebtoken的TypeScript类型定义
   - 版本建议：^9.0.5

## 完整的 package.json 示例

如果您的项目中还没有安装这些依赖，最终的 package.json 依赖部分应该如下：

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    // ... 其他依赖
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    // ... 其他开发依赖
  }
}
```

## 安装后验证

安装完成后，可以执行以下命令验证：

```bash
# 查看已安装的依赖
pnpm list bcryptjs jsonwebtoken pg

# 查看TypeScript类型定义
pnpm list -D @types/bcryptjs @types/jsonwebtoken
```

## 常见问题

### 1. 安装失败
- 确保使用的是正确的包管理器（推荐pnpm）
- 清除缓存后重新安装：`pnpm store prune` 然后重新安装
- 检查网络连接，可能需要配置国内镜像

### 2. TypeScript报错
- 确保已安装类型定义：`@types/bcryptjs` 和 `@types/jsonwebtoken`
- 重启TypeScript服务器（VSCode中按 Ctrl+Shift+P，输入 "Restart TypeScript Server"）

### 3. bcryptjs 加密问题
- bcryptjs是纯JavaScript实现，如果性能有问题可以考虑使用bcrypt（需要编译）
- 当前方案使用bcryptjs确保跨平台兼容性

## 注意事项

1. 这些依赖都是成熟稳定的包，在生产环境广泛使用
2. 建议使用最新的稳定版本
3. 定期更新依赖以获取安全修复
4. 生产环境部署前务必测试所有功能
