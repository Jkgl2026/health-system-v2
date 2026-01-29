# 快速使用指南

## 🚀 立即开始使用新功能

### 1. 身份验证和会话管理

#### 登录流程
```typescript
// 前端调用登录API
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'your-password'
  })
});

const data = await response.json();
// Token会自动保存在HttpOnly Cookie中
```

#### 验证会话
```typescript
// 验证当前登录状态
const response = await fetch('/api/admin/verify');
const data = await response.json();

if (data.authenticated) {
  console.log('已登录', data.admin);
}
```

#### 退出登录
```typescript
// 退出登录
await fetch('/api/admin/logout', { method: 'POST' });
```

### 2. 速率限制

#### 应用速率限制到API
```typescript
// src/app/api/your-endpoint/route.ts
import { getRateLimiter, applyRateLimit } from '@/lib/rate-limit';

// 创建速率限制器
const limiter = getRateLimiter('my-endpoint', 'moderate');

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResult = applyRateLimit(request, limiter);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  // 处理请求...
}
```

#### 查看速率限制状态
```typescript
// 查看限制器状态
const stats = limiter.getStats();
console.log('活跃标识符:', stats.activeIdentifiers);
```

### 3. JSONB压缩

#### 压缩数据
```typescript
import { compressForStorage, decompressFromStorage } from '@/lib/compressionUtils';

// 保存时压缩
const data = { /* 大型对象 */ };
const compressed = compressForStorage(data);

// 存储到数据库
await db.insert(users).values({ 
  id: userId,
  largeData: compressed
});
```

#### 解压数据
```typescript
// 读取时解压
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
});

const data = decompressFromStorage(user.largeData);
```

### 4. 数据库连接池监控

#### 查看连接池状态
```typescript
// GET /api/admin/pool-stats
// 需要管理员登录
const response = await fetch('/api/admin/pool-stats');
const stats = await response.json();

console.log('连接池状态:', stats.pool);
console.log('数据库大小:', stats.database);
console.log('慢查询:', stats.slowQueries);
```

### 5. 统一错误处理

#### 使用自定义错误
```typescript
import { ValidationError, NotFoundError, handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    // 验证参数
    if (!request.params.id) {
      throw new ValidationError('缺少必需参数: id');
    }

    // 查询数据
    const data = await findById(request.params.id);
    if (!data) {
      throw new NotFoundError('用户');
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 6. 自动保存

#### 在React组件中使用
```typescript
'use client';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const { save, status, lastSavedData, isSaving } = useAutoSave({
    saveFn: async (data) => {
      await fetch('/api/user/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delay: 1000, // 1秒防抖
    onSaveSuccess: (data) => {
      console.log('保存成功', data);
    },
  });

  // 保存数据
  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    save(newData);
  };

  return (
    <form>
      <input 
        name="name" 
        value={formData.name}
        onChange={handleChange}
      />
      <input 
        name="email" 
        value={formData.email}
        onChange={handleChange}
      />
      <div>
        {isSaving && <span>保存中...</span>}
        {status === 'success' && <span>已保存</span>}
        {status === 'error' && <span>保存失败</span>}
      </div>
    </form>
  );
}
```

#### 使用表单专用Hook
```typescript
import { useFormAutoSave } from '@/hooks/useAutoSave';

export default function MyForm() {
  const {
    formData,
    updateField,
    submitForm,
    hasChanges,
    isSaving,
  } = useFormAutoSave({
    saveFn: async (data) => await saveToDatabase(data),
    initialData: { name: '', email: '' },
  });

  return (
    <form>
      <input 
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <button 
        onClick={submitForm}
        disabled={!hasChanges || isSaving}
      >
        {isSaving ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 7. 健康检查和告警

#### 查看系统健康状态
```typescript
// GET /api/health
const response = await fetch('/api/health');
const health = await response.json();

console.log('健康评分:', health.health.score);
console.log('状态:', health.health.status);
console.log('数据库响应时间:', health.database.responseTime);
console.log('活跃告警:', health.alerts.active);
```

#### 查看告警历史
```typescript
// GET /api/admin/alerts?level=ERROR&limit=10
// 需要管理员登录
const response = await fetch('/api/admin/alerts?limit=20');
const data = await response.json();

console.log('告警记录:', data.alerts);
console.log('统计:', data.stats);
```

#### 配置自定义告警规则
```typescript
import { alertManager, AlertLevel, AlertType } from '@/lib/alertManager';

// 添加自定义告警规则
alertManager.addRule({
  id: 'custom-alert',
  name: '自定义告警',
  description: '监控自定义指标',
  type: AlertType.SYSTEM,
  level: AlertLevel.WARNING,
  enabled: true,
  checkFn: async () => {
    // 自定义检查逻辑
    const metric = await getCustomMetric();
    return {
      triggered: metric > threshold,
      value: metric,
      message: `当前值: ${metric}`,
    };
  },
});

// 启动告警检查
alertManager.start();
```

## 🔧 配置建议

### 环境变量
```bash
# .env.local
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### JWT Secret生成
```bash
# 在生产环境中使用强密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 监控建议

### 关键指标
- 健康评分 > 80
- 数据库响应时间 < 100ms
- 活跃告警 = 0
- 连接数 < 60

### 告警阈值
- 数据库连接数 > 80: 警告
- 响应时间 > 1000ms: 警告
- 健康评分 < 70: 需关注

## 🐛 故障排查

### 登录失败
1. 检查JWT_SECRET是否配置
2. 查看控制台错误日志
3. 确认管理员账号存在

### 速率限制触发
1. 检查请求频率
2. 查看X-RateLimit-*响应头
3. 等待冷却时间

### 自动保存失败
1. 检查网络连接
2. 查看控制台错误
3. 手动调用saveImmediately

### 告警频繁触发
1. 检查阈值设置
2. 分析性能瓶颈
3. 调整规则配置

## 📚 相关文档

- [数据库连接池优化指南](DATABASE_POOL_OPTIMIZATION.md)
- [系统安全加固总结](SECURITY_OPTIMIZATION_SUMMARY.md)
- [系统全面检查报告](SYSTEM_COMPREHENSIVE_REVIEW.md)

## 💡 最佳实践

1. **安全性**
   - 生产环境必须配置JWT_SECRET
   - 定期更新密钥
   - 启用所有安全中间件

2. **性能优化**
   - 启用JSONB压缩
   - 监控慢查询
   - 优化连接池配置

3. **用户体验**
   - 使用自动保存
   - 提供清晰的状态反馈
   - 友好的错误提示

4. **监控告警**
   - 配置合理的阈值
   - 及时处理告警
   - 定期检查健康状态

## 🆘 获取帮助

如遇到问题，请：
1. 查看控制台日志
2. 检查健康检查API
3. 查看告警历史
4. 阅读相关文档

---

**祝使用愉快！** 🎉
