'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, Loader2, AlertCircle, CheckCircle2, RotateCcw,
  Sparkles, ArrowLeft, Heart, Play, Pause, Square,
  Activity, Shield, Volume2, Info, FileDown
} from 'lucide-react';

interface VoiceHealthResult {
  overallScore: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  voiceQuality: {
    clarity: number;
    volume: number;
    tone: number;
    rhythm: number;
  };
  healthIndicators: Array<{
    indicator: string;
    value: number;
    status: 'normal' | 'warning' | 'abnormal';
    description: string;
  }>;
  riskAssessment: {
    respiratory: string;
    vocalCord: string;
    overall: string;
  };
  recommendations: Array<{
    category: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  voiceCareTips: string[];
  summary: string;
  fullReport: string;
  timestamp: string;
}

export default function VoiceHealthPage() {
  const router = useRouter();
  
  // 用户信息
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', age: '', gender: '' });
  
  // 录音相关
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceHealthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('无法访问麦克风:', err);
      setError('无法访问麦克风，请确保已授权');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 重新录音
  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setResult(null);
    setError(null);
  };

  // 格式化录音时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 提交分析
  const handleSubmit = async () => {
    if (!audioBlob) return;
    if (!userInfo.name) {
      setError('请填写姓名');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 将音频转换为base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        try {
          const response = await fetch('/api/voice-health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              audio: base64Audio,
              userInfo: {
                name: userInfo.name,
                age: userInfo.age,
                gender: userInfo.gender,
                phone: userInfo.phone,
              },
            }),
          });
          const data = await response.json();

          if (data.success) {
            setResult(data.data);
          } else {
            setError(data.error || '分析失败');
          }
        } catch (err) {
          console.error('语音健康评估失败:', err);
          setError('网络错误');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('处理音频失败:', err);
      setError('处理音频失败');
      setLoading(false);
    }
  };

  // 导出Word报告
  const [exporting, setExporting] = useState(false);
  const handleExportReport = async () => {
    if (!result) return;
    alert('语音健康报告导出功能开发中...');
    setExporting(false);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '声音健康 - 优秀';
      case 'good': return '声音健康 - 良好';
      case 'fair': return '声音健康 - 一般';
      case 'poor': return '声音健康 - 需关注';
      default: return '未评估';
    }
  };

  const getIndicatorStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'abnormal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 声音健康评估</h1>
                <p className="text-sm text-gray-500">通过声音分析评估您的健康状况</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {/* 用户信息输入 */}
        <Card className="border-blue-200 dark:border-blue-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
            <CardDescription>请填写您的基本信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="请输入姓名"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="请输入年龄"
                  value={userInfo.age}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select value={userInfo.gender} onValueChange={(v) => setUserInfo(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  placeholder="选填"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 录音区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">录制声音样本</CardTitle>
            <CardDescription>请朗读："今天天气真好，我想去公园散步"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {/* 录音控制 */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <>
                    {!audioUrl && (
                      <Button 
                        size="lg"
                        onClick={startRecording}
                        className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Mic className="h-7 w-7" />
                      </Button>
                    )}
                    {audioUrl && (
                      <Button 
                        size="lg"
                        onClick={resetRecording}
                        variant="outline"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />重新录制
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    size="lg"
                    onClick={stopRecording}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    <Square className="h-7 w-7" />
                  </Button>
                )}
                
                {/* 录音时间显示 */}
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-2xl font-mono font-bold">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>

              {/* 音频播放器 */}
              {audioUrl && (
                <div className="w-full max-w-md p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <audio controls className="w-full" src={audioUrl}>
                    您的浏览器不支持音频播放
                  </audio>
                </div>
              )}

              {/* 提交按钮 */}
              {audioUrl && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在分析...</>) : (<><Sparkles className="mr-2 h-4 w-4" />开始分析</>)}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>分析失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 分析结果 */}
        {result && (
          <div className="space-y-4">
            {/* 总体评分 */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    声音健康评估结果
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exporting}>
                    {exporting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />导出中...</>) : (<><FileDown className="mr-2 h-4 w-4" />导出报告</>)}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* 健康状态 */}
                <div className={`p-6 rounded-lg mb-6 ${getHealthStatusColor(result.healthStatus)}`}>
                  <div className="text-center">
                    <div className="text-sm opacity-90 mb-2">声音健康状态</div>
                    <div className="text-4xl font-bold mb-2">{getHealthStatusText(result.healthStatus)}</div>
                    <div className="text-3xl font-bold mt-2">{result.overallScore}分</div>
                    <div className="text-sm opacity-80 mt-1">满分100分</div>
                  </div>
                  <Progress value={result.overallScore} className="mt-4 h-2" />
                </div>

                {/* 声音质量分析 */}
                {result.voiceQuality && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-blue-500" />
                      声音质量分析
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { key: 'clarity', name: '清晰度', value: result.voiceQuality.clarity },
                        { key: 'volume', name: '音量', value: result.voiceQuality.volume },
                        { key: 'tone', name: '音调', value: result.voiceQuality.tone },
                        { key: 'rhythm', name: '节奏', value: result.voiceQuality.rhythm },
                      ].map((item) => (
                        <div key={item.key} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="text-xs text-muted-foreground">{item.name}</div>
                          <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                          <Progress value={item.value} className="mt-1 h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 健康指标 */}
                {result.healthIndicators && result.healthIndicators.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      健康指标
                    </h3>
                    <div className="space-y-2">
                      {result.healthIndicators.map((indicator, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{indicator.indicator}</span>
                            <Badge className={getIndicatorStatusColor(indicator.status)}>
                              {indicator.status === 'normal' ? '正常' : indicator.status === 'warning' ? '警告' : '异常'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{indicator.description}</p>
                          <Progress value={indicator.value} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 风险评估 */}
                {result.riskAssessment && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      风险评估
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>呼吸系统风险：</span>
                        <span className="font-medium">{result.riskAssessment.respiratory}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>声带健康风险：</span>
                        <span className="font-medium">{result.riskAssessment.vocalCord}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>整体健康风险：</span>
                        <span className="font-medium">{result.riskAssessment.overall}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 声音护理建议 */}
                {result.voiceCareTips && result.voiceCareTips.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      声音护理建议
                    </h3>
                    <div className="space-y-2">
                      {result.voiceCareTips.map((tip, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 健康建议 */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">💡 健康建议</h3>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                              {rec.priority === 'high' ? '重要' : rec.priority === 'medium' ? '中等' : '建议'}
                            </Badge>
                            <div>
                              <span className="font-medium">{rec.category}：</span>
                              <span className="ml-1">{rec.content}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 完整报告 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    完整分析报告
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm font-sans">{result.fullReport}</pre>
                </div>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>⚠️ 重要提示</AlertTitle>
              <AlertDescription>
                本声音健康评估结果仅供参考，不作为医疗诊断依据。如有持续声音问题，请及时就医检查专业耳鼻喉科医生。
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  );
}
