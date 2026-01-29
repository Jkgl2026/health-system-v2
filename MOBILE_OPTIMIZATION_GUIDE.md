# 移动端适配优化指南

## 概述

本文档详细说明了项目在移动端的适配优化方案，确保所有用户设备上都有良好的体验。

## 1. 触摸目标尺寸

### 规范
- **最小尺寸**: 44x44 像素 (iOS 和 Android 官方推荐)
- **推荐尺寸**: 48x48 像素
- **间距**: 至少 8 像素

### 实现示例

```tsx
// ❌ 错误：触摸目标太小
<Button size="sm" className="h-8 w-8">点击</Button>

// ✅ 正确：触摸目标足够大
<Button size="sm" className="min-h-[44px] min-w-[44px]">点击</Button>
```

### 检查清单
- [ ] 所有按钮的最小尺寸 >= 44x44 像素
- [ ] 所有可点击的图标都有足够的点击区域
- [ ] 表单元素（输入框、单选框、复选框）都有足够的点击区域
- [ ] 卡片点击区域明确

## 2. 字体大小

### 规范
- **最小字体**: 14px (移动端可读性标准)
- **正文推荐**: 16px
- **标题推荐**: 18-24px

### 实现示例

```tsx
// ❌ 错误：字体太小
<p className="text-xs">这是一段文字</p>

// ✅ 正确：使用合适的字体大小
<p className="text-sm md:text-base">这是一段文字</p>
```

### Tailwind CSS 响应式字体类
- `text-xs` (12px) - 仅用于辅助说明（如标签、徽章）
- `text-sm` (14px) - 移动端最小正文
- `text-base` (16px) - 推荐正文
- `text-lg` (18px) - 小标题
- `text-xl` (20px) - 中标题
- `text-2xl` (24px) - 大标题

## 3. 键盘弹出处理

### 问题
当用户在移动端输入时，虚拟键盘会遮挡输入框。

### 解决方案

#### 方案 1: 使用 Viewport Meta 标签
```html
<meta name="viewport" content="height=device-height, initial-scale=1.0" />
```

#### 方案 2: 添加底部 Padding
```tsx
<Input
  className="mb-20" // 为键盘留出空间
/>
```

#### 方案 3: 自动滚动到输入框
```tsx
useEffect(() => {
  if (inputRef.current && focused) {
    inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, [focused]);
```

## 4. 横屏适配

### 问题
横屏时布局可能会错乱或内容被截断。

### 解决方案

#### 检测横屏
```tsx
const [isLandscape, setIsLandscape] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsLandscape(window.innerWidth > window.innerHeight);
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  return () => window.removeEventListener('resize', handleResize);
}, []);
```

#### 横屏专用样式
```tsx
<div className={cn(
  "flex flex-col",
  isLandscape && "flex-row"
)}>
  {/* 内容 */}
</div>
```

## 5. 手势支持

### 常用手势
- **滑动返回**: 在页面导航时支持
- **下拉刷新**: 在列表页支持
- **长按**: 显示更多操作
- **双击**: 放大/缩小

### 实现示例

```tsx
// 使用 Framer Motion 实现滑动手势
import { motion } from 'framer-motion';

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.x > 100) {
      // 向右滑动，返回上一页
      router.back();
    }
  }}
>
  {/* 内容 */}
</motion.div>
```

## 6. 响应式断点

### Tailwind CSS 默认断点
```css
sm:   640px   // 平板竖屏
md:   768px   // 平板横屏
lg:   1024px  // 小型桌面
xl:   1280px  // 中型桌面
2xl:  1536px  // 大型桌面
```

### 自定义断点 (如需要)
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // 小屏手机
        'sm': '640px',  // 大屏手机
        'md': '768px',  // 平板
        'lg': '1024px', // 桌面
      },
    },
  },
};
```

## 7. 图片优化

### 使用 Next.js Image 组件
```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="描述"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false}
/>
```

### 响应式图片
```tsx
<picture>
  <source media="(max-width: 768px)" srcSet="/image-mobile.jpg" />
  <source media="(max-width: 1200px)" srcSet="/image-tablet.jpg" />
  <img src="/image-desktop.jpg" alt="描述" />
</picture>
```

## 8. 网络状态检测

### 实现离线提示
```tsx
const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

{!isOnline && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      网络连接已断开，请检查网络设置
    </AlertDescription>
  </Alert>
)}
```

## 9. 性能优化

### 图片懒加载
```tsx
<Image
  src="/image.jpg"
  alt="描述"
  loading="lazy"
/>
```

### 虚拟滚动 (长列表)
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList>
```

### 代码分割
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>加载中...</div>}>
  <HeavyComponent />
</Suspense>
```

## 10. 可访问性

### ARIA 标签
```tsx
<Button aria-label="关闭">
  <X className="h-4 w-4" />
</Button>
```

### 键盘导航
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  点击我
</div>
```

### 颜色对比度
- **WCAG AA 标准**: 4.5:1 (普通文本), 3:1 (大文本)
- **WCAG AAA 标准**: 7:1 (普通文本), 4.5:1 (大文本)

## 11. 测试

### 真机测试
- [ ] iOS Safari (iPhone)
- [ ] iOS Chrome (iPhone)
- [ ] Android Chrome
- [ ] 微信内置浏览器
- [ ] 其他主流浏览器

### 模拟器测试
- [ ] Chrome DevTools Device Mode
- [ ] iOS Simulator
- [ ] Android Emulator

### 网络条件测试
- [ ] 4G 网络
- [ ] 3G 网络
- [ ] 弱网环境
- [ ] 离线环境

## 12. 常见问题

### 问题 1: 300ms 点击延迟
**原因**: iOS 的双击缩放功能
**解决**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
```

### 问题 2: 文本自动缩放
**原因**: iOS 自动调整字体大小
**解决**:
```css
* {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

### 问题 3: 横屏时内容被截断
**原因**: 固定高度或宽度
**解决**: 使用响应式单位和媒体查询

## 13. 检查清单

### 布局
- [ ] 所有元素在移动端可见
- [ ] 横屏布局正常
- [ ] 不同屏幕尺寸下布局适配

### 交互
- [ ] 触摸目标足够大
- [ ] 手势响应流畅
- [ ] 键盘弹出不影响输入
- [ ] 滚动流畅

### 性能
- [ ] 加载速度快
- [ ] 图片优化
- [ ] 代码分割
- [ ] 内存使用合理

### 可访问性
- [ ] ARIA 标签完整
- [ ] 键盘导航支持
- [ ] 颜色对比度达标
- [ ] 屏幕阅读器兼容

### 测试
- [ ] 真机测试通过
- [ ] 不同浏览器测试通过
- [ ] 不同网络条件测试通过

## 参考资料

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Responsive Design](https://nextjs.org/docs/app/building-your-application/styling/css-modules#responsive-design)
