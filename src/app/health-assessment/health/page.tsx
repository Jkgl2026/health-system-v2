'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface QuestionnaireData {
  // 基础信息（从个人信息获取，不显示）
  // 疾病史
  hasHypertension: boolean;
  hypertensionYears: string;
  hypertensionMedications: string[];
  hasDiabetes: boolean;
  diabetesYears: string;
  diabetesType: string;
  diabetesMedications: string[];
  hasHyperlipidemia: boolean;
  hyperlipidemiaYears: string;
  hyperlipidemiaMedications: string[];
  otherDiseases: string[];
  // 症状史
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: string;
  // 生活习惯
  smokingStatus: string;
  smokingYears: string;
  smokingPerDay: string;
  drinkingStatus: string;
  drinkingFrequency: string;
  drinkingType: string[];
  exerciseFrequency: string;
  exerciseDuration: string;
  exerciseType: string[];
  sleepHours: string;
  sleepQuality: string;
  sleepIssues: string[];
  dietHabits: string;
  dietIssues: string[];
  stressLevel: string;
  stressSource: string[];
  // 家族病史
  familyHypertension: boolean;
  familyDiabetes: boolean;
  familyCardiovascular: boolean;
  familyOther: string[];
  notes: string;
}

const SYMPTOMS = [
  '头晕', '头痛', '口干', '多饮', '多尿', '乏力',
  '心悸', '气短', '胸痛', '肢体麻木', '视物模糊',
  '体重下降', '食欲不振', '恶心呕吐', '失眠'
];

const SLEEP_ISSUES = ['失眠', '早醒', '多梦', '易醒', '睡眠呼吸暂停'];

const DIET_ISSUES = ['挑食', '暴饮暴食', '夜宵', '饮食不规律', '过度节食'];

const STRESS_SOURCES = ['工作压力', '家庭压力', '经济压力', '人际关系', '健康担忧'];

const DRINKING_TYPES = ['白酒', '啤酒', '红酒', '黄酒', '洋酒'];

const EXERCISE_TYPES = ['跑步', '游泳', '瑜伽', '健身', '骑自行车', '散步', '打球', '爬山'];

const OTHER_DISEASES = ['冠心病', '脑血管疾病', '肾病', '肝病', '肺病', '甲状腺疾病', '痛风'];

function HealthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  const [activeTab, setActiveTab] = useState('diseases');
  const [formData, setFormData] = useState<QuestionnaireData>({
    hasHypertension: false,
    hypertensionYears: '',
    hypertensionMedications: [],
    hasDiabetes: false,
    diabetesYears: '',
    diabetesType: '',
    diabetesMedications: [],
    hasHyperlipidemia: false,
    hyperlipidemiaYears: '',
    hyperlipidemiaMedications: [],
    otherDiseases: [],
    symptoms: [],
    symptomDuration: '',
    symptomSeverity: '',
    smokingStatus: '',
    smokingYears: '',
    smokingPerDay: '',
    drinkingStatus: '',
    drinkingFrequency: '',
    drinkingType: [],
    exerciseFrequency: '',
    exerciseDuration: '',
    exerciseType: [],
    sleepHours: '',
    sleepQuality: '',
    sleepIssues: [],
    dietHabits: '',
    dietIssues: [],
    stressLevel: '',
    stressSource: [],
    familyHypertension: false,
    familyDiabetes: false,
    familyCardiovascular: false,
    familyOther: [],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.push('/health-assessment');
    }
  }, [sessionId, router]);

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev: any) => {
      const currentArray = prev[field as keyof QuestionnaireData] as string[] || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 保存健康问卷并关联到会话
      const response = await fetch('/api/health-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '保存失败');
      }

      // 更新会话关联
      await fetch(`/api/assessment/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthQuestionnaireId: data.data.id,
          currentStep: 'constitution_questionnaire',
        }),
      });

      setSaved(true);
      setTimeout(() => {
        router.push(`/health-assessment/constitution?sessionId=${sessionId}&userId=${userId}`);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/health-assessment?sessionId=${sessionId}&userId=${userId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">健康问卷</h1>
          <div className="w-24"></div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
            <span className="text-sm font-medium text-green-600">个人信息</span>
          </div>
          <div className="w-16 h-1 bg-blue-600 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
            <span className="text-sm font-medium text-blue-600">健康问卷</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span className="text-sm text-gray-500">体质问卷</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">4</div>
            <span className="text-sm text-gray-500">分析结果</span>
          </div>
        </div>

        {/* 表单 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle>健康问卷</CardTitle>
            <CardDescription>
              请如实填写您的健康状况，这将帮助我们进行健康分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 提示信息 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>提示：</strong>此问卷包含多个部分，请完整填写所有信息。已填写的数据会自动保存。
                </p>
              </div>

              {/* 简化版：只展示核心问题 */}
              <div className="space-y-6">
                {/* 疾病史 - 简化 */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">疾病史</h3>
                  <div className="space-y-3">
                    <Label>您是否有以下疾病？</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasHypertension"
                          checked={formData.hasHypertension}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasHypertension: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasHypertension">高血压</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasDiabetes"
                          checked={formData.hasDiabetes}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasDiabetes: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasDiabetes">糖尿病</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasHyperlipidemia"
                          checked={formData.hasHyperlipidemia}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasHyperlipidemia: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasHyperlipidemia">高血脂</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 症状 - 简化 */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">症状</h3>
                  <div className="space-y-3">
                    <Label>您最近有以下症状吗？（可多选）</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SYMPTOMS.slice(0, 8).map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`symptom-${symptom}`}
                            checked={formData.symptoms.includes(symptom)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange('symptoms', symptom, checked as boolean)
                            }
                          />
                          <Label htmlFor={`symptom-${symptom}`} className="cursor-pointer">{symptom}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 生活习惯 - 简化 */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">生活习惯</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>运动频率</Label>
                      <Select
                        value={formData.exerciseFrequency}
                        onValueChange={(value) => setFormData({ ...formData, exerciseFrequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="从不">从不运动</SelectItem>
                          <SelectItem value="每周1-2次">每周1-2次</SelectItem>
                          <SelectItem value="每周3-5次">每周3-5次</SelectItem>
                          <SelectItem value="每周6次以上">每周6次以上</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>睡眠质量</Label>
                      <Select
                        value={formData.sleepQuality}
                        onValueChange={(value) => setFormData({ ...formData, sleepQuality: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="很好">很好</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                          <SelectItem value="较差">较差</SelectItem>
                          <SelectItem value="很差">很差</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>每日睡眠时长</Label>
                      <Select
                        value={formData.sleepHours}
                        onValueChange={(value) => setFormData({ ...formData, sleepHours: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="小于5小时">小于5小时</SelectItem>
                          <SelectItem value="5-6小时">5-6小时</SelectItem>
                          <SelectItem value="7-8小时">7-8小时</SelectItem>
                          <SelectItem value="大于8小时">大于8小时</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>压力水平</Label>
                      <Select
                        value={formData.stressLevel}
                        onValueChange={(value) => setFormData({ ...formData, stressLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="很低">很低</SelectItem>
                          <SelectItem value="较低">较低</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                          <SelectItem value="较高">较高</SelectItem>
                          <SelectItem value="很高">很高</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 家族史 - 简化 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">家族病史</h3>
                  <div className="space-y-2">
                    <Label>您的直系亲属（父母、兄弟姐妹）是否有以下疾病？</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="familyHypertension"
                          checked={formData.familyHypertension}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, familyHypertension: checked as boolean })
                          }
                        />
                        <Label htmlFor="familyHypertension">高血压</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="familyDiabetes"
                          checked={formData.familyDiabetes}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, familyDiabetes: checked as boolean })
                          }
                        />
                        <Label htmlFor="familyDiabetes">糖尿病</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="familyCardiovascular"
                          checked={formData.familyCardiovascular}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, familyCardiovascular: checked as boolean })
                          }
                        />
                        <Label htmlFor="familyCardiovascular">心血管疾病</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 成功提示 */}
              {saved && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    保存成功！正在跳转...
                  </AlertDescription>
                </Alert>
              )}

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={loading || saved}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                  已保存
                    </>
                  ) : (
                    <>
                  保存并继续
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HealthQuestionnaireInAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <HealthContent />
    </Suspense>
  );
}
