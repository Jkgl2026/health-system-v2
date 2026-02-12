'use client';

import { Suspense } from 'react';
import { Clock, User, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getSymptomName, getSymptomCategoryName } from '@/lib/symptomMap';

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
  }>;
}

function UserDetailContent() {
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

  const getHealthStatusColorFromScore = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthStatusFromScore = (score: number) => {
    if (score >= 85) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '异常';
  };

  const getThermometerColor = (type: string, percentage: number): string => {
    const baseClass = 'bg-white p-3 rounded-lg text-center';
    switch(type) {
      case '湿热':
        return percentage > 40 ? 'bg-orange-100 border-2 border-orange-400' : baseClass;
      case '寒凉':
        return percentage > 40 ? 'bg-blue-100 border-2 border-blue-400' : baseClass;
      case '燥热':
        return percentage > 40 ? 'bg-red-100 border-2 border-red-400' : baseClass;
      case '湿寒':
        return percentage > 40 ? 'bg-cyan-100 border-2 border-cyan-400' : baseClass;
      default:
        return baseClass;
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

      {/* 健康状态详情 */}
      <Card className="border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Activity className="w-5 h-5" />
            健康状态详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 阴阳平衡 */}
            <div className="bg-gradient-to-r from-red-50 to-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">☯️</span>
                阴阳平衡
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <span className="text-3xl">☀️</span>
                  </div>
                  <p className="text-sm font-semibold text-red-600">阳</p>
                  <div className="w-24 bg-red-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '55%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">55%</p>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-3xl">🌙</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600">阴</p>
                  <div className="w-24 bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">45%</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">分析结果：</span>
                  {(user.health_score || 0) >= 80 
                    ? '阴阳基本平衡，身体状态良好，继续保持健康的生活方式。'
                    : (user.health_score || 0) >= 60
                    ? '阴阳略有不调，建议适当调整作息和饮食，平衡身心。'
                    : '阴阳失调较为明显，需要重点关注调理，建议及时就医咨询。'
                  }
                </p>
              </div>
            </div>

            {/* 湿热寒凉 */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌡️</span>
                湿热寒凉体质分析
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className={`p-3 rounded-lg text-center ${getThermometerColor('湿热', 30)}`}>
                  <p className="text-xs text-gray-600 mb-1">湿热</p>
                  <p className="text-2xl font-bold">30%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${getThermometerColor('寒凉', 20)}`}>
                  <p className="text-xs text-gray-600 mb-1">寒凉</p>
                  <p className="text-2xl font-bold">20%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${getThermometerColor('燥热', 25)}`}>
                  <p className="text-xs text-gray-600 mb-1">燥热</p>
                  <p className="text-2xl font-bold">25%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${getThermometerColor('湿寒', 25)}`}>
                  <p className="text-xs text-gray-600 mb-1">湿寒</p>
                  <p className="text-2xl font-bold">25%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">体质判断：</span>
                  {
                    user.blood_pressure_high && user.blood_pressure_low && 
                    parseFloat(user.blood_pressure_high) > 140 ? 
                    '体质偏热，有湿热倾向，建议清热祛湿，饮食清淡。' :
                    user.smoking === '是' ?
                    '体质偏寒凉，有湿寒倾向，建议温阳祛寒，多运动。' :
                    '体质基本平衡，无明显偏颇，保持当前生活方式即可。'
                  }
                </p>
              </div>
            </div>

            {/* 气血循环 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💓</span>
                气血循环状态
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <p className="text-xs text-gray-500 mb-2">气血充盈度</p>
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-300 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-purple-600">75%</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">良好</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <p className="text-xs text-gray-500 mb-2">血液循环</p>
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-pink-300 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-pink-600">68%</span>
                  </div>
                  <p className="text-xs text-yellow-600 font-semibold">一般</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <p className="text-xs text-gray-500 mb-2">新陈代谢</p>
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-indigo-300 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-indigo-600">
                      {user.exercise_hours && parseFloat(String(user.exercise_hours)) > 3 ? '80%' : '60%'}
                    </span>
                  </div>
                  {user.exercise_hours && parseFloat(String(user.exercise_hours)) > 3 ? (
                    <p className="text-xs font-semibold text-green-600" style={{ marginTop: '0.5rem' }}>良好</p>
                  ) : (
                    <p className="text-xs font-semibold text-orange-600" style={{ marginTop: '0.5rem' }}>需加强</p>
                  )}
                </div>
              </div>
            </div>
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

      {/* 健康报告 */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <FileText className="w-5 h-5" />
            健康报告
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 综合健康评分 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">综合健康评分</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={(user.health_score || 0) >= 80 ? '#10b981' : (user.health_score || 0) >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${(user.health_score || 0) * 2.83} 283`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">{user.health_score || 0}</p>
                    <p className="text-sm text-gray-500">分</p>
                  </div>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                (user.health_score || 0) >= 80 ? 'bg-green-500' :
                (user.health_score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {(user.health_score || 0) >= 80 ? '健康状态良好' :
                 (user.health_score || 0) >= 60 ? '健康状态中等' : '需要关注'}
              </div>
            </div>

            {/* 健康指标 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">健康指标</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.bmi && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">BMI指数</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.bmi < 18.5 ? 'bg-blue-100 text-blue-600' :
                        user.bmi < 24 ? 'bg-green-100 text-green-600' :
                        user.bmi < 28 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.bmi < 18.5 ? '偏瘦' :
                         user.bmi < 24 ? '正常' :
                         user.bmi < 28 ? '超重' : '肥胖'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{Number(user.bmi).toFixed(1)}</p>
                  </div>
                )}
                {user.heart_rate && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">心率</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        parseInt(user.heart_rate) < 60 ? 'bg-blue-100 text-blue-600' :
                        parseInt(user.heart_rate) <= 100 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {parseInt(user.heart_rate) < 60 ? '偏慢' :
                         parseInt(user.heart_rate) <= 100 ? '正常' : '偏快'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{user.heart_rate} <span className="text-sm text-gray-500">次/分</span></p>
                  </div>
                )}
                {user.blood_pressure_high && user.blood_pressure_low && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">血压</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        parseInt(user.blood_pressure_high) < 120 ? 'bg-green-100 text-green-600' :
                        parseInt(user.blood_pressure_high) < 140 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {parseInt(user.blood_pressure_high) < 120 ? '正常' :
                         parseInt(user.blood_pressure_high) < 140 ? '偏高' : '偏高'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {user.blood_pressure_high}/{user.blood_pressure_low} <span className="text-sm text-gray-500">mmHg</span>
                    </p>
                  </div>
                )}
                {user.blood_sugar && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">血糖</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        parseFloat(user.blood_sugar) < 6.1 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {parseFloat(user.blood_sugar) < 6.1 ? '正常' : '偏高'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{user.blood_sugar} <span className="text-sm text-gray-500">mmol/L</span></p>
                  </div>
                )}
                {user.blood_fat && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">血脂</span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-600">
                        需参考
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{user.blood_fat} <span className="text-sm text-gray-500">mmol/L</span></p>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">自检完成度</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.self_check_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.self_check_completed ? '已完成' : '进行中'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{user.self_check_completed ? '100%' : '未完成'}</p>
                </div>
              </div>
            </div>

            {/* 症状表详情 */}
            {parsedSymptoms && Array.isArray(parsedSymptoms) && parsedSymptoms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">症状表详情</h3>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex flex-wrap gap-2">
                    {parsedSymptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">共检出症状</span>
                      <span className="font-bold text-red-600">{parsedSymptoms.length} 项</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 健康状况分析 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                健康分析方案
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100">
                {user.analysis ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">健康分析报告</p>
                        <p className="text-xs text-gray-500">
                          {user.self_check_time ?
                            new Date(user.self_check_time).toLocaleDateString('zh-CN') :
                            '生成日期未知'
                          }
                        </p>
                      </div>
                      {user.health_score && (
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                          user.health_score >= 80 ? 'bg-green-100 text-green-700' :
                          user.health_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          得分: {user.health_score}
                        </span>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {user.analysis}
                      </p>
                    </div>
                    {parsedSymptoms && parsedSymptoms.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">关注症状：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedSymptoms.slice(0, 10).map((symptom: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs"
                            >
                              {symptom}
                            </span>
                          ))}
                          {parsedSymptoms.length > 10 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{parsedSymptoms.length - 10}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>暂无健康分析方案</p>
                    <p className="text-sm mt-1">请完成健康自检后生成分析方案</p>
                  </div>
                )}
              </div>
            </div>

            {/* 个性化调理方案 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">个性化调理方案</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 饮食调理 */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      🥗
                    </span>
                    <h4 className="font-semibold text-gray-800">饮食调理</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {user.diet ? `当前饮食：${user.diet}` : '建议增加蔬菜水果摄入'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      控制油盐摄入，少食多餐
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      多喝水，每天至少8杯
                    </li>
                  </ul>
                </div>

                {/* 运动调理 */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      🏃
                    </span>
                    <h4 className="font-semibold text-gray-800">运动调理</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      {user.exercise_hours ? `当前运动：每周${user.exercise_hours}小时` : '建议每周运动3-5次'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      选择有氧运动（快走、游泳等）
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      每次运动30-60分钟为宜
                    </li>
                  </ul>
                </div>

                {/* 作息调理 */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      😴
                    </span>
                    <h4 className="font-semibold text-gray-800">作息调理</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      {user.sleep_hours ? `当前睡眠：${user.sleep_hours}小时` : '建议每天睡眠7-8小时'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      保持规律作息，避免熬夜
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      睡前1小时避免使用电子设备
                    </li>
                  </ul>
                </div>

                {/* 心理调理 */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      🧘
                    </span>
                    <h4 className="font-semibold text-gray-800">心理调理</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">✓</span>
                      保持积极乐观的心态
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">✓</span>
                      学会释放压力，适当放松
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">✓</span>
                      培养兴趣爱好，丰富生活
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 健康改善路径 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">健康改善路径</h3>
              <div className="bg-white p-5 rounded-lg border">
                <div className="relative">
                  {[
                    { week: '1-2周', title: '初步改善', desc: '建立健康意识，开始调整生活习惯' },
                    { week: '3-4周', title: '习惯养成', desc: '形成规律作息，饮食趋于合理' },
                    { week: '1-2月', title: '明显改善', desc: '身体机能提升，症状明显缓解' },
                    { week: '3-6月', title: '显著成效', desc: '整体健康状况显著改善' }
                  ].map((phase, index) => (
                    <div key={index} className="flex gap-4 pb-6 relative">
                      {index < 3 && (
                        <div className="absolute left-[19px] top-10 w-0.5 h-full bg-gradient-to-b from-green-400 to-blue-400"></div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{phase.week}</span>
                          <h4 className="font-semibold text-gray-800">{phase.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{phase.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <span className={`px-2 py-1 rounded text-white text-xs ${getHealthStatusColorFromScore(record.overall_health)}`}>
                      {getHealthStatusFromScore(record.overall_health)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      选择了 {record.selected_symptoms?.length || 0} 项症状
                    </span>
                  </div>

                  {/* 选中的症状列表 */}
                  {record.selected_symptoms && record.selected_symptoms.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">选中的症状：</p>
                      <div className="flex flex-wrap gap-2">
                        {record.selected_symptoms.map((symptomId) => (
                          <span
                            key={symptomId}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200"
                            title={`${getSymptomCategoryName(symptomId)} - 症状ID: ${symptomId}`}
                          >
                            {getSymptomName(symptomId)}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        共 {record.selected_symptoms.length} 项症状
                      </p>
                    </div>
                  )}

                  {/* 目标改善症状 */}
                  {record.target_symptoms && record.target_symptoms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">目标改善症状：</p>
                      <div className="flex flex-wrap gap-2">
                        {record.target_symptoms.map((symptomId) => (
                          <span
                            key={symptomId}
                            className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs border border-orange-200"
                            title={`${getSymptomCategoryName(symptomId)} - 症状ID: ${symptomId}`}
                          >
                            {getSymptomName(symptomId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 各维度得分 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
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
          <div className="space-y-6">
            {/* 体质辨识 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🧬</span>
                体质辨识
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { name: '平和质', score: 70, color: 'green', desc: '体质平和，健康良好' },
                  { name: '气虚质', score: 35, color: 'yellow', desc: '气虚乏力，易感冒' },
                  { name: '阳虚质', score: 25, color: 'orange', desc: '阳虚畏寒，四肢不温' },
                  { name: '阴虚质', score: 20, color: 'red', desc: '阴虚内热，口干咽燥' },
                  { name: '痰湿质', score: 30, color: 'blue', desc: '痰湿体质，形体肥胖' },
                  { name: '湿热质', score: 25, color: 'purple', desc: '湿热内蕴，口苦口臭' },
                  { name: '血瘀质', score: 15, color: 'rose', desc: '血瘀体质，面色晦暗' },
                  { name: '气郁质', score: 20, color: 'indigo', desc: '气郁体质，情绪抑郁' },
                  { name: '特禀质', score: 10, color: 'cyan', desc: '特禀体质，易过敏' }
                ].map((constitution) => (
                  <div
                    key={constitution.name}
                    className={`bg-white p-3 rounded-lg shadow-sm border-2 ${
                      constitution.score >= 50 ? 'border-' + constitution.color + '-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{constitution.name}</span>
                      {constitution.score >= 50 && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">主要</span>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${constitution.color}-500 h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${constitution.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{constitution.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">主要体质：</span>
                  <span className="text-green-600 font-semibold">平和质</span>
                  （{user.health_score || 0}分，占比70%）
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">兼夹体质：</span>
                  气虚质（35%）、痰湿质（30%）
                </p>
              </div>
            </div>

            {/* 气血状态 */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💫</span>
                气血状态分析
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">气虚状态</h4>
                    <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded">轻度</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-600">气虚乏力</span>
                      <span className="ml-auto text-xs text-yellow-600">轻度</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">易出汗</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-600">易感冒</span>
                      <span className="ml-auto text-xs text-yellow-600">轻度</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">声音低弱</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">血虚状态</h4>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">良好</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">面色萎黄</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">头晕眼花</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">心悸失眠</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">手足麻木</span>
                      <span className="ml-auto text-xs text-green-600">正常</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3">气血总体评估</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-green-400 flex items-center justify-center mb-2">
                      <span className="text-xl font-bold text-green-600">72</span>
                    </div>
                    <p className="text-sm text-gray-600">气血指数</p>
                    <p className="text-xs text-green-600 font-semibold">良好</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-400 flex items-center justify-center mb-2">
                      <span className="text-xl font-bold text-blue-600">68</span>
                    </div>
                    <p className="text-sm text-gray-600">运行状态</p>
                    <p className="text-xs text-blue-600 font-semibold">通畅</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-purple-400 flex items-center justify-center mb-2">
                      <span className="text-xl font-bold text-purple-600">75</span>
                    </div>
                    <p className="text-sm text-gray-600">充足度</p>
                    <p className="text-xs text-purple-600 font-semibold">充足</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-orange-400 flex items-center justify-center mb-2">
                      <span className="text-xl font-bold text-orange-600">70</span>
                    </div>
                    <p className="text-sm text-gray-600">平衡度</p>
                    <p className="text-xs text-orange-600 font-semibold">平衡</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 脏腑功能评估 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🫀</span>
                脏腑功能评估
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: '心', icon: '❤️', score: 85, status: '正常' },
                  { name: '肝', icon: '🫀', score: 72, status: '良好' },
                  { name: '脾', icon: '🫁', score: 68, status: '需关注' },
                  { name: '肺', icon: '🌬️', score: 80, status: '正常' },
                  { name: '肾', icon: '💧', score: 75, status: '良好' }
                ].map((organ) => (
                  <div key={organ.name} className="bg-white p-3 rounded-lg border shadow-sm text-center">
                    <div className="text-3xl mb-2">{organ.icon}</div>
                    <h4 className="font-semibold text-gray-800 mb-1">{organ.name}</h4>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            organ.score >= 80 ? 'bg-green-500' :
                            organ.score >= 70 ? 'bg-blue-500' :
                            organ.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${organ.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{organ.score}分</span>
                      <span className={`font-semibold ${
                        organ.status === '正常' ? 'text-green-600' :
                        organ.status === '良好' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {organ.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">综合评估：</span>
                  脏腑功能整体表现良好，脾脏功能略有不足，建议注意饮食调理，增加健脾益胃的食物摄入。
                </p>
              </div>
            </div>

            {/* 经络状态 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🔗</span>
                经络状态
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: '任脉', status: '通畅', color: 'green' },
                  { name: '督脉', status: '通畅', color: 'green' },
                  { name: '手三阴', status: '微堵', color: 'yellow' },
                  { name: '手三阳', status: '通畅', color: 'green' },
                  { name: '足三阴', status: '通畅', color: 'green' },
                  { name: '足三阳', status: '微堵', color: 'yellow' },
                  { name: '奇经八脉', status: '通畅', color: 'green' },
                  { name: '十二经别', status: '通畅', color: 'green' }
                ].map((meridian) => (
                  <div key={meridian.name} className="bg-white p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{meridian.name}</span>
                      <div className={`w-2 h-2 rounded-full bg-${meridian.color}-500`}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">状态</span>
                      <span className={`text-xs font-semibold ${
                        meridian.color === 'green' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {meridian.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">经络评估：</span>
                  经络整体运行通畅，手三阴和足三阳经络有轻微阻滞现象，建议通过经络疏通、按摩或针灸调理。
                </p>
              </div>
            </div>

            {/* 健康建议 */}
            {user.analysis && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">中医调理建议</h3>
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

export default function UserDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">加载中...</div>}>
      <UserDetailContent />
    </Suspense>
  );
}
