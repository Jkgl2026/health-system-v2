'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, User, Calculator, Activity } from 'lucide-react';
import { getOrGenerateUserId } from '@/lib/user-context';
import { createUser, getUser, updateUser } from '@/lib/api-client';
import Link from 'next/link';

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    bloodPressure: '',
    occupation: '',
    address: '',
  });

  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // 计算BMI
  useEffect(() => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height) / 100; // 转换为米

      if (weight > 0 && height > 0) {
        const calculatedBMI = weight / (height * height);
        const roundedBMI = Math.round(calculatedBMI * 10) / 10;
        setBmi(roundedBMI);

        // BMI分类
        if (roundedBMI < 18.5) {
          setBmiCategory('偏瘦');
        } else if (roundedBMI < 24) {
          setBmiCategory('正常');
        } else if (roundedBMI < 28) {
          setBmiCategory('超重');
        } else {
          setBmiCategory('肥胖');
        }
      } else {
        setBmi(null);
        setBmiCategory('');
      }
    } else {
      setBmi(null);
      setBmiCategory('');
    }
  }, [formData.weight, formData.height]);

  const loadUserData = async () => {
    try {
      const userId = getOrGenerateUserId();
      const response = await getUser(userId);

      if (response.success && response.user) {
        const user = response.user;
        setFormData({
          name: user.name || '',
          gender: user.gender || '',
          age: user.age?.toString() || '',
          weight: user.weight || '',
          height: user.height || '',
          bloodPressure: user.bloodPressure || '',
          occupation: user.occupation || '',
          address: user.address || '',
        });

        if (user.bmi) {
          setBmi(parseFloat(user.bmi));
        }
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.name || !formData.gender || !formData.age || !formData.weight || !formData.height) {
      alert('请填写必填字段：姓名、性别、年龄、体重、身高');
      return;
    }

    setIsSaving(true);
    try {
      const userId = getOrGenerateUserId();
      const userData = {
        name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age) || null,
        weight: formData.weight,
        height: formData.height,
        bloodPressure: formData.bloodPressure || null,
        occupation: formData.occupation || null,
        address: formData.address || null,
        bmi: bmi?.toString() || null,
      };

      console.log('开始保存用户数据:', { userId, userData });

      const userResponse = await getUser(userId);
      console.log('获取用户响应:', userResponse);

      let response;
      if (userResponse.success && userResponse.user) {
        console.log('更新现有用户');
        response = await updateUser(userId, userData);
      } else {
        console.log('创建新用户');
        response = await createUser(userData);
      }

      console.log('保存响应:', response);

      if (!response.success) {
        throw new Error(response.error || '保存失败');
      }

      window.location.href = '/check';
    } catch (error) {
      console.error('保存个人信息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`保存失败：${errorMessage}\n请稍后重试或联系管理员`);
    } finally {
      setIsSaving(false);
    }
  };

  const getBMIColor = () => {
    if (!bmiCategory) return '';
    switch (bmiCategory) {
      case '偏瘦':
        return 'text-orange-600 dark:text-orange-400';
      case '正常':
        return 'text-green-600 dark:text-green-400';
      case '超重':
        return 'text-yellow-600 dark:text-yellow-400';
      case '肥胖':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">个人信息</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* 标题卡片 */}
        <Card className="mb-6 border-2 border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-blue-500" />
              填写个人信息
            </CardTitle>
            <CardDescription className="text-center text-base">
              请填写您的基本信息，以便我们为您提供更精准的健康分析和方案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Calculator className="w-4 h-4" />
              <AlertDescription>
                我们会根据您的身高和体重自动计算身体质量指数（BMI），帮助您了解身体状况。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 表单卡片 */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {/* 性别和年龄 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-medium">
                  性别 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-medium">
                  年龄 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="请输入年龄"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
            </div>

            {/* 身高和体重 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-base font-medium">
                  身高（cm） <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="请输入身高"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-base font-medium">
                  体重（kg） <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="请输入体重"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
            </div>

            {/* BMI 显示 */}
            {bmi && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border-2 border-blue-100 dark:border-blue-900">
                <div className="flex items-center justify-center gap-4">
                  <Calculator className="w-6 h-6 text-blue-500" />
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">身体质量指数（BMI）</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {bmi}
                    </div>
                    <div className={`text-lg font-medium mt-1 ${getBMIColor()}`}>
                      {bmiCategory}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 血压 */}
            <div className="space-y-2">
              <Label htmlFor="bloodPressure" className="text-base font-medium">
                血压（mmHg）
              </Label>
              <Input
                id="bloodPressure"
                placeholder="例如：120/80"
                value={formData.bloodPressure}
                onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                如果您最近测量过血压，请填写此项
              </p>
            </div>

            {/* 职业 */}
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-base font-medium">
                职业
              </Label>
              <Input
                id="occupation"
                placeholder="请输入您的职业"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
              />
            </div>

            {/* 地址 */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">
                地址
              </Label>
              <Input
                id="address"
                placeholder="请输入您的地址"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {isSaving ? (
                <>
                  <Activity className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存并继续'
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
