'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, ArrowLeft, Save, RefreshCw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  category: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export default function QAManagementPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 对话框状态
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    question: '',
    category: '',
    order: 1,
  });

  // 获取七问列表
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/qa/list');
      const data = await response.json();

      if (data.code === 200) {
        setQuestions(data.data || []);
      } else {
        setError(data.message || '获取七问列表失败');
      }
    } catch (err) {
      console.error('获取七问列表失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // 打开添加对话框
  const handleAdd = () => {
    setEditingQuestion(null);
    setFormData({ question: '', category: '', order: questions.length + 1 });
    setShowDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      category: question.category,
      order: question.order,
    });
    setShowDialog(true);
  };

  // 删除问题
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个问题吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/qa/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.code === 200) {
        fetchQuestions();
      } else {
        setError(data.message || '删除失败');
      }
    } catch (err) {
      console.error('删除失败:', err);
      setError('网络错误，请稍后重试');
    }
  };

  // 保存问题
  const handleSave = async () => {
    if (!formData.question.trim()) {
      setError('问题内容不能为空');
      return;
    }

    try {
      const url = editingQuestion
        ? `/api/user/qa/${editingQuestion.id}`
        : '/api/user/qa/add';

      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.code === 200) {
        setShowDialog(false);
        fetchQuestions();
      } else {
        setError(data.message || '保存失败');
      }
    } catch (err) {
      console.error('保存失败:', err);
      setError('网络错误，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">健康七问管理</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchQuestions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增问题
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 七问列表 */}
      <Card>
        <CardHeader>
          <CardTitle>问题列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">暂无七问数据</p>
              <Button onClick={handleAdd}>新增第一个问题</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions
                .sort((a, b) => a.order - b.order)
                .map((question) => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {question.order}
                          </span>
                          {question.category && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {question.category}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium">{question.question}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? '编辑问题' : '新增问题'}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? '修改七问问题内容' : '添加新的健康七问问题'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="order">顺序</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div>
              <Label htmlFor="category">分类（可选）</Label>
              <Input
                id="category"
                placeholder="例如：生活习惯、饮食习惯"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="question">问题内容</Label>
              <Textarea
                id="question"
                placeholder="请输入问题内容"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
