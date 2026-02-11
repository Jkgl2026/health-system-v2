'use client';

import { Share2, Plus, House } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IOSInstallGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            如何添加到主屏幕
          </h1>
          <p className="text-gray-600">
            只需几步，即可在 iPhone 上像原生应用一样使用健康管理
          </p>
        </div>

        {/* 步骤卡片 */}
        <div className="space-y-6">
          {/* 步骤 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">打开 Safari 浏览器</h3>
                <p className="text-gray-600">
                  确保您使用的是 Safari 浏览器访问本应用，而不是其他浏览器。
                </p>
              </div>
            </div>
          </div>

          {/* 步骤 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">点击分享按钮</h3>
                <p className="text-gray-600 mb-3">
                  在屏幕底部，找到并点击<span className="font-semibold text-emerald-600">分享图标</span>
                </p>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                  <Share2 className="h-12 w-12 text-gray-700" />
                  <span className="ml-3 text-gray-600 font-medium">
                    (方框中向上箭头的图标)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">滚动找到添加选项</h3>
                <p className="text-gray-600 mb-3">
                  在弹出的菜单中向下滑动，找到并点击
                  <span className="font-semibold text-emerald-600">
                    "添加到主屏幕"
                  </span>
                </p>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                  <Plus className="h-10 w-10 text-gray-700" />
                  <House className="h-10 w-10 text-gray-700 ml-2" />
                  <span className="ml-3 text-gray-600 font-medium">
                    "添加到主屏幕"
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 步骤 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">点击添加完成</h3>
                <p className="text-gray-600">
                  确认应用名称后，点击右上角的<span className="font-semibold text-emerald-600">"添加"</span>按钮
                </p>
              </div>
            </div>
          </div>

          {/* 提示卡片 */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-xl mb-3">✨ 完成！</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-200">✓</span>
                <span>应用图标会出现在主屏幕上</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-200">✓</span>
                <span>点击即可快速打开，像原生应用一样</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-200">✓</span>
                <span>可以离线访问部分功能</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-200">✓</span>
                <span>不占用手机存储空间</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => window.close()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold"
          >
            我知道了，返回应用
          </Button>
        </div>
      </div>
    </div>
  );
}
