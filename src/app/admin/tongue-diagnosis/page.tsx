'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Camera, 
  Loader2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Download,
  Copy,
  Sparkles
} from 'lucide-react';

export default function TongueDiagnosisPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查登录状态
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  }, [router]);

  // 处理文件上传
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    setError(null);
    setResult(null);
    setImageName(file.name);

    // 转换为 Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 提交分析
  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/tongue-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data.diagnosis);
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
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
分析时间: ${new Date().toLocaleString('zh-CN')}

${result}
`;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `舌诊报告_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          AI 舌诊分析
        </h1>
        <p className="text-muted-foreground mt-1">
          上传舌苔照片，AI 将为您提供专业的舌诊分析报告
        </p>
      </div>

      <div className="grid gap-6">
        {/* 上传区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">上传舌苔图片</CardTitle>
            <CardDescription>
              支持 JPG、PNG 格式，建议在自然光下拍摄，确保舌苔清晰可见
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 上传区域 */}
            <div
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                }
              `}
            >
              {image ? (
                <div className="space-y-4">
                  <img
                    src={image}
                    alt="舌苔预览"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
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
                    <p className="text-sm text-muted-foreground mt-1">
                      支持 JPG、PNG，最大 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-4">
              {image && (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在分析...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        开始分析
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重置
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    舌诊分析报告
                  </CardTitle>
                  <CardDescription>
                    分析完成于 {new Date().toLocaleString('zh-CN')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        复制
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载
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
      </div>
    </div>
  );
}
