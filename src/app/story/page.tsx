'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, Activity, Shield, Heart, Droplets, Snowflake, Sparkles, Smile } from 'lucide-react';
import { SYSTEM_CAMPAIGN_STORY, HEALTH_ELEMENTS } from '@/lib/health-data';
import Link from 'next/link';

export default function StoryPage() {
  const [activeElement, setActiveElement] = useState<keyof typeof HEALTH_ELEMENTS>('气血');

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

              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
                  其中任何一个要素出现了问题，都会对我们的免疫力和健康造成影响。
                  只有所有要素都处于良好状态，身体才能保持健康。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 健康要素原理 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            健康要素原理详解
          </h2>

          <Tabs value={activeElement} onValueChange={(v) => setActiveElement(v as keyof typeof HEALTH_ELEMENTS)} className="w-full">
            <TabsList className="grid w-full grid-cols-7 h-auto">
              {(Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).map((key) => {
                const Icon = elementIcons[key];
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center space-y-1 py-3 h-auto"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{HEALTH_ELEMENTS[key].name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).map((key) => {
              const element = HEALTH_ELEMENTS[key];
              const Icon = elementIcons[key];

              return (
                <TabsContent key={key} value={key} className="mt-6">
                  <Card className="border-2 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{element.name}</CardTitle>
                          <CardDescription>{element.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                          故事：{element.story}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {element.principle}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                          相关症状（对应到您的自检表）：
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {element.symptoms.map((id) => {
                            const symptom = element.symptoms.includes(id);
                            return (
                              <Badge key={id} variant="secondary" className="text-sm py-1 px-3">
                                {element.name}相关问题
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>重要提示：</strong>
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

        {/* 总结 */}
        <section className="mb-12">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">关键结论</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    身体想要维持正常的新陈代谢和生命活动，需要两个保障：<strong>营养能进得来</strong>，<strong>毒素垃圾能出得去</strong>。
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    七个健康要素（气血、循环、毒素、血脂、寒凉、免疫、情绪）任何一个出现问题，都会影响免疫力和健康。
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    医院的治疗往往只针对症状，而不解决根本原因。我们需要找到问题的根源，从根本上改善健康状况。
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    健康自我管理的核心是了解症状背后的原因，通过改善生活方式和使用科学方法来恢复健康，让身体自我修复。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center">
          <Button
            onClick={() => window.location.href = '/choices'}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            了解您的选择
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
