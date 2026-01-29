/**
 * 数据库结构检查工具
 *
 * 用途：快速对比 schema 定义与实际数据库结构，防止因不一致导致的数据访问失败
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle } from 'lucide-react';

interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: string;
  defaultValue: string;
}

interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

export default function DbSchemaCheckPage() {
  const [loading, setLoading] = useState(false);
  const [schemaCheck, setSchemaCheck] = useState<{
    isCompatible: boolean;
    missingColumns: string[];
    extraColumns: string[];
    tables: TableSchema[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 执行结构检查
  const checkSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/db-schema-check');
      const result = await response.json();

      if (result.success) {
        setSchemaCheck(result);
      } else {
        setError(result.error || '检查失败');
      }
    } catch (e: any) {
      setError(`请求失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 自动修复
  const fixSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/_init');
      const result = await response.json();

      if (result.success) {
        alert(`修复成功！执行了 ${result.migrationsExecuted.length} 个迁移`);
        checkSchema();
      } else {
        setError(result.error || '修复失败');
      }
    } catch (e: any) {
      setError(`修复失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSchema();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">数据库结构检查</h1>
              <p className="text-gray-600">对比 schema 定义与实际数据库结构</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={checkSchema}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新检查
            </Button>
            {schemaCheck && !schemaCheck.isCompatible && (
              <Button
                onClick={fixSchema}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                自动修复
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">{error}</AlertDescription>
          </Alert>
        )}

        {schemaCheck && (
          <>
            {/* 兼容性状态 */}
            <Card className={`mb-6 ${
              schemaCheck.isCompatible
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {schemaCheck.isCompatible ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-900">数据库结构兼容</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <span className="text-red-900">数据库结构不兼容</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {schemaCheck.isCompatible
                    ? '数据库结构与 schema 定义完全一致'
                    : '发现结构差异，需要执行迁移'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!schemaCheck.isCompatible && (
                  <div className="space-y-4">
                    {schemaCheck.missingColumns.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">缺失的列:</h4>
                        <ul className="list-disc list-inside space-y-1 text-red-800">
                          {schemaCheck.missingColumns.map((col, idx) => (
                            <li key={idx} className="font-mono text-sm">{col}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {schemaCheck.extraColumns.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">额外的列:</h4>
                        <ul className="list-disc list-inside space-y-1 text-orange-800">
                          {schemaCheck.extraColumns.map((col, idx) => (
                            <li key={idx} className="font-mono text-sm">{col}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 表结构详情 */}
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-gray-900">表结构详情</h2>
              {schemaCheck.tables.map((table) => (
                <Card key={table.tableName}>
                  <CardHeader>
                    <CardTitle className="text-lg font-mono">{table.tableName}</CardTitle>
                    <CardDescription>{table.columns.length} 个字段</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-2 font-medium">列名</th>
                            <th className="text-left p-2 font-medium">数据类型</th>
                            <th className="text-left p-2 font-medium">可空</th>
                            <th className="text-left p-2 font-medium">默认值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((column) => (
                            <tr key={column.columnName} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-mono">{column.columnName}</td>
                              <td className="p-2 text-gray-600">{column.dataType}</td>
                              <td className="p-2">{column.isNullable}</td>
                              <td className="p-2 text-gray-500">{column.defaultValue || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
