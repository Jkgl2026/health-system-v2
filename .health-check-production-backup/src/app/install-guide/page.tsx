'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Monitor, Download, Share2, Plus, ArrowRight, CheckCircle, Globe, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InstallGuidePage() {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');
  const [browserName, setBrowserName] = useState<string>('');
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 检测设备类型
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(userAgent);
    const isDesktop = !/Mobi|Android/i.test(userAgent);

    if (isIOS) setDeviceType('ios');
    else if (isAndroid) setDeviceType('android');
    else if (isDesktop) setDeviceType('desktop');

    // 检测浏览器
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      setBrowserName('Chrome');
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      setBrowserName('Safari');
    } else if (userAgent.includes('Edg')) {
      setBrowserName('Edge');
    } else if (userAgent.includes('Firefox')) {
      setBrowserName('Firefox');
    } else {
      setBrowserName('未知浏览器');
    }
  }, []);

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'android':
      case 'ios':
        return <Smartphone className="h-6 w-6" />;
      case 'desktop':
        return <Monitor className="h-6 w-6" />;
      default:
        return <Globe className="h-6 w-6" />;
    }
  };

  const getDeviceName = () => {
    switch (deviceType) {
      case 'android':
        return 'Android 手机';
      case 'ios':
        return 'iPhone / iPad';
      case 'desktop':
        return '电脑';
      default:
        return '设备';
    }
  };

  const androidSteps = [
    {
      title: '等待安装提示',
      description: '在 Chrome 浏览器中访问应用，3秒后底部会自动弹出安装提示',
      icon: <Download className="h-8 w-8" />,
      highlight: true
    },
    {
      title: '点击安装按钮',
      description: '点击屏幕下方的"安装应用到桌面"按钮',
      icon: <Plus className="h-8 w-8" />
    },
    {
      title: '确认安装',
      description: '在弹出的确认对话框中点击"安装"按钮',
      icon: <CheckCircle className="h-8 w-8" />
    },
    {
      title: '完成！',
      description: '应用图标会出现在主屏幕上，点击即可快速访问',
      icon: <CheckCircle className="h-8 w-8 text-emerald-600" />
    }
  ];

  const iosSteps = [
    {
      title: '使用 Safari 浏览器',
      description: '必须使用 Safari 浏览器访问应用，不要使用其他浏览器',
      icon: <Share2 className="h-8 w-8" />,
      highlight: true
    },
    {
      title: '点击分享按钮',
      description: '在屏幕底部找到并点击分享图标（方框中向上箭头）',
      icon: <Share2 className="h-8 w-8" />
    },
    {
      title: '选择添加到主屏幕',
      description: '在弹出的菜单中向下滑动，找到"添加到主屏幕"并点击',
      icon: <Plus className="h-8 w-8" />
    },
    {
      title: '确认添加',
      description: '确认应用名称后，点击右上角的"添加"按钮',
      icon: <CheckCircle className="h-8 w-8" />
    },
    {
      title: '完成！',
      description: '应用图标会出现在主屏幕上，点击即可快速访问',
      icon: <CheckCircle className="h-8 w-8 text-emerald-600" />
    }
  ];

  const desktopSteps = [
    {
      title: '等待安装提示',
      description: '在 Chrome 或 Edge 浏览器中访问应用，地址栏右侧会显示安装图标',
      icon: <Download className="h-8 w-8" />,
      highlight: true
    },
    {
      title: '点击安装图标',
      description: '点击地址栏右侧的安装图标',
      icon: <Plus className="h-8 w-8" />
    },
    {
      title: '确认安装',
      description: '在弹出的对话框中点击"安装应用"按钮',
      icon: <CheckCircle className="h-8 w-8" />
    },
    {
      title: '完成！',
      description: '应用会在桌面和开始菜单中创建快捷方式，点击即可快速访问',
      icon: <CheckCircle className="h-8 w-8 text-emerald-600" />
    }
  ];

  const getCurrentSteps = () => {
    switch (deviceType) {
      case 'android':
        return androidSteps;
      case 'ios':
        return iosSteps;
      case 'desktop':
        return desktopSteps;
      default:
        return androidSteps;
    }
  };

  const getCurrentTitle = () => {
    switch (deviceType) {
      case 'android':
        return 'Android 手机安装指南';
      case 'ios':
        return 'iPhone / iPad 安装指南';
      case 'desktop':
        return '电脑安装指南';
      default:
        return '应用安装指南';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  应用安装指南
                </h1>
                <p className="text-sm text-gray-600">
                  一键安装，快速访问健康管理应用
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              返回首页
            </Button>
          </div>
        </div>
      </header>

      {/* 正确访问地址提示 */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">正确访问地址：</span>
            <code className="bg-white px-2 py-1 rounded text-xs font-mono">cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site</code>
            <span className="text-blue-600">（无需登录，可直接访问）</span>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-12">
        {/* 正确访问地址重要提示 */}
        <Card className="max-w-4xl mx-auto mb-8 border-2 border-red-400 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-red-800">
              <AlertCircle className="h-6 w-6" />
              <span>⚠️ 重要：请使用正确的访问地址</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-red-900 font-semibold mb-2">
                  ❌ 不要访问：https://code.coze.cn/p/7598103135101599785/...
                </p>
                <p className="text-red-700 text-sm">
                  这是 Coze 平台项目页面，需要登录，无法正常使用应用
                </p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-4 border-2 border-emerald-400">
                <p className="text-emerald-900 font-bold text-lg mb-1">
                  ✅ 请访问：cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site
                </p>
                <p className="text-emerald-800 text-sm">
                  这是应用的实际部署地址，无需登录，可直接访问
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => router.push('/')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    立即打开应用
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      alert('已复制地址到剪贴板');
                    }}
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    复制地址
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 当前设备信息 */}
        {deviceType !== 'unknown' && (
          <Card className="max-w-4xl mx-auto mb-8 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="bg-emerald-600 text-white p-3 rounded-xl">
                  {getDeviceIcon()}
                </div>
                <span>
                  检测到您正在使用 {getDeviceName()}
                  <span className="text-base text-gray-600 ml-2">({browserName})</span>
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                以下是为您准备的专属安装步骤
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 重要提示 */}
        <Card className="max-w-4xl mx-auto mb-8 border-2 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-amber-800">
              <AlertCircle className="h-6 w-6" />
              <span>⚠️ 重要安装提示</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <p className="text-amber-900">
                  <strong>确保在应用首页安装</strong>：必须在应用首页看到"健康自我管理"标题和内容时，才能点击安装按钮
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <p className="text-amber-900">
                  <strong>不要在登录页面安装</strong>：如果看到"欢迎使用扣子"或"手机号登录"等登录页面，请先完成登录或刷新页面，直到看到应用内容再安装
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <p className="text-amber-900">
                  <strong>刷新页面重新安装</strong>：如果已经安装但打开后显示登录页面，请删除已安装的应用，刷新页面后重新安装
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安装步骤 */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{getCurrentTitle()}</CardTitle>
            <CardDescription>
              按照以下步骤，几分钟内即可完成安装
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentSteps().map((step, index) => (
                <div
                  key={index}
                  className={`flex gap-4 p-6 rounded-2xl border-2 transition-all ${
                    step.highlight
                      ? 'bg-gradient-to-r from-emerald-100 to-blue-100 border-emerald-300'
                      : 'bg-white border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      step.highlight
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          step.highlight ? 'bg-white/80' : 'bg-emerald-100'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 其他平台安装方法 */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">其他平台安装方法</CardTitle>
            <CardDescription>
              查看在不同设备上的安装步骤
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="android" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="ios">iOS</TabsTrigger>
                <TabsTrigger value="desktop">电脑</TabsTrigger>
              </TabsList>

              <TabsContent value="android" className="mt-6">
                <div className="space-y-3">
                  {androidSteps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ios" className="mt-6">
                <div className="space-y-3">
                  {iosSteps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="desktop" className="mt-6">
                <div className="space-y-3">
                  {desktopSteps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 优势说明 */}
        <Card className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">✨ 安装后的优势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: '快速访问', desc: '点击桌面图标直接打开，无需每次都打开浏览器' },
                { title: '全屏体验', desc: '像原生应用一样的全屏界面，更加专注' },
                { title: '离线使用', desc: '部分功能支持离线访问，网络不稳定也能使用' },
                { title: '节省空间', desc: '几乎不占用设备存储空间，只是一个网页快捷方式' },
                { title: '自动更新', desc: '始终保持最新版本，无需手动更新' },
                { title: '数据安全', desc: '所有数据自动保存到云端，换设备也能找回' },
              ].map((item, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/90">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">常见问题</CardTitle>
            <CardDescription>
              安装和使用过程中的常见疑问解答
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span>Q: 安装后打开显示登录页面怎么办？</span>
                </h3>
                <p className="text-red-900 ml-7 mb-2">
                  如果安装后打开应用显示"欢迎使用扣子"或"手机号登录"等登录页面，说明您在错误的页面安装了应用。
                </p>
                <div className="ml-7 space-y-2 text-red-800">
                  <p><strong>解决方法：</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>删除已安装的应用</li>
                    <li>刷新浏览器页面</li>
                    <li>确保看到"健康自我管理"标题和应用内容（非登录页面）</li>
                    <li>重新按照步骤安装应用</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Q</span>
                  为什么 iPhone 没有自动弹出安装提示？
                </h3>
                <p className="text-gray-600 ml-10">
                  iOS 系统为了保护用户隐私，不支持 PWA 自动安装。您需要手动通过 Safari
                  浏览器的分享按钮，选择"添加到主屏幕"来完成安装。请参考上面的 iOS 安装步骤。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Q</span>
                  安装后应用图标显示不完整怎么办？
                </h3>
                <p className="text-gray-600 ml-10">
                  第一次打开应用时可能会显示加载动画，关闭应用后再次打开即可正常显示完整的应用图标。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Q</span>
                  如何卸载已安装的应用？
                </h3>
                <p className="text-gray-600 ml-10">
                  与卸载普通应用相同：手机上长按图标选择删除，电脑上右键点击图标选择卸载。
                  删除应用不会影响您在云端保存的健康数据。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Q</span>
                  应用会占用多少手机存储空间？
                </h3>
                <p className="text-gray-600 ml-10">
                  PWA 应用几乎不占用存储空间，只是一个网页快捷方式，所有数据都存储在云端服务器。
                  您的健康数据会自动同步，随时可以访问。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Q</span>
                  需要手动更新应用吗？
                </h3>
                <p className="text-gray-600 ml-10">
                  不需要！每次打开应用时都会自动获取最新版本，您始终使用的是最新、最稳定的应用版本。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速开始 */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">🚀 开始您的健康自检之旅</h2>
              <p className="text-xl text-white/90 mb-8">
                按照上述步骤安装应用，开始科学的健康管理
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/')}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold"
                >
                  返回首页开始自检
                </Button>
                <Button
                  size="lg"
                  onClick={() => window.open('/ios-install-guide', '_blank')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold"
                >
                  查看详细 iOS 指导
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
