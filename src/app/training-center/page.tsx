'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Search, Play, Clock, Target, Zap, Activity,
  ChevronRight, Calendar, TrendingUp, Award
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  targetIssues: string[];
  duration: string;
  reps: number;
  sets: number;
  frequency: string;
  restTime: string;
  videoUrl: string;
  imageUrl: string;
  steps: string[];
  tips: string[];
  primaryMuscles: string[];
  relatedMeridians: string[];
}

export default function TrainingCenterPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises?isActive=true');
      const data = await response.json();
      if (data.success) {
        setExercises(data.data.exercises);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const zhengfuExercises = filteredExercises.filter(e => e.category === '整复训练');
  const benyuanExercises = filteredExercises.filter(e => e.category === '本源训练');

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedExercise(exercise)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            {exercise.subCategory && (
              <CardDescription className="text-xs mt-1">
                {exercise.subCategory}
              </CardDescription>
            )}
          </div>
          <Badge variant={exercise.category === '整复训练' ? 'default' : 'secondary'}>
            {exercise.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {exercise.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {exercise.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exercise.duration}
            </div>
          )}
          {exercise.reps && exercise.sets && (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {exercise.sets}组 x {exercise.reps}次
            </div>
          )}
        </div>
        {exercise.targetIssues && exercise.targetIssues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercise.targetIssues.slice(0, 3).map((issue, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {issue}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedExercise(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回训练列表
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedExercise.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {selectedExercise.description}
                  </CardDescription>
                </div>
                <Badge variant={selectedExercise.category === '整复训练' ? 'default' : 'secondary'}>
                  {selectedExercise.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 训练参数 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedExercise.duration && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-sm font-medium">{selectedExercise.duration}</p>
                    <p className="text-xs text-gray-500">时长</p>
                  </div>
                )}
                {selectedExercise.sets && selectedExercise.reps && (
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <Activity className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <p className="text-sm font-medium">{selectedExercise.sets}组 x {selectedExercise.reps}次</p>
                    <p className="text-xs text-gray-500">训练量</p>
                  </div>
                )}
                {selectedExercise.frequency && (
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Calendar className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                    <p className="text-sm font-medium">{selectedExercise.frequency}</p>
                    <p className="text-xs text-gray-500">频率</p>
                  </div>
                )}
                {selectedExercise.restTime && (
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <TrendingUp className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <p className="text-sm font-medium">{selectedExercise.restTime}</p>
                    <p className="text-xs text-gray-500">组间休息</p>
                  </div>
                )}
              </div>

              {/* 视频/图片 */}
              {selectedExercise.videoUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">视频区域（待实现）</p>
                </div>
              )}

              {/* 训练步骤 */}
              {selectedExercise.steps && selectedExercise.steps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">训练步骤</h3>
                  <ol className="space-y-2">
                    {selectedExercise.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 注意事项 */}
              {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">注意事项</h3>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <ChevronRight className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 主要肌肉 */}
              {selectedExercise.primaryMuscles && selectedExercise.primaryMuscles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">主要肌肉</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.primaryMuscles.map((muscle, idx) => (
                      <Badge key={idx} variant="outline">{muscle}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 相关经络 */}
              {selectedExercise.relatedMeridians && selectedExercise.relatedMeridians.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">相关经络</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.relatedMeridians.map((meridian, idx) => (
                      <Badge key={idx} variant="secondary">{meridian}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 开始训练按钮 */}
              <div className="flex justify-center pt-4">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600">
                  <Play className="h-5 w-5 mr-2" />
                  开始训练
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-green-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">训练中心</h1>
              <p className="text-sm text-gray-500">整复训练 · 本源训练 · 专业指导</p>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索训练动作..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="整复训练">整复训练</TabsTrigger>
              <TabsTrigger value="本源训练">本源训练</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 训练列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <Tabs defaultValue="zhengfu" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="zhengfu" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                整复训练 ({zhengfuExercises.length})
              </TabsTrigger>
              <TabsTrigger value="benyuan" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                本源训练 ({benyuanExercises.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="zhengfu">
              {zhengfuExercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zhengfuExercises.map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    暂无整复训练动作
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="benyuan">
              {benyuanExercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benyuanExercises.map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    暂无本源训练动作
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
