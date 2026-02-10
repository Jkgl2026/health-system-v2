'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  user_id: number;
  name: string;
  phone: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  job: string;
  sleep: string;
  drink_smoke: string;
  exercise: string;
  diet: string;
  pressure_state: string;
  allergy: string;
  sickness: string;
  family_sickness: string;
  symptom: string;
  complete: number;
  health_status: string;
  health_score: number;
  score_life: number;
  score_sleep: number;
  score_stress: number;
  score_body: number;
  score_risk: number;
  done_self_check: boolean;
  done_require: boolean;
  analysis: string;
}

function UserCompareContent() {
  const searchParams = useSearchParams();
  const userIdsParam = searchParams.get('userIds');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userIdsParam) {
      fetchUsersForCompare();
    }
  }, [userIdsParam]);

  const fetchUsersForCompare = async () => {
    setLoading(true);
    setError('');

    const userIds = userIdsParam?.split(',').map(Number).filter(id => !isNaN(id));

    if (!userIds || userIds.length === 0 || userIds.length > 3) {
      setError('请选择1-3个用户进行对比');
      setLoading(false);
      return;
    }

    try {
      const promises = userIds.map(userId =>
        fetch(`/api/user/detail?userId=${userId}`).then(res => res.json())
      );

      const results = await Promise.all(promises);

      const validUsers = results
        .filter(result => result.code === 200)
        .map(result => result.data);

      if (validUsers.length > 0) {
        setUsers(validUsers);
      } else {
        setError('获取用户数据失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const isDifferent = (field: keyof User) => {
    if (users.length < 2) return false;
    const values = users.map(u => u[field]);
    return values.some((v, i) => v !== values[0]);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case '优秀': return 'bg-green-500';
      case '良好': return 'bg-blue-500';
      case '一般': return 'bg-yellow-500';
      case '异常': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';
    return value;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.history.back()}>返回</Button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="text-red-500">用户不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">多用户对比</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>

      {/* 用户基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>对比用户</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <div key={user.user_id} className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold text-lg mb-2">用户 {index + 1}</h3>
                <p className="text-sm text-gray-600">ID: {user.user_id}</p>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 基础信息对比 */}
      <Card>
        <CardHeader>
          <CardTitle>基础信息对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">字段</th>
                  {users.map((user) => (
                    <th key={user.user_id} className="text-left py-2 px-4 font-semibold">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={isDifferent('gender') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">性别</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.gender)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('age') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">年龄</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.age)}岁</td>
                  ))}
                </tr>
                <tr className={isDifferent('height') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">身高</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.height)}cm</td>
                  ))}
                </tr>
                <tr className={isDifferent('weight') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">体重</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.weight)}kg</td>
                  ))}
                </tr>
                <tr className={isDifferent('job') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">职业</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.job)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 生活习惯对比 */}
      <Card>
        <CardHeader>
          <CardTitle>生活习惯对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">字段</th>
                  {users.map((user) => (
                    <th key={user.user_id} className="text-left py-2 px-4 font-semibold">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={isDifferent('sleep') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">睡眠</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.sleep)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('drink_smoke') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">烟酒</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.drink_smoke)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('exercise') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">运动</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.exercise)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('diet') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">饮食</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.diet)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 健康状况对比 */}
      <Card>
        <CardHeader>
          <CardTitle>健康状况对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">字段</th>
                  {users.map((user) => (
                    <th key={user.user_id} className="text-left py-2 px-4 font-semibold">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={isDifferent('health_status') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">健康状态</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getHealthStatusColor(user.health_status)}`}>
                        {user.health_status || '未评估'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className={isDifferent('health_score') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">健康分数</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {user.health_score || 0}分
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className={isDifferent('score_life') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">生活评分</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.score_life)}分</td>
                  ))}
                </tr>
                <tr className={isDifferent('score_sleep') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">睡眠评分</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.score_sleep)}分</td>
                  ))}
                </tr>
                <tr className={isDifferent('score_stress') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">压力评分</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.score_stress)}分</td>
                  ))}
                </tr>
                <tr className={isDifferent('score_body') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">身体评分</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.score_body)}分</td>
                  ))}
                </tr>
                <tr className={isDifferent('score_risk') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">风险评分</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.score_risk)}分</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 病史信息对比 */}
      <Card>
        <CardHeader>
          <CardTitle>病史信息对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">字段</th>
                  {users.map((user) => (
                    <th key={user.user_id} className="text-left py-2 px-4 font-semibold">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={isDifferent('pressure_state') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">血压状况</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.pressure_state)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('allergy') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">过敏史</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.allergy)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('sickness') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">病史</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.sickness)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('family_sickness') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">家族病史</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.family_sickness)}</td>
                  ))}
                </tr>
                <tr className={isDifferent('symptom') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">症状</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.symptom)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 完成状态对比 */}
      <Card>
        <CardHeader>
          <CardTitle>完成状态对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">字段</th>
                  {users.map((user) => (
                    <th key={user.user_id} className="text-left py-2 px-4 font-semibold">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={isDifferent('done_self_check') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">自检完成</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-white text-xs ${user.done_self_check ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {user.done_self_check ? '已完成' : '未完成'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className={isDifferent('done_require') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">七问完成</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-white text-xs ${user.done_require ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {user.done_require ? '已完成' : '未完成'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className={isDifferent('complete') ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4">完成度</td>
                  {users.map((user) => (
                    <td key={user.user_id} className="py-2 px-4">{formatValue(user.complete)}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 健康建议对比 */}
      <Card>
        <CardHeader>
          <CardTitle>健康建议对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.user_id} className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-bold text-lg mb-2">{user.name}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {user.analysis || '暂无分析报告'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">加载中...</div>}>
      <UserCompareContent />
    </Suspense>
  );
}
