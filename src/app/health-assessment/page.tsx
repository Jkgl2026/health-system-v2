'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, User, Calendar, Ruler, Scale, AlertCircle, Loader2 } from 'lucide-react';

interface PersonalInfo {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  phone: string;
}

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [formData, setFormData] = useState<PersonalInfo>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    phone: '',
  });
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 生成用户ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('health_app_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      setUserId(newUserId);
      localStorage.setItem('health_app_user_id', newUserId);
    }
  }, []);

  // 计算BMI
  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInM = parseFloat(formData.height) / 100;
      const weightInKg = parseFloat(formData.weight);
      if (heightInM > 0 && weightInKg > 0) {
        return (weightInKg / (heightInM * heightInM)).toFixed(1);
      }
    }
    return '';
  };

  const bmi = calculateBMI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填字段
    if (!formData.name || !formData.age || !formData.gender || !formData.height || !formData.weight) {
      setError('请填写所有必填字段');
      return;
    }

    setLoading(true);

    try {
      // 如果有sessionId，更新会话；否则创建新会话
      let currentSessionId = sessionId;

      if (currentSessionId) {
        // 更新现有会话
        await fetch(`/api/assessment/sessions/${currentSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalInfo: { ...formData, bmi },
            currentStep: 'health_questionnaire',
          }),
        });
      } else {
        // 创建新会话
        const sessionName = `${formData.name} - ${new Date().toLocaleDateString('zh-CN')} 健康评估`;
        const response = await fetch('/api/assessment/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            sessionName,
            personalInfo: { ...formData, bmi },
          }),
        });

        const data = await response.json();
        if (data.success) {
          currentSessionId = data.data.id;
        } else {
          throw new Error(data.error || '创建会话失败');
        }
      }

      // 跳转到健康问卷
      router.push(`/health-assessment/health?sessionId=${currentSessionId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">健康评估</h1>
          <p className="text-gray-600">全面了解您的健康状况，开始您的健康之旅</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <span className="text-sm font-medium text-blue-600">个人信息</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
            <span className="text-sm text-gray-500">健康问卷</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span className="text-sm text-gray-500">体质问卷</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">4</div>
            <span className="text-sm text-gray-500">分析结果</span>
          </div>
        </div>

        {/* 表单卡片 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              填写个人信息
            </CardTitle>
            <CardDescription>
              请填写您的基本信息，这些信息将用于健康分析和风险评估
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              {/* 性别 */}
              <div className="space-y-2">
                <Label>性别 *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">男</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">女</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 年龄和电话 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    年龄 *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="岁"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码（选填）</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="11位手机号"
                  />
                </div>
              </div>

              {/* 身高和体重 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    身高 *
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="250"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="cm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Scale className="w-4 h-4" />
                    体重 *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="20"
                    max="300"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="kg"
                    required
                  />
                </div>
              </div>

              {/* BMI 显示 */}
              {bmi && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>BMI指数：</strong> {bmi}
                    <span className="ml-2 text-blue-600">
                      {parseFloat(bmi) < 18.5 && '(偏瘦)'}
                      {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 24 && '(正常)'}
                      {parseFloat(bmi) >= 24 && parseFloat(bmi) < 28 && '(超重)'}
                      {parseFloat(bmi) >= 28 && '(肥胖)'}
                    </span>
                  </p>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    下一步
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 说明 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>健康评估包括：健康问卷、体质问卷、健康分析、风险评估</p>
          <p className="mt-1">预计需要 10-15 分钟完成</p>
        </div>
      </div>
    </div>
  );
}

export default function HealthAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}
