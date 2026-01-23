'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Target, BookOpen, ClipboardCheck, Clock, Home, GraduationCap, FileCheck, Loader2 } from 'lucide-react';
import { ErrorAlert } from '@/components/ui/error-alert';
import { THREE_CHOICES, FOUR_REQUIREMENTS } from '@/lib/health-data';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveUserChoice, saveRequirements, createUser, getUser } from '@/lib/api-client';
import Link from 'next/link';

export default function ChoicesPage() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [acceptedRequirements, setAcceptedRequirements] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<any>(null);

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
    window.scrollTo({ top: 900, behavior: 'smooth' });
  };

  const handleRequirementToggle = (id: number) => {
    const newAccepted = new Set(acceptedRequirements);
    if (newAccepted.has(id)) {
      newAccepted.delete(id);
    } else {
      newAccepted.add(id);
    }
    setAcceptedRequirements(newAccepted);
  };

  const handleContinue = async () => {
    if (!selectedChoice) {
      alert('请先选择一个方向，这样才能为您提供合适的建议。');
      return;
    }
    
    // 如果选择前两个方案，提示但允许继续
    if (selectedChoice === 'choice1' || selectedChoice === 'choice2') {
      alert('感谢您的选择！虽然前两个选择不需要购买产品，但仍然需要完成填表和学习的任务。我们推荐您选择第三个方案，这样可以获得更快的恢复效果。');
      // 移除 return，允许继续保存数据
    }
    
    // 如果选择第三个方案，必须完成所有四个要求
    if (selectedChoice === 'choice3' && acceptedRequirements.size !== 4) {
      alert('请同意并承诺完成所有四个要求，这样才能确保健康管理的效果。如果做不到四个要求，我也不能给您调理。');
      return;
    }

    // 保存到 localStorage
    localStorage.setItem('selectedChoice', selectedChoice);
    localStorage.setItem('acceptedRequirements', JSON.stringify([...acceptedRequirements]));

    // 保存到数据库
    setIsSaving(true);
    try {
      const userId = getOrGenerateUserId();
      
      // 确保用户存在
      const userResponse = await getUser(userId);
      if (!userResponse.success || !userResponse.user) {
        await createUser({
          name: null,
          phone: null,
          email: null,
          age: null,
          gender: null,
        });
      }

      // 保存用户选择
      const choiceData = THREE_CHOICES[selectedChoice as keyof typeof THREE_CHOICES];
      if (choiceData) {
        await saveUserChoice({
          userId,
          planType: choiceData.title,
          planDescription: choiceData.description,
        });
      }

      // 保存四个要求的完成情况
      // 如果选择方案1或2，默认完成四个要求（承诺填表和学习）
      // 如果选择方案3，根据勾选情况保存
      const requirementsData = {
        userId,
        requirement1Completed: selectedChoice === 'choice1' || selectedChoice === 'choice2' ? true : acceptedRequirements.has(1),
        requirement2Completed: selectedChoice === 'choice1' || selectedChoice === 'choice2' ? true : acceptedRequirements.has(2),
        requirement3Completed: selectedChoice === 'choice1' || selectedChoice === 'choice2' ? true : acceptedRequirements.has(3),
        requirement4Completed: selectedChoice === 'choice1' || selectedChoice === 'choice2' ? true : acceptedRequirements.has(4),
      };
      
      await saveRequirements(requirementsData);

      // 保存成功后清除错误状态，然后跳转
      setSaveError(null);
      setIsSaving(false);
      
      // 使用更可靠的跳转方式
      setTimeout(() => {
        window.location.href = '/requirements';
      }, 100);
    } catch (error) {
      console.error('保存用户选择和要求数据失败:', error);
      setSaveError(error);
      setIsSaving(false);
      // ⚠️ 保存失败时不跳转，让用户看到错误并决定下一步
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/story" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                调理方案选择
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 开场说明 */}
        <section className="mb-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">三个选择，四个要求</CardTitle>
              <CardDescription className="text-base mt-2">
                要解决您的问题有三个方法，有不花钱的、也有花钱的，我都给您介绍一下，您自己选择
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <BookOpen className="w-4 h-4" />
                <AlertDescription>
                  因为找不到病因是治不好病的，而真正的病因都在生活里。我给您提供几个选择，这里面有快的有慢的，也有不花钱的，有花钱的。您自己来选一下，好吧？
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* 三个选择 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">三个选择</h2>

          <div className="space-y-8 max-w-5xl mx-auto">
            {/* 选择一 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice1'
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice1')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                    selectedChoice === 'choice1' ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <Home className={`w-7 h-7 ${selectedChoice === 'choice1' ? 'text-white' : 'text-blue-500'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{THREE_CHOICES.choice1.title}</CardTitle>
                    <CardDescription className="text-base">
                      {THREE_CHOICES.choice1.description}
                    </CardDescription>
                  </div>
                  {selectedChoice === 'choice1' && (
                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">详细说明：</h4>
                    {THREE_CHOICES.choice1.details.map((detail, index) => (
                      <p key={index} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      要求：
                    </h4>
                    {THREE_CHOICES.choice1.requirements.map((req, index) => (
                      <p key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                        {req}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 选择二 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice2'
                  ? 'border-green-500 ring-2 ring-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice2')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                    selectedChoice === 'choice2' ? 'bg-green-500' : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <Target className={`w-7 h-7 ${selectedChoice === 'choice2' ? 'text-white' : 'text-green-500'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{THREE_CHOICES.choice2.title}</CardTitle>
                    <CardDescription className="text-base">
                      {THREE_CHOICES.choice2.description}
                    </CardDescription>
                  </div>
                  {selectedChoice === 'choice2' && (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">详细说明：</h4>
                    {THREE_CHOICES.choice2.details.map((detail, index) => (
                      <p key={index} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      要求：
                    </h4>
                    {THREE_CHOICES.choice2.requirements.map((req, index) => (
                      <p key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                        {req}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 选择三 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice3'
                  ? 'border-purple-500 ring-2 ring-purple-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice3')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                    selectedChoice === 'choice3' ? 'bg-purple-500' : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <CheckCircle2 className={`w-7 h-7 ${selectedChoice === 'choice3' ? 'text-white' : 'text-purple-500'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{THREE_CHOICES.choice3.title}</CardTitle>
                    <CardDescription className="text-base">
                      {THREE_CHOICES.choice3.description}
                    </CardDescription>
                  </div>
                  {selectedChoice === 'choice3' && (
                    <CheckCircle2 className="w-8 h-8 text-purple-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">详细说明：</h4>
                    {THREE_CHOICES.choice3.details.map((detail, index) => (
                      <p key={index} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      必须满足的条件：
                    </h4>
                    {THREE_CHOICES.choice3.requirements.map((req, index) => (
                      <p key={index} className="text-sm text-red-700 dark:text-red-400 font-semibold">
                        {req}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedChoice && (
            <div className="mt-8 max-w-3xl mx-auto">
              <Alert className={`border-2 ${
                selectedChoice === 'choice3' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                selectedChoice === 'choice2' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                {selectedChoice === 'choice3' ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <AlertDescription>
                  {selectedChoice === 'choice3' ? (
                    <span className="text-purple-700 dark:text-purple-400">
                      您选择了使用我的产品和服务。这就像坐豪车，跑得快还舒服，能加快恢复的速度。
                      以后有任何需要，您都可以来找我，就算我的能力不足以解决您所有的问题，但是我的背后还有一个强大的平台。
                      您就把我当成您的健康顾问就行！
                    </span>
                  ) : selectedChoice === 'choice2' ? (
                    <span className="text-green-700 dark:text-green-400">
                      您选择了带产品来免费服务。每个人挣钱都不容易，不要浪费，您的身体恢复这才是我的目的。
                      您获得了健康，我也获得了经验。这就像坐车回家，舒服、安全、速度快。
                    </span>
                  ) : (
                    <span className="text-blue-700 dark:text-blue-400">
                      您选择了不花钱的方法。这就像走路回家，要么冷要么热，还很辛苦，但是只要坚持，最后也肯定能到家。
                      得个病也不容易，要十几年甚至几十年才能形成的。去掉一个病也需要时间和坚持。
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </section>

        {/* 四个要求 */}
        {selectedChoice === 'choice3' && (
          <section className="mb-12">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">四个要求</CardTitle>
                <CardDescription className="text-base mt-2">
                  如果您选择第三个方案（使用我的产品和服务），必须完成以下四个要求。
                  <strong>如果您做不到这四个要求，我也不能给您调理。</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    找不到病因真的治不好病，真正的病因都在生活里。如果习惯不改，医生治不好您的病，我也没有办法给您调好。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* 要求1 */}
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(1)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
                onClick={() => handleRequirementToggle(1)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id="req-1"
                      checked={acceptedRequirements.has(1)}
                      onChange={() => handleRequirementToggle(1)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        要求1：{FOUR_REQUIREMENTS.requirement1.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {FOUR_REQUIREMENTS.requirement1.description}
                    </p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>详细内容：</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {FOUR_REQUIREMENTS.requirement1.details}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                        {FOUR_REQUIREMENTS.requirement1.warning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 要求2 */}
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(2)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
                onClick={() => handleRequirementToggle(2)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id="req-2"
                      checked={acceptedRequirements.has(2)}
                      onChange={() => handleRequirementToggle(2)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        要求2：{FOUR_REQUIREMENTS.requirement2.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {FOUR_REQUIREMENTS.requirement2.description}
                    </p>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>详细内容：</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {FOUR_REQUIREMENTS.requirement2.details}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <strong>好处：</strong> {FOUR_REQUIREMENTS.requirement2.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 要求3 */}
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(3)
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
                onClick={() => handleRequirementToggle(3)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id="req-3"
                      checked={acceptedRequirements.has(3)}
                      onChange={() => handleRequirementToggle(3)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        要求3：{FOUR_REQUIREMENTS.requirement3.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {FOUR_REQUIREMENTS.requirement3.description}
                    </p>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>详细内容：</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {FOUR_REQUIREMENTS.requirement3.details}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>好处：</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {FOUR_REQUIREMENTS.requirement3.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 要求4 */}
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(4)
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
              }`}
                onClick={() => handleRequirementToggle(4)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id="req-4"
                      checked={acceptedRequirements.has(4)}
                      onChange={() => handleRequirementToggle(4)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        要求4：{FOUR_REQUIREMENTS.requirement4.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {FOUR_REQUIREMENTS.requirement4.description}
                    </p>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>详细内容：</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {FOUR_REQUIREMENTS.requirement4.details}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>原因：</strong> {FOUR_REQUIREMENTS.requirement4.reason}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        <strong>好处：</strong> {FOUR_REQUIREMENTS.requirement4.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-3xl mx-auto">
              <Alert className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <AlertDescription className="text-purple-700 dark:text-purple-400">
                  这四个要求缺一不可，是健康管理成功的关键保障。只有严格执行，
                  才能确保调理效果。请您认真对待每一项要求，如果做不到这四个要求，我也不能给您调理。
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {saveError && (
          <ErrorAlert
            error={saveError}
            onRetry={() => {
              setSaveError(null);
              handleContinue();
            }}
          />
        )}

        {/* 下一步按钮 */}
        {selectedChoice && (
          <section className="text-center">
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={(selectedChoice === 'choice3' && acceptedRequirements.size !== 4) || isSaving}
              className={`${
                selectedChoice === 'choice3' && acceptedRequirements.size === 4
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  : selectedChoice === 'choice3'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : selectedChoice === 'choice3' ? (
                <>
                  获取健康管理方案
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  确认选择
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            {selectedChoice === 'choice3' && acceptedRequirements.size !== 4 && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                请先同意并承诺完成所有四个要求，如果做不到这四个要求，我也不能给您调理
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
