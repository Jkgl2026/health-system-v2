'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Camera, Loader2, FileText, AlertCircle, CheckCircle2, RotateCcw,
  Download, Copy, Sparkles, ArrowLeft, Activity, Shield,
  ChevronRight, Info, Target, Zap, TrendingUp, TrendingDown,
  Bone, Heart, Brain, Timer, AlertTriangle, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Eye, RotateCw, MessageCircle,
  History, BarChart3, Dumbbell, CalendarDays, FileDown, BoxIcon, User
} from 'lucide-react';
import {
  createPoseDetector,
  detectPoseFromImageEnhanced,
  EnhancedPostureAnalysisResult,
  PostureIssue,
  MuscleStatus,
  FasciaChainStatus,
  HealthRisk,
  ISSUE_NAMES_CN,
  ANGLE_NAMES_CN,
  calculateExtendedAngles,
} from '@/lib/pose-detection-enhanced';
import {
  drawPostureAnnotationEnhanced,
  createAnnotatedCanvas,
  downloadAnnotatedImage,
  DEFAULT_ENHANCED_DRAW_CONFIG,
} from '@/lib/pose-drawing-enhanced';
import { EXERCISE_DATABASE, SuitableIssue } from '@/lib/exercise-database';
import { generateTrainingPlan, getPhaseWeeklyPlans, PHASE_DETAILS, TrainingPhase, TrainingPlan } from '@/lib/training-planner';
import { saveRecord, getAllRecords, AssessmentRecord, getStatistics } from '@/lib/progress-tracker';
import { generatePDFReport, downloadPDF, generateReportFilename, ReportData } from '@/lib/pdf-generator';
import { compressImage, getImageInfo } from '@/lib/image-compress';

// 动态导入重型组件
import dynamic from 'next/dynamic';
const BodyModel3D = dynamic(() => import('@/components/BodyModel3D'), { ssr: false });
const ProgressChart = dynamic(() => import('@/components/ProgressChart'), { ssr: false });
const ComparisonView = dynamic(() => import('@/components/ComparisonView'), { ssr: false });
const SkeletonAnnotationCanvas = dynamic(() => import('@/components/SkeletonAnnotationCanvas'), { ssr: false });
const PostureHistoryManager = dynamic(() => import('@/components/PostureHistoryManager'), { ssr: false });
const AIDeepAnalysisView = dynamic(() => import('@/components/AIDeepAnalysisView'), { ssr: false });

// ==================== 类型定义 ====================

interface ImageState {
  front: string | null;
  left: string | null;
  right: string | null;
  back: string | null;
}

interface AnalysisState {
  mediaPipeResults: {
    front: EnhancedPostureAnalysisResult | null;
    left: EnhancedPostureAnalysisResult | null;
    right: EnhancedPostureAnalysisResult | null;
    back: EnhancedPostureAnalysisResult | null;
  };
  overallScore: number;
  grade: string;
  allIssues: PostureIssue[];
  allMuscles: MuscleStatus[];
  allFasciaChains: FasciaChainStatus[];
  allHealthRisks: HealthRisk[];
  semanticAnalysis: SemanticAnalysisResult | null;
}

interface SemanticAnalysisResult {
  summary: string;
  detailedAnalysis: any;
  recommendations: any;
  tcmPerspective: any;
  treatmentPlan: any;
  trainingPlan?: TrainingPlan;
}

// ==================== 辅助函数 ====================

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    'A': 'bg-green-500',
    'B': 'bg-blue-500',
    'C': 'bg-yellow-500',
    'D': 'bg-orange-500',
    'E': 'bg-red-500',
  };
  return colors[grade] || 'bg-gray-500';
};

const getGradeText = (grade: string) => {
  const texts: Record<string, string> = {
    'A': '优秀',
    'B': '良好',
    'C': '一般',
    'D': '较差',
    'E': '需改善',
  };
  return texts[grade] || '未知';
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'mild': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'moderate': 'bg-orange-100 text-orange-800 border-orange-300',
    'severe': 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getSeverityText = (severity: string) => {
  const texts: Record<string, string> = {
    'mild': '轻度',
    'moderate': '中度',
    'severe': '重度',
  };
  return texts[severity] || '无';
};

const getMuscleStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'tight': 'bg-red-100 text-red-800',
    'weak': 'bg-blue-100 text-blue-800',
    'overactive': 'bg-orange-100 text-orange-800',
    'inhibited': 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getMuscleStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'tight': '紧张',
    'weak': '无力',
    'overactive': '过度活跃',
    'inhibited': '抑制',
  };
  return texts[status] || '正常';
};

const getRiskColor = (risk: string) => {
  const colors: Record<string, string> = {
    'low': 'text-green-600 bg-green-50',
    'medium': 'text-yellow-600 bg-yellow-50',
    'high': 'text-red-600 bg-red-50',
  };
  return colors[risk] || 'text-gray-600 bg-gray-50';
};

const getRiskText = (risk: string) => {
  const texts: Record<string, string> = {
    'low': '低风险',
    'medium': '中等风险',
    'high': '高风险',
  };
  return texts[risk] || '未知';
};

// ==================== 主组件 ====================

