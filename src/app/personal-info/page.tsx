'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, User, Calculator, Activity, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { getOrGenerateUserId } from '@/lib/user-context';
import { createUser, getUser, updateUser } from '@/lib/api-client';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/lib/formDataManager';
import Link from 'next/link';

interface ErrorResponse {
  status: number;
  statusText: string;
  data: any;
  message: string;
  timestamp: string;
  url: string;
}

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    gender: string;
    age: string;
    weight: string;
    height: string;
    bloodPressure: string;
    occupation: string;
    address: string;
  }>({
    name: '',
    phone: '',
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
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 先显示表单，不等待 API 响应
    setLoading(false);

    // 然后在后台异步加载用户数据
    loadUserData();
  }, []);

  // 从 localStorage 加载保存的数据
  useEffect(() => {
    const savedFormData = loadFromStorage(STORAGE_KEYS.USER_INFO);
    if (savedFormData) {
      setFormData(savedFormData as typeof formData);
      console.log('[PersonalInfo] 从 localStorage 恢复表单数据');
    }
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
          phone: user.phone || '',
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
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // 自动保存到 localStorage（防抖）
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEYS.USER_INFO, newFormData);
      setLastSaveTime(Date.now());
      console.log('[PersonalInfo] 表单数据已自动保存');
    }, 1000);

    setAutoSaveTimeout(timeout);
  };

  // 安全解析响应的工具函数
  const safeParseResponse = async (res: Response) => {
    console.log('[前端] 响应状态:', res.status, res.statusText);
    console.log('[前端] 响应头 Content-Type:', res.headers.get('content-type'));

    // 先检查状态码
    if (!res.ok) {
      // 尝试读取响应体（文本或JSON）
      let errorText = '';
      let errorData = null;

      try {
        // 尝试解析为 JSON
        if (res.headers.get('content-type')?.includes('application/json')) {
          errorData = await res.json();
          errorText = errorData.error || errorData.message || JSON.stringify(errorData);
        } else {
          // 如果不是 JSON，读取为文本
          errorText = await res.text();
          // 限制文本长度，避免过长
          errorText = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
        }
      } catch (e) {
        // 如果连文本都读取失败，使用默认消息
        errorText = '无法读取服务器响应';
      }

      throw {
        status: res.status,
        statusText: res.statusText,
        message: errorText || `HTTP ${res.status}: ${res.statusText}`,
        data: errorData,
        url: res.url,
      };
    }

    // 如果响应成功，尝试解析为 JSON
    try {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await res.json();
      } else {
        // 非 JSON 成功响应
        const text = await res.text();
        return { success: true, data: text };
      }
    } catch (e) {
      throw {
        status: 0,
        statusText: 'Parse Error',
        message: '响应解析失败',
        data: { originalError: e instanceof Error ? e.message : String(e) },
      };
    }
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.name || !formData.gender || !formData.age || !formData.weight || !formData.height) {
      alert('请填写必填字段：姓名、性别、年龄、体重、身高');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const userId = getOrGenerateUserId();
      const userData = {
        name: formData.name,
        phone: formData.phone || null,
        gender: formData.gender,
        age: parseInt(formData.age) || null,
        weight: formData.weight,
        height: formData.height,
        bloodPressure: formData.bloodPressure || null,
        occupation: formData.occupation || null,
        address: formData.address || null,
        bmi: bmi?.toString() || null,
      };

      console.log('[前端] 开始保存用户数据（每次都创建新记录）:', { userId, userData });

      // 每次都创建新记录，不再更新已有记录
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const response = await safeParseResponse(res);

      console.log('[前端] 保存响应:', response);

      if (!response.success) {
        throw new Error(response.error || '保存失败');
      }

      // 更新 localStorage 中的 userId 为新创建的用户ID
      if (response.user?.id) {
        localStorage.setItem('health_app_user_id', response.user.id);
      }

      window.location.href = '/check';
    } catch (error) {
      console.error('[前端] 保存个人信息失败:', error);

      // 构建详细的错误信息
      let errorResponse: ErrorResponse = {
        status: 0,
        statusText: 'Unknown',
        data: null,
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      // 如果是 fetch 错误
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorResponse.status = 0;
        errorResponse.statusText = 'Network Error';
        errorResponse.message = '网络请求失败，请检查网络连接或稍后重试';
        errorResponse.data = { originalError: error.message };
      } else {
        errorResponse.status = (error as any).status || 500;
        errorResponse.statusText = (error as any).statusText || 'Internal Server Error';
        errorResponse.data = error;
      }

      // 处理不同类型的错误
      if (typeof error === 'object' && error !== null) {
        // 从 safeParseResponse 抛出的错误对象
        errorResponse = {
          status: (error as any).status || 500,
          statusText: (error as any).statusText || 'Unknown Error',
          data: (error as any).data || error,
          message: (error as any).message || '保存失败',
          timestamp: new Date().toISOString(),
          url: (error as any).url || window.location.href,
        };
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误
        errorResponse = {
          status: 0,
          statusText: 'Network Error',
          data: { originalError: error.message },
          message: '网络请求失败，请检查网络连接或稍后重试',
          timestamp: new Date().toISOString(),
          url: window.location.href,
        };
      } else {
        // 其他错误
        errorResponse = {
          status: 500,
          statusText: 'Internal Server Error',
          data: error,
          message: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
          url: window.location.href,
        };
      }

      setError(errorResponse);
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

  const copyError = () => {
    if (!error) return;

    const errorText = `
错误时间: ${error.timestamp}
页面URL: ${error.url}
错误状态: ${error.status} ${error.statusText}
错误信息: ${error.message}
详细信息: ${JSON.stringify(error.data, null, 2)}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getErrorSuggestion = (error: ErrorResponse) => {
    if (error.status === 0) {
      return '网络请求失败，请检查网络连接或刷新页面重试。如果问题持续，可能是服务器暂时不可用。';
    } else if (error.status === 400) {
      return '请求参数错误，请检查填写的信息是否完整和正确。';
    } else if (error.status === 404) {
      return '资源不存在，请联系管理员检查服务器配置。';
    } else if (error.status === 500) {
      if (error.message.includes('database') || error.message.includes('Database') || error.message.includes('relation')) {
        return '数据库表结构错误，请联系管理员初始化数据库。';
      } else if (error.message.includes('Internal S')) {
        return '服务器返回了非标准响应，这通常是服务器配置问题，请联系技术支持。';
      } else {
        return '服务器内部错误，请稍后重试或联系技术支持。';
      }
    } else if (error.status === 502 || error.status === 503 || error.status === 504) {
      return '服务暂时不可用，请稍后重试。';
    } else {
      return `请稍后重试，或复制错误信息联系技术支持。状态码: ${error.status}`;
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">个人信息</span>
              </div>
              <AutoSaveIndicator
                isSaving={false}
                lastSaveTime={lastSaveTime}
                error={error?.message}
              />
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
            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>保存失败</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyError}
                    className="h-6 px-2 text-xs"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        复制错误信息
                      </>
                    )}
                  </Button>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="space-y-2">
                    <p className="font-medium">{error.message}</p>
                    <p className="text-sm opacity-90">{getErrorSuggestion(error)}</p>

                    {/* 详细错误信息（可折叠） */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium hover:underline">
                        查看详细信息
                      </summary>
                      <div className="mt-2 p-3 bg-black/10 dark:bg-black/20 rounded-md text-xs font-mono overflow-auto max-h-40">
                        <div>时间: {new Date(error.timestamp).toLocaleString('zh-CN')}</div>
                        <div>状态: <span className="font-bold">{error.status}</span> {error.statusText}</div>
                        <div className="break-all">URL: {error.url}</div>
                        <div className="mt-2">
                          <div className="font-bold mb-1">详情:</div>
                          <pre className="mt-1 whitespace-pre-wrap break-words">
                            {typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>

                    {/* 快速解决方案 */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-xs space-y-1.5">
                      <p className="font-bold">快速解决步骤：</p>
                      <ol className="list-decimal list-inside space-y-1 ml-1">
                        <li>按 F12 打开浏览器控制台</li>
                        <li>切换到 "Network" 标签</li>
                        <li>点击保存按钮查看请求详情</li>
                        <li>如果数据库未初始化，访问：<code className="bg-white/50 dark:bg-black/30 px-1.5 py-0.5 rounded break-all">/api/init-db</code></li>
                      </ol>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

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

            {/* 手机号 */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">
                手机号（选填）
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入您的手机号，用于数据关联"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                填写手机号后，换设备或清除浏览器数据时仍可找回您的记录
              </p>
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
