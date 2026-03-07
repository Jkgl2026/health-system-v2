'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle2, Activity, Utensils, 
  Heart, Plus, TrendingUp, Award, Zap, Timer
} from 'lucide-react';

interface CheckInRecord {
  id: string;
  type: string;
  content: any;
  notes: string;
  exerciseIds: string[];
  completed: boolean;
  duration: number;
  checkInDate: string;
  createdAt: string;
}

interface CheckInStats {
  totalCheckIns: number;
  trainingCheckIns: number;
  dietCheckIns: number;
  symptomCheckIns: number;
  thisWeekCheckIns: number;
  thisMonthCheckIns: number;
}

export default function CheckInsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState({
    type: 'training',
    notes: '',
    duration: 30,
  });

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const typeParam = activeTab !== 'all' ? `&type=${activeTab}` : '';
      const response = await fetch(`/api/check-ins?userId=demo${typeParam}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheckIn = async () => {
    try {
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo',
          type: newCheckIn.type,
          notes: newCheckIn.notes,
          duration: newCheckIn.duration,
          content: {},
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddDialog(false);
        setNewCheckIn({ type: 'training', notes: '', duration: 30 });
        fetchRecords();
      }
    } catch (error) {
      console.error('Failed to add check-in:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return <Activity className="h-4 w-4" />;
      case 'diet': return <Utensils className="h-4 w-4" />;
      case 'symptom': return <Heart className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-100 text-blue-700';
      case 'diet': return 'bg-green-100 text-green-700';
      case 'symptom': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'training': return '训练打卡';
      case 'diet': return '饮食打卡';
      case 'symptom': return '症状记录';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">打卡记录</h1>
              <p className="text-sm text-gray-500">坚持打卡，见证改变</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                打卡
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增打卡</DialogTitle>
                <DialogDescription>记录你的健康行动</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">打卡类型</label>
                  <Tabs value={newCheckIn.type} onValueChange={(v) => setNewCheckIn({...newCheckIn, type: v})}>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="training">训练</TabsTrigger>
                      <TabsTrigger value="diet">饮食</TabsTrigger>
                      <TabsTrigger value="symptom">症状</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {newCheckIn.type === 'training' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">训练时长（分钟）</label>
                    <Input
                      type="number"
                      value={newCheckIn.duration}
                      onChange={(e) => setNewCheckIn({...newCheckIn, duration: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">备注</label>
                  <Textarea
                    placeholder="记录你的感受..."
                    value={newCheckIn.notes}
                    onChange={(e) => setNewCheckIn({...newCheckIn, notes: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddCheckIn} className="w-full">
                  确认打卡
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">总打卡</p>
                    <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
                  </div>
                  <Award className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">本周</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.thisWeekCheckIns}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">本月</p>
                    <p className="text-2xl font-bold text-green-600">{stats.thisMonthCheckIns}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">训练</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.trainingCheckIns}</p>
                  </div>
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 打卡记录列表 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>打卡记录</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="training">训练</TabsTrigger>
                  <TabsTrigger value="diet">饮食</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(record.type)}`}>
                      {getTypeIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTypeName(record.type)}</span>
                        {record.completed && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            已完成
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(record.checkInDate)}
                        </span>
                        {record.duration && (
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {record.duration}分钟
                          </span>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-xs text-gray-600 mt-1">{record.notes}</p>
                      )}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>暂无打卡记录</p>
                <p className="text-sm mt-1">点击右上角按钮开始打卡</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
