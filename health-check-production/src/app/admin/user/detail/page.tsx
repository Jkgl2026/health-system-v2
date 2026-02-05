'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserDetail {
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
  answer_content: string;
  analysis: string;
  create_time: string;
  update_time: string;
  history: Array<{
    check_id: number;
    check_time: string;
    health_score: number;
    health_status: string;
    analysis: string;
  }>;
}

export default function UserDetailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/user/detail?userId=${userId}`);
      const data = await response.json();

      if (data.code === 200) {
        setUser(data.data);
      } else {
        setError(data.msg || '获取用户详情失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (!user) {
    return <div className="text-red-500">用户不存在</div>;
  }

  let answerContent = null;
  try {
    if (user.answer_content) {
      answerContent = JSON.parse(user.answer_content);
    }
  } catch (e) {
    answerContent = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">用户详情</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>

      {/* 用户基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">用户ID</p>
              <p className="font-semibold">{user.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">手机号</p>
              <p className="font-semibold">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">年龄</p>
              <p className="font-semibold">{user.age}岁</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">性别</p>
              <p className="font-semibold">{user.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">身高</p>
              <p className="font-semibold">{user.height}cm</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">体重</p>
              <p className="font-semibold">{user.weight}kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">职业</p>
              <p className="font-semibold">{user.job}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 健康评分卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>健康评分</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">健康状态</p>
              <span className={`px-3 py-1 rounded text-white mt-1 inline-block ${getHealthStatusColor(user.health_status)}`}>
                {user.health_status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">综合健康分数</p>
              <p className="text-3xl font-bold text-blue-600">{user.health_score}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">完成度</p>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${user.complete}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{user.complete}%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">生活方式得分</p>
              <p className="text-2xl font-bold">{user.score_life}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">睡眠质量得分</p>
              <p className="text-2xl font-bold">{user.score_sleep}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">压力状态得分</p>
              <p className="text-2xl font-bold">{user.score_stress}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">体质指数得分</p>
              <p className="text-2xl font-bold">{user.score_body}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">健康风险得分</p>
              <p className="text-2xl font-bold">{user.score_risk}分</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生活信息 */}
      <Card>
        <CardHeader>
          <CardTitle>生活信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">作息情况</p>
              <p className="font-semibold">{user.sleep || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">烟酒习惯</p>
              <p className="font-semibold">{user.drink_smoke || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">运动习惯</p>
              <p className="font-semibold">{user.exercise || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">饮食习惯</p>
              <p className="font-semibold">{user.diet || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">压力状态</p>
              <p className="font-semibold">{user.pressure_state || '未填写'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 病史信息 */}
      <Card>
        <CardHeader>
          <CardTitle>病史信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">过敏史</p>
              <p className="font-semibold">{user.allergy || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">既往病史</p>
              <p className="font-semibold">{user.sickness || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">家族病史</p>
              <p className="font-semibold">{user.family_sickness || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">当前症状</p>
              <p className="font-semibold">{user.symptom || '无'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 自检原始内容 */}
      {answerContent && (
        <Card>
          <CardHeader>
            <CardTitle>自检原始内容</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(answerContent as Record<string, string>).map(([question, answer], index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-700">{question}</p>
                  <p className="text-gray-600 mt-1">{answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 健康分析报告 */}
      {user.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>健康分析报告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {user.analysis}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      {user.history && user.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史自检记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.history.map((record) => (
                <div key={record.check_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">检测时间</p>
                      <p className="font-semibold">{new Date(record.check_time).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">健康分数</p>
                      <p className="text-2xl font-bold text-blue-600">{record.health_score}分</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded text-white text-xs ${getHealthStatusColor(record.health_status)}`}>
                      {record.health_status}
                    </span>
                  </div>
                  {record.analysis && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.analysis}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 注册信息 */}
      <Card>
        <CardHeader>
          <CardTitle>注册信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">注册时间</p>
              <p className="font-semibold">{new Date(user.create_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最后更新时间</p>
              <p className="font-semibold">{new Date(user.update_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成自检</p>
              <p className="font-semibold">{user.done_self_check ? '是' : '否'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成要求</p>
              <p className="font-semibold">{user.done_require ? '是' : '否'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
