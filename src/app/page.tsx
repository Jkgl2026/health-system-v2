'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Activity, Heart, Shield, Target, BookOpen, ClipboardCheck, Settings, Info } from 'lucide-react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWARedirect } from './page-pwa-redirect';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

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
              数据管理（备份/恢复/清除）
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
