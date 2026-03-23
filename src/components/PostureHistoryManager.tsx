'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, User, History, BarChart3, TrendingUp, TrendingDown,
  Plus, ChevronRight, Calendar, Award, AlertCircle, Loader2,
  Users, FileText, Trash2, Eye, GitCompare, Minus
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { comparePostureDiagnosisRecords, ComparisonResult, getOrganName } from '@/lib/comparison-utils';

// 用户接口
interface PostureUser {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  assessment_count: number;
  last_assessment_date: string | null;
  avg_score: number | null;
}

// 评估记录接口
interface AssessmentRecord {
  id: number;
  user_id: number;
  assessment_date: string;
  overall_score: number;
  grade: string;
  issues: any[];
  ai_summary: string;
  name: string;
  phone: string;
}

// 记录详情接口
interface AssessmentDetail extends AssessmentRecord {
  angles: Record<string, number>;
  muscles: { tight: string[]; weak: string[] };
  health_risks: any[];
  ai_detailed_analysis: any;
  tcm_analysis: any;
  training_plan: any;
  image_front: string;
  annotation_front: string;
}

interface PostureHistoryManagerProps {
  onViewRecord?: (record: AssessmentDetail) => void;
  onCompareRecords?: (record1: AssessmentDetail, record2: AssessmentDetail) => void;
}

