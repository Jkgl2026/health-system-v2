'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Search, CheckCircle2, XCircle, AlertCircle, Loader2, Wrench } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  userId: string;
  user: any;
  checks: {
    user: { exists: boolean; data?: any };
    symptomCheck: { exists: boolean; data?: any; hasData?: boolean };
    healthAnalysis: { exists: boolean; data?: any; hasData?: boolean };
    userChoice: { exists: boolean; data?: any };
    requirements: { exists: boolean; data?: any; completionRate?: number };
  };
  summary: {
    totalTables: number;
    existingTables: number;
    missingTables: string[];
  };
}

export default function DiagnosePage() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!userId) {
      setError('请输入用户ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserData(null);
    setFixResult(null);

    try {
      const response = await fetch(`/api/debug/check-user-data?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '检查失败');
        return;
      }

      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async () => {
    if (!userId) {
      setError('请输入用户ID');
      return;
    }

    setIsFixing(true);
    setError(null);
    setFixResult(null);

    try {
      const response = await fetch('/api/debug/fix-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          data: true, // 修复所有缺失数据
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '修复失败');
        return;
      }

      setFixResult(data);

      // 修复成功后重新检查
      setTimeout(() => {
        handleCheck();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '修复失败');
    } finally {
      setIsFixing(false);
    }
  };

  const getTableStatusColor = (exists: boolean, hasData?: boolean) => {
    if (!exists) return 'text-red-500';
    if (hasData === false) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTableStatusIcon = (exists: boolean, hasData?: boolean) => {
    if (!exists) return <XCircle className="w-5 h-5 text-red-500" />;
    if (hasData === false) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  };

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
              <Badge variant="outline" className="text-sm">
                数据诊断工具
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">用户数据完整性检查</CardTitle>
              <CardDescription>
                输入用户ID检查其数据完整性，并可修复缺失数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="请输入用户ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                  className="flex-1"
                />
                <Button
                  onClick={handleCheck}
                  disabled={isLoading || !userId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      检查中...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      检查
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {userData && (
            <>
              {/* 用户基本信息 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>用户信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">用户ID</p>
                      <p className="font-mono text-sm">{userData.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">姓名</p>
                      <p className="font-medium">{userData.user.name || '未填写'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">手机号</p>
                      <p className="font-medium">{userData.user.phone || '未填写'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">邮箱</p>
                      <p className="font-medium">{userData.user.email || '未填写'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">年龄</p>
                      <p className="font-medium">{userData.user.age || '未填写'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">性别</p>
                      <p className="font-medium">{userData.user.gender || '未填写'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 数据完整性概览 */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>数据完整性概览</CardTitle>
                    <Badge variant={userData.summary.missingTables.length === 0 ? "default" : "destructive"}>
                      {userData.summary.existingTables} / {userData.summary.totalTables} 表有数据
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 用户表 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTableStatusIcon(userData.checks.user.exists)}
                        <span className="font-medium">用户表 (users)</span>
                      </div>
                      <Badge variant={userData.checks.user.exists ? "default" : "destructive"}>
                        {userData.checks.user.exists ? '存在' : '缺失'}
                      </Badge>
                    </div>

                    {/* 症状自检表 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTableStatusIcon(userData.checks.symptomCheck.exists, userData.checks.symptomCheck.hasData)}
                        <span className="font-medium">症状自检表 (symptom_checks)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userData.checks.symptomCheck.data && (
                          <Badge variant="outline">
                            {userData.checks.symptomCheck.data.checkedSymptoms.length} 项症状
                          </Badge>
                        )}
                        <Badge 
                          variant={userData.checks.symptomCheck.exists ? "default" : "destructive"}
                          className={getTableStatusColor(userData.checks.symptomCheck.exists, userData.checks.symptomCheck.hasData)}
                        >
                          {!userData.checks.symptomCheck.exists ? '缺失' : 
                           !userData.checks.symptomCheck.hasData ? '空数据' : '存在'}
                        </Badge>
                      </div>
                    </div>

                    {/* 健康分析表 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTableStatusIcon(userData.checks.healthAnalysis.exists, userData.checks.healthAnalysis.hasData)}
                        <span className="font-medium">健康分析表 (health_analyses)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userData.checks.healthAnalysis.data && (
                          <Badge variant="outline">
                            总分: {userData.checks.healthAnalysis.data.overallHealth}
                          </Badge>
                        )}
                        <Badge 
                          variant={userData.checks.healthAnalysis.exists ? "default" : "destructive"}
                          className={getTableStatusColor(userData.checks.healthAnalysis.exists, userData.checks.healthAnalysis.hasData)}
                        >
                          {!userData.checks.healthAnalysis.exists ? '缺失' : 
                           !userData.checks.healthAnalysis.hasData ? '空数据' : '存在'}
                        </Badge>
                      </div>
                    </div>

                    {/* 用户选择表 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTableStatusIcon(userData.checks.userChoice.exists)}
                        <span className="font-medium">用户选择表 (user_choices)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userData.checks.userChoice.data && (
                          <Badge variant="outline" className="max-w-[200px] truncate">
                            {userData.checks.userChoice.data.planType}
                          </Badge>
                        )}
                        <Badge variant={userData.checks.userChoice.exists ? "default" : "destructive"}>
                          {userData.checks.userChoice.exists ? '存在' : '缺失'}
                        </Badge>
                      </div>
                    </div>

                    {/* 要求表 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTableStatusIcon(userData.checks.requirements.exists)}
                        <span className="font-medium">要求表 (user_requirements)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userData.checks.requirements.data && (
                          <Badge variant="outline">
                            完成: {userData.checks.requirements.completionRate}%
                          </Badge>
                        )}
                        <Badge variant={userData.checks.requirements.exists ? "default" : "destructive"}>
                          {userData.checks.requirements.exists ? '存在' : '缺失'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 修复按钮 */}
              {userData.summary.missingTables.length > 0 && (
                <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="text-yellow-700 dark:text-yellow-400">
                      发现缺失数据
                    </CardTitle>
                    <CardDescription>
                      以下数据表缺失：{userData.summary.missingTables.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleFix}
                      disabled={isFixing}
                      className="w-full bg-yellow-500 hover:bg-yellow-600"
                    >
                      {isFixing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          修复中...
                        </>
                      ) : (
                        <>
                          <Wrench className="w-4 h-4 mr-2" />
                          修复缺失数据
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 修复结果 */}
              {fixResult && (
                <Card className="mb-6 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-400">
                      修复完成
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{fixResult.message}</AlertDescription>
                    </Alert>
                    {fixResult.created.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">已创建的数据：</p>
                        <div className="flex flex-wrap gap-2">
                          {fixResult.created.map((item: string) => (
                            <Badge key={item} variant="default" className="bg-green-500">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {fixResult.skipped.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">跳过的数据：</p>
                        <div className="flex flex-wrap gap-2">
                          {fixResult.skipped.map((item: string) => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
