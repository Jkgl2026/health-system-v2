'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

interface CreateUserRequest {
  name: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    phone: '',
    age: undefined,
    gender: undefined,
  });

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开新建对话框
  const handleCreateNew = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      age: undefined,
      gender: undefined,
    });
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone || '',
      age: user.age,
      gender: user.gender,
    });
    setIsDialogOpen(true);
  };

  // 删除用户
  const handleDelete = async (userId: string) => {
    if (!confirm('确定要删除该用户吗？')) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        alert('用户删除成功');
        loadUsers();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除失败');
    }
  };

  // 保存用户
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入用户姓名');
      return;
    }

    try {
      if (editingUser) {
        // 更新用户
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            ...formData,
          }),
        });
        const result = await response.json();

        if (result.success) {
          alert('用户更新成功');
          setIsDialogOpen(false);
          loadUsers();
        } else {
          alert('更新失败：' + result.error);
        }
      } else {
        // 创建用户
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (result.success) {
          alert('用户创建成功');
          setIsDialogOpen(false);
          loadUsers();
        } else {
          alert('创建失败：' + result.error);
        }
      }
    } catch (error) {
      console.error('保存用户失败:', error);
      alert('保存失败');
    }
  };

  // 过滤用户
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">用户管理</h1>
          <p className="text-gray-600">管理系统中的所有用户信息</p>
        </div>

        {/* 操作栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="搜索用户姓名或电话..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新建用户
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>共 {filteredUsers.length} 位用户</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? '未找到匹配的用户' : '暂无用户数据，请点击"新建用户"添加'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>电话</TableHead>
                    <TableHead>年龄</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.age || '-'}</TableCell>
                      <TableCell>
                        {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : user.gender === 'other' ? '其他' : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        {new Date(user.updated_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '新建用户'}</DialogTitle>
            <DialogDescription>
              {editingUser ? '修改用户信息' : '填写新用户信息'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="请输入姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">电话</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入电话号码"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">年龄</Label>
              <Input
                id="age"
                type="number"
                placeholder="请输入年龄"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
