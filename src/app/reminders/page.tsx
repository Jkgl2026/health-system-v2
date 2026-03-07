'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Bell, Clock, Calendar, Activity, Utensils, 
  Heart, Plus, Trash2, Edit, Volume2
} from 'lucide-react';

interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string;
  reminderTime: string;
  frequency: string;
  daysOfWeek: number[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    type: 'training',
    title: '',
    message: '',
    reminderTime: '09:00',
    frequency: 'daily',
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reminders?userId=demo');
      const data = await response.json();
      if (data.success) {
        setReminders(data.data.reminders);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo',
          ...formData,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddDialog(false);
        resetForm();
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  const handleUpdateReminder = async () => {
    if (!editingReminder) return;
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReminder.id,
          ...formData,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingReminder(null);
        resetForm();
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reminder.id,
          isActive: !reminder.isActive,
        }),
      });
      fetchReminders();
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('确定要删除这个提醒吗？')) return;
    
    try {
      await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
      });
      fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'training',
      title: '',
      message: '',
      reminderTime: '09:00',
      frequency: 'daily',
      daysOfWeek: [1, 2, 3, 4, 5],
    });
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      title: reminder.title,
      message: reminder.message || '',
      reminderTime: reminder.reminderTime || '09:00',
      frequency: reminder.frequency || 'daily',
      daysOfWeek: reminder.daysOfWeek || [1, 2, 3, 4, 5],
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return <Activity className="h-4 w-4" />;
      case 'diet': return <Utensils className="h-4 w-4" />;
      case 'rediagnosis': return <Heart className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-100 text-blue-700';
      case 'diet': return 'bg-green-100 text-green-700';
      case 'rediagnosis': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'training': return '训练提醒';
      case 'diet': return '饮食提醒';
      case 'rediagnosis': return '复诊提醒';
      default: return type;
    }
  };

  const getFrequencyName = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '每天';
      case 'weekly': return '每周';
      case 'custom': return '自定义';
      default: return frequency;
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const ReminderForm = ({ onSubmit, isEdit = false }: { onSubmit: () => void, isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium mb-2 block">提醒类型</label>
        <Tabs value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="training">训练</TabsTrigger>
            <TabsTrigger value="diet">饮食</TabsTrigger>
            <TabsTrigger value="rediagnosis">复诊</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">提醒标题</label>
        <Input
          placeholder="例如：该训练啦！"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">提醒内容</label>
        <Textarea
          placeholder="添加详细的提醒内容..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">提醒时间</label>
          <Input
            type="time"
            value={formData.reminderTime}
            onChange={(e) => setFormData({...formData, reminderTime: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">重复频率</label>
          <Tabs value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="daily">每天</TabsTrigger>
              <TabsTrigger value="weekly">每周</TabsTrigger>
              <TabsTrigger value="custom">自定义</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {formData.frequency === 'custom' && (
        <div>
          <label className="text-sm font-medium mb-2 block">选择日期</label>
          <div className="flex gap-2">
            {weekDays.map((day, idx) => (
              <Button
                key={idx}
                variant={formData.daysOfWeek.includes(idx) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const days = formData.daysOfWeek.includes(idx)
                    ? formData.daysOfWeek.filter(d => d !== idx)
                    : [...formData.daysOfWeek, idx];
                  setFormData({...formData, daysOfWeek: days});
                }}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )}
      <Button onClick={onSubmit} className="w-full">
        {isEdit ? '保存修改' : '创建提醒'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-indigo-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">提醒设置</h1>
              <p className="text-sm text-gray-500">设置健康提醒，养成好习惯</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                新建提醒
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建提醒</DialogTitle>
                <DialogDescription>创建一个新的健康提醒</DialogDescription>
              </DialogHeader>
              <ReminderForm onSubmit={handleAddReminder} />
            </DialogContent>
          </Dialog>
        </div>

        {/* 编辑对话框 */}
        <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑提醒</DialogTitle>
              <DialogDescription>修改提醒设置</DialogDescription>
            </DialogHeader>
            <ReminderForm onSubmit={handleUpdateReminder} isEdit />
          </DialogContent>
        </Dialog>

        {/* 提醒列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              我的提醒
            </CardTitle>
            <CardDescription>
              共 {reminders.length} 个提醒，{reminders.filter(r => r.isActive).length} 个已启用
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      reminder.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(reminder.type)}`}>
                      {getTypeIcon(reminder.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reminder.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeName(reminder.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reminder.reminderTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getFrequencyName(reminder.frequency)}
                        </span>
                      </div>
                      {reminder.message && (
                        <p className="text-xs text-gray-600 mt-1">{reminder.message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.isActive}
                        onCheckedChange={() => handleToggleActive(reminder)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(reminder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>暂无提醒</p>
                <p className="text-sm mt-1">点击右上角按钮创建提醒</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
