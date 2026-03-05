'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, FileJson, Printer, AlertCircle, CheckCircle } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: string[];
  allUserCount: number;
}

export function ExportDialog({ open, onOpenChange, selectedUsers, allUserCount }: ExportDialogProps) {
  const [exportMode, setExportMode] = useState<'summary' | 'detailed' | 'report'>('summary');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportScope, setExportScope] = useState<'selected' | 'all'>('selected');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const userIds = exportScope === 'selected' ? selectedUsers : [];

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userIds,
          mode: exportMode,
          format: exportFormat,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({ type: 'error', text: data.error || '导出失败' });
        return;
      }

      if (exportFormat === 'csv' && typeof data === 'string') {
        // CSV直接下载
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `健康数据导出_${new Date().toLocaleDateString('zh-CN')}.csv`;
        link.click();
        setMessage({ type: 'success', text: 'CSV文件已下载' });
      } else if (exportFormat === 'json') {
        // JSON下载
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `健康数据导出_${new Date().toLocaleDateString('zh-CN')}.json`;
        link.click();
        setMessage({ type: 'success', text: 'JSON文件已下载' });
      } else if (exportFormat === 'pdf') {
        // PDF模式 - 打开打印预览
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(generatePrintHTML(data.data));
          printWindow.document.close();
          printWindow.print();
          setMessage({ type: 'success', text: '请在打印预览中选择"另存为PDF"' });
        }
      }

      setTimeout(() => {
        onOpenChange(false);
        setMessage(null);
      }, 2000);
    } catch (error) {
      console.error('导出失败:', error);
      setMessage({ type: 'error', text: '导出失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const generatePrintHTML = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) return '<html><body>无数据</body></html>';

    let content = '';
    
    if (data[0].报告标题) {
      // 报告模式
      content = data.map(item => `
        <div class="report-page" style="page-break-after: always; padding: 20px;">
          <h1 style="text-align: center; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            ${item.报告标题}
          </h1>
          <p style="text-align: center; color: #666;">生成时间：${item.生成时间}</p>
          
          <h2 style="color: #333; margin-top: 20px;">基本信息</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(item.用户基本信息).map(([key, value]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; width: 120px;">${key}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
              </tr>
            `).join('')}
          </table>
          
          <h2 style="color: #333; margin-top: 20px;">健康评分</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">综合健康分</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-size: 24px; font-weight: bold; color: ${item.健康评分.综合健康分 >= 60 ? '#10b981' : '#ef4444'};">
                ${item.健康评分.综合健康分}
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">检测时间</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.健康评分.检测时间}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 15px;">各维度评分</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${Object.entries(item.健康评分.各维度评分).map(([key, value]) => `
              <div style="flex: 1; min-width: 100px; border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 8px;">
                <div style="font-size: 12px; color: #666;">${key}</div>
                <div style="font-size: 20px; font-weight: bold; color: ${Number(value) >= 60 ? '#10b981' : Number(value) >= 40 ? '#f59e0b' : '#ef4444'};">
                  ${value}
                </div>
              </div>
            `).join('')}
          </div>
          
          <h2 style="color: #333; margin-top: 20px;">症状统计</h2>
          <p>症状总数：${item.症状统计.症状总数} 项</p>
          
          <h2 style="color: #333; margin-top: 20px;">健康建议</h2>
          <ul style="padding-left: 20px;">
            ${item.健康建议.map((rec: string) => `<li style="margin: 5px 0;">${rec}</li>`).join('')}
          </ul>
          
          <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #10b981;">
            <p style="font-size: 12px; color: #666; margin: 0;">
              免责声明：本报告仅供参考，不构成医疗诊断建议。如有健康问题，请咨询专业医生。
            </p>
          </div>
        </div>
      `).join('');
    } else {
      // 摘要模式
      content = `
        <h1 style="text-align: center; color: #10b981;">健康数据导出报告</h1>
        <p style="text-align: center; color: #666;">共 ${data.length} 条记录</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #10b981; color: white;">
              ${Object.keys(data[0]).map(key => `<th style="border: 1px solid #ddd; padding: 8px;">${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                ${Object.values(row).map((val: any) => `<td style="border: 1px solid #ddd; padding: 8px;">${val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>健康数据报告</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          @media print {
            .report-page { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-500" />
            数据导出
          </DialogTitle>
          <DialogDescription>
            选择导出模式和格式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 导出范围 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">导出范围</Label>
            <RadioGroup value={exportScope} onValueChange={(v) => setExportScope(v as 'selected' | 'all')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer">
                  已选用户 ({selectedUsers.length} 人)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">
                  全部用户 ({allUserCount} 人)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 导出模式 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">导出模式</Label>
            <RadioGroup value={exportMode} onValueChange={(v) => setExportMode(v as any)}>
              <div className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="summary" id="summary" className="mt-1" />
                <div>
                  <Label htmlFor="summary" className="cursor-pointer font-medium">摘要模式</Label>
                  <p className="text-xs text-gray-500">基本信息 + 最新健康状态</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="detailed" id="detailed" className="mt-1" />
                <div>
                  <Label htmlFor="detailed" className="cursor-pointer font-medium">详细模式</Label>
                  <p className="text-xs text-gray-500">包含所有历史记录（仅JSON）</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="report" id="report" className="mt-1" />
                <div>
                  <Label htmlFor="report" className="cursor-pointer font-medium">报告模式</Label>
                  <p className="text-xs text-gray-500">生成健康报告，适合打印</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 导出格式 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">导出格式</Label>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('csv')}
                disabled={exportMode === 'detailed'}
                className={exportFormat === 'csv' ? 'bg-emerald-600' : ''}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('json')}
                className={exportFormat === 'json' ? 'bg-emerald-600' : ''}
              >
                <FileJson className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('pdf')}
                disabled={exportMode === 'detailed'}
                className={exportFormat === 'pdf' ? 'bg-emerald-600' : ''}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
            {exportFormat === 'pdf' && (
              <p className="text-xs text-gray-500">PDF格式将打开打印预览，请选择"另存为PDF"</p>
            )}
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={loading || selectedUsers.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-bounce" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                开始导出
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
