import { deflateSync, inflateSync } from 'zlib';

/**
 * 数据压缩工具
 * 用于压缩和解压缩大型JSONB字段，减少存储空间占用
 */

/**
 * 压缩数据对象
 * @param data - 要压缩的数据对象
 * @returns 压缩后的Base64字符串
 */
export function compressData(data: any): string {
  try {
    // 将对象转换为JSON字符串
    const jsonString = JSON.stringify(data);

    // 检查数据大小，如果小于1KB则不压缩
    if (jsonString.length < 1024) {
      return jsonString;
    }

    // 压缩数据
    const compressed = deflateSync(Buffer.from(jsonString, 'utf-8'));

    // 转换为Base64字符串存储
    return `ZLIB:${compressed.toString('base64')}`;
  } catch (error) {
    console.error('压缩数据失败:', error);
    // 压缩失败则返回原始JSON字符串
    return JSON.stringify(data);
  }
}

/**
 * 解压缩数据
 * @param compressedData - 压缩后的Base64字符串或原始JSON字符串
 * @returns 解压缩后的数据对象
 */
export function decompressData(compressedData: string): any {
  try {
    // 检查是否为压缩数据
    if (compressedData.startsWith('ZLIB:')) {
      // 移除ZLIB:前缀
      const base64 = compressedData.slice(5);

      // 从Base64转换为Buffer
      const compressed = Buffer.from(base64, 'base64');

      // 解压数据
      const decompressed = inflateSync(compressed);

      // 解析为对象
      return JSON.parse(decompressed.toString('utf-8'));
    } else {
      // 原始JSON字符串，直接解析
      return JSON.parse(compressedData);
    }
  } catch (error) {
    console.error('解压缩数据失败:', error);
    // 解压缩失败，尝试直接解析
    try {
      return JSON.parse(compressedData);
    } catch (e) {
      console.error('解析JSON字符串也失败:', e);
      return null;
    }
  }
}

/**
 * 估算压缩比
 * @param data - 要估算的数据对象
 * @returns 压缩前和压缩后的大小（字节）以及压缩比
 */
export function estimateCompressionRatio(data: any): {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  shouldCompress: boolean;
} {
  const jsonString = JSON.stringify(data);
  const originalSize = Buffer.byteLength(jsonString, 'utf-8');

  // 如果小于1KB，建议不压缩
  if (originalSize < 1024) {
    return {
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      shouldCompress: false,
    };
  }

  try {
    const compressed = deflateSync(Buffer.from(jsonString, 'utf-8'));
    const compressedSize = compressed.length + 5; // +5 是 "ZLIB:" 前缀的长度
    const ratio = compressedSize / originalSize;

    return {
      originalSize,
      compressedSize,
      ratio,
      shouldCompress: ratio < 0.8, // 如果压缩后小于80%，则建议压缩
    };
  } catch (error) {
    console.error('估算压缩比失败:', error);
    return {
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      shouldCompress: false,
    };
  }
}

/**
 * 批量压缩对象中的指定字段
 * @param obj - 要处理的对象
 * @param fieldsToCompress - 需要压缩的字段名数组
 * @returns 处理后的对象（带压缩标记）
 */
export function compressObjectFields<T extends Record<string, any>>(
  obj: T,
  fieldsToCompress: (keyof T)[]
): T {
  const result = { ...obj };
  const compressedFields: string[] = [];

  for (const field of fieldsToCompress) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const compressed = compressData(obj[field]);
      result[field] = compressed as any;

      // 记录哪些字段被压缩了
      if (compressed.startsWith('ZLIB:')) {
        compressedFields.push(field as string);
      }
    }
  }

  // 添加压缩标记字段
  (result as any)._compressedFields = compressedFields;

  return result;
}

/**
 * 批量解压缩对象中的字段
 * @param obj - 要处理的对象
 * @returns 处理后的对象（已解压缩）
 */
export function decompressObjectFields<T extends Record<string, any>>(
  obj: T
): T {
  const result = { ...obj };
  const compressedFields = (obj as any)._compressedFields as string[] || [];

  for (const field of compressedFields) {
    if (result[field] !== undefined && result[field] !== null) {
      const decompressed = decompressData(result[field] as string);
      result[field] = decompressed as any;
    }
  }

  // 移除压缩标记字段
  delete (result as any)._compressedFields;

  return result;
}

/**
 * 格式化字节大小
 * @param bytes - 字节数
 * @returns 易读的格式（如 "1.5 MB"）
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 检查数据是否为压缩格式
 * @param data - 要检查的数据
 * @returns 是否为压缩格式
 */
export function isCompressed(data: string): boolean {
  return typeof data === 'string' && data.startsWith('ZLIB:');
}
