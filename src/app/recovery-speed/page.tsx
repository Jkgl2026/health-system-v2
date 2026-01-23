'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ArrowRight, Info, Zap, TrendingUp } from 'lucide-react';
import { RECOVERY_SPEED_FACTORS } from '@/lib/health-data';
import Link from 'next/link';

export default function RecoverySpeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/recovery" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                恢复速度8要素
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 标题部分 */}
        <section className="mb-12">
          <Card className="border-2 border-indigo-100 dark:border-indigo-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">{RECOVERY_SPEED_FACTORS.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                决定您调理恢复速度的八个关键因素
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 介绍 */}
        <section className="mb-12">
          <Alert className="border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <AlertDescription className="mt-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {RECOVERY_SPEED_FACTORS.intro}
              </p>
            </AlertDescription>
          </Alert>
        </section>

        {/* 八个要素 */}
        <section className="mb-12">
          <Card className="border-2 border-gray-100 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl">八大恢复速度要素</CardTitle>
              <CardDescription>
                了解这些因素，做好配合，才能让调理效果事半功倍！
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECOVERY_SPEED_FACTORS.factors.map((factor) => (
                  <div key={factor.id} className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {factor.id}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                          {factor.question}
                        </p>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">答案：</span>
                            <span className="text-gray-900 dark:text-gray-100">{factor.answer}</span>
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                            💡 原理：{factor.principle}
                          </p>
                        </div>
                      </div>
                      {factor.id <= 3 && (
                        <div className="flex-shrink-0">
                          <Badge variant="default" className="bg-green-500">
                            重要
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 总结 */}
        <section className="mb-12">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">关键结论</CardTitle>
                  <CardDescription className="text-base">
                    如何加快恢复速度
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border-2 border-green-200 dark:border-green-800">
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {RECOVERY_SPEED_FACTORS.conclusion}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>配合调理：</strong>严格按照调理方案执行，不要随意中断或更改
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>改善习惯：</strong>改掉不良生活习惯，养成健康的生活习惯
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>保持心态：</strong>保持积极乐观的心态，相信身体的自我修复能力
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">4</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>及时沟通：</strong>有任何问题及时与调理导师沟通，获得专业指导
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center space-y-4 mb-12">
          <Button
            onClick={() => window.location.href = '/courses'}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            学习21堂必修课程
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
