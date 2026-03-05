'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, ArrowLeft, Settings, Users, UserPlus, Key, Trash2, 
  AlertCircle, CheckCircle, RefreshCw, Shield, Activity, Clock,
  UserCheck, UserX, Eye, EyeOff
} from 'lucide-react';

interface Admin {
  id: string;
  username: string;
  name: string | null;
  createdAt: Date;
  isActive: boolean;
}

interface LoginLog {
  id: string;
  adminId: string;
  username: string;
  loginTime: Date;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  
  // 表单数据
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 消息
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchAdmins();
    fetchLoginLogs();
  }, []);

  const checkAuth = async () => {
    // 首先检查 localStorage 快速缓存
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    // 然后验证 Cookie 是否有效
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('认证验证失败:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/admins', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch('/api/admin/login-logs?limit=50', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setLoginLogs(data.data);
      }
    } catch (error) {
      console.error('获取登录日志失败:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newUsername || !newPassword) {
      setMessage({ type: 'error', text: '用户名和密码不能为空' });
      return;
    }

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '管理员添加成功' });
        setShowAddDialog(false);
        setNewUsername('');
        setNewPassword('');
        setNewName('');
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || '添加失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '添加失败，请重试' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdatePassword = async () => {
    if (!resetPassword) {
      setMessage({ type: 'error', text: '新密码不能为空' });
      return;
    }

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedAdmin?.id,
          newPassword: resetPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '密码重置成功' });
        setShowPasswordDialog(false);
        setResetPassword('');
        setSelectedAdmin(null);
      } else {
        setMessage({ type: 'error', text: data.error || '重置失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '重置失败，请重试' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: admin.id,
          isActive: !admin.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: admin.isActive ? '已停用账号' : '已启用账号' });
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || '操作失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失败，请重试' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch(`/api/admin/admins?id=${selectedAdmin.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '管理员删除成功' });
        setShowDeleteDialog(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '删除失败，请重试' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div className="w-px h-6 bg-gray-200" />
              <div className="bg-slate-600 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">系统设置</h1>
                <p className="text-xs text-gray-500">管理员账号 · 登录日志</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchAdmins(); fetchLoginLogs(); }} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        {message && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="admins">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              管理员账号
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              登录日志
            </TabsTrigger>
          </TabsList>

          {/* 管理员账号管理 */}
          <TabsContent value="admins">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-600" />
                      管理员账号列表
                    </CardTitle>
                    <CardDescription>
                      共 {admins.length} 个管理员账号
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    添加管理员
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.username}</TableCell>
                        <TableCell>{admin.name || '-'}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(admin.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={admin.isActive ? 'default' : 'secondary'} className={admin.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                            {admin.isActive ? '正常' : '已停用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowPasswordDialog(true);
                              }}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              重置密码
                            </Button>
                            <Button
                              variant={admin.isActive ? 'secondary' : 'default'}
                              size="sm"
                              onClick={() => handleToggleStatus(admin)}
                              className={admin.isActive ? 'text-orange-600' : 'bg-green-600 hover:bg-green-700'}
                            >
                              {admin.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  停用
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  启用
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 登录日志 */}
          <TabsContent value="logs">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  登录日志
                </CardTitle>
                <CardDescription>
                  最近 50 条登录记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>登录时间</TableHead>
                      <TableHead>IP地址</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>失败原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.username}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(log.loginTime)}</TableCell>
                        <TableCell>{log.ipAddress || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={log.success ? 'default' : 'destructive'} className={log.success ? 'bg-green-500' : ''}>
                            {log.success ? '成功' : '失败'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-red-600">{log.failureReason || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {loginLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          暂无登录记录
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加管理员对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              添加新管理员
            </DialogTitle>
            <DialogDescription>
              创建新的管理员账号
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="请输入姓名（可选）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddAdmin} className="bg-emerald-600 hover:bg-emerald-700">
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              重置密码
            </DialogTitle>
            <DialogDescription>
              为 {selectedAdmin?.username} 重置密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetPassword">新密码</Label>
              <div className="relative">
                <Input
                  id="resetPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="请输入新密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              取消
            </Button>
            <Button onClick={handleUpdatePassword}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              确认删除
            </DialogTitle>
            <DialogDescription>
              确定要删除管理员 "{selectedAdmin?.username}" 吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
