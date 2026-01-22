'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, CheckCircle2, Sparkles, AlertTriangle, Home, RotateCcw, ArrowRight } from 'lucide-react';
import { CLEANING_STORY, BODY_SYMPTOMS, HEALTH_ELEMENTS } from '@/lib/health-data';
import Link from 'next/link';

export default function SolutionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [targetSymptom, setTargetSymptom] = useState<number | null>(null);
  const [sevenAnswers, setSevenAnswers] = useState<any[]>([]);

  useEffect(() => {
    const savedSymptoms = localStorage.getItem('selectedSymptoms');
    const savedTarget = localStorage.getItem('targetSymptom');
    const savedAnswers = localStorage.getItem('sevenAnswers');

    if (savedSymptoms) {
      setSelectedSymptoms(JSON.parse(savedSymptoms));
    }
    if (savedTarget) {
      setTargetSymptom(parseInt(savedTarget));
    }
    if (savedAnswers) {
      setSevenAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const getTargetSymptom = () => {
    return BODY_SYMPTOMS.find(s => s.id === targetSymptom);
  };

  // 计算主要健康要素
  const getPrimaryElements = () => {
    const counts: Record<string, number> = {};
    (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).forEach(key => {
      const element = HEALTH_ELEMENTS[key];
      const count = element.symptoms.filter(id => selectedSymptoms.includes(id)).length;
      if (count > 0) {
        counts[element.name] = count;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  };

  const primaryElements = getPrimaryElements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/choices" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                健康管理方案
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 欢迎信息 */}
        <section className="mb-12">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">您的个性化健康管理方案</CardTitle>
              <CardDescription className="text-base mt-2">
                恭喜您完成了健康自检流程！以下是您的健康管理方案
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 您的健康状况总结 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">您的健康状况总结</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 重点症状 */}
              {targetSymptom && getTargetSymptom() && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    您重点改善的症状：
                  </h3>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {getTargetSymptom()!.name}
                  </p>
                </div>
              )}

              {/* 症状统计 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    症状总数
                  </h4>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {selectedSymptoms.length}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    主要健康要素
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {primaryElements.map((el, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {el.name} ({el.count}项)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 七问回答摘要 */}
              {sevenAnswers.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    您的详细回答（已记录）
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    您已完成了持续跟进落实健康的七问，所有回答已保存。
                    这些信息将帮助我们为您提供更精准的健康管理建议。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 大扫除故事 - 好转反应 */}
        <section className="mb-12">
          <Card className="border-2 border-yellow-100 dark:border-yellow-900">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                重要提示：好转反应
              </CardTitle>
              <CardDescription>
                了解调理过程中可能出现的好转反应，不要惊慌
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                  在调理过程中，您可能会出现一些不适，这其实是好转反应，说明身体正在清理毒素。
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    大扫除的故事
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {CLEANING_STORY.content}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    关键理解
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• 服用产品的过程中，一旦出现类似好转反应，说明身体正在排毒</li>
                    <li>• 这个时候去医院检查指标可能会升高，这是正常现象</li>
                    <li>• 坚持一段时间，让毒素彻底排出，身体才能好转</li>
                    <li>• 不要因为一时的不适就停止调理，那会前功尽弃</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 健康约定 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl">健康约定</CardTitle>
              <CardDescription>
                为了确保调理效果，请您严格遵守以下约定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      按时按量使用产品
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    严格按照指导使用，不随意增减用量
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      每天好习惯打卡
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    记录每天坚持的健康习惯，养成良好生活方式
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      填写不良生活习惯表
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    诚实地记录日常生活中的不良习惯，找出问题根源
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      每月填写全面质检表
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    连续三个月每月填写一次，跟踪身体变化
                  </p>
                </div>
              </div>

              <Alert className="mt-6">
                <Home className="w-4 h-4" />
                <AlertDescription>
                  如果需要进店调理，可以随时到店里来。我们会全程陪伴您的健康管理之旅。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* 总结 */}
        <section className="mb-12">
          <Card className="border-2 border-gradient-to-r from-blue-500 to-green-500 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">健康自我管理的核心价值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  我们给自己的定位是健康管理，不是产品的推销员。
                  我们的使命是<strong>"让老百姓少花钱甚至不花钱解决问题"</strong>。
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  因为最省钱的方法就是教会您健康自我管理。
                  有钱的顾客我们要服务，没有钱的顾客我们更要服务。
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  老百姓生不起病，我们要教他会生活、少生病，把健康把握在自己手里！
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 完成按钮 */}
        <section className="text-center mb-12">
          <Button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            完成自检，返回首页
            <CheckCircle2 className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            您的健康管理之旅才刚刚开始，祝您早日恢复健康！
          </p>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg font-semibold">健康自我管理 - 把健康把握在自己手里</p>
          <p className="mt-2">让老百姓少花钱甚至不花钱解决问题</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/check'}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重新自检
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
