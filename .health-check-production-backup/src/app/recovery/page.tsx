'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ArrowRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { CLEANING_STORY } from '@/lib/health-data';
import Link from 'next/link';

export default function RecoveryPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/story" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                好转反应
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 标题部分 */}
        <section className="mb-12">
          <Card className="border-2 border-yellow-100 dark:border-yellow-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">好转反应</CardTitle>
              <CardDescription className="text-base mt-2">
                理解调理过程中可能出现的好转反应，不要轻易放弃
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 重要提醒 */}
        <section className="mb-12">
          <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="mt-2">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                重要提醒
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                在调理过程中，您可能会出现一些不适，这其实是好转反应，说明身体正在清理毒素。
              </p>
            </AlertDescription>
          </Alert>
        </section>

        {/* 大扫除故事 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl">大扫除的故事</CardTitle>
              <CardDescription>
                用一个形象的比喻理解好转反应
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                  {CLEANING_STORY.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 好转反应的特点 */}
        <section className="mb-12">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-2xl">好转反应的特点</CardTitle>
              <CardDescription>
                如何区分好转反应和身体不适
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    好转反应的特征
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• 症状与之前身体的问题有关，说明毒素正在排出</li>
                    <li>• 不会持续很久，随着毒素排出逐渐减轻</li>
                    <li>• 身体整体感觉在好转，精力在恢复</li>
                    <li>• 配合饮食和休息，反应会逐渐消失</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    常见的好转反应
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• 疲劳感加重：身体在排毒，需要更多休息</li>
                    <li>• 痛感出现或加重：炎症正在被清除</li>
                    <li>• 皮肤出疹或瘙痒：毒素通过皮肤排出</li>
                    <li>• 消化系统反应：肠胃在清理毒素</li>
                    <li>• 头痛头晕：头部血管在疏通</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 应对方法 */}
        <section className="mb-12">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl">如何应对好转反应</CardTitle>
              <CardDescription>
                出现好转反应时应该怎么做
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">✅ 应该做的</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• 多喝温水，帮助排毒</li>
                    <li>• 保证充足睡眠，让身体修复</li>
                    <li>• 坚持调理，不要轻易停止</li>
                    <li>• 与导师沟通，获得指导</li>
                    <li>• 记录身体变化，观察进展</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">❌ 不应该做的</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• 不要因为不适就立即停止调理</li>
                    <li>• 不要过度劳累，增加身体负担</li>
                    <li>• 不要吃生冷油腻食物</li>
                    <li>• 不要熬夜，影响身体修复</li>
                    <li>• 不要过度担心，保持良好心态</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 重要提示 */}
        <section className="mb-12">
          <Alert className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="mt-2">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                特别提示
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                如果好转反应特别强烈，持续超过3-5天，或者出现发烧、剧烈疼痛等严重症状，
                请及时暂停调理并咨询医生。同时联系您的调理导师，获得专业指导。
              </p>
            </AlertDescription>
          </Alert>
        </section>

        {/* 下一步按钮 */}
        <section className="text-center space-y-4 mb-12">
          <Button
            onClick={() => router.push('/recovery-speed')}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            了解恢复速度8要素
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
