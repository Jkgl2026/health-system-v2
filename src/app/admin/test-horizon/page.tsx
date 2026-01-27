'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserDetailHorizon from '@/app/admin/user-detail-horizon';

// 模拟测试数据
const mockUserData = {
  user: {
    id: 'test-001',
    name: '测试用户',
    phone: '13800138000',
    age: 30,
    gender: '男',
    height: 175,
    weight: 70,
    bmi: 22.9,
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
  },
  symptomChecks: [
    {
      id: 'check-001',
      checkedSymptoms: ['1', '4', '5', '10', '16', '30', '35', '41', '55', '62', '63', '68'],
      totalScore: 12,
      checkedAt: new Date().toISOString(),
    }
  ],
  healthAnalysis: [
    {
      id: 'analysis-001',
      qiAndBlood: 65,
      circulation: 60,
      toxins: 70,
      bloodLipids: 75,
      coldness: 55,
      immunity: 68,
      emotions: 72,
      overallHealth: 66,
      analyzedAt: new Date().toISOString(),
    }
  ],
  userChoices: [
    {
      id: 'choice-001',
      planType: '综合调理',
      planDescription: '气血不足，需要重点调理',
      selectedAt: new Date().toISOString(),
    }
  ],
  requirements: {
    id: 'req-001',
    requirement1Completed: true,
    requirement2Completed: true,
    requirement3Completed: false,
    requirement4Completed: false,
    completedAt: new Date().toISOString(),
    badHabitsChecklist: [1, 5, 10, 15, 20, 25, 30, 35],
    symptoms300Checklist: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    sevenQuestionsAnswers: {
      '1': '经常，每天都要熬夜到12点以后',
      '2': '一般，大概有7-8个小时',
      '3': '有时，天气变化时会失眠',
      '4': '很少，基本每天都吃早餐',
      '5': '有时，工作压力大时会忘',
      '6': '一般，每天喝6杯水左右',
      '7': '很少，基本不运动',
    }
  }
};

export default function TestHorizonLayoutPage() {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">横向布局测试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">测试说明</h3>
            <p className="text-sm text-gray-600">
              此页面用于测试新的横向布局用户详情对话框。
              点击下方按钮打开横向布局对话框，查看所有13个模块的显示效果。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">✅ 已实现的模块</h4>
              <ul className="text-sm space-y-1">
                <li>第一行：基本信息、综合健康评分、健康状况解析、改善路径</li>
                <li>第二行：中医分析、健康七问V2、推荐产品</li>
                <li>第三行：推荐课程、分阶段调理计划</li>
                <li>第四行：不良生活习惯、身体语言简表</li>
                <li>第五行：300项症状自检表</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 布局特点</h4>
              <ul className="text-sm space-y-1">
                <li>✓ 横向布局，充分利用宽屏</li>
                <li>✓ 网格系统：4×4、8×8、3×3</li>
                <li>✓ 信息密度高，一屏显示更多</li>
                <li>✓ 视觉统一，渐变背景区分模块</li>
                <li>✓ 对话框宽度：95vw，最大1800px</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={() => setShowDetail(true)}
            className="w-full h-12 text-lg"
            size="lg"
          >
            打开横向布局用户详情
          </Button>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold mb-2">📊 测试数据</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <p><strong>用户：</strong>{mockUserData.user.name}</p>
              <p><strong>身体语言：</strong>{mockUserData.symptomChecks[0].checkedSymptoms.length}项</p>
              <p><strong>不良习惯：</strong>{mockUserData.requirements.badHabitsChecklist.length}项</p>
              <p><strong>症状300：</strong>{mockUserData.requirements.symptoms300Checklist.length}项</p>
              <p><strong>健康七问：</strong>{Object.keys(mockUserData.requirements.sevenQuestionsAnswers).length}个已回答</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserDetailHorizon
        open={showDetail}
        onOpenChange={setShowDetail}
        userData={mockUserData}
      />
    </div>
  );
}
