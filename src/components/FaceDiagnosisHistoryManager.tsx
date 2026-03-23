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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, User, History, Plus, ChevronRight, Calendar,
  AlertCircle, Loader2, Users, FileText, Trash2, Eye, X, FileDown,
  GitCompare, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { generateTCMPDFReport, downloadTCMPDF, generateTCMReportFilename, TCMReportData } from '@/lib/tcm-pdf-generator';
import { compareFaceDiagnosisRecords, ComparisonResult } from '@/lib/comparison-utils';

// 用户接口
interface FaceDiagnosisUser {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  diagnosis_count: number;
  last_diagnosis_date: string | null;
}

// 诊断记录接口
interface FaceDiagnosisRecord {
  id: number;
  user_id: number;
  diagnosis_date: string;
  constitution: string | null;
  face_color: string | null;
  health_hints: any[];
  ai_analysis: string | null;
  name: string;
  phone: string;
}

// 记录详情接口
interface FaceDiagnosisDetail extends FaceDiagnosisRecord {
  features: any;
  recommendations: any[];
  image_thumbnail: string;
  full_report: string;
}

interface FaceDiagnosisHistoryManagerProps {
  onViewRecord?: (record: FaceDiagnosisDetail) => void;
  onSelectUser?: (user: FaceDiagnosisUser) => void;
}

