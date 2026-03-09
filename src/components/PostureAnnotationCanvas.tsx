'use client';

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Maximize2 } from 'lucide-react';

interface ComparisonData {
  beforeImage: string;
  afterImage: string;
  beforeData: {
    score: number;
    grade: string;
    bodyStructure?: any;
  };
  afterData: {
    score: number;
    grade: string;
    bodyStructure?: any;
  };
  improvements: Array<{ area: string; change: string }>;
  deteriorations: Array<{ area: string; change: string }>;
  angle: 'front' | 'leftSide' | 'rightSide' | 'back';
}

interface PostureAnnotationCanvasProps {
  comparison: ComparisonData;
  width?: number;
  height?: number;
}

export function PostureAnnotationCanvas({ comparison, width = 600, height = 400 }: PostureAnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showFullView, setShowFullView] = useState(false);

  useEffect(() => {
    drawComparison();
  }, [comparison]);

  const drawComparison = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 绘制标题
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI体态对比分析', width / 2, 25);

    // 分割线
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 35);
    ctx.lineTo(width / 2, height - 20);
    ctx.stroke();

    // 加载并绘制图片
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      // 绘制"之前"图片
      if (comparison.beforeImage) {
        try {
          const beforeImg = await loadImage(comparison.beforeImage);
          const imgWidth = (width / 2) - 40;
          const imgHeight = height - 120;
          const scale = Math.min(imgWidth / beforeImg.width, imgHeight / beforeImg.height);
          const scaledWidth = beforeImg.width * scale;
          const scaledHeight = beforeImg.height * scale;
          const x = (width / 4) - (scaledWidth / 2);
          const y = 50;
          
          ctx.drawImage(beforeImg, x, y, scaledWidth, scaledHeight);
          
          // 绘制标签
          ctx.fillStyle = '#64748b';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('评估前', width / 4, 45);
          
          // 绘制分数
          ctx.fillStyle = comparison.beforeData.score >= 70 ? '#22c55e' : '#ef4444';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`评分: ${comparison.beforeData.score}分`, width / 4, height - 35);
        } catch {
          // 图片加载失败，绘制占位符
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(20, 50, (width / 2) - 40, height - 120);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.fillText('图片加载失败', width / 4, height / 2);
        }
      }

      // 绘制"之后"图片
      if (comparison.afterImage) {
        try {
          const afterImg = await loadImage(comparison.afterImage);
          const imgWidth = (width / 2) - 40;
          const imgHeight = height - 120;
          const scale = Math.min(imgWidth / afterImg.width, imgHeight / afterImg.height);
          const scaledWidth = afterImg.width * scale;
          const scaledHeight = afterImg.height * scale;
          const x = (width * 3 / 4) - (scaledWidth / 2);
          const y = 50;
          
          ctx.drawImage(afterImg, x, y, scaledWidth, scaledHeight);
          
          // 绘制标签
          ctx.fillStyle = '#64748b';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('评估后', (width * 3) / 4, 45);
          
          // 绘制分数
          const scoreChange = comparison.afterData.score - comparison.beforeData.score;
          ctx.fillStyle = scoreChange >= 0 ? '#22c55e' : '#ef4444';
          ctx.font = 'bold 14px sans-serif';
          const changeText = scoreChange >= 0 ? `+${scoreChange}` : `${scoreChange}`;
          ctx.fillText(`评分: ${comparison.afterData.score}分 (${changeText})`, (width * 3) / 4, height - 35);
        } catch {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect((width / 2) + 20, 50, (width / 2) - 40, height - 120);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.fillText('图片加载失败', (width * 3) / 4, height / 2);
        }
      }

      // 绘制标注区域
      drawAnnotations(ctx, width, height);

    } catch (error) {
      console.error('Error drawing comparison:', error);
    }
  };

  const drawAnnotations = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 绘制改善区域标注
    if (comparison.improvements && comparison.improvements.length > 0) {
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      
      comparison.improvements.slice(0, 3).forEach((item, index) => {
        const y = height - 80 + (index * 14);
        ctx.fillText(`✓ ${item.area}: ${item.change}`, 10, y);
      });
    }

    // 绘制恶化区域标注
    if (comparison.deteriorations && comparison.deteriorations.length > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      
      comparison.deteriorations.slice(0, 3).forEach((item, index) => {
        const y = height - 80 + (index * 14);
        ctx.fillText(`✗ ${item.area}: ${item.change}`, width - 10, y);
      });
    }

    // 绘制角度标签
    const angleLabels: Record<string, string> = {
      front: '正面',
      leftSide: '左侧',
      rightSide: '右侧',
      back: '背面'
    };
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`视角: ${angleLabels[comparison.angle] || comparison.angle}`, width / 2, height - 5);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `posture-comparison-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">AI差异标注图</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={downloadImage}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFullView(!showFullView)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`relative ${showFullView ? '' : 'overflow-hidden'}`}>
          <canvas
            ref={canvasRef}
            className={`w-full border rounded-lg ${showFullView ? '' : 'max-h-96'}`}
            style={{ aspectRatio: `${width}/${height}` }}
          />
        </div>
        
        {/* 图例 */}
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>改善区域</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>需关注区域</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>当前视角</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostureAnnotationCanvas;
