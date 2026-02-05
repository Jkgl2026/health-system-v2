'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StatData {
  totalUsers: number;
  completedSelfCheck: number;
  completedRequire: number;
  avgHealthScore: number;
  recentUsers: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/stat');
      const data = await response.json();

      if (data.code === 200) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">加载失败</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">控制台首页</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">已完成自检</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.completedSelfCheck}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">已完成要求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedRequire}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">平均健康分数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.avgHealthScore.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近用户列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近注册用户</CardTitle>
          <Link href="/admin/user/list">
            <Button variant="outline">查看全部</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">用户ID</th>
                  <th className="text-left py-3 px-4">姓名</th>
                  <th className="text-left py-3 px-4">手机号</th>
                  <th className="text-left py-3 px-4">健康状态</th>
                  <th className="text-left py-3 px-4">健康分数</th>
                  <th className="text-left py-3 px-4">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.user_id}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-white text-xs ${
                        user.health_status === '优秀' ? 'bg-green-500' :
                        user.health_status === '良好' ? 'bg-blue-500' :
                        user.health_status === '一般' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {user.health_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.health_score}</td>
                    <td className="py-3 px-4">{new Date(user.create_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
