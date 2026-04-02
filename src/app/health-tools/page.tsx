'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Activity, Camera, Eye, 
  ArrowRight, Sparkles, Shield, ClipboardCheck,
  TrendingUp, Target
} from 'lucide-react';

interface HealthTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'available' | 'developing';
  category: string;
  featured?: boolean;
}

const healthTools: HealthTool[] = [
  {
    id: 'health-self-check',
    title: '症状自检',
    description: '通过100项身体语言简表、252项不良生活习惯、300项症状表全面评估健康状况',
    icon: <ClipboardCheck className="h-8 w-8" />,
    path: '/personal-info',
    status: 'available',
    category: '症状评估',
    featured: true,
  },
  {
    id: 'face-diagnosis',
    title: 'AI 面诊',
    description: '通过面部照片分析健康状况，包含五脏健康评估和三高风险评估',
    icon: <Camera className="h-8 w-8" />,
    path: '/face-diagnosis',
    status: 'available',
    category: 'AI检测',
  },
  {
    id: 'tongue-diagnosis',
    title: 'AI 舌诊',
    description: '通过舌象分析脏腑健康状态，包含三高风险深度中医分析',
    icon: <Heart className="h-8 w-8" />,
    path: '/tongue-diagnosis',
    status: 'available',
    category: 'AI检测',
  },
  {
    id: 'posture-diagnosis',
    title: 'AI 体态评估',
    description: '通过MediaPipe检测骨骼点，分析体态问题并给出矫正建议',
    icon: <Activity className="h-8 w-8" />,
    path: '/posture-diagnosis',
    status: 'available',
    category: 'AI检测',
  },
  {
    id: 'health-progress',
    title: '健康进度',
    description: '查看健康管理方案执行进度，持续跟踪改善效果',
    icon: <TrendingUp className="h-8 w-8" />,
    path: '/health-progress',
    status: 'available',
    category: '进度管理',
  },
];

const categories = ['症状评估', 'AI检测', '进度管理'];

export default function HealthToolsPage() {
  const router = useRouter();

  const handleToolClick = (tool: HealthTool) => {
    if (tool.status === 'available') {
      router.push(tool.path);
    } else {
      alert('该功能开发中，敬请期待！');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">健康工具</h1>
                <p className="text-sm text-gray-500">全方位智能健康评估系统</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Shield className="h-3 w-3 mr-1" />
                医疗级AI分析
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* 简介部分 */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            专业健康评估工具集
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            基于先进的人工智能技术，结合中医理论和现代医学，为您提供全方位的健康评估服务
          </p>
        </div>

        {/* 分类导航 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-sm px-4 py-2">
              {category}
            </Badge>
          ))}
        </div>

        {/* 重点工具 - 症状自检 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/personal-info')}>
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ClipboardCheck className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 text-white border-0">
                      <Target className="h-3 w-3 mr-1" />
                      推荐优先使用
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">症状自检</h3>
                  <p className="text-white/90 text-sm max-w-2xl">
                    通过100项身体语言简表、252项不良生活习惯、300项症状表，全面评估您的健康状况，生成个性化健康方案
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI检测工具标题 */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI 智能检测
          </h3>
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthTools.map((tool) => {
            if (tool.id === 'health-self-check' || tool.id === 'health-progress') return null;
            
            return (
              <Card
                key={tool.id}
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  tool.status === 'available'
                    ? 'hover:border-blue-300 hover:scale-[1.02]'
                    : 'opacity-70'
                }`}
                onClick={() => handleToolClick(tool)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      tool.status === 'available'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {tool.icon}
                    </div>
                    <Badge
                      variant={tool.status === 'available' ? 'default' : 'secondary'}
                      className={
                        tool.status === 'available'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {tool.status === 'available' ? '可用' : '开发中'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    {tool.status === 'available' && (
                      <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                        立即使用
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 进度管理工具标题 */}
        <div className="mb-4 mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            进度管理
          </h3>
        </div>

        {/* 健康进度卡片 */}
        <Card 
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-green-300 hover:scale-[1.02]"
          onClick={() => router.push('/health-progress')}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white">
                <TrendingUp className="h-8 w-8" />
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">
                可用
              </Badge>
            </div>
            <CardTitle className="mt-4 group-hover:text-green-600 transition-colors">
              健康进度
            </CardTitle>
            <CardDescription className="text-sm">
              查看健康管理方案执行进度，持续跟踪改善效果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                进度管理
              </Badge>
              <Button variant="ghost" size="sm" className="group-hover:bg-green-50">
                查看进度
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              核心功能特点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-blue-500" />
                  全面症状评估
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  100项身体语言简表 + 252项不良生活习惯 + 300项症状表，全方位健康数据采集
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-purple-500" />
                  AI 智能检测
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  面诊、舌诊、体态评估，结合中医理论和现代医学，提供精准健康分析
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  持续进度跟踪
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  健康进度追踪，持续监控改善效果，动态调整健康管理方案
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
            ⚠️ 重要提示：所有AI健康评估结果仅供参考，不作为医疗诊断依据。如有健康问题，请及时就医检查。
          </p>
        </div>
      </main>
    </div>
  );
}
