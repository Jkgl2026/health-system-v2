'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Clock, User, Activity, FileText } from 'lucide-react';

interface UserDetail {
  user_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  waistline: number | null;
  hipline: number | null;
  blood_pressure_high: string | null;
  blood_pressure_low: string | null;
  blood_sugar: string | null;
  blood_fat: string | null;
  heart_rate: string | null;
  sleep_hours: number | null;
  exercise_hours: number | null;
  smoking: string | null;
  drinking: string | null;
  diet: string | null;
  chronic_disease: string | null;
  medication: string | null;
  family_history: string | null;
  symptoms: string | null;
  occupation: string | null;
  address: string | null;
  answer_content: string | null;
  analysis: string | null;
  health_status: string | null;
  health_score: number | null;
  self_check_completed: boolean;
  self_check_time: string | null;
  create_time: string;
  update_time: string;
  symptomCheckHistory: Array<{
    check_id: number;
    check_date: string;
    selected_symptoms: number[];
    target_symptoms: number[];
    total_score: number;
    qi_blood_score: number;
    circulation_score: number;
    toxins_score: number;
    blood_lipids_score: number;
    coldness_score: number;
    immunity_score: number;
    emotions_score: number;
    overall_health: number;
    health_status: string;
    analysis_report: string;
  }>;
}

