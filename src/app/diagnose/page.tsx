'use client';

import { useState, useEffect } from 'react';

export default function DiagnosePage() {
  const [userData, setUserData] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    loadAllUserData();
  }, []);

  const loadAllUserData = async () => {
    try {
      const response = await fetch('/api/debug/check-user-data');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleTestSave = async (userId: string) => {
    try {
      // 测试保存自检数据
      const symptomResponse = await fetch('/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          checkedSymptoms: ['1', '2', '3'],
          totalScore: 3,
          elementScores: { '气血': 1, '循环': 1, '毒素': 1 }
        })
      });
      const symptomResult = await symptomResponse.json();
      console.log('Symptom check result:', symptomResult);

      // 测试保存健康分析数据
      const analysisResponse = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          qiAndBlood: 2,
          circulation: 1,
          toxins: 1,
          overallHealth: 4
        })
      });
      const analysisResult = await analysisResponse.json();
      console.log('Health analysis result:', analysisResult);

      // 测试保存用户选择
      const choiceResponse = await fetch('/api/user-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planType: '系统调理',
          planDescription: '测试方案'
        })
      });
      const choiceResult = await choiceResponse.json();
      console.log('User choice result:', choiceResult);

      // 测试保存要求
      const reqResponse = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requirement1Completed: true,
          requirement2Completed: true,
          requirement3Completed: true,
          requirement4Completed: true
        })
      });
      const reqResult = await reqResponse.json();
      console.log('Requirements result:', reqResult);

      alert('测试数据保存成功！请刷新页面查看。');
      loadAllUserData();
    } catch (error) {
      console.error('Test save failed:', error);
      alert('测试保存失败：' + error);
    }
  };

  if (!userData) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">用户数据诊断</h1>
      <div className="mb-4">
        <p>总用户数: {userData.summary.totalUsers}</p>
        <p>自检记录: {userData.summary.totalSymptomChecks}</p>
        <p>健康分析: {userData.summary.totalHealthAnalysis}</p>
        <p>选择方案: {userData.summary.totalUserChoices}</p>
        <p>要求记录: {userData.summary.totalRequirements}</p>
      </div>

      <div className="space-y-4">
        {userData.users.map((userItem: any) => (
          <div key={userItem.user.id} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">
                  {userItem.user.name || '未命名'} ({userItem.user.phone || '无手机号'})
                </h3>
                <p className="text-sm text-gray-500">ID: {userItem.user.id}</p>
                <p className="text-sm text-gray-500">注册时间: {userItem.user.createdAt}</p>
              </div>
              <button
                onClick={() => handleTestSave(userItem.user.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                测试保存数据
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold mb-1">自检状态</h4>
                {userItem.symptomChecks.count > 0 ? (
                  <div>
                    <span className="text-green-600">✓ 已完成 ({userItem.symptomChecks.count} 条记录)</span>
                    <pre className="text-xs mt-1">{JSON.stringify(userItem.symptomChecks.latest, null, 2)}</pre>
                  </div>
                ) : (
                  <span className="text-red-600">✗ 未完成</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold mb-1">分析状态</h4>
                {userItem.healthAnalysis.count > 0 ? (
                  <div>
                    <span className="text-green-600">✓ 已完成 ({userItem.healthAnalysis.count} 条记录)</span>
                    <pre className="text-xs mt-1">{JSON.stringify(userItem.healthAnalysis.latest, null, 2)}</pre>
                  </div>
                ) : (
                  <span className="text-red-600">✗ 未完成</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold mb-1">选择方案</h4>
                {userItem.userChoices.count > 0 ? (
                  <div>
                    <span className="text-green-600">✓ 已选择 ({userItem.userChoices.count} 条记录)</span>
                    <pre className="text-xs mt-1">{JSON.stringify(userItem.userChoices.latest, null, 2)}</pre>
                  </div>
                ) : (
                  <span className="text-red-600">✗ 未选择</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold mb-1">要求完成度</h4>
                {userItem.requirements.count > 0 ? (
                  <div>
                    <span className="text-green-600">✓ 已记录 ({userItem.requirements.count} 条记录)</span>
                    <pre className="text-xs mt-1">{JSON.stringify(userItem.requirements.latest, null, 2)}</pre>
                  </div>
                ) : (
                  <span className="text-red-600">✗ 未完成</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