export default function FaceDiagnosisHistoryManager({
  onViewRecord,
  onSelectUser,
}: FaceDiagnosisHistoryManagerProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<FaceDiagnosisUser[]>([]);
  const [records, setRecords] = useState<FaceDiagnosisRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<FaceDiagnosisUser | null>(null);
  const [userRecords, setUserRecords] = useState<FaceDiagnosisRecord[]>([]);
  const [recordDetail, setRecordDetail] = useState<FaceDiagnosisDetail | null>(null);
  
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  
  // 对比模式状态
  const [compareMode, setCompareMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // 导出PDF报告
  const handleExportPDF = useCallback(async () => {
    if (!recordDetail) return;
    
    setExportingPDF(true);
    try {
      const reportData: TCMReportData = {
        userName: recordDetail.name || undefined,
        diagnosisDate: recordDetail.diagnosis_date ? 
          new Date(recordDetail.diagnosis_date).toLocaleDateString('zh-CN') : 
          new Date().toLocaleDateString('zh-CN'),
        diagnosisType: 'face',
        constitution: recordDetail.constitution || undefined,
        faceColor: recordDetail.face_color || undefined,
        healthHints: recordDetail.health_hints?.map((h: any) => ({
          category: h.category || '健康提示',
          hint: h.hint || h,
          severity: h.severity || 'low',
        })) || [],
        recommendations: {
          diet: recordDetail.recommendations?.filter((r: any) => r.type === 'diet').map((r: any) => r.content || r) || [],
          lifestyle: recordDetail.recommendations?.filter((r: any) => r.type === 'lifestyle').map((r: any) => r.content || r) || [],
        },
        aiAnalysis: recordDetail.ai_analysis || recordDetail.full_report || undefined,
        imageThumbnail: recordDetail.image_thumbnail || undefined,
      };
      
      const blob = await generateTCMPDFReport(reportData);
      downloadTCMPDF(blob, generateTCMReportFilename('face'));
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请稍后重试');
    } finally {
      setExportingPDF(false);
    }
  }, [recordDetail]);

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/face-diagnosis-records?action=users');
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
      const res = await fetch('/api/face-diagnosis-records?action=recent&limit=20');
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
      
      const res = await fetch(`/api/face-diagnosis-records?${params}`);
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
      const res = await fetch(`/api/face-diagnosis-records?action=userRecords&userId=${userId}`);
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
      const res = await fetch(`/api/face-diagnosis-records?action=detail&recordId=${recordId}`);
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
      const res = await fetch('/api/face-diagnosis-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteRecord', recordId }),
      });
      const data = await res.json();
      if (data.success) {
        // 刷新列表
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
  const handleSelectUser = (user: FaceDiagnosisUser) => {
    setSelectedUser(user);
    loadUserRecords(user.id);
    setActiveTab('records');
    setCompareMode(false);
    setSelectedRecords([]);
    onSelectUser?.(user);
  };
  
  // 切换记录选择（用于对比）
  const toggleRecordSelection = (recordId: number) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      }
      if (prev.length >= 2) {
        return [prev[1], recordId];
      }
      return [...prev, recordId];
    });
  };
  
  // 执行对比分析
  const handleCompare = useCallback(async () => {
    if (selectedRecords.length !== 2) return;
    
    setLoading(true);
    try {
      // 加载两条记录的详情
      const [res1, res2] = await Promise.all([
        fetch(`/api/face-diagnosis-records?action=detail&recordId=${selectedRecords[0]}`),
        fetch(`/api/face-diagnosis-records?action=detail&recordId=${selectedRecords[1]}`),
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      
      if (data1.success && data2.success) {
        // 执行对比（按时间排序，旧记录在前）
        const record1 = data1.data;
        const record2 = data2.data;
        const date1 = new Date(record1.diagnosis_date).getTime();
        const date2 = new Date(record2.diagnosis_date).getTime();
        
        const result = date1 < date2 
          ? compareFaceDiagnosisRecords(record1, record2)
          : compareFaceDiagnosisRecords(record2, record1);
        
        setComparisonResult(result);
        setShowComparisonDialog(true);
      }
    } catch (err) {
      console.error('对比失败:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRecords]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          面诊历史记录
        </CardTitle>
        <CardDescription>管理面诊用户和诊断记录</CardDescription>
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
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
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
            {/* 返回按钮和对比控制 */}
            <div className="flex items-center justify-between">
              {selectedUser && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedUser(null);
                    setCompareMode(false);
                    setSelectedRecords([]);
                  }}>
                    <X className="h-4 w-4 mr-1" />
                    返回用户列表
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm text-gray-600">
                    {selectedUser.name} 的诊断记录
                  </span>
                </div>
              )}
              
              {/* 对比模式控制 */}
              {(selectedUser ? userRecords : records).length >= 2 && (
                <div className="flex items-center gap-2">
                  {compareMode ? (
                    <>
                      <span className="text-sm text-blue-600">
                        已选择 {selectedRecords.length}/2 条记录
                      </span>
                      <Button 
                        size="sm" 
                        onClick={handleCompare}
                        disabled={selectedRecords.length !== 2}
                      >
                        <GitCompare className="h-4 w-4 mr-1" />
                        开始对比
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCompareMode(false);
                          setSelectedRecords([]);
                        }}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCompareMode(true)}
                    >
                      <GitCompare className="h-4 w-4 mr-1" />
                      对比分析
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* 记录列表 */}
            <ScrollArea className="h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                      className={`p-3 rounded-lg transition-colors ${
                        selectedRecords.includes(record.id) 
                          ? 'bg-blue-50 border-2 border-blue-300' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } ${compareMode ? 'cursor-pointer' : ''}`}
                      onClick={() => compareMode && toggleRecordSelection(record.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {compareMode && (
                            <Checkbox 
                              checked={selectedRecords.includes(record.id)}
                              onCheckedChange={() => toggleRecordSelection(record.id)}
                            />
                          )}
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(parseISO(record.diagnosis_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadRecordDetail(record.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecord(record.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {record.constitution && (
                          <Badge variant="outline">{record.constitution}</Badge>
                        )}
                        {record.face_color && (
                          <Badge variant="outline" className="bg-orange-50">
                            {record.face_color}
                          </Badge>
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
            <DialogTitle>诊断详情</DialogTitle>
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
              
              <div>
                <p className="text-sm text-gray-500 mb-1">体质判断</p>
                <Badge>{recordDetail.constitution || '未判断'}</Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">面色分析</p>
                <p className="text-sm">{recordDetail.face_color || '无'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">AI分析</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {recordDetail.ai_analysis || recordDetail.full_report || '无'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button onClick={handleExportPDF} disabled={exportingPDF}>
              {exportingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              导出报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 对比结果弹窗 */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              对比分析结果
            </DialogTitle>
          </DialogHeader>
          {comparisonResult && (
            <div className="space-y-6">
              {/* 趋势总览 */}
              <div className={`p-4 rounded-lg ${
                comparisonResult.trend === 'improving' ? 'bg-green-50' :
                comparisonResult.trend === 'declining' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {comparisonResult.trend === 'improving' && (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700">整体趋势：改善中</span>
                    </>
                  )}
                  {comparisonResult.trend === 'declining' && (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-700">整体趋势：需关注</span>
                    </>
                  )}
                  {comparisonResult.trend === 'stable' && (
                    <>
                      <Minus className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-700">整体趋势：稳定</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  基于 {selectedRecords.length} 次评估记录的对比分析
                </p>
              </div>
              
              {/* 改善项 */}
              {comparisonResult.improvements.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    改善项目
                  </h4>
                  <div className="space-y-2">
                    {comparisonResult.improvements.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="font-medium">{item.name}</span>
                        <div className="text-sm">
                          <span className="text-gray-500">{item.previous}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600 font-medium">{item.current}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 退步项 */}
              {comparisonResult.deteriorations.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    需关注项目
                  </h4>
                  <div className="space-y-2">
                    {comparisonResult.deteriorations.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="font-medium">{item.name}</span>
                        <div className="text-sm">
                          <span className="text-gray-500">{item.previous}</span>
                          <span className="mx-2">→</span>
                          <span className="text-red-600 font-medium">{item.current}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 稳定项 */}
              {comparisonResult.stableItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Minus className="h-4 w-4" />
                    稳定项目
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.stableItems.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 五脏状态对比 */}
              {comparisonResult.organStatusComparison && (
                <div>
                  <h4 className="font-medium mb-2">五脏状态变化</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(comparisonResult.organStatusComparison).map(([organ, data]) => (
                      <div key={organ} className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">{getOrganName(organ)}</p>
                        <p className={`font-bold ${data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {data.change > 0 ? '+' : ''}{data.change}
                        </p>
                        <p className="text-xs text-gray-400">{data.previous} → {data.current}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 建议 */}
              {comparisonResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">健康建议</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {comparisonResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
    </Card>
  );
}

// 辅助函数
function getOrganName(organ: string): string {
  const names: Record<string, string> = {
    heart: '心',
    liver: '肝',
    spleen: '脾',
    lung: '肺',
    kidney: '肾',
  };
  return names[organ] || organ;
}
