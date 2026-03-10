'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, Maximize2, Loader2, AlertCircle, CheckCircle2,
  Activity, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
  createPoseDetector,
  detectPoseFromImage,
  PostureAnalysisResult,
  calculateAllAngles,
  detectPostureIssues,
  calculateOverallScore,
} from '@/lib/pose-detection';
import {
  drawPostureAnnotation,
  createComparisonAnnotation,
  downloadAnnotation,
  DEFAULT_DRAW_CONFIG,
} from '@/lib/pose-drawing';

interface PostureAnnotationCanvasProps {
  // 单图模式
  imageUrl?: string;
  
  // 对比模式
  beforeImage?: string;
  afterImage?: string;
  beforeData?: {
    score: number;
    grade: string;
    bodyStructure?: any;
  };
  afterData?: {
    score: number;
    grade: string;
    bodyStructure?: any;
  };
  improvements?: Array<{ area: string; change: string }>;
  deteriorations?: Array<{ area: string; change: string }>;
  
  // 通用配置
  mode?: 'single' | 'comparison';
  angle?: 'front' | 'leftSide' | 'rightSide' | 'back';
  width?: number;
  height?: number;
  showAnalysis?: boolean;
  onAnalysisComplete?: (result: PostureAnalysisResult | null) => void;
}

interface SemanticAnalysis {
  summary: string;
  detailedAnalysis: any;
  primaryIssues: any[];
  riskAssessment: any;
  recommendations: any;
  tcmPerspective: any;
}

