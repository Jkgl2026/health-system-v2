'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, Loader2, FileText, AlertCircle, CheckCircle2, RotateCcw,
  Download, Copy, Sparkles, ArrowLeft, Activity, Shield,
  ChevronRight, Info, Target, Zap, TrendingUp, TrendingDown,
  Bone, Heart, Brain, Timer
} from 'lucide-react';
import {
  createPoseDetector,
  detectPoseFromImage,
  PostureAnalysisResult,
  POSE_LANDMARKS,
  JointAngles,
  PostureIssue,
} from '@/lib/pose-detection';
import {
  drawPostureAnnotation,
  DEFAULT_DRAW_CONFIG,
} from '@/lib/pose-drawing';

// ==================== 类型定义 ====================

interface ImageState {
  front: string | null;
  left: string | null;
  right: string | null;
  back: string | null;
}

interface EnhancedAnalysisResult {
  // MediaPipe检测结果
  mediaPipeResults: {
    front: PostureAnalysisResult | null;
    left: PostureAnalysisResult | null;
    right: PostureAnalysisResult | null;
    back: PostureAnalysisResult | null;
  };
  
  // 综合评分
  overallScore: number;
  grade: string;
  
  // 汇总的体态问题
  allIssues: PostureIssue[];
  issueSummary: {
    severe: number;
    moderate: number;
    mild: number;
  };
  
  // Vision语义分析结果
  semanticAnalysis: {
    summary: string;
    detailedAnalysis: any;
    primaryIssues: any[];
    riskAssessment: any;
    recommendations: any;
    tcmPerspective: any;
  } | null;
  
  // 精确角度数据
  angleData: {
    front: JointAngles | null;
    left: JointAngles | null;
    right: JointAngles | null;
    back: JointAngles | null;
  };
  
  // 时间戳
  timestamp: string;
}

// ==================== 中文映射 ====================

const BODY_PART_NAMES: Record<string, string> = {
  head: '头部',
  shoulder: '肩部',
  spine: '脊柱',
  pelvis: '骨盆',
  knee: '膝部',
  ankle: '脚踝',
  neck: '颈部',
  hip: '髋部',
};

const ISSUE_NAMES: Record<string, string> = {
  '高低肩': '高低肩',
  '骨盆倾斜': '骨盆倾斜',
  '头部倾斜': '头部倾斜',
  '脊柱侧弯': '脊柱侧弯',
  '头前伸': '头前伸',
  '膝超伸': '膝超伸',
  '圆肩': '圆肩',
};

const SEVERITY_NAMES: Record<string, string> = {
  'none': '无',
  'mild': '轻度',
  'moderate': '中度',
  'severe': '重度',
};

const SEVERITY_COLORS: Record<string, string> = {
  'none': 'bg-gray-100 text-gray-600',
  'mild': 'bg-yellow-100 text-yellow-700',
  'moderate': 'bg-orange-100 text-orange-700',
  'severe': 'bg-red-100 text-red-700',
};

const FASCIA_CHAIN_NAMES: Record<string, string> = {
  frontLine: '前表链',
  backLine: '后表链',
  lateralLine: '体侧链',
  spiralLine: '螺旋链',
  armLine: '手臂链',
  deepFrontLine: '深前线',
};

const ANGLE_NAMES: Record<string, string> = {
  leftShoulderAngle: '左肩角度',
  rightShoulderAngle: '右肩角度',
  leftElbowAngle: '左肘角度',
  rightElbowAngle: '右肘角度',
  leftHipAngle: '左髋角度',
  rightHipAngle: '右髋角度',
  leftKneeAngle: '左膝角度',
  rightKneeAngle: '右膝角度',
  shoulderTilt: '肩部倾斜',
  hipTilt: '骨盆倾斜',
  headTilt: '头部倾斜',
  spinalAlignment: '脊柱对齐度',
};

// ==================== 主组件 ====================

