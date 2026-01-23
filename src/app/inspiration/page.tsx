'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ArrowRight, Heart, Sparkles, Quote } from 'lucide-react';
import { HEART_INSPIRATION } from '@/lib/health-data';
import Link from 'next/link';

export default function InspirationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                发心感悟
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 标题部分 */}
        <section className="mb-12">
          <Card className="border-2 border-pink-100 dark:border-pink-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">{HEART_INSPIRATION.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                用心感悟健康之道，用爱传递健康理念
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 发心内容 */}
        <section className="mb-12">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Quote className="w-6 h-6 text-purple-500 mr-2" />
                发心感悟
              </CardTitle>
              <CardDescription>
                健康调理不仅需要方法，更需要用心
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg text-center">
                  {HEART_INSPIRATION.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 健康理念 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl">健康理念</CardTitle>
              <CardDescription>
                我们的健康调理核心理念
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">治标更要治本</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    不只是缓解症状，更要找到问题的根源，从根本上改善健康状况
                  </p>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">用心对待身体</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    身体是最诚实的伙伴，用心倾听它的信号，给予它应有的关爱和呵护
                  </p>
                </div>

                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">循序渐进</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    健康恢复是一个循序渐进的过程，要有耐心，给身体足够的时间修复
                  </p>
                </div>

                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">知行合一</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    知道不如做到，将健康知识转化为实际行动，才能真正改变健康状况
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 行动承诺 */}
        <section className="mb-12">
          <Card className="border-2 border-yellow-100 dark:border-yellow-900">
            <CardHeader>
              <CardTitle className="text-2xl">行动承诺</CardTitle>
              <CardDescription>
                现在开始，为自己的健康做出承诺
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">认真对待身体</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      身体是革命的本钱，没有健康，一切都是空谈。从今天开始，认真对待自己的身体
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">坚持调理方案</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      按照调理方案坚持执行，不轻易放弃，给身体足够的时间恢复健康
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">传递健康理念</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      将学到的健康知识分享给家人朋友，让更多人受益，共同守护健康
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center space-y-4 mb-12">
          <Button
            onClick={() => window.location.href = '/'}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            返回首页
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
