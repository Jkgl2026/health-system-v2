/**
 * PDF中文字体支持
 * 使用 jspdf + 中文字体方案
 */

import { jsPDF } from 'jspdf';

// 中文字体Base64（精简版，仅包含常用汉字）
// 这里使用思源黑体的子集，包含约3500个常用汉字
let chineseFontLoaded = false;
let chineseFontBase64: string | null = null;

// 字体加载状态
export const isChineseFontReady = () => chineseFontLoaded;

/**
 * 加载中文字体
 * 从CDN或本地加载字体文件
 */
export async function loadChineseFont(): Promise<boolean> {
  if (chineseFontLoaded) return true;
  
  try {
    // 尝试从本地加载字体
    const fontUrl = '/fonts/NotoSansSC-Regular-subset.ttf';
    
    // 使用fetch加载字体文件
    const response = await fetch(fontUrl);
    if (!response.ok) {
      console.warn('[PDF] 本地字体文件不存在，使用备用方案');
      return false;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    chineseFontBase64 = arrayBufferToBase64(arrayBuffer);
    chineseFontLoaded = true;
    console.log('[PDF] 中文字体加载成功');
    return true;
  } catch (error) {
    console.warn('[PDF] 加载中文字体失败:', error);
    return false;
  }
}

/**
 * ArrayBuffer转Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 创建支持中文的PDF文档
 */
export async function createChinesePDF(): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // 尝试加载中文字体
  const fontLoaded = await loadChineseFont();
  
  if (fontLoaded && chineseFontBase64) {
    try {
      // 添加字体到虚拟文件系统
      doc.addFileToVFS('NotoSansSC.ttf', chineseFontBase64);
      // 注册字体
      doc.addFont('NotoSansSC.ttf', 'NotoSansSC', 'normal');
      // 设置为默认字体
      doc.setFont('NotoSansSC');
      console.log('[PDF] 中文字体设置成功');
    } catch (error) {
      console.warn('[PDF] 设置中文字体失败:', error);
    }
  }
  
  return doc;
}

/**
 * 使用图片方式渲染中文文本
 * 当字体不可用时的备用方案
 */
export async function renderChineseTextAsImage(
  text: string,
  options: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    width?: number;
  } = {}
): Promise<string | null> {
  const { fontSize = 16, color = '#333333', backgroundColor = 'transparent', width = 200 } = options;
  
  try {
    // 创建canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // 设置canvas尺寸
    ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = Math.min(metrics.width + 20, width);
    const textHeight = fontSize * 1.5;
    
    canvas.width = textWidth * 2; // 2x for retina
    canvas.height = textHeight * 2;
    ctx.scale(2, 2);
    
    // 绘制背景
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, textWidth, textHeight);
    }
    
    // 绘制文字
    ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 10, textHeight / 2);
    
    // 返回Base64图片
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('[PDF] 渲染中文文本为图片失败:', error);
    return null;
  }
}
