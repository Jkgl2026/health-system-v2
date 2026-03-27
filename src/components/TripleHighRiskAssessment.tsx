'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, Heart, Activity, Droplets, Info, TrendingUp, Calendar, Shield, Utensils, Moon, Dumbbell, Brain } from 'lucide-react';

interface TripleHighRiskData {
  overallRisk?: {
    level: string;
    score: number;
    confidence: number;
    primaryRisk: string;
  };
  hypertension?: any;
  hyperglycemia?: any;
  hyperlipidemia?: any;
  comprehensiveRecommendations?: any;
  lifestyleFactors?: any;
}

interface TripleHighRiskAssessmentProps {
  data: TripleHighRiskData;
}

export function TripleHighRiskAssessment({ data }: TripleHighRiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case '高': return 'text-red-600 bg-red-50 border-red-200';
      case '中': return 'text-orange-600 bg-orange-50 border-orange-200';
      case '低': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case '高': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case '中': return <Activity className="h-5 w-5 text-orange-500" />;
      case '低': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!data || !data.overallRisk) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 总体风险评估 */}
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-500" />
                三高风险综合评估
              </CardTitle>
              <CardDescription>基于面诊/舌诊特征的深度分析</CardDescription>
            </div>
            <Badge className={getRiskColor(data.overallRisk.level)} variant="outline">
              {getRiskIcon(data.overallRisk.level)}
              <span className="ml-2 font-bold">{data.overallRisk.level}风险</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                {data.overallRisk.score}
              </div>
              <div className="text-sm text-muted-foreground mt-1">风险评分</div>
              <Progress value={data.overallRisk.score} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {data.overallRisk.confidence}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">置信度</div>
              <Progress value={data.overallRisk.confidence} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                {data.overallRisk.primaryRisk}
              </div>
              <div className="text-sm text-muted-foreground mt-1">主要风险</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 三高详细风险评估 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 高血压风险评估 */}
        {data.hypertension && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                高血压风险
              </CardTitle>
              <Badge className={getRiskColor(data.hypertension.riskLevel)} variant="outline">
                {data.hypertension.riskLevel}风险
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>风险评分</span>
                  <span className="font-bold">{data.hypertension.riskScore}/100</span>
                </div>
                <Progress value={data.hypertension.riskScore} className="h-2" />
              </div>

              {data.hypertension.indicators && data.hypertension.indicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    检测指标
                  </h4>
                  <div className="space-y-2">
                    {data.hypertension.indicators.map((ind: any, idx: number) => (
                      ind.detected && (
                        <div key={idx} className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{ind.name}</span>
                            <Badge variant="outline" className="text-xs">{ind.severity}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            置信度: {ind.confidence}%
                          </div>
                          {ind.description && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {ind.description}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {data.hypertension.medicalRecommendations && data.hypertension.medicalRecommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    医疗建议
                  </h4>
                  <ul className="text-sm space-y-1">
                    {data.hypertension.medicalRecommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 高血糖风险评估 */}
        {data.hyperglycemia && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplets className="h-5 w-5 text-yellow-500" />
                高血糖风险
              </CardTitle>
              <Badge className={getRiskColor(data.hyperglycemia.riskLevel)} variant="outline">
                {data.hyperglycemia.riskLevel}风险
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>风险评分</span>
                  <span className="font-bold">{data.hyperglycemia.riskScore}/100</span>
                </div>
                <Progress value={data.hyperglycemia.riskScore} className="h-2" />
              </div>

              {data.hyperglycemia.indicators && data.hyperglycemia.indicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    检测指标
                  </h4>
                  <div className="space-y-2">
                    {data.hyperglycemia.indicators.map((ind: any, idx: number) => (
                      ind.detected && (
                        <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{ind.name}</span>
                            <Badge variant="outline" className="text-xs">{ind.severity}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            置信度: {ind.confidence}%
                          </div>
                          {ind.description && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {ind.description}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {data.hyperglycemia.medicalRecommendations && data.hyperglycemia.medicalRecommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    医疗建议
                  </h4>
                  <ul className="text-sm space-y-1">
                    {data.hyperglycemia.medicalRecommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 高血脂风险评估 */}
        {data.hyperlipidemia && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                高血脂风险
              </CardTitle>
              <Badge className={getRiskColor(data.hyperlipidemia.riskLevel)} variant="outline">
                {data.hyperlipidemia.riskLevel}风险
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>风险评分</span>
                  <span className="font-bold">{data.hyperlipidemia.riskScore}/100</span>
                </div>
                <Progress value={data.hyperlipidemia.riskScore} className="h-2" />
              </div>

              {data.hyperlipidemia.indicators && data.hyperlipidemia.indicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    检测指标
                  </h4>
                  <div className="space-y-2">
                    {data.hyperlipidemia.indicators.map((ind: any, idx: number) => (
                      ind.detected && (
                        <div key={idx} className="p-2 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{ind.name}</span>
                            <Badge variant="outline" className="text-xs">{ind.severity}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            置信度: {ind.confidence}%
                          </div>
                          {ind.description && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {ind.description}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {data.hyperlipidemia.medicalRecommendations && data.hyperlipidemia.medicalRecommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    医疗建议
                  </h4>
                  <ul className="text-sm space-y-1">
                    {data.hyperlipidemia.medicalRecommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 综合建议 */}
      {data.comprehensiveRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              综合建议与行动计划
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 立即行动 */}
            {data.comprehensiveRecommendations.immediate && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  立即行动
                </h4>
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <ul className="text-sm space-y-1">
                    {data.comprehensiveRecommendations.immediate.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              </div>
            )}

            {/* 短期目标 */}
            {data.comprehensiveRecommendations.shortTerm && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  短期目标（1-3个月）
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.comprehensiveRecommendations.shortTerm.map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Badge className="mt-0.5" variant="outline">目标{idx + 1}</Badge>
                        <span className="text-sm">{rec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 长期规划 */}
            {data.comprehensiveRecommendations.longTerm && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                  长期规划（3年以上）
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.comprehensiveRecommendations.longTerm.map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-950 rounded border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-2">
                        <Badge className="mt-0.5" variant="outline">规划{idx + 1}</Badge>
                        <span className="text-sm">{rec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 生活方式因素分析 */}
      {data.lifestyleFactors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-500" />
              生活方式因素分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 饮食 */}
              {data.lifestyleFactors.diet && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">饮食</span>
                  </div>
                  <Badge className="mb-2" variant="outline">{data.lifestyleFactors.diet.status}</Badge>
                  {data.lifestyleFactors.diet.recommendations && (
                    <div className="text-xs mt-2 space-y-1">
                      {data.lifestyleFactors.diet.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-muted-foreground">• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 运动 */}
              {data.lifestyleFactors.exercise && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">运动</span>
                  </div>
                  <Badge className="mb-2" variant="outline">{data.lifestyleFactors.exercise.status}</Badge>
                  {data.lifestyleFactors.exercise.recommendations && (
                    <div className="text-xs mt-2 space-y-1">
                      {data.lifestyleFactors.exercise.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-muted-foreground">• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 睡眠 */}
              {data.lifestyleFactors.sleep && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">睡眠</span>
                  </div>
                  <Badge className="mb-2" variant="outline">{data.lifestyleFactors.sleep.status}</Badge>
                  {data.lifestyleFactors.sleep.recommendations && (
                    <div className="text-xs mt-2 space-y-1">
                      {data.lifestyleFactors.sleep.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-muted-foreground">• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 压力 */}
              {data.lifestyleFactors.stress && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">压力</span>
                  </div>
                  <Badge className="mb-2" variant="outline">{data.lifestyleFactors.stress.status}</Badge>
                  {data.lifestyleFactors.stress.recommendations && (
                    <div className="text-xs mt-2 space-y-1">
                      {data.lifestyleFactors.stress.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-muted-foreground">• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 免责声明 */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>重要提示</AlertTitle>
        <AlertDescription>
          本评估结果仅供参考，不能替代专业医疗诊断。如有健康问题，请及时就医进行专业检查和治疗。
        </AlertDescription>
      </Alert>
    </div>
  );
}
