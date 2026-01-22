'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Target, BookOpen, ClipboardCheck, Clock } from 'lucide-react';
import { THREE_CHOICES, FOUR_REQUIREMENTS } from '@/lib/health-data';
import Link from 'next/link';

export default function ChoicesPage() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [acceptedRequirements, setAcceptedRequirements] = useState<Set<number>>(new Set());

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
    window.scrollTo({ top: 800, behavior: 'smooth' });
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

  const handleContinue = () => {
    if (!selectedChoice) {
      alert('请先选择一个方向，这样才能为您提供合适的建议。');
      return;
    }
    if (selectedChoice !== 'choice3') {
      alert('我们推荐您选择"学习健康自我管理"，这样才能真正改善健康状况。如果继续其他选择，症状可能会持续加重。');
      return;
    }
    if (acceptedRequirements.size !== 4) {
      alert('请同意并承诺完成所有四个要求，这样才能确保健康管理的效果。');
      return;
    }

    // 保存选择和要求
    localStorage.setItem('selectedChoice', selectedChoice);
    localStorage.setItem('acceptedRequirements', JSON.stringify([...acceptedRequirements]));

    window.location.href = '/solution';
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
                选择与承诺
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 三个选择 */}
        <section className="mb-12">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">三个选择</CardTitle>
              <CardDescription className="text-base mt-2">
                面对健康问题，您有三种选择。请仔细考虑每种选择的后果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  请认真思考：您希望选择哪条路？不同的选择会导致不同的结果。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 选择一 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice1'
                  ? 'border-red-500 ring-2 ring-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice1')}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedChoice === 'choice1' ? 'bg-red-500' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  <XCircle className={`w-8 h-8 ${selectedChoice === 'choice1' ? 'text-white' : 'text-red-500'}`} />
                </div>
                <CardTitle className="text-xl">{THREE_CHOICES.choice1.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {THREE_CHOICES.choice1.description}
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                    {THREE_CHOICES.choice1.consequence}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 选择二 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice2'
                  ? 'border-yellow-500 ring-2 ring-yellow-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice2')}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedChoice === 'choice2' ? 'bg-yellow-500' : 'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                  <AlertTriangle className={`w-8 h-8 ${selectedChoice === 'choice2' ? 'text-white' : 'text-yellow-500'}`} />
                </div>
                <CardTitle className="text-xl">{THREE_CHOICES.choice2.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {THREE_CHOICES.choice2.description}
                </p>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold">
                    {THREE_CHOICES.choice2.consequence}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 选择三 */}
            <Card
              className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedChoice === 'choice3'
                  ? 'border-green-500 ring-2 ring-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleChoiceSelect('choice3')}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedChoice === 'choice3' ? 'bg-green-500' : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <CheckCircle2 className={`w-8 h-8 ${selectedChoice === 'choice3' ? 'text-white' : 'text-green-500'}`} />
                </div>
                <CardTitle className="text-xl">{THREE_CHOICES.choice3.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {THREE_CHOICES.choice3.description}
                </p>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                    {THREE_CHOICES.choice3.consequence}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedChoice && (
            <div className="mt-8 max-w-3xl mx-auto">
              <Alert className={`border-2 ${
                selectedChoice === 'choice1' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                selectedChoice === 'choice2' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}>
                {selectedChoice === 'choice3' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <AlertDescription>
                  {selectedChoice === 'choice3' ? (
                    <span className="text-green-700 dark:text-green-400">
                      恭喜您选择了正确的方向！学习健康自我管理是改善健康状况的最佳途径。
                      接下来，请阅读并承诺完成四个要求。
                    </span>
                  ) : (
                    <span>
                      请慎重考虑。虽然这是您自己的选择，但我们真诚建议您选择"学习健康自我管理"。
                      其他选择可能导致症状持续加重，错失最佳调理时机。
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
                  为了确保健康管理的效果，请您认真阅读并承诺完成以下四个要求
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <BookOpen className="w-4 h-4" />
                  <AlertDescription>
                    这四个要求是健康管理成功的关键，缺一不可。只有严格执行，才能确保调理效果。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(1)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
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
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {FOUR_REQUIREMENTS.requirement1.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {FOUR_REQUIREMENTS.requirement1.description}
                    </p>
                  </div>
                </div>
              </div>

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
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {FOUR_REQUIREMENTS.requirement2.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {FOUR_REQUIREMENTS.requirement2.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(3)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
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
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {FOUR_REQUIREMENTS.requirement3.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {FOUR_REQUIREMENTS.requirement3.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                acceptedRequirements.has(4)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
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
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {FOUR_REQUIREMENTS.requirement4.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {FOUR_REQUIREMENTS.requirement4.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-3xl mx-auto">
              <Alert className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  这四个要求缺一不可，是健康管理成功的关键保障。只有严格执行，
                  才能确保调理效果。请您认真对待每一项要求。
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {/* 下一步按钮 */}
        {selectedChoice === 'choice3' && (
          <section className="text-center">
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={acceptedRequirements.size !== 4}
              className={`${
                acceptedRequirements.size === 4
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              获取您的健康管理方案
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            {acceptedRequirements.size !== 4 && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                请先同意并承诺完成所有四个要求
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