export default function PostureDiagnosisPageV2() {
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
  const [result, setResult] = useState<AnalysisState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [activeResultTab, setActiveResultTab] = useState('overview');
  
  // 新增状态
  const [showHistoryManager, setShowHistoryManager] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showTrainingPlan, setShowTrainingPlan] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([]);
  
  // 用户信息
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  
  // MediaPipe实例
  const [poseInstance, setPoseInstance] = useState<any>(null);
  const [poseReady, setPoseReady] = useState(false);
  
  // Canvas引用
  const canvasRefs = {
    front: useRef<HTMLCanvasElement>(null),
    left: useRef<HTMLCanvasElement>(null),
    right: useRef<HTMLCanvasElement>(null),
    back: useRef<HTMLCanvasElement>(null),
  };
  
  // 图片元素引用
  const imageRefs = {
    front: useRef<HTMLImageElement>(null),
    left: useRef<HTMLImageElement>(null),
    right: useRef<HTMLImageElement>(null),
    back: useRef<HTMLImageElement>(null),
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
        setLoadingStep('正在加载骨骼检测模型...');
        const pose = createPoseDetector();
        
        // 等待模型加载
        await new Promise<void>((resolve) => {
          pose.onResults(() => {});
          // 给模型一些初始化时间
          setTimeout(() => resolve(), 2000);
        });
        
        setPoseInstance(pose);
        setPoseReady(true);
        console.log('[PostureDiagnosis] MediaPipe Pose 初始化成功');
      } catch (err) {
        console.error('[PostureDiagnosis] MediaPipe 初始化失败:', err);
        setError('骨骼检测模型加载失败，请刷新页面重试');
      }
    };
    
    initPose();
    
    return () => {
      if (poseInstance) {
        poseInstance.close?.();
      }
    };
  }, []);

  // 加载历史记录 - 初始加载和result变化时都加载
  useEffect(() => {
    const records = getAllRecords();
    setAssessmentHistory(records);
    console.log('[PostureDiagnosis] 加载历史记录:', records.length, '条');
  }, []); // 初始加载

  // result变化时也重新加载
  useEffect(() => {
    if (result) {
      const records = getAllRecords();
      setAssessmentHistory(records);
      console.log('[PostureDiagnosis] 评估完成，刷新历史记录');
    }
  }, [result]);

  // 保存评估结果
  const saveAssessmentResult = useCallback(() => {
    if (!result) return;
    
      const record = saveRecord({
      overallScore: result.overallScore,
      grade: result.grade,
      issues: result.allIssues.map(i => ({
        type: i.type,
        name: i.name,
        severity: i.severity,
        angle: i.angle,
      })),
      angles: result.mediaPipeResults.front?.extendedAngles ? 
        Object.fromEntries(Object.entries(result.mediaPipeResults.front.extendedAngles)) : {},
      muscles: {
        tight: result.allMuscles.filter(m => m.status === 'tight').map(m => m.name),
        weak: result.allMuscles.filter(m => m.status === 'weak').map(m => m.name),
      },
      imageThumbnail: images.front || undefined,
    });
    
    // 更新历史记录
    setAssessmentHistory(prev => [record, ...prev]);
  }, [result, images]);

  // 导出PDF报告
  const handleExportPDF = async () => {
    if (!result) return;
    
    setExportingPDF(true);
    
    try {
      const trainingPlan = result.semanticAnalysis?.trainingPlan || 
        generateTrainingPlan(result.allIssues.map(i => i.type as any));
      
      // 构建详细问题数据
      const detailedIssues = result.allIssues.map(i => ({
        type: i.type,
        name: i.name,
        severity: i.severity,
        angle: i.angle,
        description: i.description,
        cause: i.healthImpact?.shortTerm?.join('、') || '',
        impact: i.healthImpact?.longTerm?.join('、') || '',
        recommendation: '',
      }));
      
      // 构建健康风险数据
      const detailedRisks = result.allHealthRisks.map(r => ({
        category: r.category,
        risk: r.risk,
        condition: r.condition,
        cause: '',
        prevention: '',
      }));
      
      // 构建推荐动作数据
      const exercises: { name: string; category: string; purpose: string; method: string }[] = [];
      
      const reportData: ReportData = {
        userName: userInfo.name || undefined,
        assessmentDate: new Date().toLocaleDateString('zh-CN'),
        overallScore: result.overallScore,
        grade: result.grade,
        issues: detailedIssues,
        angles: result.mediaPipeResults.front?.extendedAngles ? 
          Object.fromEntries(Object.entries(result.mediaPipeResults.front.extendedAngles)) : {},
        muscles: {
          tight: result.allMuscles.filter(m => m.status === 'tight').map(m => m.name),
          weak: result.allMuscles.filter(m => m.status === 'weak').map(m => m.name),
        },
        risks: detailedRisks,
        recommendations: {
          immediate: result.allIssues.filter(i => i.severity === 'severe').map(i => 
            `及时就医检查${i.name}，避免进一步恶化`
          ),
          shortTerm: result.allIssues.filter(i => i.severity === 'moderate').map(i => 
            `改善${i.name}问题，加强相关肌肉训练`
          ),
          longTerm: [
            '建立规律的运动习惯，每周至少3次体态矫正训练',
            '保持良好的坐姿和站姿习惯，避免长时间保持同一姿势',
            '定期进行体态评估复查，建议每4周一次',
            '加强核心肌群训练，提升身体稳定性',
          ],
          exercises: exercises,
        },
        tcmAnalysis: result.semanticAnalysis?.tcmPerspective ? {
          constitution: result.semanticAnalysis.tcmPerspective.constitution || '',
          constitutionType: result.semanticAnalysis.tcmPerspective.constitutionType,
          constitutionFeatures: result.semanticAnalysis.tcmPerspective.constitutionFeatures || [],
          meridians: result.semanticAnalysis.tcmPerspective.meridians?.map((m: any) => ({
            name: typeof m === 'string' ? m : m.name,
            status: typeof m === 'object' && m.status ? m.status : '失衡',
            reason: typeof m === 'object' && m.reason ? m.reason : '',
          })) || [],
          acupoints: result.semanticAnalysis.tcmPerspective.acupoints?.map((a: any) => ({
            name: typeof a === 'string' ? a : a.name,
            location: typeof a === 'object' && a.location ? a.location : '',
            benefit: typeof a === 'object' && a.benefit ? a.benefit : '',
          })) || [],
          dietSuggestions: result.semanticAnalysis.tcmPerspective.dietSuggestions || [],
        } : undefined,
        trainingPlan: trainingPlan ? {
          phases: Object.entries(PHASE_DETAILS).map(([key, phase]) => {
            const weeklyPlans = getPhaseWeeklyPlans(trainingPlan, key as TrainingPhase);
            return {
              name: phase.name,
              duration: phase.duration,
              focus: phase.objective,
              exercises: weeklyPlans.flatMap(wp => 
                wp.sessions.flatMap(s => 
                  s.exercises.map(e => typeof e === 'string' ? e : e.name)
                )
              ).slice(0, 5),
            };
          }),
        } : undefined,
        images: {
          front: images.front || undefined,
          left: images.left || undefined,
          right: images.right || undefined,
          back: images.back || undefined,
        },
      };
      
      const blob = await generatePDFReport(reportData);
      downloadPDF(blob, generateReportFilename(result.overallScore));
    } catch (error) {
      console.error('PDF导出失败:', error);
      setError('PDF导出失败，请稍后重试');
    } finally {
      setExportingPDF(false);
    }
  };

  // ==================== Canvas绘制 ====================
  
  // 绘制骨骼标注图的函数
  const drawAnnotationToCanvas = useCallback((
    angle: keyof ImageState,
    imageDataUrl: string,
    analysisResult: EnhancedPostureAnalysisResult | null
  ) => {
    const canvas = canvasRefs[angle].current;
    if (!canvas || !imageDataUrl) {
      console.log(`[Canvas] ${angle} canvas或图片数据不存在`);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log(`[Canvas] ${angle} 无法获取ctx`);
      return;
    }
    
    // 创建新的图片对象
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`[Canvas] ${angle} 图片加载成功，开始绘制`);
      
      // 设置canvas尺寸
      const maxWidth = 600;
      const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      
      // 绘制原图
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      console.log(`[Canvas] ${angle} 原图绘制完成，尺寸: ${canvas.width}x${canvas.height}`);
      
      // 绘制骨骼标注（不清空画布，保留原图）
      if (analysisResult && analysisResult.landmarks && analysisResult.landmarks.length > 0) {
        console.log(`[Canvas] ${angle} 开始绘制骨骼标注，landmarks数量:`, analysisResult.landmarks.length);
        drawPostureAnnotationEnhanced(ctx, canvas, analysisResult, {
          showLandmarkLabels: false,
          showAngleArcs: true,
          showConfidence: true,
        }, false); // false 表示不清空画布
        console.log(`[Canvas] ${angle} 骨骼标注绘制完成`);
      } else {
        console.log(`[Canvas] ${angle} 无骨骼数据或landmarks为空，跳过骨骼绘制`);
        // 在图片上显示提示
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 150, 30);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('骨骼检测数据不完整', 15, 30);
      }
    };
    
    img.onerror = (e) => {
      console.error(`[Canvas] ${angle} 图片加载失败`, e);
    };
    
    img.src = imageDataUrl;
  }, []);
  
  // 当分析结果变化时绘制Canvas
  useEffect(() => {
    if (!result) return;
    
    console.log('[Canvas] 分析结果变化，开始绘制Canvas');
    
    const angles: (keyof ImageState)[] = ['front', 'left', 'right', 'back'];
    
    angles.forEach(angle => {
      if (images[angle] && result.mediaPipeResults[angle]) {
        console.log(`[Canvas] ${angle} 准备绘制`);
        drawAnnotationToCanvas(angle, images[angle]!, result.mediaPipeResults[angle]);
      }
    });
  }, [result, images, drawAnnotationToCanvas]);

  // ==================== 文件处理 ====================
  
  const handleFileSelect = useCallback(async (angle: keyof ImageState, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('图片大小不能超过 20MB');
      return;
    }
    setError(null);
    
    // 显示加载状态
    setLoading(true);
    setLoadingStep('正在压缩图片...');
    setLoadingProgress(5);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        try {
          // 获取图片信息
          const info = await getImageInfo(dataUrl);
          console.log(`[FileSelect] 原始图片: ${info.width}x${info.height}, ${info.sizeKB.toFixed(0)}KB`);
          
          // 如果图片过大，进行压缩
          let finalDataUrl = dataUrl;
          if (info.width > 1280 || info.height > 1280 || info.sizeKB > 800) {
            setLoadingStep('正在优化图片...');
            finalDataUrl = await compressImage(dataUrl, {
              maxWidth: 1280,
              maxHeight: 1280,
              quality: 0.85,
              maxSizeKB: 500,
            });
            
            const newInfo = await getImageInfo(finalDataUrl);
            console.log(`[FileSelect] 压缩后: ${newInfo.width}x${newInfo.height}, ${newInfo.sizeKB.toFixed(0)}KB`);
          }
          
          setImages(prev => ({ ...prev, [angle]: finalDataUrl }));
          setLoading(false);
          setLoadingStep('');
          setLoadingProgress(0);
        } catch (compressError) {
          console.error('[FileSelect] 图片压缩失败:', compressError);
          // 压缩失败时使用原图
          setImages(prev => ({ ...prev, [angle]: dataUrl }));
          setLoading(false);
          setLoadingStep('');
          setLoadingProgress(0);
        }
      };
      reader.onerror = () => {
        setError('图片读取失败');
        setLoading(false);
        setLoadingStep('');
        setLoadingProgress(0);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[FileSelect] 处理失败:', error);
      setError('图片处理失败，请重试');
      setLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
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
  ): Promise<EnhancedPostureAnalysisResult | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // 设置图片加载超时
      const timeout = setTimeout(() => {
        console.error(`[PostureDiagnosis] ${angle} 图片加载超时`);
        resolve(null);
      }, 30000);
      
      img.onload = async () => {
        clearTimeout(timeout);
        
        // 保存图片引用
        if (imageRefs[angle].current) {
          imageRefs[angle].current.src = imageData;
        }
        
        if (!poseInstance) {
          console.log(`[PostureDiagnosis] ${angle} poseInstance 不存在`);
          resolve(null);
          return;
        }
        
        try {
          console.log(`[PostureDiagnosis] ${angle} 开始骨骼检测...`);
          const result = await detectPoseFromImageEnhanced(img, poseInstance, angle);
          console.log(`[PostureDiagnosis] ${angle} 检测完成，发现问题:`, result?.issues?.length || 0);
          resolve(result);
        } catch (err: any) {
          console.error(`[PostureDiagnosis] ${angle} 检测失败:`, err);
          // 捕获 WASM 崩溃错误
          if (err?.message?.includes('abort') || err?.name === 'RuntimeError') {
            console.error(`[PostureDiagnosis] ${angle} WASM 崩溃，可能是图片尺寸过大`);
            // 返回一个空结果而不是 null，这样后续流程可以继续
            resolve({
              landmarks: [],
              issues: [],
              overallScore: 50,
              muscleAnalysis: [],
              fasciaChainAnalysis: [],
              healthRisks: [],
              extendedAngles: {},
              confidence: 0,
              viewAngle: angle,
            } as unknown as EnhancedPostureAnalysisResult);
          } else {
            resolve(null);
          }
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.error(`[PostureDiagnosis] ${angle} 图片加载失败`);
        resolve(null);
      };
      
      img.src = imageData;
    });
  };

  // ==================== 语义分析 ====================
  
  const performSemanticAnalysis = async (
    mediaPipeResults: AnalysisState['mediaPipeResults'],
    images: ImageState
  ): Promise<SemanticAnalysisResult | null> => {
    try {
      // 收集所有检测结果
      const allIssues: any[] = [];
      const allAngles: any[] = [];
      
      Object.entries(mediaPipeResults).forEach(([angle, result]) => {
        if (result) {
          allIssues.push({ 
            angle, 
            issues: result.issues.map(i => ({
              name: i.name,
              severity: i.severity,
              description: i.description,
            }))
          });
          allAngles.push({ angle, angles: result.extendedAngles });
        }
      });
      
      // 获取第一张图片用于Vision分析
      const firstImage = images.front || images.left || images.right || images.back;
      
      const response = await fetch('/api/posture-semantic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarks: mediaPipeResults.front?.landmarks || null,
          angles: mediaPipeResults.front?.extendedAngles || null,
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
    if (!userInfo.name.trim()) {
      setError('请填写用户姓名');
      return;
    }
    
    if (!hasAnyImage) {
      setError('请至少上传一张体态照片');
      return;
    }
    
    if (!poseInstance || !poseReady) {
      setError('骨骼检测模型未加载完成，请稍后重试');
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
      
      const mediaPipeResults: AnalysisState['mediaPipeResults'] = {
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
          
          completedSteps++;
          setLoadingProgress(10 + (completedSteps / totalSteps) * 50);
        }
      }
      
      // Step 2: 汇总分析结果
      setLoadingStep('正在汇总分析结果...');
      setLoadingProgress(65);
      
      const allIssues: PostureIssue[] = [];
      const issueSet = new Set<string>();
      
      Object.values(mediaPipeResults).forEach(result => {
        if (result?.issues) {
          result.issues.forEach(issue => {
            const key = `${issue.type}-${issue.severity}`;
            if (!issueSet.has(key)) {
              issueSet.add(key);
              allIssues.push(issue);
            }
          });
        }
      });
      
      // 汇总肌肉分析
      const allMuscles: MuscleStatus[] = [];
      const muscleSet = new Set<string>();
      
      Object.values(mediaPipeResults).forEach(result => {
        if (result?.muscleAnalysis) {
          result.muscleAnalysis.forEach(muscle => {
            if (!muscleSet.has(muscle.name)) {
              muscleSet.add(muscle.name);
              allMuscles.push(muscle);
            }
          });
        }
      });
      
      // 汇总筋膜链分析
      const allFasciaChains: FasciaChainStatus[] = [];
      const fasciaSet = new Set<string>();
      
      Object.values(mediaPipeResults).forEach(result => {
        if (result?.fasciaChainAnalysis) {
          result.fasciaChainAnalysis.forEach(chain => {
            if (!fasciaSet.has(chain.name)) {
              fasciaSet.add(chain.name);
              allFasciaChains.push(chain);
            }
          });
        }
      });
      
      // 汇总健康风险
      const allHealthRisks: HealthRisk[] = [];
      const riskSet = new Set<string>();
      
      Object.values(mediaPipeResults).forEach(result => {
        if (result?.healthRisks) {
          result.healthRisks.forEach(risk => {
            if (!riskSet.has(risk.condition)) {
              riskSet.add(risk.condition);
              allHealthRisks.push(risk);
            }
          });
        }
      });
      
      // Step 3: 计算综合评分
      setLoadingStep('正在计算综合评分...');
      setLoadingProgress(75);
      
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
      setLoadingProgress(85);
      
      const semanticAnalysis = await performSemanticAnalysis(mediaPipeResults, images);
      
      setLoadingProgress(100);
      
      // 生成最终结果
      const finalResult: AnalysisState = {
        mediaPipeResults,
        overallScore,
        grade,
        allIssues,
        allMuscles,
        allFasciaChains,
        allHealthRisks,
        semanticAnalysis,
      };
      
      setResult(finalResult);
      setActiveTab('result');
      
      // 自动保存评估结果到数据库
      if (userInfo.name.trim()) {
        try {
          // 先创建或查找用户
          const userRes = await fetch('/api/posture-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'createUser',
              name: userInfo.name.trim(),
              phone: userInfo.phone.trim() || null,
            }),
          });
          const userData = await userRes.json();
          
          if (userData.success && userData.data?.id) {
            const userId = userData.data.id;
            
            // 保存评估记录
            await fetch('/api/posture-records', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'saveAssessment',
                userId: userId,
                assessmentData: {
                  overallScore: finalResult.overallScore,
                  grade: finalResult.grade,
                  issues: finalResult.allIssues.map(i => ({
                    type: i.type,
                    name: i.name,
                    severity: i.severity,
                    angle: i.angle,
                  })),
                  angles: finalResult.mediaPipeResults.front?.extendedAngles ? 
                    Object.fromEntries(Object.entries(finalResult.mediaPipeResults.front.extendedAngles)) : {},
                  muscles: {
                    tight: finalResult.allMuscles.filter(m => m.status === 'tight').map(m => m.name),
                    weak: finalResult.allMuscles.filter(m => m.status === 'weak').map(m => m.name),
                  },
                  healthRisks: finalResult.allHealthRisks,
                  aiSummary: finalResult.semanticAnalysis?.summary || '',
                  aiDetailedAnalysis: finalResult.semanticAnalysis?.detailedAnalysis || {},
                  tcmAnalysis: finalResult.semanticAnalysis?.tcmPerspective || {},
                  trainingPlan: finalResult.semanticAnalysis?.trainingPlan || {},
                  images: {
                    front: images.front || null,
                    left: images.left || null,
                    right: images.right || null,
                    back: images.back || null,
                  },
                },
              }),
            });
            
            console.log('[PostureDiagnosis] 评估结果已保存到数据库');
          }
        } catch (saveErr) {
          console.error('[PostureDiagnosis] 保存评估结果失败:', saveErr);
        }
      }
      
      // 同时保存到localStorage作为备份
      try {
        const record = saveRecord({
          overallScore: finalResult.overallScore,
          grade: finalResult.grade,
          issues: finalResult.allIssues.map(i => ({
            type: i.type,
            name: i.name,
            severity: i.severity,
            angle: i.angle,
          })),
          angles: finalResult.mediaPipeResults.front?.extendedAngles ? 
            Object.fromEntries(Object.entries(finalResult.mediaPipeResults.front.extendedAngles)) : {},
          muscles: {
            tight: finalResult.allMuscles.filter(m => m.status === 'tight').map(m => m.name),
            weak: finalResult.allMuscles.filter(m => m.status === 'weak').map(m => m.name),
          },
          imageThumbnail: images.front || undefined,
        });
        
        // 更新历史记录
        setAssessmentHistory(prev => [record, ...prev]);
      } catch (saveErr) {
        console.error('[PostureDiagnosis] 保存到localStorage失败:', saveErr);
      }
      
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

  const handleDownloadAnnotation = (angle: keyof ImageState) => {
    const canvas = canvasRefs[angle].current;
    if (canvas) {
      downloadAnnotatedImage(canvas, `体态分析_${angle}_${Date.now()}.png`);
    }
  };

  // ==================== 拍摄指导 ====================
  
  const shootingGuide = {
    front: {
      title: '正面照',
      icon: '👤',
      tips: ['站直，双脚与肩同宽', '双臂自然下垂', '目视前方，表情放松', '相机与胸部同高', '距离约2-3米']
    },
    left: {
      title: '左侧照',
      icon: '👈',
      tips: ['保持站姿不变', '双臂自然下垂', '从左侧拍摄全身', '相机与身体侧面垂直', '确保能看到头部到脚部']
    },
    right: {
      title: '右侧照',
      icon: '👉',
      tips: ['保持站姿不变', '双臂自然下垂', '从右侧拍摄全身', '相机与身体侧面垂直', '确保能看到头部到脚部']
    },
    back: {
      title: '背面照',
      icon: '🔙',
      tips: ['站直，双脚与肩同宽', '双臂自然下垂', '目视前方', '从正后方拍摄', '确保能看到头部到脚部']
    }
  };

  // ==================== 图片上传卡片组件 ====================
  
  const ImageUploadCard = ({ angle, title }: { angle: keyof ImageState; title: string }) => (
    <Card className={`relative transition-all ${images[angle] ? 'ring-2 ring-green-400' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-2xl">{shootingGuide[angle].icon}</span>
            {title}
          </CardTitle>
          {images[angle] && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              已上传
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          onClick={() => fileInputRefs[angle].current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            images[angle] 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          {images[angle] ? (
            <div className="relative">
              <img
                ref={imageRefs[angle] as any}
                src={images[angle]!}
                alt={title}
                className="max-h-40 mx-auto rounded"
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(angle); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="py-6">
              <Camera className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">点击上传照片</p>
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
              <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-blue-400" />
              {tip}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ==================== 结果组件 ====================

  // 问题卡片组件
  const IssueCard = ({ issue }: { issue: PostureIssue }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <Card className={`border-l-4 ${
        issue.severity === 'severe' ? 'border-l-red-500' :
        issue.severity === 'moderate' ? 'border-l-orange-500' : 'border-l-yellow-500'
      }`}>
        <CardContent className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-3">
              <Badge className={getSeverityColor(issue.severity)}>
                {getSeverityText(issue.severity)}
              </Badge>
              <div>
                <h4 className="font-medium">{issue.name}</h4>
                <p className="text-sm text-gray-500">{issue.description}</p>
              </div>
            </div>
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expanded && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              {/* 受影响的结构 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">受影响的结构</h5>
                <div className="flex flex-wrap gap-1">
                  {issue.anatomicalInfo.affectedStructures.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              
              {/* 肌肉状态 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h5 className="text-sm font-medium text-red-600 mb-1">紧张的肌肉</h5>
                  <div className="flex flex-wrap gap-1">
                    {issue.anatomicalInfo.relatedMuscles.tight.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-red-50">{m}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-600 mb-1">无力的肌肉</h5>
                  <div className="flex flex-wrap gap-1">
                    {issue.anatomicalInfo.relatedMuscles.weak.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50">{m}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 潜在症状 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">潜在症状</h5>
                <div className="flex flex-wrap gap-1">
                  {issue.anatomicalInfo.potentialSymptoms.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-gray-50">{s}</Badge>
                  ))}
                </div>
              </div>
              
              {/* 健康影响 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">健康影响</h5>
                <div className="space-y-1">
                  {issue.healthImpact.shortTerm.length > 0 && (
                    <p className="text-xs text-gray-600"><strong>短期：</strong>{issue.healthImpact.shortTerm.join('、')}</p>
                  )}
                  {issue.healthImpact.midTerm.length > 0 && (
                    <p className="text-xs text-gray-600"><strong>中期：</strong>{issue.healthImpact.midTerm.join('、')}</p>
                  )}
                  {issue.healthImpact.longTerm.length > 0 && (
                    <p className="text-xs text-red-600"><strong>长期：</strong>{issue.healthImpact.longTerm.join('、')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 肌肉状态卡片
  const MuscleCard = ({ muscle }: { muscle: MuscleStatus }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <Card className="mb-2">
        <CardContent className="p-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Badge className={getMuscleStatusColor(muscle.status)}>
                {getMuscleStatusText(muscle.status)}
              </Badge>
              <div>
                <span className="font-medium">{muscle.name}</span>
                <span className="text-xs text-gray-500 ml-2">({muscle.location})</span>
              </div>
            </div>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          
          {expanded && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-gray-600">{muscle.reason}</p>
              
              {muscle.stretches.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-600">推荐拉伸：</h5>
                  <ul className="list-disc list-inside text-gray-600">
                    {muscle.stretches.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              
              {muscle.exercises.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-600">推荐训练：</h5>
                  <ul className="list-disc list-inside text-gray-600">
                    {muscle.exercises.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 筋膜链卡片
  const FasciaChainCard = ({ chain }: { chain: FasciaChainStatus }) => {
    const statusColors: Record<string, string> = {
      'normal': 'bg-green-100 text-green-800',
      'restricted': 'bg-yellow-100 text-yellow-800',
      'tight': 'bg-orange-100 text-orange-800',
      'weak': 'bg-blue-100 text-blue-800',
    };
    
    return (
      <Card className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{chain.name}</span>
              <Badge className={statusColors[chain.status] || ''}>{chain.status}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">紧张度：</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${chain.tension > 6 ? 'bg-red-500' : chain.tension > 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${chain.tension * 10}%` }}
                />
              </div>
              <span className="text-xs font-medium">{chain.tension}/10</span>
            </div>
          </div>
          
          {chain.restrictions.length > 0 && (
            <div className="text-sm text-gray-600 mb-1">
              <strong>受限原因：</strong>{chain.restrictions.join('、')}
            </div>
          )}
          
          {chain.impact.length > 0 && (
            <div className="text-sm text-gray-600 mb-1">
              <strong>影响：</strong>{chain.impact.join('、')}
            </div>
          )}
          
          {chain.treatmentSuggestions.length > 0 && (
            <div className="text-sm text-blue-600">
              <strong>处理建议：</strong>{chain.treatmentSuggestions.join('、')}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 健康风险卡片
  const HealthRiskCard = ({ risk }: { risk: HealthRisk }) => {
    const categoryIcons: Record<string, any> = {
      'skeletal': <Bone className="h-5 w-5" />,
      'neurological': <Brain className="h-5 w-5" />,
      'circulatory': <Heart className="h-5 w-5" />,
      'respiratory': <Activity className="h-5 w-5" />,
      'digestive': <Target className="h-5 w-5" />,
    };
    
    return (
      <Card className={`border-l-4 ${
        risk.risk === 'high' ? 'border-l-red-500' :
        risk.risk === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getRiskColor(risk.risk)}`}>
              {categoryIcons[risk.category] || <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{risk.condition}</h4>
                <Badge className={getRiskColor(risk.risk)}>{getRiskText(risk.risk)}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{risk.cause}</p>
              
              {risk.symptoms.length > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  <strong>可能症状：</strong>{risk.symptoms.join('、')}
                </div>
              )}
              
              {risk.preventionMeasures.length > 0 && (
                <div className="text-xs text-blue-600 mb-2">
                  <strong>预防措施：</strong>{risk.preventionMeasures.join('、')}
                </div>
              )}
              
              {risk.medicalAdvice && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  <strong>就医建议：</strong>{risk.medicalAdvice}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ==================== 主渲染 ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="hover:bg-blue-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Bone className="h-6 w-6 text-blue-500" />
                  AI 体态评估
                </h1>
                <p className="text-xs text-gray-500">MediaPipe骨骼检测 + Vision深度分析</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistoryManager(true)}
                className="gap-1"
              >
                <History className="h-4 w-4" />
                历史记录
              </Button>
              {poseReady ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  模型已就绪
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  模型加载中
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow">
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
                系统将使用 <strong>MediaPipe</strong> 检测33个骨骼关键点，计算50+项关节角度，
                检测30+种体态问题，并结合 <strong>Vision AI</strong> 进行深度语义分析。
              </AlertDescription>
            </Alert>

            {/* 历史记录面板 */}
            {assessmentHistory.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <History className="h-5 w-5 text-purple-600" />
                      历史评估记录
                    </span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {assessmentHistory.length} 次评估
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {assessmentHistory.slice(0, 3).map((record) => (
                      <Card 
                        key={record.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                        onClick={() => {
                          // 显示历史记录详情
                          setShowHistory(true);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                            </span>
                            <Badge className={`
                              ${record.overallScore >= 80 ? 'bg-green-500' : 
                                record.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                              text-white text-xs
                            `}>
                              {record.grade}级
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{record.overallScore}</span>
                            <span className="text-xs text-gray-500">分</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            检测到 {record.issues.length} 个问题
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {assessmentHistory.length > 3 && (
                    <div className="mt-3 text-center">
                      <Button 
                        variant="link" 
                        className="text-purple-600"
                        onClick={() => setShowHistory(true)}
                      >
                        查看全部 {assessmentHistory.length} 条记录
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 用户信息输入 */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  用户信息
                </CardTitle>
                <CardDescription>请填写基本信息以便保存评估记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">姓名 *</label>
                    <Input
                      placeholder="请输入姓名"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">电话（选填）</label>
                    <Input
                      placeholder="请输入电话号码"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                disabled={!hasAnyImage || loading || !poseReady}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 min-w-[160px]"
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
                    <Progress value={loadingProgress} className="h-2" />
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
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>体态评估结果</span>
                      <Badge className={`${getGradeColor(result.grade)} text-white text-lg px-4 py-1`}>
                        {result.grade}级 · {getGradeText(result.grade)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className={`text-7xl font-bold ${result.overallScore >= 60 ? 'text-white' : 'text-red-200'}`}>
                          {result.overallScore}
                        </div>
                        <p className="text-sm text-blue-100 mt-2">综合评分</p>
                      </div>
                      <div className="flex-1 max-w-md">
                        <Progress value={result.overallScore} className="h-4 bg-white/20" />
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                          <div className="bg-white/20 rounded-lg p-3">
                            <div className="font-bold text-2xl">{result.allIssues.filter(i => i.severity === 'severe').length}</div>
                            <div className="text-blue-100">重度问题</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-3">
                            <div className="font-bold text-2xl">{result.allIssues.filter(i => i.severity === 'moderate').length}</div>
                            <div className="text-blue-100">中度问题</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-3">
                            <div className="font-bold text-2xl">{result.allIssues.filter(i => i.severity === 'mild').length}</div>
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
                            <div className="text-sm font-medium text-center bg-gray-100 py-1 rounded">
                              {angle === 'front' ? '正面' : angle === 'back' ? '背面' : angle === 'left' ? '左侧' : '右侧'}
                            </div>
                            <div className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[200px]">
                              <SkeletonAnnotationCanvas
                                imageUrl={images[angle]!}
                                angle={angle}
                              />
                            </div>
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
                <Tabs value={activeResultTab} onValueChange={setActiveResultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6 bg-white shadow">
                    <TabsTrigger value="overview">总览</TabsTrigger>
                    <TabsTrigger value="issues">问题详情</TabsTrigger>
                    <TabsTrigger value="muscles">肌肉分析</TabsTrigger>
                    <TabsTrigger value="fascia">筋膜链</TabsTrigger>
                    <TabsTrigger value="risks">健康风险</TabsTrigger>
                    <TabsTrigger value="tcm">中医视角</TabsTrigger>
                  </TabsList>

                  {/* 总览 */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">检测到的问题</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {result.allIssues.length > 0 ? (
                            <div className="space-y-2">
                              {result.allIssues.slice(0, 5).map((issue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{issue.name}</span>
                                  <Badge className={getSeverityColor(issue.severity)}>
                                    {getSeverityText(issue.severity)}
                                  </Badge>
                                </div>
                              ))}
                              {result.allIssues.length > 5 && (
                                <p className="text-sm text-gray-500 text-center">
                                  还有 {result.allIssues.length - 5} 个问题...
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                              <p>未检测到明显体态问题</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">肌肉状态概览</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {result.allMuscles.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex gap-4 text-sm">
                                <div className="flex-1 bg-red-50 p-2 rounded text-center">
                                  <div className="font-bold text-red-600">
                                    {result.allMuscles.filter(m => m.status === 'tight').length}
                                  </div>
                                  <div className="text-xs text-red-500">紧张肌肉</div>
                                </div>
                                <div className="flex-1 bg-blue-50 p-2 rounded text-center">
                                  <div className="font-bold text-blue-600">
                                    {result.allMuscles.filter(m => m.status === 'weak').length}
                                  </div>
                                  <div className="text-xs text-blue-500">无力肌肉</div>
                                </div>
                              </div>
                              <Separator />
                              <div className="space-y-1">
                                {result.allMuscles.slice(0, 4).map((muscle, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span>{muscle.name}</span>
                                    <Badge variant="outline" className={getMuscleStatusColor(muscle.status)}>
                                      {getMuscleStatusText(muscle.status)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Activity className="h-12 w-12 mx-auto mb-2 text-green-500" />
                              <p>肌肉状态正常</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* AI深度分析 */}
                    {result.semanticAnalysis && (
                      <AIDeepAnalysisView analysis={result.semanticAnalysis} />
                    )}
                  </TabsContent>

                  {/* 问题详情 */}
                  <TabsContent value="issues" className="space-y-4">
                    {result.allIssues.length > 0 ? (
                      <div className="space-y-3">
                        {result.allIssues
                          .sort((a, b) => {
                            const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2, none: 3 };
                            return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
                          })
                          .map((issue, idx) => (
                            <IssueCard key={idx} issue={issue} />
                          ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-medium text-gray-800">体态良好！</h3>
                          <p className="text-gray-500">未检测到明显的体态问题</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* 肌肉分析 */}
                  <TabsContent value="muscles" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-red-600 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            紧张肌肉 ({result.allMuscles.filter(m => m.status === 'tight' || m.status === 'overactive').length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            {result.allMuscles
                              .filter(m => m.status === 'tight' || m.status === 'overactive')
                              .map((muscle, idx) => (
                                <MuscleCard key={idx} muscle={muscle} />
                              ))}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-blue-600 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            无力肌肉 ({result.allMuscles.filter(m => m.status === 'weak' || m.status === 'inhibited').length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            {result.allMuscles
                              .filter(m => m.status === 'weak' || m.status === 'inhibited')
                              .map((muscle, idx) => (
                                <MuscleCard key={idx} muscle={muscle} />
                              ))}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* 筋膜链分析 */}
                  <TabsContent value="fascia" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">筋膜链状态分析</CardTitle>
                        <CardDescription>
                          筋膜链是连接全身肌肉的连续性结构，其状态影响整体姿势和运动模式
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.allFasciaChains.map((chain, idx) => (
                            <FasciaChainCard key={idx} chain={chain} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 健康风险 */}
                  <TabsContent value="risks" className="space-y-4">
                    {result.allHealthRisks.length > 0 ? (
                      <div className="space-y-3">
                        {result.allHealthRisks
                          .sort((a, b) => {
                            const order = { high: 0, medium: 1, low: 2 };
                            return order[a.risk] - order[b.risk];
                          })
                          .map((risk, idx) => (
                            <HealthRiskCard key={idx} risk={risk} />
                          ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-medium text-gray-800">健康状况良好！</h3>
                          <p className="text-gray-500">未检测到明显的健康风险因素</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* 中医视角 */}
                  <TabsContent value="tcm" className="space-y-4">
                    {result.semanticAnalysis?.tcmPerspective ? (
                      <div className="space-y-4">
                        {/* 体质辨识 */}
                        <Card className="border-l-4 border-l-amber-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="text-amber-600">中医体质辨识</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="text-2xl font-bold text-amber-600">
                                {result.semanticAnalysis.tcmPerspective.constitution || '平和质'}
                              </div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                中医九种体质
                              </Badge>
                            </div>
                            {result.semanticAnalysis.tcmPerspective.constitutionReason && (
                              <p className="text-sm text-gray-600 mb-3">{result.semanticAnalysis.tcmPerspective.constitutionReason}</p>
                            )}
                            {result.semanticAnalysis.tcmPerspective.constitutionFeatures && (
                              <div className="flex flex-wrap gap-2">
                                {result.semanticAnalysis.tcmPerspective.constitutionFeatures.map((f: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* 经络分析 */}
                        {result.semanticAnalysis.tcmPerspective.meridians && result.semanticAnalysis.tcmPerspective.meridians.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-500" />
                                经络状态分析
                              </CardTitle>
                              <CardDescription>根据体态问题分析相关经络的气血运行状态</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {result.semanticAnalysis.tcmPerspective.meridians.map((m: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-gray-800">{m.name}</span>
                                      <Badge variant={m.status === '受阻' ? 'destructive' : m.status === '不畅' ? 'default' : 'outline'}>
                                        {m.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{m.reason}</p>
                                    {m.symptoms && m.symptoms.length > 0 && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        <span className="font-medium">可能症状：</span>
                                        {m.symptoms.join('、')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* 穴位调理 */}
                        {result.semanticAnalysis.tcmPerspective.acupoints && result.semanticAnalysis.tcmPerspective.acupoints.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                穴位调理建议
                              </CardTitle>
                              <CardDescription>针对体态问题的穴位按摩调理方案</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.semanticAnalysis.tcmPerspective.acupoints.slice(0, 8).map((a: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="font-medium text-green-800 mb-1">{a.name}</div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      <strong>位置：</strong>{a.location}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">{a.benefit}</div>
                                    <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                                      <strong>方法：</strong>{a.method}
                                    </div>
                                    {a.contraindications && (
                                      <div className="text-xs text-orange-600 mt-1">
                                        ⚠️ {a.contraindications}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* 导引功法 */}
                        {result.semanticAnalysis.tcmPerspective.daoyinSuggestions && result.semanticAnalysis.tcmPerspective.daoyinSuggestions.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-500" />
                                中医导引功法
                              </CardTitle>
                              <CardDescription>传统功法对体态调理的帮助</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {result.semanticAnalysis.tcmPerspective.daoyinSuggestions.map((d: string, i: number) => (
                                  <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 py-1.5">
                                    {d}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* 饮食建议 */}
                        {result.semanticAnalysis.tcmPerspective.dietaryAdvice && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                食疗养生建议
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {result.semanticAnalysis.tcmPerspective.dietaryAdvice.suitable && (
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-green-100 text-green-700">宜食</Badge>
                                    <span className="text-sm text-gray-600">
                                      {result.semanticAnalysis.tcmPerspective.dietaryAdvice.suitable.join('、')}
                                    </span>
                                  </div>
                                )}
                                {result.semanticAnalysis.tcmPerspective.dietaryAdvice.avoid && (
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-red-100 text-red-700">忌食</Badge>
                                    <span className="text-sm text-gray-600">
                                      {result.semanticAnalysis.tcmPerspective.dietaryAdvice.avoid.join('、')}
                                    </span>
                                  </div>
                                )}
                                {result.semanticAnalysis.tcmPerspective.dietaryAdvice.teaRecommendation && (
                                  <div className="p-2 bg-amber-50 rounded text-sm text-amber-800">
                                    <strong>代茶饮：</strong>{result.semanticAnalysis.tcmPerspective.dietaryAdvice.teaRecommendation}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* 四季养生 */}
                        {result.semanticAnalysis.tcmPerspective.seasonalAdvice && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">四季养生建议</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600">{result.semanticAnalysis.tcmPerspective.seasonalAdvice}</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* 日常养生 */}
                        {result.semanticAnalysis.tcmPerspective.dailyRoutine && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">日常养生时辰</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                  <div className="text-orange-600 font-medium mb-1">早晨</div>
                                  <div className="text-xs text-gray-600">{result.semanticAnalysis.tcmPerspective.dailyRoutine.morning || '晨起活动，舒展筋骨'}</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                  <div className="text-red-600 font-medium mb-1">中午</div>
                                  <div className="text-xs text-gray-600">{result.semanticAnalysis.tcmPerspective.dailyRoutine.noon || '午休调养，养心安神'}</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <div className="text-blue-600 font-medium mb-1">晚间</div>
                                  <div className="text-xs text-gray-600">{result.semanticAnalysis.tcmPerspective.dailyRoutine.evening || '早睡早起，养肝护肾'}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-800">中医分析</h3>
                          <p className="text-gray-500">AI正在分析中医视角...</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* 底部操作 */}
                <div className="space-y-4">
                  {/* 主要操作按钮 */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重新评估
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={saveAssessmentResult}
                      disabled={!result}
                    >
                      <History className="h-4 w-4 mr-2" />
                      保存记录
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleExportPDF}
                      disabled={exportingPDF}
                    >
                      {exportingPDF ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 mr-2" />
                      )}
                      导出报告
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowChat(true)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      AI咨询
                    </Button>
                  </div>
                  
                  {/* 功能入口 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowExerciseLibrary(true)}
                    >
                      <CardContent className="p-4 text-center">
                        <Dumbbell className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="font-medium text-sm">动作库</div>
                        <div className="text-xs text-gray-500">50+康复动作</div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowTrainingPlan(true)}
                    >
                      <CardContent className="p-4 text-center">
                        <CalendarDays className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="font-medium text-sm">训练方案</div>
                        <div className="text-xs text-gray-500">五阶段计划</div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowHistory(true)}
                    >
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="font-medium text-sm">进度追踪</div>
                        <div className="text-xs text-gray-500">{assessmentHistory.length}次记录</div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowComparison(true)}
                    >
                      <CardContent className="p-4 text-center">
                        <History className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <div className="font-medium text-sm">历史对比</div>
                        <div className="text-xs text-gray-500">评估对比</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 3D骨骼模型对话框 */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BoxIcon className="h-5 w-5" />
              3D骨骼模型
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[500px]">
            <BodyModel3D 
              issues={result?.allIssues.map(i => ({ type: i.type, severity: i.severity })) || []}
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 历史记录管理对话框 */}
      <Dialog open={showHistoryManager} onOpenChange={setShowHistoryManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              历史记录管理
            </DialogTitle>
          </DialogHeader>
          <PostureHistoryManager />
        </DialogContent>
      </Dialog>
      
      {/* 进度追踪对话框 */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              进度追踪
            </DialogTitle>
          </DialogHeader>
          <ProgressChart days={30} />
        </DialogContent>
      </Dialog>
      
      {/* 历史对比对话框 */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              历史对比
            </DialogTitle>
          </DialogHeader>
          <ComparisonView />
        </DialogContent>
      </Dialog>
      
      {/* 动作库对话框 */}
      <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              康复动作库
            </DialogTitle>
          </DialogHeader>
          <ExerciseLibraryView issues={result?.allIssues || []} />
        </DialogContent>
      </Dialog>
      
      {/* 训练方案对话框 */}
      <Dialog open={showTrainingPlan} onOpenChange={setShowTrainingPlan}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              五阶段训练方案
            </DialogTitle>
          </DialogHeader>
          <TrainingPlanView 
            issues={result?.allIssues || []}
            muscles={result?.allMuscles || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== 动作库视图组件 ====================
function ExerciseLibraryView({ issues }: { issues: PostureIssue[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 根据问题推荐动作
  const recommendedExercises = useMemo(() => {
    const exerciseIds = new Set<string>();
    // 根据问题类型推荐动作
    issues.forEach(issue => {
      // 根据问题类型添加推荐动作
      const issueToExerciseMap: Record<string, string[]> = {
        forward_head: ['neck-chin-tuck', 'neck-stretch', 'scapular-retraction'],
        rounded_shoulder: ['scapular-retraction', 'chest-stretch', 'wall-angels'],
        elevated_shoulder: ['upper-trap-stretch', 'levator-scapulae-stretch'],
        thoracic_hyperkyphosis: ['thoracic-extension', 'wall-angels', 'cat-cow'],
        anterior_pelvic_tilt: ['hip-flexor-stretch', 'glute-bridge', 'dead-bug'],
        posterior_pelvic_tilt: ['hip-flexor-activation', 'hamstring-stretch'],
        flat_foot: ['foot-arch-activation', 'calf-stretch', 'towel-curl'],
        genu_recuvatum: ['quad-activation', 'hamstring-activation'],
        genu_valgum: ['hip-abductor-activation', 'clam-shell'],
        genu_varum: ['hip-adductor-stretch', 'itb-stretch'],
      };
      
      const recommended = issueToExerciseMap[issue.type] || [];
      recommended.forEach(id => exerciseIds.add(id));
    });
    return Array.from(exerciseIds);
  }, [issues]);
  
  // 过滤动作
  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => {
      const matchCategory = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchSearch = !searchTerm || 
        ex.name.includes(searchTerm) || 
        ex.targetMuscles.some(m => m.includes(searchTerm));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);
  
  return (
    <div className="space-y-4">
      {/* 推荐动作 */}
      {recommendedExercises.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800">针对您的问题推荐</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_DATABASE.filter(ex => recommendedExercises.includes(ex.id)).slice(0, 6).map(ex => (
                <div key={ex.id} className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-sm">{ex.name}</div>
                  <div className="text-xs text-gray-500">{ex.duration}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 筛选 */}
      <div className="flex gap-2">
        <select 
          className="border rounded px-3 py-1.5 text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">全部类别</option>
          <option value="stretch">拉伸类</option>
          <option value="activation">激活类</option>
          <option value="strengthen">强化类</option>
          <option value="functional">功能训练</option>
        </select>
        
        <input
          type="text"
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="搜索动作..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* 动作列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredExercises.map(exercise => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}

// 动作卡片组件
function ExerciseCard({ exercise }: { exercise: any }) {
  const [expanded, setExpanded] = useState(false);
  
  const categoryColors: Record<string, string> = {
    stretch: 'bg-purple-100 text-purple-800',
    activation: 'bg-blue-100 text-blue-800',
    strengthen: 'bg-green-100 text-green-800',
    functional: 'bg-orange-100 text-orange-800',
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[exercise.category]}>
              {exercise.category === 'stretch' ? '拉伸' :
               exercise.category === 'activation' ? '激活' :
               exercise.category === 'strengthen' ? '强化' : '功能'}
            </Badge>
            <div>
              <div className="font-medium text-sm">{exercise.name}</div>
              <div className="text-xs text-gray-500">{exercise.duration}</div>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2 text-sm">
            <div>
              <strong className="text-gray-600">目标肌肉：</strong>
              {exercise.targetMuscles.join('、')}
            </div>
            <div>
              <strong className="text-gray-600">动作要领：</strong>
              {exercise.instructions}
            </div>
            {exercise.tips && (
              <div className="text-blue-600">
                <strong>注意事项：</strong>{exercise.tips}
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              <span>次数：{exercise.reps}</span>
              <span>组数：{exercise.sets}组</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== 训练方案视图组件 ====================
function TrainingPlanView({ issues, muscles }: { issues: PostureIssue[]; muscles: MuscleStatus[] }) {
  const [activePhase, setActivePhase] = useState(0);
  
  // 转换问题类型
  const suitableIssues: SuitableIssue[] = useMemo(() => {
    const issueTypeMap: Record<string, SuitableIssue> = {
      forward_head: 'forward_head',
      rounded_shoulder: 'rounded_shoulder',
      elevated_shoulder: 'elevated_shoulder',
      thoracic_hyperkyphosis: 'thoracic_hyperkyphosis',
      anterior_pelvic_tilt: 'anterior_pelvic_tilt',
      posterior_pelvic_tilt: 'posterior_pelvic_tilt',
      genu_recuvatum: 'genu_recuvatum',
      genu_valgum: 'genu_valgum',
      genu_varum: 'genu_varum',
      flat_foot: 'flat_foot',
    };
    
    return issues
      .map(i => issueTypeMap[i.type])
      .filter(Boolean) as SuitableIssue[];
  }, [issues]);
  
  const plan = useMemo(() => generateTrainingPlan(suitableIssues), [suitableIssues]);
  
  const phaseNames = ['姿势纠正', '肌肉激活', '力量强化', '功能整合', '维持巩固'];
  const phaseKeys: TrainingPhase[] = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'];
  const phaseDurations = ['1-2周', '2-4周', '4-8周', '8-12周', '长期'];
  
  // 获取当前阶段的周计划
  const currentPhasePlans = useMemo(() => {
    return getPhaseWeeklyPlans(plan, phaseKeys[activePhase]);
  }, [plan, activePhase]);
  
  // 获取当前阶段的详细信息
  const currentPhaseDetail = useMemo(() => {
    return PHASE_DETAILS[phaseKeys[activePhase]];
  }, [activePhase]);
  
  // 获取当前阶段的所有练习
  const currentPhaseExercises = useMemo(() => {
    const allExercises: any[] = [];
    currentPhasePlans.forEach(weekPlan => {
      weekPlan.sessions.forEach(session => {
        session.exercises.forEach(ex => {
          // 避免重复
          if (!allExercises.find(e => e.id === ex.id)) {
            allExercises.push(ex);
          }
        });
      });
    });
    return allExercises;
  }, [currentPhasePlans]);
  
  return (
    <div className="space-y-4">
      {/* 阶段选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {phaseNames.map((name, i) => (
          <Button
            key={i}
            variant={activePhase === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePhase(i)}
            className="flex-shrink-0"
          >
            {i + 1}. {name}
          </Button>
        ))}
      </div>
      
      {/* 当前阶段详情 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              第{activePhase + 1}阶段：{phaseNames[activePhase]}
            </CardTitle>
            <Badge variant="outline">{phaseDurations[activePhase]}</Badge>
          </div>
          <CardDescription>
            {currentPhaseDetail?.objective || '根据您的评估结果定制的训练计划'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 阶段说明 */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <div className="font-medium mb-1">训练目标</div>
            <div>{currentPhaseDetail?.description}</div>
            <div className="mt-2 text-xs text-blue-600">
              频率：{currentPhaseDetail?.frequency} · 每次时长：{currentPhaseDetail?.durationPerSession}
            </div>
          </div>
          
          {/* 关键要点 */}
          {currentPhaseDetail?.keyPoints && currentPhaseDetail.keyPoints.length > 0 && (
            <div className="mb-4">
              <div className="font-medium text-sm mb-2">关键要点</div>
              <div className="flex flex-wrap gap-2">
                {currentPhaseDetail.keyPoints.map((point, i) => (
                  <Badge key={i} variant="outline" className="bg-gray-50">{point}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 训练动作 */}
          <div className="mb-2">
            <div className="font-medium text-sm mb-2">训练动作（共{currentPhaseExercises.length}个）</div>
          </div>
          
          {currentPhaseExercises.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {currentPhaseExercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ex.name}</div>
                    <div className="text-xs text-gray-500">
                      {ex.duration || ex.repetitions || ''} · {ex.frequency || '每周2-3次'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ex.category === 'stretch' ? '拉伸' :
                     ex.category === 'activation' ? '激活' :
                     ex.category === 'strengthening' ? '强化' : '功能'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>暂无训练内容</p>
            </div>
          )}
          
          {/* 预期效果 */}
          {currentPhaseDetail?.expectedOutcomes && currentPhaseDetail.expectedOutcomes.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="font-medium text-sm mb-2 text-green-700">预期效果</div>
              <ul className="text-xs text-gray-600 space-y-1">
                {currentPhaseDetail.expectedOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 注意事项 */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>训练提示</AlertTitle>
        <AlertDescription className="text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li>每个阶段建议完成后再进入下一阶段</li>
            <li>如出现疼痛请立即停止并咨询专业人士</li>
            <li>建议每周进行2-3次训练</li>
            <li>配合日常姿势调整效果更佳</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
