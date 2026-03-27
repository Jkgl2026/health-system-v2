'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Camera, Loader2, AlertCircle, CheckCircle2, RotateCcw,
  Sparkles, ArrowLeft, Heart, Eye, Activity, Shield,
  Calendar, Clock, TrendingUp, Info, FileDown, User
} from 'lucide-react';
import { generateFaceDiagnosisReport, FaceDiagnosisData, UserInfo } from '@/lib/report-generator';

interface BiologicalAgeResult {
  estimatedAge: number;
  chronologicalAge: number;
  ageDifference: number;
  biologicalAgeScore: number;
  agingFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    score: number;
  }>;
  healthIndex: {
    skin: number;
    eyes: number;
    facialSymmetry: number;
    overall: number;
  };
  recommendations: Array<{
    category: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  antiAgingTips: string[];
  summary: string;
  fullReport: string;
  timestamp: string;
}

export default function BiologicalAgePage() {
  const router = useRouter();
  
  // 用户信息
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', age: '', gender: '' });
  
  // 图片相关
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BiologicalAgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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

  // 提交分析
  const handleSubmit = async () => {
    if (!image) return;
    if (!userInfo.age || !userInfo.name) {
      setError('请填写姓名和年龄');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const chronologicalAge = parseInt(userInfo.age);
      
      // 调用API进行生理年龄评估
      const response = await fetch('/api/biological-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image, 
          chronologicalAge,
          userInfo: {
            name: userInfo.name,
            gender: userInfo.gender,
            phone: userInfo.phone,
          },
        }),
      });
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '分析失败');
      }
    } catch (err) {
      console.error('生理年龄评估失败:', err);
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

  // 导出Word报告
  const [exporting, setExporting] = useState(false);
  const handleExportReport = async () => {
    if (!result) return;
    
    setExporting(true);
    try {
      // 这里可以创建专门的生理年龄报告生成器
      // 暂时使用面诊报告生成器作为基础
      alert('生理年龄报告导出功能开发中...');
    } catch (err) {
      console.error('导出报告失败:', err);
      alert('导出报告失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const getAgeDifferenceColor = (diff: number) => {
    if (diff > 5) return 'text-red-600 bg-red-50';
    if (diff > 2) return 'text-orange-600 bg-orange-50';
    if (diff < -5) return 'text-green-600 bg-green-50';
    if (diff < -2) return 'text-cyan-600 bg-cyan-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getAgeDifferenceText = (diff: number) => {
    if (diff > 5) return '衰老加速，需重视';
    if (diff > 2) return '略显衰老';
    if (diff < -5) return '年轻态明显';
    if (diff < -2) return '保养良好';
    return '年龄匹配';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 生理年龄评估</h1>
                <p className="text-sm text-gray-500">基于面部特征分析您的生理年龄</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {/* 用户信息输入 */}
        <Card className="border-purple-200 dark:border-purple-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              基本信息
            </CardTitle>
            <CardDescription>请填写您的姓名和实际年龄，用于对比生理年龄</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label htmlFor="age">实际年龄 <span className="text-red-500">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="请输入年龄"
                  value={userInfo.age}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select value={userInfo.gender} onValueChange={(v) => setUserInfo(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  placeholder="选填"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
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
                ${isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
              {image ? (
                <div className="space-y-4">
                  <img src={image} alt="面部预览" className="max-h-64 mx-auto rounded-lg shadow-md" />
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
                    <p className="text-base font-medium">点击或拖拽上传正面照片</p>
                    <p className="text-sm text-muted-foreground mt-1">素颜拍摄，光线充足</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              {image && (
                <>
                  <Button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在分析...</>) : (<><Sparkles className="mr-2 h-4 w-4" />开始评估</>)}
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
          <div className="space-y-4">
            {/* 生理年龄评分 */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    生理年龄评估结果
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exporting}>
                    {exporting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />导出中...</>) : (<><FileDown className="mr-2 h-4 w-4" />导出报告</>)}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* 年龄对比 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">实际年龄</div>
                    <div className="text-4xl font-bold text-gray-700">{result.chronologicalAge}</div>
                    <div className="text-xs text-muted-foreground mt-1">岁</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
                    <div className="text-sm opacity-90 mb-1">生理年龄</div>
                    <div className="text-5xl font-bold mb-1">{result.estimatedAge}</div>
                    <div className="text-xs opacity-80">岁</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${getAgeDifferenceColor(result.ageDifference)}`}>
                    <div className="text-sm text-muted-foreground mb-1">年龄差值</div>
                    <div className={`text-3xl font-bold ${result.ageDifference > 0 ? 'text-red-600' : result.ageDifference < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {result.ageDifference > 0 ? '+' : ''}{result.ageDifference}
                    </div>
                    <div className="text-xs mt-1">岁</div>
                  </div>
                </div>

                {/* 年龄状态 */}
                <div className={`p-4 rounded-lg mb-6 ${getAgeDifferenceColor(result.ageDifference)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.ageDifference > 2 ? (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      ) : result.ageDifference < -2 ? (
                        <Activity className="h-5 w-5 text-green-500" />
                      ) : (
                        <Calendar className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="font-medium">{getAgeDifferenceText(result.ageDifference)}</span>
                    </div>
                    <Badge variant="outline">
                      评分: {result.biologicalAgeScore}/100
                    </Badge>
                  </div>
                  <Progress value={result.biologicalAgeScore} className="mt-2 h-2" />
                </div>

                {/* 健康指标 */}
                {result.healthIndex && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-purple-500" />
                      健康指标分析
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-muted-foreground">皮肤状态</div>
                        <div className="text-2xl font-bold text-purple-600">{result.healthIndex.skin}</div>
                        <Progress value={result.healthIndex.skin} className="mt-1 h-1" />
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-muted-foreground">眼部状态</div>
                        <div className="text-2xl font-bold text-blue-600">{result.healthIndex.eyes}</div>
                        <Progress value={result.healthIndex.eyes} className="mt-1 h-1" />
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-muted-foreground">面部对称性</div>
                        <div className="text-2xl font-bold text-green-600">{result.healthIndex.facialSymmetry}</div>
                        <Progress value={result.healthIndex.facialSymmetry} className="mt-1 h-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 衰老因素分析 */}
                {result.agingFactors && result.agingFactors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      衰老因素分析
                    </h3>
                    <div className="space-y-2">
                      {result.agingFactors.map((factor, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          factor.impact === 'negative' ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                          factor.impact === 'positive' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                          'bg-gray-50 border-gray-200 dark:bg-gray-900'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{factor.factor}</span>
                            <Badge variant="outline" className={
                              factor.impact === 'negative' ? 'bg-red-100 text-red-700' :
                              factor.impact === 'positive' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {factor.impact === 'negative' ? '加速' : factor.impact === 'positive' ? '延缓' : '中性'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                          <Progress value={factor.score} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 抗衰老建议 */}
                {result.antiAgingTips && result.antiAgingTips.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      抗衰老建议
                    </h3>
                    <div className="space-y-2">
                      {result.antiAgingTips.map((tip, index) => (
                        <div key={index} className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 健康建议 */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">💡 健康建议</h3>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                              {rec.priority === 'high' ? '重要' : rec.priority === 'medium' ? '中等' : '建议'}
                            </Badge>
                            <div>
                              <span className="font-medium">{rec.category}：</span>
                              <span className="ml-1">{rec.content}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 完整报告 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-500" />
                    完整分析报告
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm font-sans">{result.fullReport}</pre>
                </div>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>⚠️ 重要提示</AlertTitle>
              <AlertDescription>
                本生理年龄评估结果仅供参考，不作为医疗诊断依据。生理年龄受多种因素影响，包括遗传、生活习惯、环境等。建议保持健康的生活方式，定期体检。
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  );
}
