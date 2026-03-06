'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, Heart, Eye, Calendar, Activity, 
  AlertCircle, Loader2, LogOut, User
} from 'lucide-react';

interface HealthProfile {
  id: string;
  user_id: string | null;
  face_diagnosis_count: number;
  tongue_diagnosis_count: number;
  latest_face_score: number | null;
  latest_tongue_score: number | null;
  latest_score: number | null;
  constitution: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminHealthProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    fetchProfiles();
  }, [router]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/health-profiles');
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data || []);
      } else {
        setError(data.error || '获取健康档案失败');
      }
    } catch {
      setError('获取健康档案失败');
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (profile: HealthProfile) => {
    setSelectedProfile(profile);
    setShowDetail(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline">未评分</Badge>;
    if (score >= 80) return <Badge className="bg-green-500">{score}分</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">{score}分</Badge>;
    return <Badge className="bg-red-500">{score}分</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">用户健康档案</h1>
                <p className="text-sm text-muted-foreground">综合健康评估记录</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />退出
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>健康档案列表</CardTitle>
            <CardDescription>共 {profiles.length} 个档案</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无健康档案
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户ID</TableHead>
                    <TableHead>面诊次数</TableHead>
                    <TableHead>舌诊次数</TableHead>
                    <TableHead>面诊评分</TableHead>
                    <TableHead>舌诊评分</TableHead>
                    <TableHead>综合评分</TableHead>
                    <TableHead>体质类型</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.user_id?.substring(0, 8) || '匿名'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{profile.face_diagnosis_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{profile.tongue_diagnosis_count}</Badge>
                      </TableCell>
                      <TableCell>{getScoreBadge(profile.latest_face_score)}</TableCell>
                      <TableCell>{getScoreBadge(profile.latest_tongue_score)}</TableCell>
                      <TableCell>
                        {profile.latest_score ? (
                          <span className="font-bold text-lg text-indigo-600">{profile.latest_score}</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {profile.constitution || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(profile.updated_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => viewDetail(profile)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 详情对话框 */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>健康档案详情</DialogTitle>
              <DialogDescription>
                {selectedProfile && formatDate(selectedProfile.updated_at)}
              </DialogDescription>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">面诊次数</div>
                      <div className="text-3xl font-bold text-cyan-600">{selectedProfile.face_diagnosis_count}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">舌诊次数</div>
                      <div className="text-3xl font-bold text-purple-600">{selectedProfile.tongue_diagnosis_count}</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white text-center">
                  <div className="text-sm opacity-80">综合健康评分</div>
                  <div className="text-5xl font-bold">{selectedProfile.latest_score || '-'}</div>
                </div>
                {selectedProfile.constitution && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      体质类型
                    </h4>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-semibold text-purple-700 dark:text-purple-300">
                        {selectedProfile.constitution}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