export default function UserDetailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 获取用户详情
  const fetchUserDetail = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/user/detail?userId=${userId}`);
      const data = await response.json();

      if (data.code === 200) {
        setUser(data.data);
        setLastUpdateTime(new Date());
        setError('');
      } else {
        setError(data.msg || '获取用户详情失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初始加载
  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  // 实时轮询更新（每5秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserDetail();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUserDetail]);

  const getHealthStatusColor = (status: string | null) => {
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

  // 解析 answer_content
  let answerContent = null;
  try {
    if (user.answer_content) {
      answerContent = JSON.parse(user.answer_content);
    }
  } catch (e) {
    answerContent = null;
  }

  // 解析 symptoms
  let parsedSymptoms = null;
  try {
    if (user.symptoms) {
      parsedSymptoms = JSON.parse(user.symptoms);
    }
  } catch (e) {
    parsedSymptoms = user.symptoms;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">用户详情</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              最后更新: {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : '-'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUserDetail}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>

      {/* 用户基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            基本信息
          </CardTitle>
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
              <p className="font-semibold">{user.phone || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="font-semibold">{user.email || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">年龄</p>
              <p className="font-semibold">{user.age ? `${user.age}岁` : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">性别</p>
              <p className="font-semibold">{user.gender || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">身高</p>
              <p className="font-semibold">{user.height ? `${user.height}cm` : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">体重</p>
              <p className="font-semibold">{user.weight ? `${user.weight}kg` : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">BMI</p>
              <p className="font-semibold">{user.bmi ? Number(user.bmi).toFixed(1) : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">职业</p>
              <p className="font-semibold">{user.occupation || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">地址</p>
              <p className="font-semibold">{user.address || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">创建时间</p>
              <p className="font-semibold text-sm">{new Date(user.create_time).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 身体指标 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            身体指标
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">腰围</p>
              <p className="font-semibold">{user.waistline ? `${user.waistline}cm` : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">臀围</p>
              <p className="font-semibold">{user.hipline ? `${user.hipline}cm` : '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">血压（高）</p>
              <p className="font-semibold">{user.blood_pressure_high || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">血压（低）</p>
              <p className="font-semibold">{user.blood_pressure_low || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">血糖</p>
              <p className="font-semibold">{user.blood_sugar || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">血脂</p>
              <p className="font-semibold">{user.blood_fat || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">心率</p>
              <p className="font-semibold">{user.heart_rate || '未填写'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生活方式 */}
      <Card>
        <CardHeader>
          <CardTitle>生活方式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">睡眠时长（小时）</p>
              <p className="font-semibold">{user.sleep_hours || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">运动时长（小时）</p>
              <p className="font-semibold">{user.exercise_hours || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">吸烟习惯</p>
              <p className="font-semibold">{user.smoking || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">饮酒习惯</p>
              <p className="font-semibold">{user.drinking || '未填写'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">饮食习惯</p>
              <p className="font-semibold">{user.diet || '未填写'}</p>
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
              <p className="text-sm text-gray-500">慢性病</p>
              <p className="font-semibold">{user.chronic_disease || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">用药情况</p>
              <p className="font-semibold">{user.medication || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">家族病史</p>
              <p className="font-semibold">{user.family_history || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">症状</p>
              <p className="font-semibold">
                {Array.isArray(parsedSymptoms) ? parsedSymptoms.join(', ') : (user.symptoms || '无')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 健康状态 */}
      <Card>
        <CardHeader>
          <CardTitle>健康状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">健康状态</p>
              <span className={`px-3 py-1 rounded text-white mt-1 inline-block ${getHealthStatusColor(user.health_status)}`}>
                {user.health_status || '未评估'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">健康分数</p>
              <p className="text-3xl font-bold text-blue-600">{user.health_score || 0}分</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">自检完成状态</p>
              <span className={`px-3 py-1 rounded text-white mt-1 inline-block ${user.self_check_completed ? 'bg-green-500' : 'bg-gray-500'}`}>
                {user.self_check_completed ? '已完成' : '未完成'}
              </span>
            </div>
            {user.self_check_time && (
              <div>
                <p className="text-sm text-gray-500">自检时间</p>
                <p className="font-semibold">{new Date(user.self_check_time).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 待完成模块 */}
      {!user.self_check_completed && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700">待完成模块</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">基本信息</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.name ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.name ? '已完成' : '未完成'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">身体指标</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.blood_pressure_high ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.blood_pressure_high ? '已完成' : '未完成'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">生活方式</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.sleep_hours ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.sleep_hours ? '已完成' : '未完成'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">病史信息</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.chronic_disease ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.chronic_disease ? '已完成' : '未完成'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">症状自检</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.symptoms ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.symptoms ? '已完成' : '未完成'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">健康七问</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${user.answer_content ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.answer_content ? '已完成' : '未完成'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 自检原始内容 */}
      {answerContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              自检原始内容
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              健康分析报告
            </CardTitle>
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

      {/* 症状自检记录 */}
      {user.symptomCheckHistory && user.symptomCheckHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              症状自检记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.symptomCheckHistory.map((record) => (
                <div key={record.check_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">检测时间</p>
                      <p className="font-semibold">{new Date(record.check_date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">健康分数</p>
                      <p className="text-2xl font-bold text-blue-600">{record.overall_health}分</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded text-white text-xs ${getHealthStatusColor(record.health_status)}`}>
                      {record.health_status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      选择了 {record.selected_symptoms?.length || 0} 项症状
                    </span>
                  </div>

                  {/* 各维度得分 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">气血</p>
                      <p className="font-semibold">{record.qi_blood_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">循环</p>
                      <p className="font-semibold">{record.circulation_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">毒素</p>
                      <p className="font-semibold">{record.toxins_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">血脂</p>
                      <p className="font-semibold">{record.blood_lipids_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">寒凉</p>
                      <p className="font-semibold">{record.coldness_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">免疫</p>
                      <p className="font-semibold">{record.immunity_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">情绪</p>
                      <p className="font-semibold">{record.emotions_score}分</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">总分</p>
                      <p className="font-semibold">{record.total_score}分</p>
                    </div>
                  </div>

                  {record.analysis_report && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.analysis_report}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 中医健康分析 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Activity className="w-5 h-5" />
            中医健康分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 体质分析 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">体质分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-500">气血状况</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {user.blood_pressure_high && user.blood_pressure_low ? '正常' : '需关注'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-500">循环状况</p>
                  <p className="text-lg font-semibold text-green-600">
                    {user.heart_rate ? '良好' : '需评估'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-500">寒凉体质</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {user.smoking === '否' ? '不明显' : '可能存在'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-500">情绪状态</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {user.diet ? '稳定' : '需观察'}
                  </p>
                </div>
              </div>
            </div>

            {/* 健康建议 */}
            {user.analysis && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">健康建议</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {user.analysis}
                </p>
              </div>
            )}

            {/* 风险提示 */}
            {(user.chronic_disease || user.family_history) && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">健康风险提示</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {user.chronic_disease && (
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">⚠</span>
                      <span>有慢性病史：{user.chronic_disease}</span>
                    </div>
                  )}
                  {user.family_history && (
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">⚠</span>
                      <span>有家族病史：{user.family_history}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 时间戳 */}
      <Card>
        <CardHeader>
          <CardTitle>数据时间戳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">创建时间</p>
              <p className="font-semibold">{new Date(user.create_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">更新时间</p>
              <p className="font-semibold">{new Date(user.update_time).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
