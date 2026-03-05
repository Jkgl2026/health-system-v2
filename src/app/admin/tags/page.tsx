'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pagination } from '@/components/admin/Pagination';
import { PREDEFINED_TAGS_FLAT } from '@/lib/health-constants';
import { 
  LogOut, ArrowLeft, Tags, RefreshCw, Filter, 
  User, CheckCircle, X, Search
} from 'lucide-react';

// 使用统一的预定义标签
const PREDEFINED_TAGS = PREDEFINED_TAGS_FLAT;

interface UserWithTag {
  id: string;
  name: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  tags: string[];
  createdAt: Date;
}

interface TagStats {
  [key: string]: number;
}

export default function TagsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithTag[]>([]);
  const [tagStats, setTagStats] = useState<TagStats>({});
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithTag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setMounted(true);
    checkAuth();
    fetchTagStats();
    fetchUsers();
  }, [currentPage, selectedTag]);

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

  const fetchTagStats = async () => {
    try {
      const response = await fetch('/api/admin/tags?action=stats', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setTagStats(data.data.tagStats);
      }
    } catch (error) {
      console.error('获取标签统计失败:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        // 过滤标签
        let filteredUsers = data.data.map((u: any) => ({
          id: u.user.id,
          name: u.user.name,
          phone: u.user.phone,
          age: u.user.age,
          gender: u.user.gender,
          tags: (u.user.tags as string[]) || [],
          createdAt: u.user.createdAt,
        }));

        if (selectedTag) {
          filteredUsers = filteredUsers.filter((u: UserWithTag) => u.tags.includes(selectedTag));
        }

        setUsers(filteredUsers);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag('');
    } else {
      setSelectedTag(tagId);
    }
    setCurrentPage(1);
  };

  const handleUserTagClick = (user: UserWithTag) => {
    setSelectedUser(user);
    setSelectedTags(user.tags);
    setShowTagDialog(true);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSaveTags = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser.id,
          tagIds: selectedTags,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 更新本地状态
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, tags: selectedTags } : u
        ));
        setShowTagDialog(false);
        fetchTagStats();
      }
    } catch (error) {
      console.error('保存标签失败:', error);
    }
  };

  const handleRemoveTag = async (userId: string, tagId: string) => {
    try {
      const response = await fetch(`/api/admin/tags?userId=${userId}&tagId=${tagId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, tags: data.data.tags } : u
        ));
        fetchTagStats();
      }
    } catch (error) {
      console.error('移除标签失败:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const getTagName = (tagId: string) => {
    const tag = PREDEFINED_TAGS.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  const getTagColor = (tagId: string) => {
    const tag = PREDEFINED_TAGS.find(t => t.id === tagId);
    return tag?.color || '#6b7280';
  };

  // 等待客户端挂载
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
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
              <div className="bg-violet-500 p-2 rounded-lg">
                <Tags className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">用户标签管理</h1>
                <p className="text-xs text-gray-500">分类管理 · 快速筛选 · 精准营销</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchTagStats(); fetchUsers(); }} disabled={loading}>
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
        {/* 标签统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {PREDEFINED_TAGS.map(tag => (
            <Card 
              key={tag.id} 
              className={`cursor-pointer transition-all ${selectedTag === tag.id ? 'ring-2 ring-violet-500' : ''}`}
              onClick={() => handleTagClick(tag.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{tag.name}</p>
                    <p className="text-xl font-bold">{tagStats[tag.id] || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 当前筛选 */}
        {selectedTag && (
          <Alert className="mb-4 border-violet-200 bg-violet-50">
            <Filter className="h-4 w-4 text-violet-600" />
            <AlertDescription className="text-violet-700">
              当前筛选: <Badge style={{ backgroundColor: getTagColor(selectedTag) }} className="ml-2">
                {getTagName(selectedTag)}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                onClick={() => setSelectedTag('')}
              >
                清除筛选
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 用户列表 */}
        <Card className="border-violet-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-violet-500" />
              用户标签列表
            </CardTitle>
            <CardDescription>
              点击用户的标签可进行编辑
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || '-'}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{user.age || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 cursor-pointer" onClick={() => handleUserTagClick(user)}>
                            {user.tags.length === 0 ? (
                              <Badge variant="outline" className="text-gray-400">无标签</Badge>
                            ) : (
                              user.tags.map(tagId => (
                                <Badge 
                                  key={tagId}
                                  style={{ backgroundColor: getTagColor(tagId) }}
                                  className="relative group"
                                >
                                  {getTagName(tagId)}
                                  <X 
                                    className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveTag(user.id, tagId);
                                    }}
                                  />
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserTagClick(user)}
                          >
                            编辑标签
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={users.length}
                    limit={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onLimitChange={(limit) => {
                      // 简化处理，不实现limit变更
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 标签编辑对话框 */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-violet-500" />
              编辑用户标签
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.phone || '用户'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-600">健康标签</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.filter(t => t.category === 'health').map(tag => (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer transition-all ${selectedTags.includes(tag.id) ? '' : 'opacity-50'}`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#e5e7eb',
                      color: selectedTags.includes(tag.id) ? 'white' : '#374151'
                    }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {selectedTags.includes(tag.id) && <CheckCircle className="h-3 w-3 mr-1" />}
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-600">行为标签</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.filter(t => t.category === 'behavior').map(tag => (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer transition-all ${selectedTags.includes(tag.id) ? '' : 'opacity-50'}`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#e5e7eb',
                      color: selectedTags.includes(tag.id) ? 'white' : '#374151'
                    }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {selectedTags.includes(tag.id) && <CheckCircle className="h-3 w-3 mr-1" />}
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTags} className="bg-violet-600 hover:bg-violet-700">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
