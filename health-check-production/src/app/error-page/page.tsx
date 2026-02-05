'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ExternalLink, Copy, CheckCircle, XCircle, RefreshCw, Smartphone } from 'lucide-react';

const CORRECT_URL = 'https://cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site';

export default function ErrorPage() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isCorrectUrl, setIsCorrectUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    setIsCorrectUrl(window.location.hostname.includes('dev.coze.site'));
  }, []);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(CORRECT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const openCorrectUrl = () => {
    window.location.href = CORRECT_URL;
  };

  const uninstallGuide = () => {
    window.location.href = '/install-guide';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  访问错误
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  请使用正确的地址重新安装应用
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 错误提示卡片 */}
        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl text-red-900 dark:text-red-100">
                  检测到错误的访问地址
                </CardTitle>
                <CardDescription className="text-base text-red-700 dark:text-red-300">
                  您正在使用一个无效的应用地址，这会导致无法正常访问
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                当前使用的错误地址：
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all text-red-600 dark:text-red-400">
                {currentUrl}
              </code>
            </div>

            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                可能的原因：
              </p>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                <li>您可能保存了Coze平台的项目页面地址（code.coze.cn）</li>
                <li>应用图标可能指向了过期的地址</li>
                <li>浏览器缓存了错误的URL</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 解决方案卡片 */}
        <Card className="border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-100">
                  解决方案
                </CardTitle>
                <CardDescription className="text-base text-emerald-700 dark:text-emerald-300">
                  按照以下步骤重新安装应用
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 正确地址 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                正确的访问地址：
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs md:text-sm bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded-lg font-mono flex-1 break-all text-emerald-800 dark:text-emerald-200">
                  {CORRECT_URL}
                </code>
                <Button
                  onClick={copyUrl}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                提示：地址包含 .dev.coze.site，这是正确的应用部署地址
              </p>
            </div>

            {/* 步骤2 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                卸载当前错误的应用
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• <strong>Android手机</strong>：长按应用图标 → 卸载</p>
                <p>• <strong>iPhone手机</strong>：长按应用图标 → 删除应用</p>
                <p>• <strong>电脑桌面</strong>：右键应用图标 → 卸载</p>
              </div>
            </div>

            {/* 步骤3 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                访问正确的地址并重新安装
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={openCorrectUrl}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white flex items-center gap-2"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  立即打开正确的应用
                </Button>
                <Button
                  onClick={uninstallGuide}
                  variant="outline"
                  size="lg"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  查看详细安装指南
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 对比卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">如何区分正确的地址？</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  ❌ 错误的地址
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <li>• 包含 code.coze.cn</li>
                  <li>• 包含 /p/7598103135101599785</li>
                  <li>• 可能显示"欢迎使用扣子"登录页面</li>
                </ul>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  ✅ 正确的地址
                </p>
                <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                  <li>• 包含 .dev.coze.site</li>
                  <li>• 地址类似 cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site</li>
                  <li>• 直接显示"健康自我管理"首页</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 重要提示 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                重要提示
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
                <li>
                  • 应用地址以 <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.dev.coze.site</code> 结尾才是正确的
                </li>
                <li>
                  • 正确的地址会直接显示"健康自我管理"首页，不需要登录
                </li>
                <li>
                  • 如果在安装前看到登录页面，请立即停止，检查地址是否正确
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={openCorrectUrl}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            前往正确地址
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            刷新当前页面
          </Button>
        </div>
      </main>
    </div>
  );
}
