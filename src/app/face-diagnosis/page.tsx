'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Camera, Loader2, FileText, AlertCircle, CheckCircle2, RotateCcw,
  Download, Copy, Sparkles, ArrowLeft, Heart, Eye, Activity, Shield
} from 'lucide-react';

export default function FaceDiagnosisPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/face-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, saveRecord: true }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '分析失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageName('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = async () => {
    if (result?.fullReport) {
      await navigator.clipboard.writeText(result.fullReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.fullReport) return;
    const report = `中医面诊报告\n================\n分析时间: ${new Date().toLocaleString('zh-CN')}\n\n${result.fullReport}`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `面诊报告_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 面诊分析</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <Card className="mb-6 border-cyan-200 dark:border-cyan-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              AI 智能面诊
            </CardTitle>
            <CardDescription>上传您的正面照片，AI 将为您提供专业的中医面诊分析报告</CardDescription>
          </CardHeader>
        </Card>

        {/* 面诊须知 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-500" />
              面诊须知
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✓ 拍摄要求</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 素颜拍摄，不化妆不美颜</li>
                  <li>• 自然光线，避免强光逆光</li>
                  <li>• 正面照，头发不遮挡面部</li>
                  <li>• 表情自然，眼睛平视镜头</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">✗ 避免做法</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 不要使用滤镜或美颜</li>
                  <li>• 避免化妆后拍摄</li>
                  <li>• 不要侧脸或低头</li>
                  <li>• 避免表情夸张</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 上传区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">上传面部照片</CardTitle>
            <CardDescription>支持 JPG、PNG 格式，最大 10MB</CardDescription>
          </CardHeader>
          <CardContent>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div onClick={handleClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950' : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
              {image ? (
                <div className="space-y-4">
                  <img src={image} alt="面部预览" className="max-h-64 mx-auto rounded-lg shadow-md" />
                  <p className="text-sm text-muted-foreground">{imageName}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-cyan-100 dark:bg-cyan-900 rounded-full">
                      <Camera className="h-8 w-8 text-cyan-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-medium">点击或拖拽上传正面照片</p>
                    <p className="text-sm text-muted-foreground mt-1">支持 JPG、PNG，最大 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              {image && (
                <>
                  <Button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在分析...</>) : (<><Sparkles className="mr-2 h-4 w-4" />开始面诊</>)}
                  </Button>
                  <Button variant="outline" onClick={handleReset} disabled={loading}>
                    <RotateCcw className="mr-2 h-4 w-4" />重置
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>分析失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 分析结果 */}
        {result && (
          <div className="space-y-4 mb-6">
            {/* 综合评分 */}
            <Card className="border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    面诊分析报告
                  </CardTitle>
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
                {result.score !== undefined && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg text-white text-center">
                    <div className="text-sm font-medium mb-2 opacity-90">综合健康评分</div>
                    <div className="text-5xl font-bold mb-1">{result.score}</div>
                    <div className="text-sm opacity-80">分（满分100）</div>
                  </div>
                )}

                {/* 五脏状态雷达图区域 */}
                {result.organStatus && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-500" />
                      五脏健康状态
                    </h3>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[
                        { key: 'heart', name: '心', icon: '❤️' },
                        { key: 'liver', name: '肝', icon: '🫀' },
                        { key: 'spleen', name: '脾', icon: '🟡' },
                        { key: 'lung', name: '肺', icon: '🫁' },
                        { key: 'kidney', name: '肾', icon: '🟤' },
                      ].map((organ) => (
                        <div key={organ.key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="text-lg mb-1">{organ.icon}</div>
                          <div className="text-xs text-muted-foreground">{organ.name}</div>
                          <div className="text-lg font-bold text-cyan-600">{result.organStatus[organ.key] || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 体质判断 */}
                {result.constitution && (
                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      体质判断
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-300">{result.constitution.type}</span>
                      {result.constitution.confidence && (
                        <span className="text-sm text-purple-600 dark:text-purple-400">置信度 {result.constitution.confidence}%</span>
                      )}
                    </div>
                    {result.constitution.secondary && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">次要倾向：{result.constitution.secondary}</p>
                    )}
                  </div>
                )}

                {/* 健康建议 */}
                {result.suggestions?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-3">💡 健康建议</h3>
                    <div className="space-y-2">
                      {result.suggestions.map((s: any, i: number) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="font-medium text-cyan-600 dark:text-cyan-400">【{s.type}】</span>
                          <span className="ml-2">{s.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 完整报告 */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{result.fullReport}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 隐私提示 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>🔒 隐私保护说明</AlertTitle>
          <AlertDescription>
            您的面部照片仅用于AI健康分析，照片会加密存储，仅您和管理员可查看。您可随时删除历史记录。我们不会将照片用于其他任何用途。
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
