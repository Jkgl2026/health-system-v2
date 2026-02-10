import { Suspense } from 'react';

/**
 * SuspenseBoundary 组件
 * 用于包裹使用 useSearchParams()、usePathname() 等动态 API 的组件
 */
export function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      {children}
    </Suspense>
  );
}
