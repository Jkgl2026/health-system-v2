'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Shield, Zap, Flame, Heart, Brain, Eye, TrendingUp, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { calculateComprehensiveHealthScore } from '@/lib/health-score-calculator';

export default function HealthDetail() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<any>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = () => {
    try {
      // 读取症状数据
      const savedSymptoms = localStorage.getItem('selectedSymptoms');
      const savedBadHabits = localStorage.getItem('selectedBadHabitsRequirements');
      const savedSymptoms300 = localStorage.getItem('selectedSymptoms300');
      const savedHealthAnalysis = localStorage.getItem('healthAnalysis');

      // 解析数据
      const bodySymptoms = savedSymptoms ? JSON.parse(savedSymptoms) : [];
      const badHabits = savedBadHabits ? JSON.parse(savedBadHabits) : [];
      const symptoms300 = savedSymptoms300 ? JSON.parse(savedSymptoms300) : [];
      const healthAnalysisData = savedHealthAnalysis ? JSON.parse(savedHealthAnalysis) : [];

      // 计算健康评分
      const scoreResult = calculateComprehensiveHealthScore({
        bodySymptomIds: bodySymptoms,
        habitIds: badHabits,
        symptom300Ids: symptoms300,
      });

      const totalSymptoms = bodySymptoms.length + badHabits.length + symptoms300.length;
      
      // 计算严重+紧急症状数量
      const severeEmergencyCount = 
        scoreResult.breakdown.bodyLanguage.severityBreakdown.emergency +
        scoreResult.breakdown.bodyLanguage.severityBreakdown.severe +
        scoreResult.breakdown.symptoms300.severityBreakdown.emergency +
        scoreResult.breakdown.symptoms300.severityBreakdown.severe;

      // 计算最高指数系数
      const maxFactor = Math.max(
        scoreResult.breakdown.bodyLanguage.factor,
        scoreResult.breakdown.habits.factor,
        scoreResult.breakdown.symptoms300.factor
      );

      setHealthData({
        healthScore: scoreResult.healthScore,
        healthStatus: scoreResult.healthStatus,
        totalDeduction: scoreResult.totalDeduction,
        totalSymptoms,
        severeEmergencyCount,
        maxFactor,
        breakdown: scoreResult.breakdown,
      });

      // 设置健康要素分析数据
      if (healthAnalysisData.length > 0) {
        const latestAnalysis = healthAnalysisData[0];
        setHealthAnalysis(latestAnalysis);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load health data:', error);
      setIsLoading(false);
    }
  };

  // 中医深入分析函数
  const analyzeTCMHealth = () => {
    if (!healthData) return null;

    const totalSymptoms = healthData.totalSymptoms;

    // 体质辨识
    let constitution = {
      type: '平和质',
      description: '身体健康，阴阳气血调和',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms === 0) {
      constitution = { type: '平和质', description: '身体健康，阴阳气血调和', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (totalSymptoms <= 5) {
      constitution = { type: '气虚质', description: '气短懒言，容易疲劳，自汗', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    } else if (totalSymptoms <= 10) {
      constitution = { type: '阳虚质', description: '畏寒怕冷，手足不温，精神不振', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    } else if (totalSymptoms <= 15) {
      constitution = { type: '阴虚质', description: '手足心热，口干咽燥，盗汗', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    } else if (totalSymptoms <= 20) {
      constitution = { type: '血瘀质', description: '面色晦暗，舌质紫暗，易有瘀斑', color: 'bg-red-100 text-red-800 border-red-300' };
    } else if (totalSymptoms <= 25) {
      constitution = { type: '痰湿质', description: '体型肥胖，舌苔厚腻，身体困重', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    } else if (totalSymptoms <= 30) {
      constitution = { type: '湿热质', description: '面垢油光，口苦口臭，大便黏滞', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      constitution = { type: '气郁质', description: '情志抑郁，胸胁胀痛，善太息', color: 'bg-pink-100 text-pink-800 border-pink-300' };
    }

    // 气血状态
    let qiBloodStatus = {
      type: '气血充盈',
      description: '面色红润，精力充沛，舌质淡红',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms <= 5) {
      qiBloodStatus = { type: '气血充盈', description: '面色红润，精力充沛，舌质淡红', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (totalSymptoms <= 15) {
      qiBloodStatus = { type: '气血两虚', description: '面色苍白，乏力少气，心悸失眠', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    } else if (totalSymptoms <= 25) {
      qiBloodStatus = { type: '气虚血瘀', description: '气短乏力，舌质紫暗，身体疼痛', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    } else {
      qiBloodStatus = { type: '气血瘀滞', description: '胸胁胀痛，月经不调，舌有瘀斑', color: 'bg-red-100 text-red-800 border-red-300' };
    }

    // 脏腑功能
    const organFunction = {
      heart: { score: 79, status: '轻度异常' },
      liver: { score: 90, status: '正常' },
      spleen: { score: 90, status: '正常' },
      lung: { score: 90, status: '正常' },
      kidney: { score: 90, status: '正常' }
    };

    // 经络状态
    const meridianStatus = {
      duMai: { name: '督脉', status: '轻度阻滞', description: '阳气略有不足，偶有颈腰疼痛' },
      renMai: { name: '任脉', status: '中度阻滞', description: '阴血不足，偶有消化问题' },
      chongMai: { name: '冲脉', status: '正常', description: '气血运行通畅，月经规律' },
      daiMai: { name: '带脉', status: '正常', description: '带脉固摄正常，体型适中' }
    };

    // 阴阳平衡
    let yinYangBalance = {
      type: '阴阳平衡',
      description: '阴阳协调，正常健康状态',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms <= 5) {
      yinYangBalance = { type: '阴阳平衡', description: '阴阳协调，正常健康状态', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (totalSymptoms <= 15) {
      yinYangBalance = { type: '阴盛阳衰', description: '面色苍白，畏寒肢冷，精神萎靡', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    } else if (totalSymptoms <= 25) {
      yinYangBalance = { type: '阳盛阴衰', description: '面红目赤，烦躁易怒，便秘尿黄', color: 'bg-red-100 text-red-800 border-red-300' };
    } else {
      yinYangBalance = { type: '阴阳两虚', description: '时而怕冷时而怕热，自汗盗汗', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }

    // 湿热寒凉
    const wetHeatColdCool = {
      coldWet: { status: '无', description: '无寒湿症状' },
      wetHeat: { status: '无', description: '无湿热症状' },
      cold: { status: '有', description: '畏寒肢冷，面色苍白，舌淡苔白' },
      heat: { status: '无', description: '无热证表现' },
      wet: { status: '无', description: '无湿证表现' },
      dry: { status: '无', description: '无燥证表现' }
    };

    if (healthData.breakdown.habits.count > 5) {
      wetHeatColdCool.wetHeat.status = '有';
      wetHeatColdCool.wetHeat.description = '湿热内蕴，面垢油光，口苦口臭';
    }

    return {
      constitution,
      qiBloodStatus,
      organFunction,
      meridianStatus,
      yinYangBalance,
      wetHeatColdCool
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-200">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无健康数据</h2>
              <p className="text-gray-600 mb-6">请先完成健康自检</p>
              <Button onClick={() => router.push('/personal-info')} className="bg-gradient-to-r from-blue-500 to-green-500">
                开始自检
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tcmData = analyzeTCMHealth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">健康详细数据</h1>
                <p className="text-sm text-gray-600">您的健康分析报告</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 关键指标 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">症状总数</div>
              <div className="text-3xl font-bold text-gray-900">{healthData.totalSymptoms}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">严重+紧急</div>
              <div className="text-3xl font-bold text-red-600">{healthData.severeEmergencyCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">指数系数</div>
              <div className="text-3xl font-bold text-purple-600">{healthData.maxFactor.toFixed(1)}x</div>
            </CardContent>
          </Card>
        </div>

        {/* 健康风险评估 */}
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              健康风险评估
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-xl border-2 ${
              healthData.healthScore >= 80 ? 'bg-green-50 border-green-200' :
              healthData.healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">风险等级</div>
                  <div className={`text-2xl font-bold ${
                    healthData.healthScore >= 80 ? 'text-green-700' :
                    healthData.healthScore >= 60 ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {healthData.healthScore >= 80 ? '低风险' :
                     healthData.healthScore >= 60 ? '中等风险' :
                     '高风险'}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  healthData.healthScore >= 80 ? 'bg-green-100' :
                  healthData.healthScore >= 60 ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <Shield className={`w-8 h-8 ${
                    healthData.healthScore >= 80 ? 'text-green-600' :
                    healthData.healthScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                </div>
              </div>
            </div>

            {healthData.severeEmergencyCount > 0 && (
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-gray-900">严重+紧急症状</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{healthData.severeEmergencyCount}项</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 健康要素分析结果 */}
        {healthAnalysis && (
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                健康要素分析结果
              </CardTitle>
              <div className="text-sm text-gray-500 mt-1">
                最新分析结果 · {new Date(healthAnalysis.analyzedAt).toLocaleString('zh-CN')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: '气血', value: healthAnalysis.qiAndBlood, desc: '营养输送能力', color: 'red' },
                  { name: '循环', value: healthAnalysis.circulation, desc: '微循环通畅程度', color: 'orange' },
                  { name: '毒素', value: healthAnalysis.toxins, desc: '体内垃圾毒素积累', color: 'yellow' },
                  { name: '血脂', value: healthAnalysis.bloodFat, desc: '血液中油脂含量', color: 'purple' },
                  { name: '寒凉', value: healthAnalysis.coldCool, desc: '体内寒湿气程度', color: 'blue' },
                  { name: '免疫', value: healthAnalysis.immune, desc: '身体自我防护能力', color: 'green' },
                  { name: '情绪', value: healthAnalysis.emotion, desc: '心理状态和情绪管理', color: 'pink' },
                  { name: '整体健康', value: healthAnalysis.overallHealth, desc: '综合健康评分', color: 'indigo' }
                ].map((item, idx) => (
                  <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 p-4 rounded-lg border border-${item.color}-200`}>
                    <div className="text-sm text-${item.color}-600 mb-1">{item.name}</div>
                    <div className="text-2xl font-bold text-${item.color}-700 mb-1">{item.value || 0}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 中医深入分析 */}
        {tcmData && (
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-600" />
                中医深入分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 体质辨识 */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  体质辨识
                </h4>
                <div className={`p-3 rounded-lg border-2 ${tcmData.constitution.color}`}>
                  <div className="font-bold text-lg">{tcmData.constitution.type}</div>
                  <div className="text-sm text-gray-600 mt-1">{tcmData.constitution.description}</div>
                </div>
              </div>

              {/* 气血状态 */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  气血状态
                </h4>
                <div className={`p-3 rounded-lg border-2 ${tcmData.qiBloodStatus.color}`}>
                  <div className="font-bold text-lg">{tcmData.qiBloodStatus.type}</div>
                  <div className="text-sm text-gray-600 mt-1">{tcmData.qiBloodStatus.description}</div>
                </div>
              </div>

              {/* 脏腑功能评估 */}
              <div>
                <h4 className="font-bold text-lg mb-3">脏腑功能评估</h4>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(tcmData.organFunction).map(([key, value]: [string, any]) => {
                    const icons: any = {
                      heart: Heart,
                      liver: Brain,
                      spleen: CheckCircle2,
                      lung: Activity,
                      kidney: Activity
                    };
                    const Icon = icons[key];
                    return (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <Icon className={`w-5 h-5 mx-auto mb-2 ${value.status === '正常' ? 'text-green-600' : 'text-orange-600'}`} />
                        <div className="text-xs text-gray-600 mb-1">{key}</div>
                        <div className="text-sm font-bold text-gray-900">{value.score}%</div>
                        <div className="text-xs text-gray-500">{value.status}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 经络状态 */}
              <div>
                <h4 className="font-bold text-lg mb-3">经络状态</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(tcmData.meridianStatus).map((meridian: any, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${meridian.status === '正常' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="font-semibold text-gray-900 mb-1">{meridian.name}</div>
                      <div className={`text-xs font-medium ${meridian.status === '正常' ? 'text-green-700' : 'text-yellow-700'}`}>
                        {meridian.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{meridian.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 阴阳平衡 */}
              <div>
                <h4 className="font-bold text-lg mb-3">阴阳平衡</h4>
                <div className={`p-3 rounded-lg border-2 ${tcmData.yinYangBalance.color}`}>
                  <div className="font-bold text-lg">{tcmData.yinYangBalance.type}</div>
                  <div className="text-sm text-gray-600 mt-1">{tcmData.yinYangBalance.description}</div>
                </div>
              </div>

              {/* 湿热寒凉 */}
              <div>
                <h4 className="font-bold text-lg mb-3">湿热寒凉</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(tcmData.wetHeatColdCool).map(([key, value]: [string, any]) => (
                    <div key={key} className={`p-3 rounded-lg ${value.status === '无' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {value.status === '无' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="font-semibold text-gray-900">{key}</span>
                      </div>
                      <div className="text-xs text-gray-600">{value.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
