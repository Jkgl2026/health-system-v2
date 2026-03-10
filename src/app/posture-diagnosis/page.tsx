'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, Loader2, FileText, AlertCircle, CheckCircle2, RotateCcw,
  Download, Copy, Sparkles, ArrowLeft, User, Activity, Shield,
  ChevronRight, Info, Clock, Target, Zap
} from 'lucide-react';

interface ImageState {
  front: string | null;
  left: string | null;
  right: string | null;
  back: string | null;
}

interface AnalysisResult {
  score: number;
  grade: string;
  bodyStructure: any;
  fasciaChainAnalysis: any;
  muscleAnalysis: any;
  breathingAssessment: any;
  alignmentAssessment: any;
  compensationPatterns: any[];
  healthImpact: any;
  healthPrediction: any;
  treatmentPlan: any;
  summary: string;
  recordId: string;
}

export default function PostureDiagnosisPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageState>({
    front: null,
    left: null,
    right: null,
    back: null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  };

  const handleFileSelect = useCallback((angle: keyof ImageState, file: File) => {
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
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => ({ ...prev, [angle]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (angle: keyof ImageState, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(angle, file);
  };

  const handleRemoveImage = (angle: keyof ImageState) => {
    setImages(prev => ({ ...prev, [angle]: null }));
    if (fileInputRefs[angle].current) {
      fileInputRefs[angle].current.value = '';
    }
  };

  const hasAnyImage = Object.values(images).some(img => img !== null);

  const handleSubmit = async () => {
    if (!hasAnyImage) {
      setError('请至少上传一张体态照片');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/posture-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: images.front,
          leftSideImage: images.left,
          rightSideImage: images.right,
          backImage: images.back,
          saveRecord: true,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        setActiveTab('result');
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
    setImages({ front: null, left: null, right: null, back: null });
    setResult(null);
    setError(null);
    setActiveTab('upload');
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  const handleCopy = async () => {
    if (result?.summary) {
      await navigator.clipboard.writeText(result.summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // 拍摄指导内容
  const shootingGuide = {
    front: {
      title: '正面照',
      tips: [
        '站直，双脚与肩同宽',
        '双臂自然下垂',
        '目视前方，表情放松',
        '相机与胸部同高',
        '距离约2-3米'
      ]
    },
    left: {
      title: '左侧照',
      tips: [
        '保持站姿不变',
        '双臂自然下垂',
        '从左侧拍摄全身',
        '相机与身体侧面垂直',
        '确保能看到头部到脚部'
      ]
    },
    right: {
      title: '右侧照',
      tips: [
        '保持站姿不变',
        '双臂自然下垂',
        '从右侧拍摄全身',
        '相机与身体侧面垂直',
        '确保能看到头部到脚部'
      ]
    },
    back: {
      title: '背面照',
      tips: [
        '站直，双脚与肩同宽',
        '双臂自然下垂',
        '目视前方',
        '从正后方拍摄',
        '确保能看到头部到脚部'
      ]
    }
  };

  const ImageUploadCard = ({ angle, title }: { angle: keyof ImageState; title: string }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {images[angle] && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              已上传
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {shootingGuide[angle].tips[0]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onClick={() => fileInputRefs[angle].current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            images[angle] 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          {images[angle] ? (
            <div className="relative">
              <img
                src={images[angle]!}
                alt={title}
                className="max-h-32 mx-auto rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(angle);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="py-4">
              <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">点击上传照片</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRefs[angle]}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileChange(angle, e)}
        />
        <div className="mt-3 space-y-1">
          {shootingGuide[angle].tips.map((tip, idx) => (
            <p key={idx} className="text-xs text-gray-500 flex items-start">
              <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              {tip}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-blue-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI 体态评估</h1>
              <p className="text-sm text-gray-500">四角度拍摄 · 深度分析 · 个性化方案</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            <Activity className="h-3 w-3 mr-1" />
            体态健康
          </Badge>
        </div>

        {/* 主要内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              拍摄上传
            </TabsTrigger>
            <TabsTrigger value="result" disabled={!result} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              评估结果
            </TabsTrigger>
          </TabsList>

          {/* 上传页面 */}
          <TabsContent value="upload" className="space-y-4">
            {/* 提示信息 */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">拍摄建议</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                请穿着紧身或贴身衣物，在光线充足的环境下拍摄。建议拍摄正、左、右、背四个角度，至少上传一张照片进行分析。
              </AlertDescription>
            </Alert>

            {/* 图片上传区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadCard angle="front" title="正面照" />
              <ImageUploadCard angle="back" title="背面照" />
              <ImageUploadCard angle="left" title="左侧照" />
              <ImageUploadCard angle="right" title="右侧照" />
            </div>

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasAnyImage}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重新拍摄
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!hasAnyImage || loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始评估
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* 结果页面 */}
          <TabsContent value="result" className="space-y-4">
            {result && (
              <>
                {/* 总体评分卡片 */}
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>体态评估结果</span>
                      <Badge className={`${getGradeColor(result.grade)} text-white text-lg px-3 py-1`}>
                        {result.grade}级
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </div>
                        <p className="text-sm text-blue-100 mt-2">综合评分</p>
                      </div>
                      <div className="flex-1">
                        <Progress value={result.score} className="h-3" />
                        <p className="text-sm text-blue-100 mt-2">{result.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 详细分析结果 */}
                <Tabs defaultValue="structure" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="structure">身体结构</TabsTrigger>
                    <TabsTrigger value="fascia">筋膜链</TabsTrigger>
                    <TabsTrigger value="muscle">肌肉分析</TabsTrigger>
                    <TabsTrigger value="plan">调理方案</TabsTrigger>
                  </TabsList>

                  {/* 身体结构分析 */}
                  <TabsContent value="structure">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">身体结构分析</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result.bodyStructure && Object.entries(result.bodyStructure).map(([key, value]: [string, any]) => (
                          <div key={key} className="border-b pb-3 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{key}</span>
                              <Badge variant={value.severity === '无' ? 'secondary' : 'destructive'}>
                                {value.severity || '正常'}
                              </Badge>
                            </div>
                            {value.issues && value.issues.length > 0 && (
                              <div className="text-sm text-gray-600 space-y-1">
                                {value.issues.map((issue: string, idx: number) => (
                                  <p key={idx}>• {issue}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 筋膜链分析 */}
                  <TabsContent value="fascia">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">筋膜链分析</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.fasciaChainAnalysis && Object.entries(result.fasciaChainAnalysis).map(([key, value]: [string, any]) => (
                            <Card key={key} className="bg-gray-50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm capitalize">{value.status || key}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-gray-600">紧张程度: {value.tension || '正常'}</p>
                                {value.issues && value.issues.length > 0 && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {value.issues.map((issue: string, idx: number) => (
                                      <p key={idx}>• {issue}</p>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 肌肉分析 */}
                  <TabsContent value="muscle">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">肌肉分析</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result.muscleAnalysis?.tight && result.muscleAnalysis.tight.length > 0 && (
                          <div>
                            <h4 className="font-medium text-red-600 mb-2">紧张肌肉</h4>
                            <div className="space-y-2">
                              {result.muscleAnalysis.tight.map((item: any, idx: number) => (
                                <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                                  <span className="font-medium">{item.muscle}</span>
                                  <span className="text-gray-600 ml-2">- {item.severity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.muscleAnalysis?.weak && result.muscleAnalysis.weak.length > 0 && (
                          <div>
                            <h4 className="font-medium text-yellow-600 mb-2">无力肌肉</h4>
                            <div className="space-y-2">
                              {result.muscleAnalysis.weak.map((item: any, idx: number) => (
                                <div key={idx} className="text-sm bg-yellow-50 p-2 rounded">
                                  <span className="font-medium">{item.muscle}</span>
                                  <span className="text-gray-600 ml-2">- {item.severity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 调理方案 */}
                  <TabsContent value="plan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 整复训练 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            整复训练
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            {result.treatmentPlan?.zhengfu?.description}
                          </p>
                          {result.treatmentPlan?.zhengfu?.sessions?.map((session: any, idx: number) => (
                            <div key={idx} className="border-l-2 border-blue-200 pl-3 mb-3">
                              <p className="font-medium text-sm">{session.phase} - {session.focus}</p>
                              <p className="text-xs text-gray-500">{session.duration}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* 本源训练 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-500" />
                            本源训练
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            {result.treatmentPlan?.benyuan?.description}
                          </p>
                          {result.treatmentPlan?.benyuan?.sessions?.map((session: any, idx: number) => (
                            <div key={idx} className="border-l-2 border-green-200 pl-3 mb-3">
                              <p className="font-medium text-sm">{session.phase} - {session.focus}</p>
                              <p className="text-xs text-gray-500">{session.duration}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 操作按钮 */}
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleCopy}>
                    {copySuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        复制结果
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新评估
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
