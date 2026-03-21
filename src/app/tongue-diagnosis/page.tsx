'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Camera, Loader2, FileText, AlertCircle, CheckCircle2, RotateCcw,
  Download, Copy, Sparkles, ArrowLeft, Heart, History, User
} from 'lucide-react';
import dynamic from 'next/dynamic';

// 动态导入历史记录组件
const TongueDiagnosisHistoryManager = dynamic(
  () => import('@/components/TongueDiagnosisHistoryManager'),
  { ssr: false }
);

export default function UserTongueDiagnosisPage() {
  const router = useRouter();
  
  // 用户信息
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const [userId, setUserId] = useState<number | null>(null);
  
  // 图片相关
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文件选择处理
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }
    setError(null);
    setResult(null);
    setResultData(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // 创建或查找用户
  const ensureUser = async (): Promise<number | null> => {
    if (!userInfo.name.trim()) {
      setError('请填写姓名');
      return null;
    }

    try {
      const res = await fetch('/api/tongue-diagnosis-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUser',
          name: userInfo.name.trim(),
          phone: userInfo.phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        setUserId(data.data.id);
        return data.data.id;
      }
      return null;
    } catch (err) {
      console.error('创建用户失败:', err);
      return null;
    }
  };

  // 提交分析
  const handleSubmit = async () => {
    if (!image) return;
    if (!userInfo.name.trim()) {
      setError('请填写姓名');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultData(null);

    try {
      // 1. 创建或查找用户
      const uid = await ensureUser();
      if (!uid) {
        setError('用户信息保存失败');
        setLoading(false);
        return;
      }

      // 2. 调用舌诊 API
      const response = await fetch('/api/tongue-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data.diagnosis);
        setResultData(data.data);

        // 3. 保存诊断记录到数据库
        try {
          await fetch('/api/tongue-diagnosis-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'saveDiagnosis',
              userId: uid,
              diagnosisData: {
                tongueColor: data.data?.tongueColor,
                tongueCoating: data.data?.tongueCoating,
                tongueShape: data.data?.tongueShape,
                constitution: data.data?.constitution,
                features: data.data?.features || {},
                healthHints: data.data?.healthHints || [],
                aiAnalysis: data.data?.diagnosis,
                recommendations: data.data?.recommendations || [],
                imageThumbnail: image?.substring(0, 1000),
                fullReport: data.data?.diagnosis,
              },
            }),
          });
          console.log('[TongueDiagnosis] 诊断记录已保存');
        } catch (saveErr) {
          console.error('[TongueDiagnosis] 保存记录失败:', saveErr);
        }
      } else {
        setError(data.error || '分析失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setImage(null);
    setImageName('');
    setResult(null);
    setResultData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 复制结果
  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // 下载报告
  const handleDownload = () => {
    if (!result) return;
    
    const report = `中医舌诊报告
================
姓名: ${userInfo.name}
分析时间: ${new Date().toLocaleString('zh-CN')}

${result}
`;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `舌诊报告_${userInfo.name}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 从历史记录选择用户
  const handleSelectUserFromHistory = (user: any) => {
    setUserInfo({ name: user.name, phone: user.phone || '' });
    setUserId(user.id);
    setShowHistory(false);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 舌诊分析</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4 mr-1" />历史记录
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">上传诊断</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* 用户信息输入 */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  用户信息
                </CardTitle>
                <CardDescription>请填写您的姓名和电话（电话选填），用于保存和查询历史记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="请输入姓名"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">电话 <span className="text-gray-400">(选填)</span></Label>
                    <Input
                      id="phone"
                      placeholder="请输入电话"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 介绍卡片 */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI 智能舌诊
                </CardTitle>
                <CardDescription>上传您的舌苔照片，AI 将为您提供专业的中医舌诊分析报告</CardDescription>
              </CardHeader>
            </Card>

            {/* 上传区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">上传舌苔图片</CardTitle>
                <CardDescription>支持 JPG、PNG 格式，建议在自然光下拍摄，确保舌苔清晰可见</CardDescription>
              </CardHeader>
              <CardContent>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div onClick={handleClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
                  {image ? (
                    <div className="space-y-4">
                      <img src={image} alt="舌苔预览" className="max-h-64 mx-auto rounded-lg shadow-md" />
                      <p className="text-sm text-muted-foreground">{imageName}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                          <Camera className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-medium">点击或拖拽上传图片</p>
                        <p className="text-sm text-muted-foreground mt-1">支持 JPG、PNG，最大 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  {image && (
                    <>
                      <Button onClick={handleSubmit} disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在分析...</>) : (<><Sparkles className="mr-2 h-4 w-4" />开始分析</>)}
                      </Button>
                      <Button variant="outline" onClick={handleReset} disabled={loading}>
                        <RotateCcw className="mr-2 h-4 w-4" />重置
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>分析失败</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 分析结果 */}
            {result && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        舌诊分析报告
                      </CardTitle>
                      <CardDescription>分析完成于 {new Date().toLocaleString('zh-CN')}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copySuccess ? (<><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />已复制</>) : (<><Copy className="mr-2 h-4 w-4" />复制</>)}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />下载
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm leading-relaxed">
                      {result}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  拍摄建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">✓ 推荐做法</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 在自然光下拍摄，避免灯光色差</li>
                      <li>• 舌头自然伸出，不要过度用力</li>
                      <li>• 拍摄前避免食用有色食物</li>
                      <li>• 确保舌苔清晰可见</li>
                      <li>• 保持相机稳定，避免模糊</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">✗ 避免做法</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 不要在刚吃完东西后拍摄</li>
                      <li>• 不要使用美颜或滤镜</li>
                      <li>• 避免强光直射或逆光</li>
                      <li>• 不要伸出舌头时间过长</li>
                      <li>• 避免舌苔被染色（如咖啡）</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>温馨提示</AlertTitle>
              <AlertDescription>
                AI舌诊结果仅供参考，不能替代专业医生的诊断。如有健康问题，请及时就医。
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="history">
            <TongueDiagnosisHistoryManager onSelectUser={handleSelectUserFromHistory} />
          </TabsContent>
        </Tabs>
      </main>

      {/* 历史记录弹窗 */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>舌诊历史记录</DialogTitle>
          </DialogHeader>
          <TongueDiagnosisHistoryManager onSelectUser={handleSelectUserFromHistory} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
