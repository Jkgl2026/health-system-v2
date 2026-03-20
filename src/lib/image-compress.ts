/**
 * 图片压缩工具
 * 用于压缩上传的图片，防止 MediaPipe WASM 内存溢出
 */

export interface CompressOptions {
  maxWidth?: number;      // 最大宽度
  maxHeight?: number;     // 最大高度
  quality?: number;       // 质量 (0-1)
  maxSizeKB?: number;     // 最大文件大小(KB)
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  maxSizeKB: 500,
};

/**
 * 压缩图片
 * @param file 图片文件或 Base64 字符串
 * @param options 压缩选项
 * @returns 压缩后的 Base64 字符串
 */
export async function compressImage(
  file: File | string,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 如果是 File 对象，先转换为 Base64
  let dataUrl: string;
  if (file instanceof File) {
    dataUrl = await fileToBase64(file);
  } else {
    dataUrl = file;
  }
  
  // 创建图片对象
  const img = await loadImage(dataUrl);
  
  // 计算压缩后的尺寸
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  
  // 如果图片尺寸在范围内，且文件大小符合要求，直接返回
  if (width <= opts.maxWidth! && height <= opts.maxHeight!) {
    const sizeKB = getBase64Size(dataUrl);
    if (sizeKB <= opts.maxSizeKB!) {
      console.log(`[ImageCompress] 图片尺寸和大小符合要求，无需压缩: ${width}x${height}, ${sizeKB}KB`);
      return dataUrl;
    }
  }
  
  // 计算缩放比例
  const scaleW = opts.maxWidth! / width;
  const scaleH = opts.maxHeight! / height;
  const scale = Math.min(scaleW, scaleH, 1); // 不放大图片
  
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  
  console.log(`[ImageCompress] 压缩图片: ${width}x${height} -> ${newWidth}x${newHeight}`);
  
  // 创建 Canvas 进行压缩
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文');
  }
  
  // 使用高质量缩放
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // 绘制图片
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  // 转换为 Base64
  let result = canvas.toDataURL('image/jpeg', opts.quality);
  
  // 如果仍然超过大小限制，降低质量再压缩
  let currentQuality = opts.quality!;
  while (getBase64Size(result) > opts.maxSizeKB! && currentQuality > 0.1) {
    currentQuality -= 0.1;
    result = canvas.toDataURL('image/jpeg', currentQuality);
    console.log(`[ImageCompress] 降低质量至 ${currentQuality.toFixed(1)}`);
  }
  
  const finalSizeKB = getBase64Size(result);
  console.log(`[ImageCompress] 压缩完成: ${finalSizeKB}KB`);
  
  return result;
}

/**
 * File 转 Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 获取 Base64 字符串的大小(KB)
 */
function getBase64Size(base64: string): number {
  // 移除 data:image/xxx;base64, 前缀
  const base64Data = base64.split(',')[1] || base64;
  // Base64 编码后的大小约为原始数据的 4/3
  const sizeInBytes = (base64Data.length * 3) / 4;
  return sizeInBytes / 1024;
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  images: Record<string, string | null>,
  options: CompressOptions = {}
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  
  for (const [key, value] of Object.entries(images)) {
    if (value) {
      try {
        result[key] = await compressImage(value, options);
      } catch (error) {
        console.error(`[ImageCompress] 压缩 ${key} 失败:`, error);
        result[key] = value; // 保留原图
      }
    } else {
      result[key] = null;
    }
  }
  
  return result;
}

/**
 * 获取图片尺寸信息
 */
export async function getImageInfo(src: string): Promise<{
  width: number;
  height: number;
  sizeKB: number;
}> {
  const img = await loadImage(src);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    sizeKB: getBase64Size(src),
  };
}
