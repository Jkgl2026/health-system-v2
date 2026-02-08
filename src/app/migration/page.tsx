'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LocalUserData {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  bloodPressure: string | null;
  occupation: string | null;
  address: string | null;
  bmi: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function DataMigrationPage() {
  const [localUsers, setLocalUsers] = useState<LocalUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<{ name: string; success: boolean; message: string }[]>([]);

  useEffect(() => {
    loadLocalUsers();
  }, []);

  const loadLocalUsers = () => {
    try {
      // 从 localStorage 读取用户数据
      const userData = localStorage.getItem('healthUserData');
      if (userData) {
        const user = JSON.parse(userData);
        setLocalUsers([user]);
      } else {
        setLocalUsers([]);
      }
    } catch (error) {
      console.error('读取本地数据失败:', error);
      setLocalUsers([]);
    }
  };

  const syncToDatabase = async (user: LocalUserData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/user/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          email: user.email,
          age: user.age,
          gender: user.gender,
          weight: user.weight,
          height: user.height,
          bloodPressure: user.bloodPressure,
          occupation: user.occupation,
          address: user.address,
          bmi: user.bmi,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSyncResults(prev => [...prev, {
          name: user.name || '未知用户',
          success: true,
          message: `同步成功，User ID: ${result.data.userId}`
        }]);
      } else {
        setSyncResults(prev => [...prev, {
          name: user.name || '未知用户',
          success: false,
          message: result.msg || '同步失败'
        }]);
      }
    } catch (error) {
      setSyncResults(prev => [...prev, {
        name: user.name || '未知用户',
        success: false,
        message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const syncAll = async () => {
    setSyncResults([]);

    for (const user of localUsers) {
      await syncToDatabase(user);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">数据迁移工具</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          此工具用于将浏览器 localStorage 中的真实用户数据同步到服务器数据库。
          同步后，您可以在后台用户管理页面看到这些用户。
        </AlertDescription>
      </Alert>

      {localUsers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>未发现本地数据</CardTitle>
            <CardDescription>
              浏览器 localStorage 中没有找到用户数据。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>本地用户数据</CardTitle>
              <CardDescription>
                发现 {localUsers.length} 个用户数据保存在 localStorage 中
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>年龄</TableHead>
                    <TableHead>身高</TableHead>
                    <TableHead>体重</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>职业</TableHead>
                    <TableHead>地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.gender || '-'}</TableCell>
                      <TableCell>{user.age || '-'}</TableCell>
                      <TableCell>{user.height || '-'}</TableCell>
                      <TableCell>{user.weight || '-'}</TableCell>
                      <TableCell>{user.bmi || '-'}</TableCell>
                      <TableCell>{user.occupation || '-'}</TableCell>
                      <TableCell>{user.address || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex gap-4">
                <Button
                  onClick={syncAll}
                  disabled={loading || localUsers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? '同步中...' : '同步到数据库'}
                </Button>
                <Button
                  onClick={loadLocalUsers}
                  variant="outline"
                >
                  刷新数据
                </Button>
              </div>
            </CardContent>
          </Card>

          {syncResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>同步结果</CardTitle>
                <CardDescription>
                  {syncResults.filter(r => r.success).length} / {syncResults.length} 成功
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {syncResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        result.success
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {syncResults.some(r => r.success) && (
                  <div className="mt-6">
                    <Button
                      onClick={() => window.location.href = '/admin/users'}
                      className="w-full"
                    >
                      去后台用户管理页面查看
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
