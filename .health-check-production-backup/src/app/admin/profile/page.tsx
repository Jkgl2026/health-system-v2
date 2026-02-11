'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(localStorage.getItem('username') || '');
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">个人中心</h1>

      <Card>
        <CardHeader>
          <CardTitle>管理员信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">用户名</p>
              <p className="font-semibold text-lg">{username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>账号操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link href="/admin/profile/change-password">
              <Button variant="outline" className="w-full">
                修改密码
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
