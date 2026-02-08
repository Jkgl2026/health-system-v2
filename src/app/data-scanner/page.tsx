'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, AlertCircle, CheckCircle2, Search, RefreshCw } from 'lucide-react';

interface StorageData {
  key: string;
  data: any;
  type: 'localStorage' | 'sessionStorage';
  timestamp: string;
}

interface UserRecord {
  source: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  occupation: string;
  address: string;
  bloodPressure: string;
  rawData: any;
}

export default function DataScannerPage() {
  const [scannedData, setScannedData] = useState<UserRecord[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<{ name: string; success: boolean; message: string }[]>([]);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    scanStorage();
  }, []);

  const scanStorage = () => {
    const users: UserRecord[] = [];
    const storageKeys = [
      'healthUserData',
      'userData',
      'userProfile',
      'userInfo',
      'personalInfo',
      'formData',
      'healthFormData'
    ];

    // 扫描 localStorage
    for (const key of storageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const userRecord = extractUserData(parsed, key, 'localStorage');
          if (userRecord) {
            users.push(userRecord);
          }
        }
      } catch (error) {
        console.error(`扫描 ${key} 失败:`, error);
      }
    }

    // 扫描所有 localStorage 键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !storageKeys.includes(key)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // 检查是否包含用户相关信息
            if (typeof parsed === 'object' && (
              parsed.name ||
              parsed.phone ||
              parsed.email ||
              parsed.age ||
              parsed.gender
            )) {
              const userRecord = extractUserData(parsed, key, 'localStorage');
              if (userRecord && userRecord.name) {
                users.push(userRecord);
              }
            }
          }
        } catch (error) {
          // 忽略解析错误
        }
      }
    }

    // 扫描 sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const data = sessionStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (typeof parsed === 'object' && (
              parsed.name ||
              parsed.phone ||
              parsed.email
            )) {
              const userRecord = extractUserData(parsed, key, 'sessionStorage');
              if (userRecord && userRecord.name) {
                users.push(userRecord);
              }
            }
          }
        } catch (error) {
          // 忽略解析错误
        }
      }
    }

    // 去重（按姓名和手机号）
    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex((u) =>
        u.name === user.name && u.phone === user.phone
      )
    );

    setScannedData(uniqueUsers);
    setScanCount(uniqueUsers.length);
  };

  const extractUserData = (data: any, source: string, type: 'localStorage' | 'sessionStorage'): UserRecord | null => {
    if (!data || typeof data !== 'object') return null;

    const name = data.name || data.userName || data.username || data.fullName || null;
    if (!name) return null;

    return {
      source: `${type}:${source}`,
      name,
      phone: data.phone || data.mobile || data.phoneNumber || null,
      email: data.email || data.mail || null,
      age: data.age || null,
      gender: data.gender || data.sex || null,
      height: data.height || null,
      weight: data.weight || null,
      bmi: data.bmi || data.BMI || null,
      occupation: data.occupation || data.job || data.work || null,
      address: data.address || data.location || null,
      bloodPressure: data.bloodPressure || data.blood_pressure || null,
      rawData: data
    };
  };

  const toggleSelect = (index: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index.toString())) {
        newSet.delete(index.toString());
      } else {
        newSet.add(index.toString());
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === scannedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(scannedData.map((_, i) => i.toString())));
    }
  };

  const syncSelected = async () => {
    const selectedUsers = scannedData.filter((_, i) =>
      selectedItems.has(i.toString())
    );

    if (selectedUsers.length === 0) {
      alert('请先选择要同步的用户数据');
      return;
    }

    setLoading(true);
    setSyncResults([]);

    try {
      const response = await fetch('/api/migration/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: selectedUsers.map(user => ({
            name: user.name,
            phone: user.phone,
            email: user.email,
            age: user.age,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            blood_pressure_high: user.rawData?.blood_pressure_high || null,
            blood_pressure_low: user.rawData?.blood_pressure_low || null,
            blood_sugar: user.rawData?.blood_sugar || null,
            blood_fat: user.rawData?.blood_fat || null,
            sleep_hours: user.rawData?.sleep_hours || null,
            exercise_hours: user.rawData?.exercise_hours || null,
            smoking: user.rawData?.smoking || null,
            drinking: user.rawData?.drinking || null,
            diet: user.rawData?.diet || null,
            chronic_disease: user.rawData?.chronic_disease || null,
            medication: user.rawData?.medication || null,
            family_history: user.rawData?.family_history || null,
            symptoms: user.rawData?.symptoms || null,
            answer_content: user.rawData?.answer_content || null,
            analysis: user.rawData?.analysis || null,
            health_status: user.rawData?.health_status || null,
            health_score: user.rawData?.health_score || 0,
            self_check_completed: user.rawData?.self_check_completed || false
          }))
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSyncResults(result.data.results.map((r: any) => ({
          name: r.name,
          success: r.success,
          message: r.success
            ? `${r.action === 'created' ? '创建成功' : '更新成功'}, User ID: ${r.userId}`
            : `失败: ${r.error}`
        })));
      }
    } catch (error) {
      setSyncResults([{
        name: '系统',
        success: false,
        message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">真实数据扫描与迁移工具</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          此工具会扫描浏览器中的所有存储空间（localStorage、sessionStorage），查找真实的用户数据。
          找到后，您可以选择将这些数据同步到数据库，然后在后台用户管理页面查看。
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>扫描结果</CardTitle>
          <CardDescription>
            发现 {scanCount} 个用户数据记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Button
              onClick={scanStorage}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新扫描
            </Button>
            <Button
              onClick={syncSelected}
              disabled={loading || selectedItems.size === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              同续选中的数据到数据库 ({selectedItems.size})
            </Button>
          </div>

          {scannedData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              未发现用户数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.size === scannedData.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>年龄</TableHead>
                    <TableHead>身高</TableHead>
                    <TableHead>体重</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>职业</TableHead>
                    <TableHead>地址</TableHead>
                    <TableHead>血压</TableHead>
                    <TableHead>数据来源</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scannedData.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(index.toString())}
                          onCheckedChange={() => toggleSelect(index)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.gender || '-'}</TableCell>
                      <TableCell>{user.age || '-'}</TableCell>
                      <TableCell>{user.height || '-'}</TableCell>
                      <TableCell>{user.weight || '-'}</TableCell>
                      <TableCell>{user.bmi || '-'}</TableCell>
                      <TableCell>{user.occupation || '-'}</TableCell>
                      <TableCell>{user.address || '-'}</TableCell>
                      <TableCell>{user.bloodPressure || '-'}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {user.source}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
                  去后台用户管理页面查看真实数据
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
