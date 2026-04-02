'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuestionnaireData {
  // 基础信息
  age: string;
  gender: string;
  height: string;
  weight: string;
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

export default function HealthQuestionnairePage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<QuestionnaireData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
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
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const calculateProgress = () => {
    const tabs = ['basic', 'disease', 'symptom', 'lifestyle', 'family'];
    const currentIndex = tabs.indexOf(activeTab);
    return ((currentIndex + 1) / tabs.length) * 100;
  };

  const handleCheckboxChange = (field: keyof QuestionnaireData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      // 尝试从 localStorage 获取用户ID
      let userId = localStorage.getItem('userId');
      
      // 如果没有用户ID，则创建新用户
      if (!userId) {
        const createResponse = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '问卷用户',
            age: formData.age ? parseInt(formData.age) : null,
            gender: formData.gender || null,
            height: formData.height ? parseFloat(formData.height) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
          })
        });
        const createUserResult = await createResponse.json();
        if (createUserResult.success && createUserResult.user) {
          userId = createUserResult.user.id;
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } else {
          throw new Error('创建用户失败');
        }
      }

      // 确保userId存在
      if (!userId) {
        throw new Error('无法获取用户ID');
      }

      const response = await fetch('/api/health-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          // 疾病史
          hasHypertension: formData.hasHypertension ?? false,
          hypertensionYears: formData.hypertensionYears ? parseInt(formData.hypertensionYears) : null,
          hypertensionMedications: formData.hypertensionMedications.length > 0 ? formData.hypertensionMedications : null,
          hasDiabetes: formData.hasDiabetes ?? false,
          diabetesYears: formData.diabetesYears ? parseInt(formData.diabetesYears) : null,
          diabetesType: formData.diabetesType || null,
          diabetesMedications: formData.diabetesMedications.length > 0 ? formData.diabetesMedications : null,
          hasHyperlipidemia: formData.hasHyperlipidemia ?? false,
          hyperlipidemiaYears: formData.hyperlipidemiaYears ? parseInt(formData.hyperlipidemiaYears) : null,
          hyperlipidemiaMedications: formData.hyperlipidemiaMedications.length > 0 ? formData.hyperlipidemiaMedications : null,
          otherDiseases: formData.otherDiseases.length > 0 ? formData.otherDiseases : null,
          // 症状史
          symptoms: formData.symptoms.length > 0 ? formData.symptoms : null,
          symptomDuration: formData.symptomDuration || null,
          symptomSeverity: formData.symptomSeverity || null,
          // 生活习惯
          smokingStatus: formData.smokingStatus || null,
          smokingYears: formData.smokingYears ? parseInt(formData.smokingYears) : null,
          smokingPerDay: formData.smokingPerDay ? parseInt(formData.smokingPerDay) : null,
          drinkingStatus: formData.drinkingStatus || null,
          drinkingFrequency: formData.drinkingFrequency || null,
          drinkingType: formData.drinkingType.length > 0 ? formData.drinkingType : null,
          exerciseFrequency: formData.exerciseFrequency || null,
          exerciseDuration: formData.exerciseDuration ? parseInt(formData.exerciseDuration) : null,
          exerciseType: formData.exerciseType.length > 0 ? formData.exerciseType : null,
          sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
          sleepQuality: formData.sleepQuality || null,
          sleepIssues: formData.sleepIssues.length > 0 ? formData.sleepIssues : null,
          dietHabits: formData.dietHabits || null,
          dietIssues: formData.dietIssues.length > 0 ? formData.dietIssues : null,
          stressLevel: formData.stressLevel || null,
          stressSource: formData.stressSource.length > 0 ? formData.stressSource : null,
          // 家族病史
          familyHypertension: formData.familyHypertension ?? false,
          familyDiabetes: formData.familyDiabetes ?? false,
          familyCardiovascular: formData.familyCardiovascular ?? false,
          familyOther: formData.familyOther.length > 0 ? formData.familyOther : null,
          notes: formData.notes || null
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: '健康问卷提交成功！' });
      } else {
        console.error('问卷提交失败:', result);
        const errorMessage = result.error || '提交失败，请重试';
        const detailMessage = result.details ? ` (${result.details})` : '';
        setMessage({ type: 'error', text: errorMessage + detailMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextTab = () => {
    const tabs = ['basic', 'disease', 'symptom', 'lifestyle', 'family'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const tabs = ['basic', 'disease', 'symptom', 'lifestyle', 'family'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>健康问卷</CardTitle>
          <CardDescription>
            请如实填写以下信息，帮助我们为您提供更准确的健康评估
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="mb-6" />

          {message && (
            <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="disease">疾病史</TabsTrigger>
              <TabsTrigger value="symptom">症状史</TabsTrigger>
              <TabsTrigger value="lifestyle">生活习惯</TabsTrigger>
              <TabsTrigger value="family">家族病史</TabsTrigger>
            </TabsList>

            {/* 基础信息 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="请输入年龄"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="请选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">身高 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="请输入身高"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="请输入体重"
                  />
                </div>
              </div>
            </TabsContent>

            {/* 疾病史 */}
            <TabsContent value="disease" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHypertension"
                    checked={formData.hasHypertension}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasHypertension: checked as boolean })}
                  />
                  <Label htmlFor="hasHypertension">高血压</Label>
                </div>
                {formData.hasHypertension && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="hypertensionYears">患病年限</Label>
                      <Input
                        id="hypertensionYears"
                        type="number"
                        value={formData.hypertensionYears}
                        onChange={(e) => setFormData({ ...formData, hypertensionYears: e.target.value })}
                        placeholder="年"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>正在服用的药物</Label>
                      <Textarea
                        placeholder="请输入正在服用的降压药，用逗号分隔"
                        onChange={(e) => setFormData({ ...formData, hypertensionMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDiabetes"
                    checked={formData.hasDiabetes}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDiabetes: checked as boolean })}
                  />
                  <Label htmlFor="hasDiabetes">糖尿病</Label>
                </div>
                {formData.hasDiabetes && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="diabetesYears">患病年限</Label>
                      <Input
                        id="diabetesYears"
                        type="number"
                        value={formData.diabetesYears}
                        onChange={(e) => setFormData({ ...formData, diabetesYears: e.target.value })}
                        placeholder="年"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diabetesType">糖尿病类型</Label>
                      <Select value={formData.diabetesType} onValueChange={(value) => setFormData({ ...formData, diabetesType: value })}>
                        <SelectTrigger id="diabetesType">
                          <SelectValue placeholder="请选择类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1型">1型糖尿病</SelectItem>
                          <SelectItem value="2型">2型糖尿病</SelectItem>
                          <SelectItem value="妊娠期">妊娠期糖尿病</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>正在服用的药物</Label>
                      <Textarea
                        placeholder="请输入正在服用的降糖药，用逗号分隔"
                        onChange={(e) => setFormData({ ...formData, diabetesMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHyperlipidemia"
                    checked={formData.hasHyperlipidemia}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasHyperlipidemia: checked as boolean })}
                  />
                  <Label htmlFor="hasHyperlipidemia">高血脂</Label>
                </div>
                {formData.hasHyperlipidemia && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="hyperlipidemiaYears">患病年限</Label>
                      <Input
                        id="hyperlipidemiaYears"
                        type="number"
                        value={formData.hyperlipidemiaYears}
                        onChange={(e) => setFormData({ ...formData, hyperlipidemiaYears: e.target.value })}
                        placeholder="年"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>正在服用的药物</Label>
                      <Textarea
                        placeholder="请输入正在服用的降脂药，用逗号分隔"
                        onChange={(e) => setFormData({ ...formData, hyperlipidemiaMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>其他疾病</Label>
                <div className="grid grid-cols-3 gap-2">
                  {OTHER_DISEASES.map((disease) => (
                    <div key={disease} className="flex items-center space-x-2">
                      <Checkbox
                        id={disease}
                        checked={formData.otherDiseases.includes(disease)}
                        onCheckedChange={() => handleCheckboxChange('otherDiseases', disease)}
                      />
                      <Label htmlFor={disease} className="text-sm">{disease}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 症状史 */}
            <TabsContent value="symptom" className="space-y-6">
              <div className="space-y-2">
                <Label>目前存在的症状（可多选）</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SYMPTOMS.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={formData.symptoms.includes(symptom)}
                        onCheckedChange={() => handleCheckboxChange('symptoms', symptom)}
                      />
                      <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symptomDuration">症状持续时间</Label>
                  <Input
                    id="symptomDuration"
                    value={formData.symptomDuration}
                    onChange={(e) => setFormData({ ...formData, symptomDuration: e.target.value })}
                    placeholder="如：3个月"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptomSeverity">症状严重程度</Label>
                  <Select value={formData.symptomSeverity} onValueChange={(value) => setFormData({ ...formData, symptomSeverity: value })}>
                    <SelectTrigger id="symptomSeverity">
                      <SelectValue placeholder="请选择严重程度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="轻">轻度</SelectItem>
                      <SelectItem value="中">中度</SelectItem>
                      <SelectItem value="重">重度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* 生活习惯 */}
            <TabsContent value="lifestyle" className="space-y-6">
              <div className="space-y-2">
                <Label>吸烟情况</Label>
                <RadioGroup
                  value={formData.smokingStatus}
                  onValueChange={(value) => setFormData({ ...formData, smokingStatus: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="从不吸烟" id="smoke1" />
                    <Label htmlFor="smoke1">从不吸烟</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="已戒烟" id="smoke2" />
                    <Label htmlFor="smoke2">已戒烟</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="偶尔吸烟" id="smoke3" />
                    <Label htmlFor="smoke3">偶尔吸烟</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="经常吸烟" id="smoke4" />
                    <Label htmlFor="smoke4">经常吸烟</Label>
                  </div>
                </RadioGroup>
              </div>

              {(formData.smokingStatus === '经常吸烟' || formData.smokingStatus === '偶尔吸烟') && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="smokingYears">吸烟年限</Label>
                    <Input
                      id="smokingYears"
                      type="number"
                      value={formData.smokingYears}
                      onChange={(e) => setFormData({ ...formData, smokingYears: e.target.value })}
                      placeholder="年"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smokingPerDay">每天吸烟支数</Label>
                    <Input
                      id="smokingPerDay"
                      type="number"
                      value={formData.smokingPerDay}
                      onChange={(e) => setFormData({ ...formData, smokingPerDay: e.target.value })}
                      placeholder="支"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>饮酒情况</Label>
                <RadioGroup
                  value={formData.drinkingStatus}
                  onValueChange={(value) => setFormData({ ...formData, drinkingStatus: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="从不饮酒" id="drink1" />
                    <Label htmlFor="drink1">从不饮酒</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="偶尔饮酒" id="drink2" />
                    <Label htmlFor="drink2">偶尔饮酒</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="经常饮酒" id="drink3" />
                    <Label htmlFor="drink3">经常饮酒</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.drinkingStatus === '经常饮酒' && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="drinkingFrequency">饮酒频率</Label>
                    <Select value={formData.drinkingFrequency} onValueChange={(value) => setFormData({ ...formData, drinkingFrequency: value })}>
                      <SelectTrigger id="drinkingFrequency">
                        <SelectValue placeholder="请选择频率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="每天">每天</SelectItem>
                        <SelectItem value="每周">每周</SelectItem>
                        <SelectItem value="每月">每月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>饮酒种类（可多选）</Label>
                    <div className="grid grid-cols-2 gap-1">
                      {DRINKING_TYPES.map((type) => (
                        <div key={type} className="flex items-center space-x-1">
                          <Checkbox
                            id={type}
                            checked={formData.drinkingType.includes(type)}
                            onCheckedChange={() => handleCheckboxChange('drinkingType', type)}
                          />
                          <Label htmlFor={type} className="text-xs">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>运动情况</Label>
                <RadioGroup
                  value={formData.exerciseFrequency}
                  onValueChange={(value) => setFormData({ ...formData, exerciseFrequency: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="从不" id="exercise1" />
                    <Label htmlFor="exercise1">从不运动</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="偶尔" id="exercise2" />
                    <Label htmlFor="exercise2">偶尔运动</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="经常" id="exercise3" />
                    <Label htmlFor="exercise3">经常运动</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="每天" id="exercise4" />
                    <Label htmlFor="exercise4">每天运动</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.exerciseFrequency !== '从不' && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="exerciseDuration">每次运动时长</Label>
                    <Input
                      id="exerciseDuration"
                      type="number"
                      value={formData.exerciseDuration}
                      onChange={(e) => setFormData({ ...formData, exerciseDuration: e.target.value })}
                      placeholder="分钟"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>运动类型（可多选）</Label>
                    <div className="grid grid-cols-2 gap-1">
                      {EXERCISE_TYPES.map((type) => (
                        <div key={type} className="flex items-center space-x-1">
                          <Checkbox
                            id={type}
                            checked={formData.exerciseType.includes(type)}
                            onCheckedChange={() => handleCheckboxChange('exerciseType', type)}
                          />
                          <Label htmlFor={type} className="text-xs">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleepHours">每天睡眠时长</Label>
                  <Input
                    id="sleepHours"
                    type="number"
                    step="0.5"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                    placeholder="小时"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleepQuality">睡眠质量</Label>
                  <Select value={formData.sleepQuality} onValueChange={(value) => setFormData({ ...formData, sleepQuality: value })}>
                    <SelectTrigger id="sleepQuality">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="好">好</SelectItem>
                      <SelectItem value="一般">一般</SelectItem>
                      <SelectItem value="差">差</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>睡眠问题（可多选）</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SLEEP_ISSUES.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <Checkbox
                        id={issue}
                        checked={formData.sleepIssues.includes(issue)}
                        onCheckedChange={() => handleCheckboxChange('sleepIssues', issue)}
                      />
                      <Label htmlFor={issue} className="text-sm">{issue}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dietHabits">饮食习惯</Label>
                  <Select value={formData.dietHabits} onValueChange={(value) => setFormData({ ...formData, dietHabits: value })}>
                    <SelectTrigger id="dietHabits">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="均衡">均衡饮食</SelectItem>
                      <SelectItem value="高盐">高盐饮食</SelectItem>
                      <SelectItem value="高糖">高糖饮食</SelectItem>
                      <SelectItem value="高脂">高脂饮食</SelectItem>
                      <SelectItem value="素食">素食</SelectItem>
                      <SelectItem value="杂食">杂食</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>饮食问题（可多选）</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {DIET_ISSUES.map((issue) => (
                      <div key={issue} className="flex items-center space-x-1">
                        <Checkbox
                          id={issue}
                          checked={formData.dietIssues.includes(issue)}
                          onCheckedChange={() => handleCheckboxChange('dietIssues', issue)}
                        />
                        <Label htmlFor={issue} className="text-xs">{issue}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>压力水平</Label>
                <RadioGroup
                  value={formData.stressLevel}
                  onValueChange={(value) => setFormData({ ...formData, stressLevel: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="低" id="stress1" />
                    <Label htmlFor="stress1">低</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="中" id="stress2" />
                    <Label htmlFor="stress2">中</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="高" id="stress3" />
                    <Label htmlFor="stress3">高</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.stressLevel === '高' && (
                <div className="space-y-2 ml-6">
                  <Label>压力来源（可多选）</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STRESS_SOURCES.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={source}
                          checked={formData.stressSource.includes(source)}
                          onCheckedChange={() => handleCheckboxChange('stressSource', source)}
                        />
                        <Label htmlFor={source} className="text-sm">{source}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 家族病史 */}
            <TabsContent value="family" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHypertension"
                    checked={formData.familyHypertension}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHypertension: checked as boolean })}
                  />
                  <Label htmlFor="familyHypertension">家族中有高血压患者</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyDiabetes"
                    checked={formData.familyDiabetes}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyDiabetes: checked as boolean })}
                  />
                  <Label htmlFor="familyDiabetes">家族中有糖尿病患者</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyCardiovascular"
                    checked={formData.familyCardiovascular}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyCardiovascular: checked as boolean })}
                  />
                  <Label htmlFor="familyCardiovascular">家族中有心血管疾病患者</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">其他补充信息</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="请填写其他需要说明的信息"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevTab}
              disabled={activeTab === 'basic'}
            >
              上一步
            </Button>

            <div className="flex gap-2">
              {activeTab !== 'family' ? (
                <Button onClick={handleNextTab}>
                  下一步
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      提交问卷
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
