'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">页面不存在</h2>
            <p className="text-gray-600 mb-6">
              抱歉，您访问的页面不存在或已被删除。
            </p>
            <div className="space-y-3">
              <Link href="/admin/dashboard">
                <Button className="w-full">
                  返回首页
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                返回上一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
