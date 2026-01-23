'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ArrowRight, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { TWENTY_ONE_COURSES } from '@/lib/health-data';
import Link from 'next/link';

export default function CoursesPage() {
  // 按模块分组课程
  const coursesByModule = TWENTY_ONE_COURSES.reduce((acc, course) => {
    const moduleIndex = Math.ceil(course.id / 7);
    const moduleName = `模块${moduleIndex}`;
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(course);
    return acc;
  }, {} as Record<string, typeof TWENTY_ONE_COURSES>);

  const modules = Object.keys(coursesByModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/solution" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                21堂必修课程
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 标题部分 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">客户必修的21堂课</CardTitle>
              <CardDescription className="text-base mt-2">
                系统学习健康管理知识，掌握调理方法，恢复健康
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 课程说明 */}
        <section className="mb-12">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BookOpen className="w-6 h-6 text-purple-500 mr-2" />
                学习说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>• <strong>系统学习：</strong>这21堂课是健康管理的核心内容，需要认真学习并理解</p>
                <p>• <strong>循序渐进：</strong>按照课程顺序学习，不要跳跃，确保知识连贯性</p>
                <p>• <strong>实践结合：</strong>理论学习后要结合实际进行实践，才能真正掌握</p>
                <p>• <strong>及时复习：</strong>重要知识点需要反复学习，加深理解</p>
                <p>• <strong>提问交流：</strong>学习过程中有任何疑问，及时向导师请教</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 课程列表 */}
        <section className="mb-12">
          {modules.map((module, moduleIndex) => (
            <div key={module} className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {moduleIndex + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {module}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coursesByModule[module].map((course) => (
                  <Card key={course.id} className="border-2 border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          第{course.id}课
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {course.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 学习提示 */}
        <section className="mb-12">
          <Card className="border-2 border-yellow-100 dark:border-yellow-900">
            <CardHeader>
              <CardTitle className="text-xl">学习提示</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">做好笔记</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">记录重要知识点</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <div className="text-3xl mb-2">💭</div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">勤于思考</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">理解原理和机制</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <div className="text-3xl mb-2">🏃</div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">积极实践</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">将知识转化为行动</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center space-y-4 mb-12">
          <Button
            onClick={() => window.location.href = '/inspiration'}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            了解发心感悟
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
