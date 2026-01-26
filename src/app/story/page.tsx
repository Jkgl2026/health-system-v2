'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, BookOpen, Activity, Shield, Heart, Droplets, Snowflake, Sparkles, Smile, MessageCircle, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { SYSTEM_CAMPAIGN_STORY, HEALTH_ELEMENTS, KEY_QUESTION } from '@/lib/health-data';
import Link from 'next/link';

export default function StoryPage() {
  const [activeElement, setActiveElement] = useState<keyof typeof HEALTH_ELEMENTS>('气血');
  const [showFullStory, setShowFullStory] = useState(false);

  const elementIcons: Record<keyof typeof HEALTH_ELEMENTS, any> = {
    气血: Activity,
    循环: Heart,
    毒素: Droplets,
    血脂: Shield,
    寒凉: Snowflake,
    免疫: Sparkles,
    情绪: Smile,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/analysis" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                健康原理学习
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 系统战役故事 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">{SYSTEM_CAMPAIGN_STORY.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                通过一个形象的比喻，了解影响健康的七个核心要素
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {SYSTEM_CAMPAIGN_STORY.content.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    {section.section}
                  </h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* 关键问题 */}
              <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <MessageCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="mt-2">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">{KEY_QUESTION.question}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {KEY_QUESTION.answer}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
                  其中任何一个要素出现了问题，都会对我们的免疫力和健康造成影响。
                  只有所有要素都处于良好状态，身体才能保持健康。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 健康要素原理详解 */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              健康要素原理详解
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              深入了解影响健康的七个核心要素，掌握健康的根本
            </p>
          </div>

          <Tabs value={activeElement} onValueChange={(v) => setActiveElement(v as keyof typeof HEALTH_ELEMENTS)} className="w-full">
            {/* 优化TabList - 添加渐变背景和更好的视觉层次 */}
            <TabsList className="grid w-full grid-cols-7 h-auto bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800 p-2 gap-1">
              {(Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).map((key) => {
                const Icon = elementIcons[key];
                const isActive = activeElement === key;
                const elementColors: Record<string, { bg: string; text: string; gradient: string }> = {
                  气血: { bg: 'bg-red-500', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
                  循环: { bg: 'bg-blue-500', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
                  毒素: { bg: 'bg-yellow-500', text: 'text-yellow-600', gradient: 'from-yellow-500 to-yellow-600' },
                  血脂: { bg: 'bg-orange-500', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
                  寒凉: { bg: 'bg-cyan-500', text: 'text-cyan-600', gradient: 'from-cyan-500 to-cyan-600' },
                  免疫: { bg: 'bg-green-500', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
                  情绪: { bg: 'bg-purple-500', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
                };
                const colors = elementColors[key] || elementColors.气血;

                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={`flex flex-col items-center space-y-2 py-4 h-auto transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg scale-105`
                        : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white/20' : colors.bg + ' text-white'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : colors.text}`}>
                      {HEALTH_ELEMENTS[key].name}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).map((key) => {
              const element = HEALTH_ELEMENTS[key];
              const Icon = elementIcons[key];
              const elementColors: Record<string, { bg: string; text: string; gradient: string; border: string }> = {
                气血: { bg: 'bg-red-500', text: 'text-red-600', gradient: 'from-red-500 to-red-600', border: 'border-red-200' },
                循环: { bg: 'bg-blue-500', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-200' },
                毒素: { bg: 'bg-yellow-500', text: 'text-yellow-600', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-200' },
                血脂: { bg: 'bg-orange-500', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-200' },
                寒凉: { bg: 'bg-cyan-500', text: 'text-cyan-600', gradient: 'from-cyan-500 to-cyan-600', border: 'border-cyan-200' },
                免疫: { bg: 'bg-green-500', text: 'text-green-600', gradient: 'from-green-500 to-green-600', border: 'border-green-200' },
                情绪: { bg: 'bg-purple-500', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-200' },
              };
              const colors = elementColors[key] || elementColors.气血;

              return (
                <TabsContent key={key} value={key} className="mt-6">
                  <Card className={`border-2 ${colors.border} dark:${colors.border.replace('border-', 'dark:border-')} shadow-lg`}>
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <div>
                            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                              {element.name}
                            </CardTitle>
                            <CardDescription className="text-base mt-1 text-gray-600 dark:text-gray-400">
                              {element.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFullStory(!showFullStory)}
                          className="font-semibold"
                        >
                          {showFullStory ? '收起故事' : '查看完整故事'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 mt-6">
                      {/* 原理说明 - 使用浅色背景 */}
                      <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl border-2 ${colors.border} dark:${colors.border.replace('border-', 'dark:border-')}`}>
                        <h3 className={`text-xl font-bold mb-3 flex items-center ${colors.text}`}>
                          <BookOpen className="w-5 h-5 mr-2" />
                          基本原理
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {element.principle}
                        </p>
                      </div>

                      {/* 完整故事 - 优化展示 */}
                      {showFullStory && element.fullStory && (
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                          <h3 className={`text-xl font-bold mb-3 flex items-center text-purple-700 dark:text-purple-400`}>
                            <Sparkles className="w-5 h-5 mr-2" />
                            完整故事：{element.story}
                          </h3>
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                            {element.fullStory}
                          </div>
                        </div>
                      )}

                      {/* 重要提示 - 使用醒目的警告样式 */}
                      <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-800">
                        <h3 className={`text-lg font-bold mb-2 flex items-center ${colors.text}`}>
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          重要提示
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          如果您在之前的症状自检中出现了与此要素相关的症状，说明该要素可能存在问题。
                          只有找到问题的根本原因，才能真正改善健康状况，而不是仅仅缓解症状。
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center space-y-4 mb-12">
          <Button
            onClick={() => window.location.href = '/choices'}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            查看三个选择
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
