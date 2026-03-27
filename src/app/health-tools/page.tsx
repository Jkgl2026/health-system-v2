'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Activity, Camera, Clock, Mic, Eye, Hand,
  Wind, FileText, ArrowRight, Sparkles, Shield
} from 'lucide-react';

interface HealthTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'available' | 'developing';
  category: string;
}

const healthTools: HealthTool[] = [
  {
    id: 'face-diagnosis',
    title: 'AI 面诊',
    description: '通过面部照片分析健康状况，包含五脏健康评估和三高风险评估',
    icon: <Camera className="h-8 w-8" />,
    path: '/face-diagnosis',
    status: 'available',
    category: '中医诊断',
  },
  {
    id: 'tongue-diagnosis',
    title: 'AI 舌诊',
    description: '通过舌象分析脏腑健康状态，包含三高风险深度中医分析',
    icon: <Heart className="h-8 w-8" />,
    path: '/tongue-diagnosis',
    status: 'available',
    category: '中医诊断',
  },
  {
    id: 'posture-diagnosis',
    title: 'AI 体态评估',
    description: '通过MediaPipe检测骨骼点，分析体态问题并给出矫正建议',
    icon: <Activity className="h-8 w-8" />,
    path: '/posture-diagnosis',
    status: 'available',
    category: '体态评估',
  },
  {
    id: 'biological-age',
    title: '生理年龄评估',
    description: '基于面部特征分析您的生理年龄，评估衰老因素',
    icon: <Clock className="h-8 w-8" />,
    path: '/biological-age',
    status: 'available',
    category: '健康评估',
  },
  {
    id: 'voice-health',
    title: '声音健康评估',
    description: '通过声音分析呼吸系统和声带健康状态',
    icon: <Mic className="h-8 w-8" />,
    path: '/voice-health',
    status: 'available',
    category: '健康评估',
  },
  {
    id: 'palm-diagnosis',
    title: 'AI 手相',
    description: '通过手相分析健康运势和体质特征',
    icon: <Hand className="h-8 w-8" />,
    path: '/palmistry-health',
    status: 'available',
    category: '中医诊断',
  },
  {
    id: 'breathing-analysis',
    title: '呼吸分析',
    description: '分析呼吸模式和深度，评估呼吸系统健康',
    icon: <Wind className="h-8 w-8" />,
    path: '/breathing-analysis',
    status: 'available',
    category: '健康评估',
  },
  {
    id: 'eye-health',
    title: '眼部健康',
    description: '通过眼部特征分析视力和眼部健康状态',
    icon: <Eye className="h-8 w-8" />,
    path: '/eye-health',
    status: 'available',
    category: '健康评估',
  },
  {
    id: 'comprehensive-report',
    title: '综合报告',
    description: '整合所有检测数据，生成全面的健康报告',
    icon: <FileText className="h-8 w-8" />,
    path: '/comprehensive-report',
    status: 'developing',
    category: '报告管理',
  },
];

const categories = ['中医诊断', '健康评估', '体态评估', '报告管理'];

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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 健康检测工具</h1>
                <p className="text-sm text-gray-500">全方位智能健康评估系统</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Shield className="h-3 w-3 mr-1" />
              医疗级AI分析
            </Badge>
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

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthTools.map((tool) => (
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
          ))}
        </div>

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
                  <Heart className="h-4 w-4 text-red-500" />
                  三高风险评估
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  面诊和舌诊均支持高血压、高血糖、高血脂的深度风险评估，提供中医证型分析和预防建议
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  体态智能分析
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  基于MediaPipe骨骼点检测，精准测量体态角度，提供专业的矫正训练建议
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  专业报告导出
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  支持Word格式报告导出，完整的健康分析和建议，方便保存和分享
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
