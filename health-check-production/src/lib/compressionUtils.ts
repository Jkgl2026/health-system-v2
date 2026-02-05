import zlib from 'zlib';

/**
 * 压缩配置
 */
export interface CompressionConfig {
  threshold?: number;      // 压缩阈值（字节），超过此大小才压缩
  algorithm?: 'gzip' | 'deflate' | 'brotli';  // 压缩算法
  level?: number;         // 压缩级别（0-9）
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  compressed: boolean;
  data: string;          // 压缩后的数据（Base64编码）
  originalSize: number;  // 原始大小（字节）
  compressedSize: number; // 压缩后大小（字节）
  compressionRatio: number; // 压缩比
  algorithm: string;     // 使用的算法
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CompressionConfig = {
  threshold: 1024,       // 超过1KB才压缩
  algorithm: 'gzip',
  level: 6,              // 默认压缩级别
};

/**
 * 压缩工具类
 */
export class CompressionUtils {
  private config: CompressionConfig;

  constructor(config?: CompressionConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 压缩对象
   */
  compressObject(obj: any): CompressionResult {
    try {
      // 转换为JSON字符串
      const jsonString = JSON.stringify(obj);
      const originalSize = Buffer.byteLength(jsonString, 'utf8');

      // 如果数据小于阈值，不压缩
      if (originalSize < (this.config.threshold || 0)) {
        return {
          compressed: false,
          data: jsonString,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
          algorithm: 'none',
        };
      }

      // 根据算法选择压缩函数
      let compressedBuffer: Buffer;
      const algorithm = this.config.algorithm || 'gzip';
      const level = this.config.level || 6;

      switch (algorithm) {
        case 'gzip':
          compressedBuffer = zlib.gzipSync(Buffer.from(jsonString, 'utf8'), { level });
          break;
        case 'deflate':
          compressedBuffer = zlib.deflateSync(Buffer.from(jsonString, 'utf8'), { level });
          break;
        case 'brotli':
          compressedBuffer = zlib.brotliCompressSync(Buffer.from(jsonString, 'utf8'), {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: level,
            },
          });
          break;
        default:
          throw new Error(`不支持的压缩算法: ${algorithm}`);
      }

      // 转换为Base64编码
      const compressedSize = compressedBuffer.length;
      const compressedData = compressedBuffer.toString('base64');
      const compressionRatio = compressedSize / originalSize;

      console.log('[CompressionUtils] 压缩完成:', {
        algorithm,
        originalSize,
        compressedSize,
        compressionRatio: `${(compressionRatio * 100).toFixed(2)}%`,
      });

      return {
        compressed: true,
        data: compressedData,
        originalSize,
        compressedSize,
        compressionRatio,
        algorithm,
      };
    } catch (error) {
      console.error('[CompressionUtils] 压缩失败:', error);
      throw new Error(`压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解压缩对象
   */
  decompressObject(data: string, algorithm: string = 'gzip'): any {
    try {
      // 如果未压缩，直接解析JSON
      if (algorithm === 'none') {
        return JSON.parse(data);
      }

      // 从Base64解码
      const compressedBuffer = Buffer.from(data, 'base64');

      // 根据算法选择解压缩函数
      let decompressedBuffer: Buffer;

      switch (algorithm) {
        case 'gzip':
          decompressedBuffer = zlib.gunzipSync(compressedBuffer);
          break;
        case 'deflate':
          decompressedBuffer = zlib.inflateSync(compressedBuffer);
          break;
        case 'brotli':
          decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);
          break;
        default:
          throw new Error(`不支持的解压缩算法: ${algorithm}`);
      }

      // 解析JSON
      const jsonString = decompressedBuffer.toString('utf8');
      const obj = JSON.parse(jsonString);

      console.log('[CompressionUtils] 解压缩完成:', {
        algorithm,
        compressedSize: compressedBuffer.length,
        decompressedSize: decompressedBuffer.length,
      });

      return obj;
    } catch (error) {
      console.error('[CompressionUtils] 解压缩失败:', error);
      throw new Error(`解压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 智能压缩（自动判断是否需要压缩）
   */
  smartCompress(obj: any): CompressionResult {
    const result = this.compressObject(obj);

    // 如果压缩后反而变大了，返回原始数据
    if (result.compressed && result.compressedSize > result.originalSize) {
      console.log('[CompressionUtils] 压缩后变大，返回原始数据');
      return {
        compressed: false,
        data: JSON.stringify(obj),
        originalSize: result.originalSize,
        compressedSize: result.originalSize,
        compressionRatio: 1,
        algorithm: 'none',
      };
    }

    return result;
  }

  /**
   * 批量压缩对象数组
   */
  compressObjects(objs: any[]): CompressionResult[] {
    return objs.map(obj => this.smartCompress(obj));
  }

  /**
   * 批量解压缩
   */
  decompressObjects(results: { data: string; algorithm: string }[]): any[] {
    return results.map(result => this.decompressObject(result.data, result.algorithm));
  }

  /**
   * 估算压缩后的数据大小（不实际压缩）
   */
  estimateCompressedSize(obj: any): number {
    try {
      const jsonString = JSON.stringify(obj);
      const originalSize = Buffer.byteLength(jsonString, 'utf8');
      
      // 基于经验公式估算压缩比（JSON数据通常可以压缩到原始大小的30-50%）
      const estimatedCompressionRatio = 0.4;
      
      return Math.ceil(originalSize * estimatedCompressionRatio);
    } catch (error) {
      console.error('[CompressionUtils] 估算压缩大小失败:', error);
      return 0;
    }
  }
}

/**
 * 创建压缩工具实例
 */
export function createCompressionUtils(config?: CompressionConfig): CompressionUtils {
  return new CompressionUtils(config);
}

/**
 * 默认压缩工具实例
 */
export const defaultCompressionUtils = new CompressionUtils();

/**
 * 辅助函数：压缩并存储（用于数据库存储）
 */
export function compressForStorage(obj: any, config?: CompressionConfig): {
  _compressed: boolean;
  _algorithm: string;
  _originalSize: number;
  _compressedSize: number;
  data: string;
} {
  const utils = new CompressionUtils(config);
  const result = utils.smartCompress(obj);

  return {
    _compressed: result.compressed,
    _algorithm: result.algorithm,
    _originalSize: result.originalSize,
    _compressedSize: result.compressedSize,
    data: result.data,
  };
}

/**
 * 辅助函数：从存储中解压缩
 */
export function decompressFromStorage(stored: {
  _compressed: boolean;
  _algorithm: string;
  data: string;
}): any {
  if (!stored._compressed || stored._algorithm === 'none') {
    return JSON.parse(stored.data);
  }

  const utils = new CompressionUtils();
  return utils.decompressObject(stored.data, stored._algorithm);
}

/**
 * 辅助函数：检测数据是否已被压缩
 */
export function isCompressedData(data: any): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    '_compressed' in data &&
    '_algorithm' in data &&
    'data' in data
  );
}

export default CompressionUtils;

/**
 * 格式化字节数为易读格式
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
