'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Plus, Search, Edit, Trash2, LogOut, 
  Activity, Target, Zap, AlertCircle, Loader2
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
  videoUrl: string;
  imageUrl: string;
  steps: string[];
  tips: string[];
  primaryMuscles: string[];
  relatedMeridians: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '整复训练',
    subCategory: '',
    description: '',
    targetIssues: '',
    duration: '',
    reps: 0,
    sets: 0,
    frequency: '',
    steps: '',
    tips: '',
    primaryMuscles: '',
    relatedMeridians: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    fetchExercises();
  }, [router]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exercises');
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

  const handleAddExercise = async () => {
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetIssues: formData.targetIssues.split(',').map(s => s.trim()).filter(Boolean),
          steps: formData.steps.split('\n').filter(Boolean),
          tips: formData.tips.split('\n').filter(Boolean),
          primaryMuscles: formData.primaryMuscles.split(',').map(s => s.trim()).filter(Boolean),
          relatedMeridians: formData.relatedMeridians.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddDialog(false);
        resetForm();
        fetchExercises();
      }
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    
    try {
      const response = await fetch('/api/exercises', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExercise.id,
          ...formData,
          targetIssues: formData.targetIssues.split(',').map(s => s.trim()).filter(Boolean),
          steps: formData.steps.split('\n').filter(Boolean),
          tips: formData.tips.split('\n').filter(Boolean),
          primaryMuscles: formData.primaryMuscles.split(',').map(s => s.trim()).filter(Boolean),
          relatedMeridians: formData.relatedMeridians.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingExercise(null);
        resetForm();
        fetchExercises();
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('确定要删除这个训练动作吗？')) return;
    
    try {
      await fetch(`/api/exercises?id=${id}`, {
        method: 'DELETE',
      });
      fetchExercises();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '整复训练',
      subCategory: '',
      description: '',
      targetIssues: '',
      duration: '',
      reps: 0,
      sets: 0,
      frequency: '',
      steps: '',
      tips: '',
      primaryMuscles: '',
      relatedMeridians: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      subCategory: exercise.subCategory || '',
      description: exercise.description || '',
      targetIssues: (exercise.targetIssues || []).join(', '),
      duration: exercise.duration || '',
      reps: exercise.reps || 0,
      sets: exercise.sets || 0,
      frequency: exercise.frequency || '',
      steps: (exercise.steps || []).join('\n'),
      tips: (exercise.tips || []).join('\n'),
      primaryMuscles: (exercise.primaryMuscles || []).join(', '),
      relatedMeridians: (exercise.relatedMeridians || []).join(', '),
      isActive: exercise.isActive,
      sortOrder: exercise.sortOrder || 0,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const ExerciseForm = ({ onSubmit, isEdit = false }: { onSubmit: () => void, isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">动作名称 *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="动作名称"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">分类 *</label>
          <Tabs value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="整复训练">整复训练</TabsTrigger>
              <TabsTrigger value="本源训练">本源训练</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">子分类</label>
        <Input
          value={formData.subCategory}
          onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
          placeholder="如：颈椎调理、肩部调理"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">描述</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="动作描述"
          rows={2}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">适用问题（逗号分隔）</label>
        <Input
          value={formData.targetIssues}
          onChange={(e) => setFormData({...formData, targetIssues: e.target.value})}
          placeholder="颈椎前引, 颈部僵硬, 头痛"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">时长</label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="15分钟"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">次数/组</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={formData.reps}
              onChange={(e) => setFormData({...formData, reps: parseInt(e.target.value) || 0})}
              placeholder="10"
            />
            <Input
              type="number"
              value={formData.sets}
              onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value) || 0})}
              placeholder="3"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">频率</label>
          <Input
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            placeholder="每日2次"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">训练步骤（每行一步）</label>
        <Textarea
          value={formData.steps}
          onChange={(e) => setFormData({...formData, steps: e.target.value})}
          placeholder="第一步描述&#10;第二步描述&#10;..."
          rows={3}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">注意事项（每行一条）</label>
        <Textarea
          value={formData.tips}
          onChange={(e) => setFormData({...formData, tips: e.target.value})}
          placeholder="注意点1&#10;注意点2&#10;..."
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">主要肌肉（逗号分隔）</label>
          <Input
            value={formData.primaryMuscles}
            onChange={(e) => setFormData({...formData, primaryMuscles: e.target.value})}
            placeholder="胸锁乳突肌, 斜方肌"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">相关经络（逗号分隔）</label>
          <Input
            value={formData.relatedMeridians}
            onChange={(e) => setFormData({...formData, relatedMeridians: e.target.value})}
            placeholder="督脉, 膀胱经"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">排序</label>
          <Input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm">启用</label>
        </div>
      </div>
      
      <Button onClick={onSubmit} className="w-full">
        {isEdit ? '保存修改' : '创建动作'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">训练动作管理</h1>
              <p className="text-sm text-gray-500">管理整复训练和本源训练动作库</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  新增动作
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新增训练动作</DialogTitle>
                  <DialogDescription>添加新的训练动作到动作库</DialogDescription>
                </DialogHeader>
                <ExerciseForm onSubmit={handleAddExercise} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>

        {/* 编辑对话框 */}
        <Dialog open={!!editingExercise} onOpenChange={() => setEditingExercise(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑训练动作</DialogTitle>
              <DialogDescription>修改训练动作信息</DialogDescription>
            </DialogHeader>
            <ExerciseForm onSubmit={handleUpdateExercise} isEdit />
          </DialogContent>
        </Dialog>

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
          <Tabs value={filterCategory} onValueChange={setFilterCategory}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="整复训练">整复训练</TabsTrigger>
              <TabsTrigger value="本源训练">本源训练</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总动作数</p>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">整复训练</p>
                  <p className="text-2xl font-bold text-green-600">
                    {exercises.filter(e => e.category === '整复训练').length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本源训练</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {exercises.filter(e => e.category === '本源训练').length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 动作列表 */}
        <Card>
          <CardHeader>
            <CardTitle>训练动作列表</CardTitle>
            <CardDescription>共 {filteredExercises.length} 个动作</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredExercises.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>子分类</TableHead>
                    <TableHead>时长</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">{exercise.name}</TableCell>
                      <TableCell>
                        <Badge variant={exercise.category === '整复训练' ? 'default' : 'secondary'}>
                          {exercise.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{exercise.subCategory || '-'}</TableCell>
                      <TableCell>{exercise.duration || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={exercise.isActive ? 'default' : 'secondary'}>
                          {exercise.isActive ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(exercise)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteExercise(exercise.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无训练动作
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