export default function PostureHistoryManager({
  onViewRecord,
  onCompareRecords,
}: PostureHistoryManagerProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<PostureUser[]>([]);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<PostureUser | null>(null);
  const [userRecords, setUserRecords] = useState<AssessmentRecord[]>([]);
  const [recordDetail, setRecordDetail] = useState<AssessmentDetail | null>(null);
  
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posture-records?action=users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('加载用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载最近记录
  const loadRecentRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posture-records');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('加载记录失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 按名字搜索
  const searchByName = useCallback(async () => {
    if (!searchName.trim()) {
      loadUsers();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posture-records?action=search&name=${encodeURIComponent(searchName)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchName, loadUsers]);

  // 按电话搜索
  const searchByPhone = useCallback(async () => {
    if (!searchPhone.trim()) {
      loadUsers();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posture-records?action=search&phone=${encodeURIComponent(searchPhone)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchPhone, loadUsers]);

  // 选择用户，加载其记录
  const selectUser = useCallback(async (user: PostureUser) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const res = await fetch(`/api/posture-records?action=records&userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setUserRecords(data.data);
        setActiveTab('records');
      }
    } catch (err) {
      console.error('加载用户记录失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载记录详情
  const loadRecordDetail = useCallback(async (recordId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posture-records?action=detail&recordId=${recordId}`);
      const data = await res.json();
      if (data.success) {
        setRecordDetail(data.data);
        setShowDetailDialog(true);
      }
    } catch (err) {
      console.error('加载记录详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建新用户
  const createUser = useCallback(async () => {
    if (!newUserName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/posture-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUser',
          name: newUserName,
          phone: newUserPhone || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUserDialog(false);
        setNewUserName('');
        setNewUserPhone('');
        loadUsers();
      }
    } catch (err) {
      console.error('创建用户失败:', err);
    } finally {
      setLoading(false);
    }
  }, [newUserName, newUserPhone, loadUsers]);

  // 删除记录
  const deleteRecord = useCallback(async (recordId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await fetch(`/api/posture-records?recordId=${recordId}`, { method: 'DELETE' });
      if (selectedUser) {
        selectUser(selectedUser);
      }
      loadRecentRecords();
    } catch (err) {
      console.error('删除记录失败:', err);
    }
  }, [selectedUser, selectUser, loadRecentRecords]);

  // 删除用户
  const deleteUser = useCallback(async (userId: number) => {
    if (!confirm('确定要删除该用户及其所有记录吗？此操作不可恢复！')) return;
    
    try {
      await fetch(`/api/posture-records?userId=${userId}`, { method: 'DELETE' });
      setSelectedUser(null);
      setUserRecords([]);
      loadUsers();
      loadRecentRecords();
    } catch (err) {
      console.error('删除用户失败:', err);
    }
  }, [loadUsers, loadRecentRecords]);

  // 处理对比选择
  const toggleCompareSelect = useCallback((recordId: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      }
      if (prev.length >= 2) {
        return [prev[1], recordId];
      }
      return [...prev, recordId];
    });
  }, []);

  // 执行对比
  const executeCompare = useCallback(async () => {
    if (selectedForCompare.length !== 2) return;
    
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/posture-records?action=detail&recordId=${selectedForCompare[0]}`),
        fetch(`/api/posture-records?action=detail&recordId=${selectedForCompare[1]}`),
      ]);
      
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      
      if (data1.success && data2.success) {
        // 使用对比工具生成对比结果
        const result = comparePostureDiagnosisRecords(data1.data, data2.data);
        setComparisonResult(result);
        setShowComparisonDialog(true);
        
        // 同时调用外部回调
        onCompareRecords?.(data1.data, data2.data);
      }
    } catch (err) {
      console.error('对比失败:', err);
    } finally {
      setLoading(false);
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  }, [selectedForCompare, onCompareRecords]);

  // 初始化
  useEffect(() => {
    loadUsers();
    loadRecentRecords();
  }, [loadUsers, loadRecentRecords]);

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取等级颜色
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-500',
      B: 'bg-blue-500',
      C: 'bg-yellow-500',
      D: 'bg-orange-500',
      E: 'bg-red-500',
    };
    return colors[grade] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="records">
            <History className="h-4 w-4 mr-2" />
            评估记录
          </TabsTrigger>
          <TabsTrigger value="recent">
            <BarChart3 className="h-4 w-4 mr-2" />
            最近评估
          </TabsTrigger>
        </TabsList>

        {/* 用户管理 */}
        <TabsContent value="users" className="space-y-4">
          {/* 搜索和创建 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="按姓名搜索..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchByName()}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="按电话搜索..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchByPhone()}
                  />
                </div>
                <Button onClick={searchByName}>
                  <Search className="h-4 w-4 mr-1" />
                  搜索
                </Button>
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      新建用户
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新建用户</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">姓名 *</label>
                        <Input
                          placeholder="请输入姓名"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">电话</label>
                        <Input
                          placeholder="请输入电话（选填）"
                          value={newUserPhone}
                          onChange={(e) => setNewUserPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowUserDialog(false)}>取消</Button>
                      <Button onClick={createUser} disabled={!newUserName.trim() || loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        创建
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* 用户列表 */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无用户记录</p>
                <p className="text-sm">点击"新建用户"添加第一位用户</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user) => (
                <Card 
                  key={user.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => selectUser(user)}>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>评估 {user.assessment_count} 次</span>
                          {user.last_assessment_date && (
                            <span>最近: {format(parseISO(user.last_assessment_date), 'MM-dd HH:mm')}</span>
                          )}
                          {user.avg_score && (
                            <span className={getScoreColor(user.avg_score)}>
                              平均 {Math.round(user.avg_score)} 分
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(user.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 用户记录 */}
        <TabsContent value="records" className="space-y-4">
          {selectedUser ? (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                        ← 返回
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{selectedUser.name}</span>
                        {selectedUser.phone && (
                          <span className="text-sm text-gray-500">{selectedUser.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={compareMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setCompareMode(!compareMode);
                          setSelectedForCompare([]);
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {compareMode ? '取消对比' : '对比模式'}
                      </Button>
                      {compareMode && selectedForCompare.length === 2 && (
                        <Button size="sm" onClick={executeCompare}>
                          执行对比
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userRecords.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>该用户暂无评估记录</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userRecords.map((record, index) => {
                    const prevRecord = userRecords[index + 1];
                    const scoreChange = prevRecord ? record.overall_score - prevRecord.overall_score : 0;
                    
                    return (
                      <Card 
                        key={record.id}
                        className={`cursor-pointer transition-all ${
                          selectedForCompare.includes(record.id) 
                            ? 'ring-2 ring-blue-500' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => compareMode ? toggleCompareSelect(record.id) : loadRecordDetail(record.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className={`text-3xl font-bold ${getScoreColor(record.overall_score)}`}>
                                  {record.overall_score}
                                </div>
                                <div className="text-xs text-gray-500">评分</div>
                              </div>
                              <Badge className={`${getGradeColor(record.grade)} text-white`}>
                                {record.grade}
                              </Badge>
                              {scoreChange !== 0 && (
                                <div className={`flex items-center gap-1 ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {scoreChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                  <span className="text-sm font-medium">
                                    {scoreChange > 0 ? '+' : ''}{scoreChange}
                                  </span>
                                </div>
                              )}
                              <div className="text-sm text-gray-500">
                                {format(parseISO(record.assessment_date), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {record.issues && record.issues.length > 0 && (
                                <Badge variant="outline">
                                  {record.issues.length} 个问题
                                </Badge>
                              )}
                              <Button variant="ghost" size="icon">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {record.ai_summary && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {record.ai_summary}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>请先选择一个用户</p>
                <Button variant="outline" className="mt-2" onClick={() => setActiveTab('users')}>
                  查看用户列表
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 最近评估 */}
        <TabsContent value="recent" className="space-y-4">
          {records.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无评估记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <Card 
                  key={record.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => loadRecordDetail(record.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(record.overall_score)}`}>
                            {record.overall_score}
                          </div>
                        </div>
                        <Badge className={`${getGradeColor(record.grade)} text-white`}>
                          {record.grade}
                        </Badge>
                        <div>
                          <div className="font-medium">{record.name}</div>
                          <div className="text-xs text-gray-500">
                            {format(parseISO(record.assessment_date), 'yyyy-MM-dd HH:mm')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 记录详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>评估详情</DialogTitle>
          </DialogHeader>
          {recordDetail && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(recordDetail.overall_score)}`}>
                      {recordDetail.overall_score}
                    </div>
                    <div className="text-sm text-gray-500">综合评分</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Badge className={`${getGradeColor(recordDetail.grade)} text-white text-lg px-4 py-1`}>
                      {recordDetail.grade}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">评估等级</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <div className="text-sm">
                      {format(parseISO(recordDetail.assessment_date), 'yyyy-MM-dd')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 检测问题 */}
              {recordDetail.issues && recordDetail.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">检测到的问题</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recordDetail.issues.map((issue: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{issue.name}</span>
                          <Badge variant={issue.severity === 'severe' ? 'destructive' : 'secondary'}>
                            {issue.severity === 'mild' ? '轻度' : issue.severity === 'moderate' ? '中度' : '重度'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI分析摘要 */}
              {recordDetail.ai_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI分析摘要</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{recordDetail.ai_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  关闭
                </Button>
                <Button onClick={() => onViewRecord?.(recordDetail)}>
                  查看完整报告
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 对比分析弹窗 */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-blue-600" />
              体态评估对比分析
            </DialogTitle>
          </DialogHeader>
          
          {comparisonResult && (
            <div className="space-y-4">
              {/* 评分变化 */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">上次评分</p>
                  <p className="text-2xl font-bold">{comparisonResult.previousScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">当前评分</p>
                  <p className="text-2xl font-bold">{comparisonResult.currentScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">变化</p>
                  <p className={`text-2xl font-bold ${comparisonResult.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparisonResult.scoreChange >= 0 ? '+' : ''}{comparisonResult.scoreChange}
                  </p>
                </div>
              </div>
              
              {/* 体态问题对比 */}
              {comparisonResult.detailedComparison.postureIssues && comparisonResult.detailedComparison.postureIssues.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-3 py-2 border-b">
                    <h4 className="font-medium text-blue-800">体态问题对比</h4>
                  </div>
                  <div className="divide-y">
                    {comparisonResult.detailedComparison.postureIssues.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-3 p-3 items-center">
                        <div className="text-sm font-medium text-gray-600">{item.name}</div>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-gray-50">{item.previous}</Badge>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="outline" className="bg-gray-50">{item.current}</Badge>
                          {item.change === 'improved' && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {item.change === 'declined' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {item.change === 'changed' && (
                            <Minus className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 肌肉状态对比 */}
              {comparisonResult.detailedComparison.muscles && comparisonResult.detailedComparison.muscles.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-orange-50 px-3 py-2 border-b">
                    <h4 className="font-medium text-orange-800">肌肉状态对比</h4>
                  </div>
                  <div className="divide-y">
                    {comparisonResult.detailedComparison.muscles.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-3 p-3 items-center">
                        <div className="text-sm font-medium text-gray-600">{item.name}</div>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-gray-50">{item.previous}</Badge>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="outline" className="bg-gray-50">{item.current}</Badge>
                          {item.change === 'improved' && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {item.change === 'declined' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {item.change === 'changed' && (
                            <Minus className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 改善项 */}
              {comparisonResult.improvements.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800">改善项</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    {comparisonResult.improvements.map((item, idx) => (
                      <li key={idx}>• {item.name}: {item.previous} → {item.current}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 需关注项 */}
              {comparisonResult.deteriorations.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-red-800">需关注项</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {comparisonResult.deteriorations.map((item, idx) => (
                      <li key={idx}>• {item.name}: {item.previous} → {item.current}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 变化项 */}
              {comparisonResult.changes.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Minus className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">变化项</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {comparisonResult.changes.map((item, idx) => (
                      <li key={idx}>• {item.name}: {item.previous} → {item.current}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 建议 */}
              {comparisonResult.recommendations.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">训练建议</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {comparisonResult.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComparisonDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
