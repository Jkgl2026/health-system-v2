'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';

export default function BreathingAnalysisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: '',
  });
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/breathing-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          userInfo,
          description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">呼吸分析</h1>
          <p className="text-muted-foreground">分析呼吸模式和健康状况</p>
        </div>

        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>呼吸分析</CardTitle>
              <CardDescription>上传视频或描述呼吸情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">姓名</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="请输入姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">呼吸情况描述（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  rows={4}
                  placeholder="描述您的呼吸情况..."
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !userInfo.name}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '开始分析'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>检测结果</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{result.fullReport}</pre>
              </CardContent>
            </Card>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">
              重新分析
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
