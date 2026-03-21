'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, User, History, Plus, ChevronRight, Calendar,
  AlertCircle, Loader2, Users, FileText, Trash2, Eye, X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 用户接口
interface TongueDiagnosisUser {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  diagnosis_count: number;
  last_diagnosis_date: string | null;
}

// 诊断记录接口
interface TongueDiagnosisRecord {
  id: number;
  user_id: number;
  diagnosis_date: string;
  tongue_color: string | null;
  tongue_coating: string | null;
  tongue_shape: string | null;
  constitution: string | null;
  health_hints: any[];
  ai_analysis: string | null;
  name: string;
  phone: string;
}

// 记录详情接口
interface TongueDiagnosisDetail extends TongueDiagnosisRecord {
  features: any;
  recommendations: any[];
  image_thumbnail: string;
  full_report: string;
}

interface TongueDiagnosisHistoryManagerProps {
  onViewRecord?: (record: TongueDiagnosisDetail) => void;
  onSelectUser?: (user: TongueDiagnosisUser) => void;
}

export default function TongueDiagnosisHistoryManager({
  onViewRecord,
  onSelectUser,
}: TongueDiagnosisHistoryManagerProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<TongueDiagnosisUser[]>([]);
  const [records, setRecords] = useState<TongueDiagnosisRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<TongueDiagnosisUser | null>(null);
  const [userRecords, setUserRecords] = useState<TongueDiagnosisRecord[]>([]);
  const [recordDetail, setRecordDetail] = useState<TongueDiagnosisDetail | null>(null);
  
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tongue-diagnosis-records?action=users');
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
      const res = await fetch('/api/tongue-diagnosis-records?action=recent&limit=20');
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

  // 搜索用户
  const searchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'search' });
      if (searchName) params.append('name', searchName);
      if (searchPhone) params.append('phone', searchPhone);
      
      const res = await fetch(`/api/tongue-diagnosis-records?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchPhone]);

  // 加载用户的记录
  const loadUserRecords = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tongue-diagnosis-records?action=userRecords&userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserRecords(data.data);
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
      const res = await fetch(`/api/tongue-diagnosis-records?action=detail&recordId=${recordId}`);
      const data = await res.json();
      if (data.success) {
        setRecordDetail(data.data);
        setShowDetailDialog(true);
      }
    } catch (err) {
      console.error('加载详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除记录
  const deleteRecord = useCallback(async (recordId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      const res = await fetch('/api/tongue-diagnosis-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteRecord', recordId }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedUser) {
          loadUserRecords(selectedUser.id);
        }
        loadRecentRecords();
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  }, [selectedUser, loadUserRecords, loadRecentRecords]);

  // 初始化加载
  useEffect(() => {
    loadUsers();
    loadRecentRecords();
  }, [loadUsers, loadRecentRecords]);

  // 选择用户
  const handleSelectUser = (user: TongueDiagnosisUser) => {
    setSelectedUser(user);
    loadUserRecords(user.id);
    setActiveTab('records');
    onSelectUser?.(user);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          舌诊历史记录
        </CardTitle>
        <CardDescription>管理舌诊用户和诊断记录</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">用户列表</TabsTrigger>
            <TabsTrigger value="records">诊断记录</TabsTrigger>
          </TabsList>
          
          {/* 用户列表 */}
          <TabsContent value="users" className="space-y-4">
            {/* 搜索框 */}
            <div className="flex gap-2">
              <Input
                placeholder="姓名"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="电话"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1"
              />
              <Button onClick={searchUsers} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 用户列表 */}
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无用户记录</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">
                            {user.phone || '未填写电话'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{user.diagnosis_count} 次诊断</Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.last_diagnosis_date 
                            ? format(parseISO(user.last_diagnosis_date), 'MM-dd HH:mm', { locale: zhCN })
                            : '无记录'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* 诊断记录 */}
          <TabsContent value="records" className="space-y-4">
            {/* 返回按钮 */}
            {selectedUser && (
              <div className="flex items-center gap-2 pb-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  <X className="h-4 w-4 mr-1" />
                  返回用户列表
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-gray-600">
                  {selectedUser.name} 的诊断记录
                </span>
              </div>
            )}
            
            {/* 记录列表 */}
            <ScrollArea className="h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                </div>
              ) : (selectedUser ? userRecords : records).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无诊断记录</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(selectedUser ? userRecords : records).map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(parseISO(record.diagnosis_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadRecordDetail(record.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {record.tongue_color && (
                          <Badge variant="outline" className="bg-red-50">
                            舌色: {record.tongue_color}
                          </Badge>
                        )}
                        {record.tongue_coating && (
                          <Badge variant="outline" className="bg-yellow-50">
                            舌苔: {record.tongue_coating}
                          </Badge>
                        )}
                        {record.tongue_shape && (
                          <Badge variant="outline" className="bg-purple-50">
                            舌形: {record.tongue_shape}
                          </Badge>
                        )}
                        {record.constitution && (
                          <Badge variant="outline">{record.constitution}</Badge>
                        )}
                      </div>
                      
                      {!selectedUser && (
                        <p className="text-xs text-gray-500 mt-2">
                          用户: {record.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* 详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>舌诊详情</DialogTitle>
          </DialogHeader>
          {recordDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">用户</p>
                  <p className="font-medium">{recordDetail.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">诊断时间</p>
                  <p className="font-medium">
                    {format(parseISO(recordDetail.diagnosis_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">舌色</p>
                  <Badge className="bg-red-100 text-red-700">
                    {recordDetail.tongue_color || '未判断'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">舌苔</p>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    {recordDetail.tongue_coating || '未判断'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">舌形</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    {recordDetail.tongue_shape || '未判断'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">体质判断</p>
                  <Badge>{recordDetail.constitution || '未判断'}</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">AI分析</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {recordDetail.ai_analysis || recordDetail.full_report || '无'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
