'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Activity, Target, TrendingUp, Save, Plus, Calendar, Heart, Droplets, Scale } from 'lucide-react';

interface HealthProfile {
  id?: number;
  userId?: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  medication: string;
  familyHistory: string;
  lifestyle: string;
}

interface HealthIndicator {
  id?: number;
  profileId?: number;
  indicatorType: 'blood_pressure' | 'blood_sugar' | 'blood_lipid' | 'heart_rate' | 'weight' | 'temperature';
  value: string;
  unit: string;
  measuredAt: string;
  status: 'normal' | 'warning' | 'danger';
}

interface HealthGoal {
  id?: number;
  profileId?: number;
  goalType: string;
  currentValue: string;
  targetValue: string;
  deadline: string;
  status: 'in_progress' | 'achieved' | 'failed';
}

export default function HealthProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>({
    name: '',
    age: 0,
    gender: 'male',
    height: 0,
    weight: 0,
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    medication: '',
    familyHistory: '',
    lifestyle: '',
  });
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [newIndicator, setNewIndicator] = useState<Partial<HealthIndicator>>({
    indicatorType: 'blood_pressure',
    value: '',
    unit: 'mmHg',
  });
  const [newGoal, setNewGoal] = useState({
    goalType: '',
    currentValue: '',
    targetValue: '',
    deadline: '',
  });

  // 加载健康档案
  useEffect(() => {
    loadHealthProfile();
  }, []);

  const loadHealthProfile = async () => {
    try {
      const response = await fetch('/api/health-profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProfile(data.data.profile || profile);
          setIndicators(data.data.indicators || []);
          setGoals(data.data.goals || []);
        }
      }
    } catch (error) {
      console.error('加载健康档案失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/health-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (data.success) {
        alert('健康档案保存成功！');
      } else {
        alert('保存失败：' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addIndicator = async () => {
    if (!newIndicator.value) {
      alert('请输入指标数值');
      return;
    }
    try {
      const response = await fetch('/api/health-profile/indicator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIndicator,
          measuredAt: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIndicators([...indicators, data.data]);
        setNewIndicator({ indicatorType: 'blood_pressure', value: '', unit: 'mmHg' });
        alert('指标添加成功！');
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      console.error('添加指标失败:', error);
      alert('添加失败');
    }
  };

  const addGoal = async () => {
    if (!newGoal.goalType || !newGoal.targetValue || !newGoal.deadline) {
      alert('请填写完整的目标信息');
      return;
    }
    try {
      const response = await fetch('/api/health-profile/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          status: 'in_progress',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGoals([...goals, data.data]);
        setNewGoal({ goalType: '', currentValue: '', targetValue: '', deadline: '' });
        alert('目标添加成功！');
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      console.error('添加目标失败:', error);
      alert('添加失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">健康档案管理</h1>
                <p className="text-sm text-gray-500">管理您的个人健康数据</p>
              </div>
            </div>
            <Button
              onClick={saveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '保存档案'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">基本信息</TabsTrigger>
            <TabsTrigger value="indicators">健康指标</TabsTrigger>
            <TabsTrigger value="goals">健康目标</TabsTrigger>
            <TabsTrigger value="trends">趋势分析</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  个人基本信息
                </CardTitle>
                <CardDescription>记录您的基本健康信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">年龄</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      placeholder="请输入年龄"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">性别</Label>
                    <select
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="height">身高 (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                      placeholder="请输入身高"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">体重 (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight || ''}
                      onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="请输入体重"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodType">血型</Label>
                    <select
                      id="bloodType"
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">请选择血型</option>
                      <option value="A">A型</option>
                      <option value="B">B型</option>
                      <option value="AB">AB型</option>
                      <option value="O">O型</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">过敏史</Label>
                  <textarea
                    id="allergies"
                    value={profile.allergies}
                    onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    placeholder="请输入过敏史"
                  />
                </div>

                <div>
                  <Label htmlFor="medicalHistory">既往病史</Label>
                  <textarea
                    id="medicalHistory"
                    value={profile.medicalHistory}
                    onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="请输入既往病史"
                  />
                </div>

                <div>
                  <Label htmlFor="medication">用药史</Label>
                  <textarea
                    id="medication"
                    value={profile.medication}
                    onChange={(e) => setProfile({ ...profile, medication: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    placeholder="请输入用药史"
                  />
                </div>

                <div>
                  <Label htmlFor="familyHistory">家族病史</Label>
                  <textarea
                    id="familyHistory"
                    value={profile.familyHistory}
                    onChange={(e) => setProfile({ ...profile, familyHistory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    placeholder="请输入家族病史"
                  />
                </div>

                <div>
                  <Label htmlFor="lifestyle">生活方式</Label>
                  <textarea
                    id="lifestyle"
                    value={profile.lifestyle}
                    onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    placeholder="请输入生活方式（如：运动习惯、饮食习惯、作息时间等）"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 健康指标 */}
          <TabsContent value="indicators">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    添加健康指标
                  </CardTitle>
                  <CardDescription>记录您的日常健康指标</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="indicatorType">指标类型</Label>
                      <select
                        id="indicatorType"
                        value={newIndicator.indicatorType}
                        onChange={(e) => {
                          const type = e.target.value as HealthIndicator['indicatorType'];
                          let unit = 'mmHg';
                          if (type === 'blood_sugar') unit = 'mmol/L';
                          else if (type === 'blood_lipid') unit = 'mmol/L';
                          else if (type === 'heart_rate') unit = 'bpm';
                          else if (type === 'weight') unit = 'kg';
                          else if (type === 'temperature') unit = '℃';
                          setNewIndicator({
                            indicatorType: type,
                            value: '',
                            unit,
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="blood_pressure">血压</option>
                        <option value="blood_sugar">血糖</option>
                        <option value="blood_lipid">血脂</option>
                        <option value="heart_rate">心率</option>
                        <option value="weight">体重</option>
                        <option value="temperature">体温</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="indicatorValue">数值</Label>
                      <Input
                        id="indicatorValue"
                        value={newIndicator.value}
                        onChange={(e) => setNewIndicator({ ...newIndicator, value: e.target.value })}
                        placeholder={`请输入数值（单位：${newIndicator.unit}）`}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addIndicator} className="w-full bg-gradient-to-r from-green-500 to-teal-500">
                        <Plus className="h-4 w-4 mr-2" />
                        添加指标
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>指标记录</CardTitle>
                  <CardDescription>您的历史健康指标记录</CardDescription>
                </CardHeader>
                <CardContent>
                  {indicators.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无指标记录</p>
                  ) : (
                    <div className="space-y-3">
                      {indicators.map((indicator, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              indicator.indicatorType === 'blood_pressure' ? 'bg-blue-100 text-blue-600' :
                              indicator.indicatorType === 'blood_sugar' ? 'bg-purple-100 text-purple-600' :
                              indicator.indicatorType === 'blood_lipid' ? 'bg-orange-100 text-orange-600' :
                              indicator.indicatorType === 'heart_rate' ? 'bg-red-100 text-red-600' :
                              indicator.indicatorType === 'weight' ? 'bg-green-100 text-green-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {indicator.indicatorType === 'blood_pressure' && <Heart className="h-5 w-5" />}
                              {indicator.indicatorType === 'blood_sugar' && <Droplets className="h-5 w-5" />}
                              {indicator.indicatorType === 'blood_lipid' && <Activity className="h-5 w-5" />}
                              {indicator.indicatorType === 'heart_rate' && <Activity className="h-5 w-5" />}
                              {indicator.indicatorType === 'weight' && <Scale className="h-5 w-5" />}
                              {indicator.indicatorType === 'temperature' && <Activity className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-medium">
                                {indicator.indicatorType === 'blood_pressure' && '血压'}
                                {indicator.indicatorType === 'blood_sugar' && '血糖'}
                                {indicator.indicatorType === 'blood_lipid' && '血脂'}
                                {indicator.indicatorType === 'heart_rate' && '心率'}
                                {indicator.indicatorType === 'weight' && '体重'}
                                {indicator.indicatorType === 'temperature' && '体温'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(indicator.measuredAt).toLocaleString('zh-CN')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-lg font-bold">{indicator.value} {indicator.unit}</div>
                            </div>
                            <Badge
                              variant={
                                indicator.status === 'normal' ? 'default' :
                                indicator.status === 'warning' ? 'secondary' : 'destructive'
                              }
                            >
                              {indicator.status === 'normal' ? '正常' :
                               indicator.status === 'warning' ? '警告' : '危险'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 健康目标 */}
          <TabsContent value="goals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    添加健康目标
                  </CardTitle>
                  <CardDescription>设定您的健康管理目标</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goalType">目标类型</Label>
                      <Input
                        id="goalType"
                        value={newGoal.goalType}
                        onChange={(e) => setNewGoal({ ...newGoal, goalType: e.target.value })}
                        placeholder="如：减重、降血压、增肌等"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetValue">目标值</Label>
                      <Input
                        id="targetValue"
                        value={newGoal.targetValue}
                        onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                        placeholder="如：65kg、120/80mmHg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentValue">当前值</Label>
                      <Input
                        id="currentValue"
                        value={newGoal.currentValue}
                        onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                        placeholder="当前的实际数值"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">目标截止日期</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addGoal} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="h-4 w-4 mr-2" />
                    添加目标
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>我的健康目标</CardTitle>
                  <CardDescription>您设定的健康目标追踪</CardDescription>
                </CardHeader>
                <CardContent>
                  {goals.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无目标记录</p>
                  ) : (
                    <div className="space-y-3">
                      {goals.map((goal, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{goal.goalType}</h4>
                            <Badge
                              variant={
                                goal.status === 'achieved' ? 'default' :
                                goal.status === 'in_progress' ? 'secondary' : 'destructive'
                              }
                            >
                              {goal.status === 'achieved' ? '已达成' :
                               goal.status === 'in_progress' ? '进行中' : '未达成'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">当前值：</span>
                              <span className="font-medium">{goal.currentValue}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">目标值：</span>
                              <span className="font-medium">{goal.targetValue}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">截止日期：</span>
                              <span className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {goal.deadline ? new Date(goal.deadline).toLocaleDateString('zh-CN') : '未设置'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 趋势分析 */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  健康趋势分析
                </CardTitle>
                <CardDescription>查看您的健康数据变化趋势</CardDescription>
              </CardHeader>
              <CardContent>
                {indicators.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无足够的数据进行分析</p>
                    <p className="text-sm text-gray-400 mt-2">请先添加一些健康指标记录</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {['blood_pressure', 'blood_sugar', 'blood_lipid', 'heart_rate', 'weight'].map((type) => {
                      const typeIndicators = indicators.filter(i => i.indicatorType === type);
                      if (typeIndicators.length === 0) return null;

                      const latest = typeIndicators[typeIndicators.length - 1];
                      const previous = typeIndicators[typeIndicators.length - 2];
                      const trend = previous ? 
                        (parseFloat(latest.value) > parseFloat(previous.value) ? 'up' : 
                         parseFloat(latest.value) < parseFloat(previous.value) ? 'down' : 'stable') : 'unknown';

                      return (
                        <div key={type} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              {type === 'blood_pressure' && <Heart className="h-5 w-5 text-blue-500" />}
                              {type === 'blood_sugar' && <Droplets className="h-5 w-5 text-purple-500" />}
                              {type === 'blood_lipid' && <Activity className="h-5 w-5 text-orange-500" />}
                              {type === 'heart_rate' && <Activity className="h-5 w-5 text-red-500" />}
                              {type === 'weight' && <Scale className="h-5 w-5 text-green-500" />}
                              {type === 'blood_pressure' && '血压'}
                              {type === 'blood_sugar' && '血糖'}
                              {type === 'blood_lipid' && '血脂'}
                              {type === 'heart_rate' && '心率'}
                              {type === 'weight' && '体重'}
                            </h4>
                            <Badge
                              variant={
                                trend === 'up' ? 'secondary' :
                                trend === 'down' ? 'default' : 'outline'
                              }
                            >
                              {trend === 'up' && '↑ 上升'}
                              {trend === 'down' && '↓ 下降'}
                              {trend === 'stable' && '→ 稳定'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">最新记录：</span>
                              <span className="font-medium">{latest.value} {latest.unit}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">记录时间：</span>
                              <span className="text-gray-700">{new Date(latest.measuredAt).toLocaleString('zh-CN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">历史记录数：</span>
                              <span className="text-gray-700">{typeIndicators.length} 条</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
