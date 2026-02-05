/**
 * 将数据转换为 CSV 格式
 * @param data 数据数组
 * @param headers CSV 头部
 * @returns CSV 字符串
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // 生成头部
  const headerRow = headers.map((h) => `"${h.label}"`).join(',');

  // 生成数据行
  const dataRows = data.map((item) => {
    return headers
      .map((h) => {
        const value = item[h.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * 下载 CSV 文件
 * @param csvContent CSV 内容
 * @param filename 文件名
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * 格式化日期为本地字符串
 * @param date 日期
 * @returns 格式化后的字符串
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('zh-CN');
}

/**
 * 格式化数组为字符串
 * @param arr 数组
 * @returns 格式化后的字符串
 */
export function formatArray(arr: any[] | null): string {
  if (!arr || arr.length === 0) return '';
  return arr.join('; ');
}
