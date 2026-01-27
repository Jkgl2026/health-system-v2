'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Save, AlertCircle } from 'lucide-react';
import { SEVEN_QUESTIONS } from '@/lib/health-data';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveRequirements, createUser, getUser } from '@/lib/api-client';

interface QuestionAnswer {
  questionId: number;
  answer: string;
}

export default function TestSevenQuestionsPage() {
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<any>(null);
  const [userId] = useState(getOrGenerateUserId());

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const newAnswers = [...prev];
        newAnswers[existing] = { questionId, answer };
        return newAnswers;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      console.log('[测试页面] 开始保存七问数据');
      console.log('[测试页面] userId:', userId);
      console.log('[测试页面] 答案数量:', answers.length);

      // 确保用户存在
      const userResponse = await getUser(userId);
      if (!userResponse.success || !userResponse.user) {
        console.log('[测试页面] 用户不存在，创建新用户');
        const createResponse = await createUser({
          name: '测试用户七问',
          phone: null,
          email: null,
          age: null,
          gender: null,
        });

        if (!createResponse.success || !createResponse.user) {
          throw new Error('用户创建失败，无法保存数据');
        }
        console.log('[测试页面] 用户创建成功，ID:', createResponse.user.id);
      }

      // 保存七问答案到 requirements 表
      const sevenQuestionsData: Record<string, any> = {};
      answers.forEach(a => {
        sevenQuestionsData[a.questionId.toString()] = {
          answer: a.answer,
          date: new Date().toISOString(),
        };
      });

      console.log('[测试页面] 保存七问答案，数据量:', Object.keys(sevenQuestionsData).length);
      console.log('[测试页面] 七问数据:', JSON.stringify(sevenQuestionsData, null, 2));

      const requirementsData = {
        userId,
        sevenQuestionsAnswers: sevenQuestionsData,
      };

      const saveResponse = await saveRequirements(requirementsData);
      console.log('[测试页面] 保存响应:', saveResponse);

      if (saveResponse.success) {
        setSaveSuccess(true);
        console.log('[测试页面] 七问答案保存成功');
      } else {
        throw new Error(saveResponse.error || '保存失败');
      }
    } catch (error) {
      console.error('[测试页面] 保存失败:', error);
      setSaveError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/debug/requirements/${userId}`);
      const data = await response.json();
      console.log('[测试页面] 验证结果:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[测试页面] 验证失败:', error);
      alert('验证失败: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">七问数据保存测试</CardTitle>
            <CardDescription>
              当前用户ID: {userId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  此页面用于测试七问数据的保存和显示功能。请填写以下7个问题，然后点击"保存数据"按钮。
                  保存成功后，可以点击"验证数据"按钮查看数据库中的实际存储数据。
                </p>
              </div>

              {saveSuccess && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    七问数据保存成功！现在可以在后台管理页面查看该用户的七问答案。
                  </AlertDescription>
                </Alert>
              )}

              {saveError && (
                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    保存失败: {saveError.message || String(saveError)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {SEVEN_QUESTIONS.map((q, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{q.question}</CardTitle>
                    <CardDescription>{q.description}</CardDescription>
                  </div>
                  {answers.find(a => a.questionId === q.id) && (
                    <Badge variant="secondary" className="ml-auto">已填写</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请输入您的回答..."
                  value={answers.find(a => a.questionId === q.id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || answers.length < 7}
            className="flex-1"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存数据
              </>
            )}
          </Button>

          <Button
            onClick={handleVerify}
            variant="outline"
            size="lg"
          >
            验证数据
          </Button>
        </div>

        {answers.length < 7 && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            还需要填写 {7 - answers.length} 个问题
          </div>
        )}
      </div>
    </div>
  );
}