export default function PostureDiagnosisPageNew() {
  const router = useRouter();
  
  // 图片状态
  const [images, setImages] = useState<ImageState>({
    front: null,
    left: null,
    right: null,
    back: null,
  });
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // 分析结果
  const [result, setResult] = useState<EnhancedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // MediaPipe实例
  const [poseInstance, setPoseInstance] = useState<any>(null);
  
  // Canvas引用
  const canvasRefs = {
    front: useRef<HTMLCanvasElement>(null),
    left: useRef<HTMLCanvasElement>(null),
    right: useRef<HTMLCanvasElement>(null),
    back: useRef<HTMLCanvasElement>(null),
  };
  
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  };

  // ==================== 初始化MediaPipe ====================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initPose = async () => {
      try {
        const pose = createPoseDetector();
        setPoseInstance(pose);
        console.log('[PostureDiagnosis] MediaPipe Pose 初始化成功');
      } catch (err) {
        console.error('[PostureDiagnosis] MediaPipe 初始化失败:', err);
      }
    };
    
    initPose();
    
    return () => {
      if (poseInstance) {
        poseInstance.close?.();
      }
    };
  }, []);

  // ==================== 文件处理 ====================
  
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

  // ==================== MediaPipe检测 ====================
  
  const detectPoseForAngle = async (
    angle: keyof ImageState,
    imageData: string
  ): Promise<PostureAnalysisResult | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        if (!poseInstance) {
          resolve(null);
          return;
        }
        
        try {
          const result = await detectPoseFromImage(img, poseInstance);
          resolve(result);
          
          // 绘制骨骼标注
          if (result && canvasRefs[angle].current) {
            const canvas = canvasRefs[angle].current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // 设置canvas尺寸
              canvas.width = img.width > 600 ? 600 : img.width;
              canvas.height = (canvas.width / img.width) * img.height;
              
              // 绘制原图
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // 绘制骨骼标注
              drawPostureAnnotation(ctx, canvas, result, {});
            }
          }
        } catch (err) {
          console.error(`[PostureDiagnosis] ${angle} 检测失败:`, err);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageData;
    });
  };

  // ==================== 语义分析 ====================
  
  const performSemanticAnalysis = async (
    mediaPipeResults: EnhancedAnalysisResult['mediaPipeResults'],
    images: ImageState
  ): Promise<EnhancedAnalysisResult['semanticAnalysis'] | null> => {
    try {
      // 收集所有检测结果
      const allLandmarks: any[] = [];
      const allAngles: any[] = [];
      const allIssues: any[] = [];
      
      Object.entries(mediaPipeResults).forEach(([angle, result]) => {
        if (result) {
          allLandmarks.push({ angle, landmarks: result.landmarks });
          allAngles.push({ angle, angles: result.angles });
          allIssues.push({ angle, issues: result.issues });
        }
      });
      
      // 获取第一张图片用于Vision分析
      const firstImage = images.front || images.left || images.right || images.back;
      
      const response = await fetch('/api/posture-semantic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarks: allLandmarks[0]?.landmarks,
          angles: allAngles[0]?.angles,
          issues: allIssues.flatMap(i => i.issues),
          confidence: Math.max(...Object.values(mediaPipeResults).map(r => r?.confidence || 0)),
          imageUrl: firstImage,
          allAngles,
          allIssues,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data.analysisResult;
      }
      
      return null;
    } catch (err) {
      console.error('[PostureDiagnosis] 语义分析失败:', err);
      return null;
    }
  };

  // ==================== 主分析流程 ====================
  
  const handleSubmit = async () => {
    if (!hasAnyImage) {
      setError('请至少上传一张体态照片');
      return;
    }
    
    if (!poseInstance) {
      setError('骨骼检测模型未加载，请稍后重试');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingProgress(0);
    
    try {
      // Step 1: MediaPipe骨骼检测
      setLoadingStep('正在进行骨骼点检测...');
      setLoadingProgress(10);
      
      const mediaPipeResults: EnhancedAnalysisResult['mediaPipeResults'] = {
        front: null,
        left: null,
        right: null,
        back: null,
      };
      
      const angleData: EnhancedAnalysisResult['angleData'] = {
        front: null,
        left: null,
        right: null,
        back: null,
      };
      
      const anglesToDetect = ['front', 'left', 'right', 'back'] as const;
      const totalSteps = anglesToDetect.filter(a => images[a]).length;
      let completedSteps = 0;
      
      for (const angle of anglesToDetect) {
        if (images[angle]) {
          setLoadingStep(`正在分析${angle === 'front' ? '正面' : angle === 'back' ? '背面' : angle === 'left' ? '左侧' : '右侧'}照片...`);
          
          const detectResult = await detectPoseForAngle(angle, images[angle]!);
          mediaPipeResults[angle] = detectResult;
          
          if (detectResult) {
            angleData[angle] = detectResult.angles;
          }
          
          completedSteps++;
          setLoadingProgress(10 + (completedSteps / totalSteps) * 40);
        }
      }
      
      // Step 2: 汇总体态问题
      setLoadingStep('正在汇总分析结果...');
      setLoadingProgress(55);
      
      const allIssues: PostureIssue[] = [];
      const issueSet = new Set<string>();
      
      Object.values(mediaPipeResults).forEach(result => {
        if (result?.issues) {
          result.issues.forEach(issue => {
            const key = `${issue.name}-${issue.severity}`;
            if (!issueSet.has(key)) {
              issueSet.add(key);
              allIssues.push(issue);
            }
          });
        }
      });
      
      const issueSummary = {
        severe: allIssues.filter(i => i.severity === 'severe').length,
        moderate: allIssues.filter(i => i.severity === 'moderate').length,
        mild: allIssues.filter(i => i.severity === 'mild').length,
      };
      
      // Step 3: 计算综合评分
      setLoadingStep('正在计算综合评分...');
      setLoadingProgress(65);
      
      const scores = Object.values(mediaPipeResults)
        .filter(r => r !== null)
        .map(r => r!.overallScore);
      
      const overallScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      
      const grade = overallScore >= 90 ? 'A' :
                    overallScore >= 80 ? 'B' :
                    overallScore >= 60 ? 'C' :
                    overallScore >= 40 ? 'D' : 'E';
      
      // Step 4: Vision语义分析
      setLoadingStep('正在进行AI深度分析...');
      setLoadingProgress(75);
      
      const semanticAnalysis = await performSemanticAnalysis(mediaPipeResults, images);
      
      setLoadingProgress(100);
      
      // 生成最终结果
      const finalResult: EnhancedAnalysisResult = {
        mediaPipeResults,
        overallScore,
        grade,
        allIssues,
        issueSummary,
        semanticAnalysis,
        angleData,
        timestamp: new Date().toISOString(),
      };
      
      setResult(finalResult);
      setActiveTab('result');
      
    } catch (err) {
      console.error('[PostureDiagnosis] 分析失败:', err);
      setError('分析失败，请稍后重试');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // ==================== 其他操作 ====================
  
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
    if (result?.semanticAnalysis?.summary) {
      await navigator.clipboard.writeText(result.semanticAnalysis.summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadAnnotation = (angle: keyof ImageState) => {
    const canvas = canvasRefs[angle].current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `体态分析_${angle}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // ==================== 渲染辅助函数 ====================
  
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

  const getAngleStatus = (value: number, thresholds: { good: [number, number]; warning: [number, number] }) => {
    if (value >= thresholds.good[0] && value <= thresholds.good[1]) {
      return { status: '正常', color: 'text-green-600', bg: 'bg-green-50' };
    }
    if (value >= thresholds.warning[0] && value <= thresholds.warning[1]) {
      return { status: '轻微偏差', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    return { status: '需要关注', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // ==================== 拍摄指导 ====================
  
  const shootingGuide = {
    front: {
      title: '正面照',
      tips: ['站直，双脚与肩同宽', '双臂自然下垂', '目视前方，表情放松', '相机与胸部同高', '距离约2-3米']
    },
    left: {
      title: '左侧照',
      tips: ['保持站姿不变', '双臂自然下垂', '从左侧拍摄全身', '相机与身体侧面垂直', '确保能看到头部到脚部']
    },
    right: {
      title: '右侧照',
      tips: ['保持站姿不变', '双臂自然下垂', '从右侧拍摄全身', '相机与身体侧面垂直', '确保能看到头部到脚部']
    },
    back: {
      title: '背面照',
      tips: ['站直，双脚与肩同宽', '双臂自然下垂', '目视前方', '从正后方拍摄', '确保能看到头部到脚部']
    }
  };

  // ==================== 图片上传卡片组件 ====================
  
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
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(angle); }}
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

  // ==================== 主渲染 ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="hover:bg-blue-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI 体态评估</h1>
              <p className="text-sm text-gray-500">MediaPipe骨骼检测 + Vision深度分析</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            <Bone className="h-3 w-3 mr-1" />
            精准检测
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

          {/* ==================== 上传页面 ==================== */}
          <TabsContent value="upload" className="space-y-4">
            {/* 提示信息 */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">检测说明</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                系统将使用 <strong>MediaPipe</strong> 检测33个骨骼关键点，计算精确关节角度，
                并结合 <strong>Vision AI</strong> 进行深度语义分析，提供全面的体态评估报告。
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
              <Button variant="outline" onClick={handleReset} disabled={!hasAnyImage}>
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
                    {loadingStep}
                  </>
                ) : (
                  <>
                    <Bone className="h-4 w-4 mr-2" />
                    开始评估
                  </>
                )}
              </Button>
            </div>
            
            {/* 加载进度 */}
            {loading && (
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{loadingStep}</span>
                      <span>{loadingProgress}%</span>
                    </div>
                    <Progress value={loadingProgress} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== 结果页面 ==================== */}
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
                        <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}
                        </div>
                        <p className="text-sm text-blue-100 mt-2">综合评分</p>
                      </div>
                      <div className="flex-1">
                        <Progress value={result.overallScore} className="h-3" />
                        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                          <div className="bg-white/20 rounded p-2">
                            <div className="font-bold text-lg">{result.issueSummary.severe}</div>
                            <div className="text-blue-100">重度问题</div>
                          </div>
                          <div className="bg-white/20 rounded p-2">
                            <div className="font-bold text-lg">{result.issueSummary.moderate}</div>
                            <div className="text-blue-100">中度问题</div>
                          </div>
                          <div className="bg-white/20 rounded p-2">
                            <div className="font-bold text-lg">{result.issueSummary.mild}</div>
                            <div className="text-blue-100">轻度问题</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 骨骼标注图展示 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bone className="h-5 w-5 text-blue-500" />
                      骨骼点标注图
                    </CardTitle>
                    <CardDescription>MediaPipe检测到的33个骨骼关键点和角度标注</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(['front', 'left', 'right', 'back'] as const).map(angle => 
                        images[angle] && (
                          <div key={angle} className="space-y-2">
                            <div className="text-sm font-medium text-center">
                              {angle === 'front' ? '正面' : angle === 'back' ? '背面' : angle === 'left' ? '左侧' : '右侧'}
                            </div>
                            <canvas
                              ref={canvasRefs[angle]}
                              className="w-full rounded border"
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleDownloadAnnotation(angle)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              下载标注图
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 详细分析结果 */}
                <Tabs defaultValue="angles" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="angles">关节角度</TabsTrigger>
                    <TabsTrigger value="issues">体态问题</TabsTrigger>
                    <TabsTrigger value="analysis">深度分析</TabsTrigger>
                    <TabsTrigger value="recommendations">改善建议</TabsTrigger>
                    <TabsTrigger value="tcm">中医视角</TabsTrigger>
                  </TabsList>

                  {/* 关节角度详情 */}
                  <TabsContent value="angles">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">精确关节角度数据</CardTitle>
                        <CardDescription>基于MediaPipe骨骼点计算的各关节角度</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(['front', 'left', 'right', 'back'] as const).map(angle => 
                          result.angleData[angle] && (
                            <div key={angle} className="mb-4 last:mb-0">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Badge variant="outline">
                                  {angle === 'front' ? '正面' : angle === 'back' ? '背面' : angle === 'left' ? '左侧' : '右侧'}
                                </Badge>
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(result.angleData[angle]!).map(([key, value]) => (
                                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-1">
                                      {ANGLE_NAMES[key] || key}
                                    </div>
                                    <div className="text-lg font-bold">
                                      {key === 'spinalAlignment' 
                                        ? `${(value as number).toFixed(1)}%` 
                                        : `${(value as number).toFixed(1)}°`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 体态问题列表 */}
                  <TabsContent value="issues">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">检测到的体态问题</CardTitle>
                        <CardDescription>基于骨骼角度分析识别的问题</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.allIssues.length > 0 ? (
                          <div className="space-y-3">
                            {result.allIssues.map((issue, idx) => (
                              <div 
                                key={idx} 
                                className={`p-4 rounded-lg ${SEVERITY_COLORS[issue.severity]}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{issue.name}</span>
                                  <Badge variant="outline">
                                    {SEVERITY_NAMES[issue.severity]}
                                  </Badge>
                                </div>
                                <div className="text-sm opacity-80">
                                  <div>角度偏差: {issue.angle.toFixed(1)}°</div>
                                  <div>{issue.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                            <p>未检测到明显体态问题</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* AI深度分析 */}
                  <TabsContent value="analysis">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-500" />
                          Vision AI 深度分析
                        </CardTitle>
                        <CardDescription>结合骨骼数据和图像的综合分析</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.semanticAnalysis ? (
                          <div className="space-y-4">
                            {/* 总结 */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">评估总结</h4>
                              <p className="text-gray-700">{result.semanticAnalysis.summary}</p>
                            </div>
                            
                            {/* 详细分析 */}
                            {result.semanticAnalysis.detailedAnalysis && (
                              <div className="space-y-3">
                                <h4 className="font-medium">各部位详细分析</h4>
                                {Object.entries(result.semanticAnalysis.detailedAnalysis).map(([part, data]: [string, any]) => (
                                  <div key={part} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{BODY_PART_NAMES[part] || part}</span>
                                      <Badge variant={data.status?.includes('正常') ? 'secondary' : 'destructive'}>
                                        {data.status}
                                      </Badge>
                                    </div>
                                    {data.description && (
                                      <p className="text-sm text-gray-600">{data.description}</p>
                                    )}
                                    {data.impact && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        <strong>健康影响:</strong> {data.impact}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* 风险评估 */}
                            {result.semanticAnalysis.riskAssessment && (
                              <div className="bg-red-50 rounded-lg p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  风险评估
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {result.semanticAnalysis.riskAssessment.painRisk && (
                                    <div>
                                      <strong>疼痛风险:</strong> {result.semanticAnalysis.riskAssessment.painRisk.join(', ')}
                                    </div>
                                  )}
                                  {result.semanticAnalysis.riskAssessment.progressionRisk && (
                                    <div>
                                      <strong>发展趋势:</strong> {result.semanticAnalysis.riskAssessment.progressionRisk}
                                    </div>
                                  )}
                                  {result.semanticAnalysis.riskAssessment.overallRisk && (
                                    <Badge variant={
                                      result.semanticAnalysis.riskAssessment.overallRisk === '低' ? 'secondary' :
                                      result.semanticAnalysis.riskAssessment.overallRisk === '中' ? 'default' : 'destructive'
                                    }>
                                      整体风险: {result.semanticAnalysis.riskAssessment.overallRisk}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                            <p>语义分析数据未加载</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 改善建议 */}
                  <TabsContent value="recommendations">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          改善建议
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.semanticAnalysis?.recommendations ? (
                          <div className="space-y-4">
                            {/* 立即调整 */}
                            {result.semanticAnalysis.recommendations.immediate?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 text-green-700">立即可以做的调整</h4>
                                <ul className="space-y-1">
                                  {result.semanticAnalysis.recommendations.immediate.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* 短期方案 */}
                            {result.semanticAnalysis.recommendations.shortTerm?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 text-blue-700">短期改善方案</h4>
                                <ul className="space-y-1">
                                  {result.semanticAnalysis.recommendations.shortTerm.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <Timer className="h-4 w-4 text-blue-500 mt-0.5" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* 长期建议 */}
                            {result.semanticAnalysis.recommendations.longTerm?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 text-purple-700">长期调理建议</h4>
                                <ul className="space-y-1">
                                  {result.semanticAnalysis.recommendations.longTerm.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <Heart className="h-4 w-4 text-purple-500 mt-0.5" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* 推荐动作 */}
                            {result.semanticAnalysis.recommendations.exercises?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 text-orange-700">推荐训练动作</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {result.semanticAnalysis.recommendations.exercises.map((exercise: any, idx: number) => (
                                    <div key={idx} className="border rounded-lg p-3">
                                      <div className="font-medium">{exercise.name}</div>
                                      <div className="text-sm text-gray-600">{exercise.purpose}</div>
                                      <div className="text-xs text-gray-500 mt-1">频率: {exercise.frequency}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            暂无建议数据
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 中医视角 */}
                  <TabsContent value="tcm">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          中医视角分析
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.semanticAnalysis?.tcmPerspective ? (
                          <div className="space-y-4">
                            {/* 经络影响 */}
                            {result.semanticAnalysis.tcmPerspective.meridians?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">可能受影响的经络</h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.semanticAnalysis.tcmPerspective.meridians.map((meridian: string, idx: number) => (
                                    <Badge key={idx} variant="outline">{meridian}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* 穴位建议 */}
                            {result.semanticAnalysis.tcmPerspective.acupoints?.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">建议按摩的穴位</h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.semanticAnalysis.tcmPerspective.acupoints.map((point: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">{point}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* 体质倾向 */}
                            {result.semanticAnalysis.tcmPerspective.constitution && (
                              <div>
                                <h4 className="font-medium mb-2">可能的体质倾向</h4>
                                <Badge className="text-base px-3 py-1">
                                  {result.semanticAnalysis.tcmPerspective.constitution}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            暂无中医分析数据
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
