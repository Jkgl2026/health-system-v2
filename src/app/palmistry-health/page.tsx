'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, Loader2 } from 'lucide-react';

export default function PalmistryHealthPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'left' | 'right'>('left');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: '',
  });

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
    if (!image) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch('/api/palmistry-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          imageType,
          userInfo,
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
          <h1 className="text-3xl font-bold mb-2">手相健康检测</h1>
          <p className="text-muted-foreground">通过手掌特征分析健康状况</p>
        </div>

        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>上传手掌照片</CardTitle>
              <CardDescription>请选择左手或右手进行检测</CardDescription>
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
                <label className="block text-sm font-medium mb-2">选择手部</label>
                <div className="flex gap-4">
                  <Button
                    variant={imageType === 'left' ? 'default' : 'outline'}
                    onClick={() => setImageType('left')}
                  >
                    左手
                  </Button>
                  <Button
                    variant={imageType === 'right' ? 'default' : 'outline'}
                    onClick={() => setImageType('right')}
                  >
                    右手
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">上传照片</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {image ? (
                    <div className="space-y-4">
                      <img
                        src={image}
                        alt="手掌"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button onClick={() => setImage(null)} variant="outline">
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="palm-upload"
                      />
                      <label htmlFor="palm-upload">
                        <Button asChild>
                          <span><Upload className="mr-2 h-4 w-4" />上传照片</span>
                        </Button>
                      </label>
                      <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!image || analyzing || !userInfo.name}
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
              重新检测
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