export function PostureAnnotationCanvas({
  imageUrl,
  beforeImage,
  afterImage,
  beforeData,
  afterData,
  improvements = [],
  deteriorations = [],
  mode = 'single',
  angle = 'front',
  width = 600,
  height = 450,
  showAnalysis = true,
  onAnalysisComplete,
}: PostureAnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poseInstance, setPoseInstance] = useState<any>(null);
  const [showFullView, setShowFullView] = useState(false);
  
  // 分析结果
  const [singleResult, setSingleResult] = useState<PostureAnalysisResult | null>(null);
  const [beforeResult, setBeforeResult] = useState<PostureAnalysisResult | null>(null);
  const [afterResult, setAfterResult] = useState<PostureAnalysisResult | null>(null);
  
  // 语义分析
  const [semanticAnalysis, setSemanticAnalysis] = useState<SemanticAnalysis | null>(null);
  const [loadingSemantic, setLoadingSemantic] = useState(false);

  // 初始化MediaPipe Pose
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const pose = createPoseDetector();
      setPoseInstance(pose);
    } catch (err) {
      console.error('Failed to create pose detector:', err);
      setError('姿态检测器初始化失败');
    }
    
    return () => {
      if (poseInstance) {
        poseInstance.close?.();
      }
    };
  }, []);

  // 执行姿态检测
  const detectPose = useCallback(async (imgUrl: string): Promise<PostureAnalysisResult | null> => {
    if (!poseInstance) return null;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const result = await detectPoseFromImage(img, poseInstance);
          resolve(result);
        } catch (err) {
          console.error('Pose detection error:', err);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.error('Image load error:', imgUrl);
        resolve(null);
      };
      
      img.src = imgUrl;
    });
  }, [poseInstance]);

  // 单图模式检测
  useEffect(() => {
    if (mode === 'single' && imageUrl && poseInstance) {
      setLoading(true);
      setError(null);
      
      detectPose(imageUrl).then((result) => {
        setSingleResult(result);
        setLoading(false);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
        
        if (!result) {
          setError('未能检测到人体姿态');
        }
      });
    }
  }, [mode, imageUrl, poseInstance, detectPose, onAnalysisComplete]);

  // 对比模式检测
  useEffect(() => {
    if (mode === 'comparison' && beforeImage && afterImage && poseInstance) {
      setLoading(true);
      setError(null);
      
      Promise.all([
        detectPose(beforeImage),
        detectPose(afterImage),
      ]).then(([before, after]) => {
        setBeforeResult(before);
        setAfterResult(after);
        setLoading(false);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(after);
        }
        
        if (!before && !after) {
          setError('两张图片都未能检测到人体姿态');
        }
      });
    }
  }, [mode, beforeImage, afterImage, poseInstance, detectPose, onAnalysisComplete]);

  // 绘制标注
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    if (loading) {
      // 绘制加载状态
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('姿态检测中...', width / 2, height / 2);
      return;
    }
    
    if (mode === 'single') {
      // 单图模式
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // 绘制原图
          const scale = Math.min(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          // 绘制标注
          if (singleResult) {
            // 创建临时canvas用于标注
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = scaledWidth;
            tempCanvas.height = scaledHeight;
            const tempCtx = tempCanvas.getContext('2d')!;
            
            // 转换坐标
            const scaledResult = {
              ...singleResult,
              landmarks: singleResult.landmarks.map((lm) => ({
                ...lm,
                x: lm.x,
                y: lm.y,
              })),
            };
            
            drawPostureAnnotation(tempCtx, tempCanvas, scaledResult, {
              landmarkRadius: 4,
              skeletonWidth: 2,
              angleFontSize: 10,
              labelFontSize: 10,
            });
            
            // 叠加到主画布
            ctx.globalAlpha = 0.9;
            ctx.drawImage(tempCanvas, x, y);
            ctx.globalAlpha = 1;
          }
        };
        img.src = imageUrl;
      }
    } else {
      // 对比模式
      drawComparisonView(ctx, canvas);
    }
  }, [mode, loading, singleResult, beforeResult, afterResult, imageUrl, beforeImage, afterImage, width, height]);

  // 绘制对比视图
  const drawComparisonView = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // 背景
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const halfWidth = canvas.width / 2;
    
    // 分割线
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, canvas.height);
    ctx.stroke();
    
    // 加载并绘制图片
    const drawSide = (imgUrl: string | undefined, result: PostureAnalysisResult | null, x: number, label: string, score?: number) => {
      if (!imgUrl) return;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgWidth = halfWidth - 20;
        const imgHeight = canvas.height - 100;
        const scale = Math.min(imgWidth / img.width, imgHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const imgX = x + (halfWidth - scaledWidth) / 2;
        const imgY = 50;
        
        ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
        
        // 绘制标注
        if (result) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = scaledWidth;
          tempCanvas.height = scaledHeight;
          const tempCtx = tempCanvas.getContext('2d')!;
          
          drawPostureAnnotation(tempCtx, tempCanvas, result, {
            landmarkRadius: 3,
            skeletonWidth: 2,
            angleFontSize: 9,
            labelFontSize: 9,
          });
          
          ctx.globalAlpha = 0.85;
          ctx.drawImage(tempCanvas, imgX, imgY);
          ctx.globalAlpha = 1;
        }
        
        // 标签和分数
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + halfWidth / 2, 30);
        
        if (score !== undefined) {
          ctx.fillStyle = score >= 70 ? '#22c55e' : '#ef4444';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`评分: ${score}`, x + halfWidth / 2, canvas.height - 30);
        }
      };
      img.src = imgUrl;
    };
    
    // 绘制两侧
    drawSide(beforeImage, beforeResult, 0, '评估前', beforeData?.score);
    drawSide(afterImage, afterResult, halfWidth, '评估后', afterData?.score);
    
    // 角度标签
    const angleLabels: Record<string, string> = {
      front: '正面',
      leftSide: '左侧',
      rightSide: '右侧',
      back: '背面',
    };
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`视角: ${angleLabels[angle]}`, canvas.width / 2, canvas.height - 10);
  };

  // 获取语义分析
  const fetchSemanticAnalysis = async () => {
    const result = mode === 'single' ? singleResult : afterResult;
    if (!result) return;
    
    setLoadingSemantic(true);
    try {
      const response = await fetch('/api/posture-semantic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarks: result.landmarks,
          angles: result.angles,
          issues: result.issues,
          confidence: result.confidence,
          imageUrl: mode === 'single' ? imageUrl : afterImage,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSemanticAnalysis(data.data.analysisResult);
      }
    } catch (err) {
      console.error('Semantic analysis error:', err);
    } finally {
      setLoadingSemantic(false);
    }
  };

  // 下载标注图
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const filename = mode === 'single' 
      ? `posture-annotation-${Date.now()}.png`
      : `posture-comparison-${Date.now()}.png`;
    
    downloadAnnotation(canvas, filename);
  };

  // 渲染问题列表
  const renderIssues = (issues: any[]) => {
    if (!issues || issues.length === 0) return null;
    
    return (
      <div className="space-y-2">
        {issues.map((issue, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Badge 
              variant={issue.severity === 'severe' ? 'destructive' : issue.severity === 'moderate' ? 'default' : 'secondary'}
            >
              {issue.severity === 'mild' ? '轻度' : issue.severity === 'moderate' ? '中度' : '重度'}
            </Badge>
            <div className="flex-1">
              <div className="font-medium">{issue.name}</div>
              <div className="text-sm text-muted-foreground">{issue.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              AI体态标注
            </CardTitle>
            <CardDescription>
              MediaPipe骨骼检测 + Vision语义分析
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {showAnalysis && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSemanticAnalysis}
                disabled={loadingSemantic || (!singleResult && !afterResult)}
              >
                {loadingSemantic ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 mr-1" />
                )}
                深度分析
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload} disabled={loading}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFullView(!showFullView)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* 画布区域 */}
        <div ref={containerRef} className={`relative ${showFullView ? '' : 'overflow-hidden'}`}>
          {loading ? (
            <div className="flex items-center justify-center" style={{ width, height, maxHeight: height }}>
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                <p className="mt-2 text-sm text-muted-foreground">姿态检测中...</p>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className={`w-full border rounded-lg ${showFullView ? '' : 'max-h-96'}`}
              style={{ aspectRatio: `${width}/${height}` }}
            />
          )}
        </div>
        
        {/* 检测结果 */}
        {!loading && (singleResult || afterResult) && (
          <div className="mt-4 space-y-4">
            {/* 置信度和评分 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">检测置信度:</span>
                  <Badge variant="outline" className="ml-2">
                    {(((singleResult || afterResult)?.confidence || 0) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">体态评分:</span>
                  <Badge 
                    className="ml-2"
                    variant={((singleResult || afterResult)?.overallScore ?? 0) >= 70 ? 'default' : 'destructive'}
                  >
                    {(singleResult || afterResult)?.overallScore || 0}分
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* 检测到的问题 */}
            {((singleResult || afterResult)?.issues?.length || 0) > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">检测到的体态问题</div>
                {renderIssues((singleResult || afterResult)?.issues || [])}
              </div>
            )}
          </div>
        )}
        
        {/* 语义分析结果 */}
        {semanticAnalysis && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              AI专业分析
            </div>
            
            {/* 总结 */}
            {semanticAnalysis.summary && (
              <Alert>
                <AlertDescription>{semanticAnalysis.summary}</AlertDescription>
              </Alert>
            )}
            
            {/* 详细分析 */}
            {semanticAnalysis.detailedAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(semanticAnalysis.detailedAnalysis).map(([key, value]: [string, any]) => (
                  value?.status && (
                    <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{key}</div>
                      <div className="font-medium">{value.status}</div>
                      {value.description && (
                        <div className="text-xs text-muted-foreground mt-1">{value.description}</div>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
            
            {/* 主要问题 */}
            {semanticAnalysis.primaryIssues?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">主要问题分析</div>
                <div className="space-y-2">
                  {semanticAnalysis.primaryIssues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{issue.issue}</span>
                        <Badge variant="outline">{issue.severity}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{issue.cause}</div>
                      {issue.recommendation && (
                        <div className="text-sm text-orange-600 mt-1">
                          建议: {issue.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 中医视角 */}
            {semanticAnalysis.tcmPerspective && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm font-medium text-red-700 mb-2">中医视角</div>
                {semanticAnalysis.tcmPerspective.meridians?.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">相关经络:</span>{' '}
                    {semanticAnalysis.tcmPerspective.meridians.join('、')}
                  </div>
                )}
                {semanticAnalysis.tcmPerspective.acupoints?.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">建议穴位:</span>{' '}
                    {semanticAnalysis.tcmPerspective.acupoints.join('、')}
                  </div>
                )}
                {semanticAnalysis.tcmPerspective.constitution && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">体质倾向:</span>{' '}
                    {semanticAnalysis.tcmPerspective.constitution}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 图例 */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>骨骼线</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>轻度问题</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>中度问题</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>重度问题</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostureAnnotationCanvas;
