'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Activity, Heart, Shield, Target, BookOpen, ClipboardCheck, Settings, Info, AlertCircle, ArrowRight, Eye, User, Flame, Droplets, Zap, Sparkles, Award, TrendingUp } from 'lucide-react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWARedirect } from './page-pwa-redirect';
import { BODY_SYMPTOMS } from '@/lib/health-data';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [hasHealthData, setHasHealthData] = useState(false);

  // 检查是否有健康数据
  useEffect(() => {
    const checkHealthData = () => {
      try {
        // 读取所有健康相关数据
        const savedUserInfo = localStorage.getItem('userInfo'); // 用户基本信息
        const savedSymptoms = localStorage.getItem('selectedSymptoms'); // 100项身体语言简表
        const savedBadHabits = localStorage.getItem('selectedHabitsRequirements'); // 252项不良生活习惯
        const savedSymptoms300 = localStorage.getItem('selectedSymptoms300'); // 300项症状表
        const savedTarget = localStorage.getItem('targetSymptoms') || localStorage.getItem('targetSymptom'); // 重点症状
        const savedChoice = localStorage.getItem('selectedChoice');

        // 解析数据
        const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;
        const bodySymptoms = savedSymptoms ? JSON.parse(savedSymptoms) : [];
        const badHabits = savedBadHabits ? JSON.parse(savedBadHabits) : [];
        const symptoms300 = savedSymptoms300 ? JSON.parse(savedSymptoms300) : [];
        const targetSymptoms = savedTarget ? JSON.parse(savedTarget) : [];
        const choice = savedChoice || '';

        // 计算症状总数（包含三种表）
        const totalSymptoms = bodySymptoms.length + badHabits.length + symptoms300.length;

        // 计算健康评分（更科学的算法）
        // 基础分100分，根据不同类型症状权重扣分
        // 身体语言简表（高权重）：每项扣0.3分
        // 不良生活习惯（中权重）：每项扣0.2分
        // 300症状表（低权重）：每项扣0.1分
        const bodySymptomsScore = Math.max(0, bodySymptoms.length * 0.3);
        const badHabitsScore = Math.max(0, badHabits.length * 0.2);
        const symptoms300Score = Math.max(0, symptoms300.length * 0.1);
        const totalDeduction = bodySymptomsScore + badHabitsScore + symptoms300Score;
        const healthScore = Math.max(0, Math.round(100 - totalDeduction));

        // 计算各类型症状数量
        const bodySymptomsCount = bodySymptoms.length;
        const badHabitsCount = badHabits.length;
        const symptoms300Count = symptoms300.length;

        // 获取重点症状名称
        const targetSymptomNames = targetSymptoms
          .map((id: number) => {
            const symptom = BODY_SYMPTOMS.find(s => s.id === id);
            return symptom ? symptom.name : '';
          })
          .filter((name: string) => name);

        // 只要有任何数据就显示概览
        if (savedSymptoms || savedBadHabits || savedSymptoms300) {
          setHealthData({
            userInfo,
            totalSymptoms,
            targetSymptoms: Array.isArray(targetSymptoms) ? targetSymptoms.length : (targetSymptoms ? 1 : 0),
            targetSymptomNames,
            choice,
            healthScore,
            bodySymptomsCount,
            badHabitsCount,
            symptoms300Count,
          });
          setHasHealthData(true);
        } else {
          setHasHealthData(false);
        }
      } catch (error) {
        console.error('Failed to check health data:', error);
        setHasHealthData(false);
      }
    };

    checkHealthData();
  }, []);

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: '症状自检',
      description: '通过100项身体语言简表，全面了解您的健康状况',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: '系统解析',
      description: '深入了解症状背后的健康要素和原因',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: '持续跟进',
      description: '通过七问体系，持续跟踪和改善健康',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '科学方案',
      description: '基于科学原理，提供个性化的健康管理方案',
    },
  ];

  const steps = [
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: '填简表',
      description: '勾选半年内出现的症状',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: '针对症状',
      description: '深入分析最困扰的症状',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '了解原理',
      description: '学习健康要素的科学原理',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: '获得方案',
      description: '获得个性化的健康管理方案',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  健康自我管理
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  把健康把握在自己手里
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/install-guide'}
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                如何安装到桌面
              </Button>
              <Button
                onClick={() => window.location.href = '/personal-info'}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                开始自检
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 正确访问地址提示 */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">正确访问地址：</span>
            <code className="bg-white px-2 py-1 rounded text-xs font-mono">cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site</code>
            <span className="text-blue-600">（无需登录，可直接访问）</span>
          </div>
        </div>
      </div>

      {/* 健康数据概览卡片（如果有数据） */}
      {hasHealthData && healthData && (
        <section className="mb-16">
          <Card className="max-w-5xl mx-auto border-2 border-indigo-100 dark:border-indigo-900 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl">您的健康数据概览</CardTitle>
                      <CardDescription className="text-base mt-1">
                        基于上次自检的综合分析报告
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/my-solution'}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all group"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  查看完整方案
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white text-center">
                  <div className="text-sm font-medium mb-2 opacity-90">健康评分</div>
                  <div className="text-6xl font-bold mb-1">{healthData.healthScore}</div>
                  <div className="text-sm opacity-80">分（满分100）</div>
                  <div className="mt-3 text-xs opacity-70">
                    综合身体语言简表、不良生活习惯表、300症状表计算
                  </div>
                </div>

                <div
                  onClick={() => window.location.href = '/check'}
                  className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-90">身体语言简表</div>
                    <Activity className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{healthData.bodySymptomsCount}</div>
                  <div className="text-xs opacity-80">/ 100项</div>
                  <div className="mt-2 bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, healthData.bodySymptomsCount)}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs opacity-70 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    点击查看详情
                  </div>
                </div>

                <div
                  onClick={() => window.location.href = '/requirements?step=habits'}
                  className="p-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-90">不良生活习惯</div>
                    <AlertCircle className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{healthData.badHabitsCount}</div>
                  <div className="text-xs opacity-80">/ 252项</div>
                  <div className="mt-2 bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(healthData.badHabitsCount * 100 / 252))}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs opacity-70 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    点击查看详情
                  </div>
                </div>

                <div
                  onClick={() => window.location.href = '/requirements?step=symptoms300'}
                  className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-90">300症状表</div>
                    <Heart className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{healthData.symptoms300Count}</div>
                  <div className="text-xs opacity-80">/ 300项</div>
                  <div className="mt-2 bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(healthData.symptoms300Count * 100 / 300))}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs opacity-70 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    点击查看详情
                  </div>
                </div>

                <div
                  onClick={() => window.location.href = '/check'}
                  className="p-5 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-white cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium opacity-90">重点症状</div>
                      <Target className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{healthData.targetSymptoms}</div>
                    <div className="text-xs opacity-90 font-medium">个需要改善（最多3个）</div>
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs opacity-80">症状总数</span>
                        <span className="text-lg font-bold">{healthData.totalSymptoms}项</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs opacity-80 flex items-center gap-1 font-medium">
                      <ArrowRight className="w-3 h-3" />
                      点击查看详情
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">整体健康改善潜力</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                      {healthData.healthScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 h-5 rounded-full transition-all duration-700 ease-out flex items-center justify-center shadow-lg"
                      style={{ width: `${healthData.healthScore}%` }}
                    >
                      {healthData.healthScore > 10 && (
                        <span className="text-xs font-bold text-white">{healthData.healthScore}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">身体语言简表</span>
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-400">
                      权重30% · {healthData.bodySymptomsCount}/100项
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-xs font-semibold text-orange-900 dark:text-orange-300">不良生活习惯</span>
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-400">
                      权重20% · {healthData.badHabitsCount}/252项
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">300症状表</span>
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-400">
                      权重10% · {healthData.symptoms300Count}/300项
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {hasHealthData && healthData && (
          <section className="mb-16">
            <div className="max-w-5xl mx-auto space-y-8">
              <Card className="border-2 border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">健康状况总结</CardTitle>
                      <CardDescription>基于您的自检数据的综合评估</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {healthData.userInfo && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">基本信息</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">姓名：</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {healthData.userInfo.name || '未填写'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">年龄：</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {healthData.userInfo.age || '未填写'}岁
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">性别：</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {healthData.userInfo.gender || '未填写'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">BMI：</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {healthData.userInfo.bmi ? healthData.userInfo.bmi.toFixed(1) : '未计算'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start gap-3">
                      <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">老中医专家分析：</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                          根据您的自检结果，您共有<strong className="text-indigo-600 dark:text-indigo-400 font-semibold mx-1">{healthData.totalSymptoms}项</strong>健康异常，
                          其中身体语言简表<strong className="text-blue-600 dark:text-blue-400 font-semibold mx-1">{healthData.bodySymptomsCount}项</strong>、
                          不良生活习惯<strong className="text-orange-600 dark:text-orange-400 font-semibold mx-1">{healthData.badHabitsCount}项</strong>、
                          300症状表<strong className="text-purple-600 dark:text-purple-400 font-semibold mx-1">{healthData.symptoms300Count}项</strong>。
                          您的综合健康评分为<strong className="text-green-600 dark:text-green-400 font-semibold mx-1">{healthData.healthScore}分</strong>。
                          {healthData.healthScore >= 80 ? '您的整体健康状况良好，继续保持健康的生活方式。' :
                           healthData.healthScore >= 60 ? '您的健康状况处于亚健康状态，建议及时调理。' :
                           '您的健康状况需要重点关注，建议尽快进行系统调理。'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {healthData.targetSymptomNames && healthData.targetSymptomNames.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">重点改善症状</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {healthData.targetSymptomNames.map((name: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          <strong className="mr-2">专家建议：</strong>
                          以上{healthData.targetSymptomNames.length}个症状是当前最困扰您的问题，也是调理的重点。
                          我们将针对这些症状制定个性化的调理方案，通过系统的调理方法，从根本上改善这些症状。
                        </p>
                      </div>
                    </div>
                  )}

                  {healthData.choice && (
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">您的选择方案</h3>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-gray-900 dark:text-white text-base font-medium mb-3">{healthData.choice}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          这个方案是您根据自己的情况选择的，我们将基于这个方向为您提供具体的调理建议。
                          请相信，只要坚持下去，您一定能够改善健康状况。
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">推荐调理产品</CardTitle>
                      <CardDescription>根据您的症状匹配的调理方案</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(healthData.bodySymptomsCount > 0 || healthData.badHabitsCount > 0) && (
                      <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Flame className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">艾灸调理</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                  匹配度：{Math.min(95, 70 + healthData.bodySymptomsCount * 2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              <strong className="text-orange-600 dark:text-orange-400">老中医推荐：</strong>
                              艾灸是中医外治法的瑰宝，通过艾火的热力和药性，温通经络、调和气血、驱寒除湿。
                              对于您出现的寒凉、气血不足、循环不畅等症状，艾灸能够起到标本兼治的效果。
                              建议选择关元、气海、足三里等穴位进行调理，每次20-30分钟，每周3-4次。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">调理原理：</p>
                            <ul className="space-y-1">
                              {[
                                '温通经络，促进气血运行，改善末梢循环',
                                '驱寒除湿，温补阳气，增强身体抵抗力',
                                '调和脏腑功能，促进新陈代谢',
                                '缓解疼痛，改善慢性炎症'
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <Droplets className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {(healthData.bodySymptomsCount > 5 || healthData.badHabitsCount > 10) && (
                      <div className="p-5 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Zap className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">火灸调理</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                  匹配度：{Math.min(92, 65 + healthData.bodySymptomsCount * 1.5 + healthData.badHabitsCount)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              <strong className="text-red-600 dark:text-red-400">老中医推荐：</strong>
                              火灸是比艾灸更强烈的调理方法，以火之力，温阳散寒，活血化瘀。
                              对于您体内存在的淤堵、毒素、寒湿等问题，火灸能够强力疏通，净化体内环境。
                              建议在专业指导下进行，重点调理大椎、命门、肾俞等穴位，每次15-20分钟。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">调理原理：</p>
                            <ul className="space-y-1">
                              {[
                                '强力活血化瘀，疏通经络淤堵',
                                '温阳补气，提升身体能量水平',
                                '祛除体内毒素和湿气，净化血液',
                                '改善微循环，促进细胞修复'
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <Sparkles className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">分阶段调理计划</CardTitle>
                      <CardDescription>循序渐进，科学调理</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                      </div>
                      <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">第一阶段：清理排毒（1-2周）</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          先清理体内的毒素和淤堵，为后续调理打好基础。重点改善消化系统、血液循环。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">调理重点：</span>肠胃排毒、疏通经络
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">推荐产品：</span>艾灸、火灸
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                      </div>
                      <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">第二阶段：补益调理（3-4周）</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          在清理的基础上，补充气血，调理脏腑功能，增强身体自愈能力。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">调理重点：</span>补气血、强免疫
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">推荐产品：</span>艾灸、营养补充
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </div>
                      <div className="flex-1 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">第三阶段：巩固养护（4-6周）</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          巩固调理成果，建立健康的生活习惯，维持长期的健康状态。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">调理重点：</span>巩固疗效、健康养生
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">推荐产品：</span>养生灸、生活习惯调整
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-12">
        {/* 欢迎区域 */}
        <section className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              让老百姓
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                少花钱
              </span>
              甚至
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                不花钱
              </span>
              解决问题
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              健康自我管理的核心价值在于教会您健康观念，把健康把握在自己手里。
              最省钱的方法就是学会健康自我管理，少生病，把健康掌握在自己手里。
            </p>
          </div>

          {/* 核心问题 */}
          <Card className="max-w-4xl mx-auto border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl text-center">三个核心问题</CardTitle>
              <CardDescription className="text-center text-base">
                思考这些问题，认识健康的重要性
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    1. 老百姓是舒服的时候去医院检查，还是难受的时候？
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    大多数人都是难受的时候才去医院检查
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    2. 有没有这种情况？明明难受，但医院检查结论却是"正常"？
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    这种情况还挺多的
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    3. 大病检查出来一般是什么期？
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    一般都是中晚期了。早期去哪儿了呢？其实早期就是症状！
                  </p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg">
                <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
                  如果我们能够真正帮助每一个人在出现症状的时候，就能够发现症状，找到原因，
                  并把症状调理好，实际上就是属于健康自我管理的一个部分。
                  用这种方式就可以实现让老百姓少花钱、不花钱来解决问题！
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 服务流程 */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            健康自检流程
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 text-white">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </CardContent>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      →
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* 特点介绍 */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            为什么选择我们
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 核心价值 */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto border-2 border-green-100 dark:border-green-900">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">我们的使命</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
                  有钱的顾客我们要服务，没有钱的顾客我们更要服务。
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
                  老百姓生不起病，我们要教他们会生活、少生病，把健康把握在自己手里。
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center font-semibold">
                  这才是最实在的！
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 开始按钮 */}
        <section className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.location.href = '/personal-info'}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              立即开始健康自检
            </Button>
            <Button
              onClick={() => window.location.href = '/my-solution'}
              size="lg"
              variant="outline"
              className="text-lg px-12 py-6 rounded-full shadow-md hover:shadow-lg transition-all border-2 border-blue-200 hover:border-blue-300"
            >
              查看我的方案
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            花费约 15-20 分钟，全面了解您的健康状况
          </p>

          {/* 数据管理入口 */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/data-reset'}
              className="text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              数据管理（备份/恢复）
            </Button>
          </div>
        </section>
      </main>

      {/* PWA 启动重定向 */}
      <PWARedirect />

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>健康自我管理 - 把健康把握在自己手里</p>
          <p className="mt-2 text-sm">让老百姓少花钱甚至不花钱解决问题</p>
        </div>
      </footer>

      {/* PWA 安装提示 */}
      <PWAInstallPrompt />
    </div>
  );
}
