'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sparkles, Brain, Activity, Target, Shield, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Heart, Zap,
  Bone, User, Calendar, Clock, Dumbbell, Leaf, Apple
} from 'lucide-react';
import { useState } from 'react';

interface AISemanticAnalysis {
  summary: string;
  detailedAnalysis?: {
    head?: { status: string; angle?: string; description?: string; impact?: string };
    shoulders?: { status: string; leftRightDiff?: string; roundingStatus?: string; description?: string; impact?: string };
    spine?: { status: string; alignmentScore?: string; curves?: { cervical?: string; thoracic?: string; lumbar?: string }; description?: string; impact?: string };
    pelvis?: { status: string; tiltAngle?: string; rotationStatus?: string; description?: string; impact?: string };
    knees?: { status: string; angle?: string; description?: string; impact?: string };
    ankles?: { status: string; description?: string; impact?: string };
  };
  primaryIssues?: Array<{
    issue: string;
    severity: string;
    angle?: string;
    cause?: string;
    relatedMuscles?: string[];
    relatedMeridians?: string[];
    recommendation?: string;
  }>;
  muscleAnalysis?: {
    tight?: Array<{ muscle: string; location: string; reason: string; stretches: string[] }>;
    weak?: Array<{ muscle: string; location: string; reason: string; exercises: string[] }>;
  };
  fasciaChainAnalysis?: {
    frontLine?: { status: string; tension: string; impact: string };
    backLine?: { status: string; tension: string; impact: string };
    lateralLine?: { status: string; tension: string; impact: string };
    spiralLine?: { status: string; tension: string; impact: string };
    deepFrontLine?: { status: string; tension: string; impact: string };
  };
  breathingAssessment?: {
    pattern: string;
    diaphragm: string;
    accessoryMuscles: string;
    ribcageMobility: string;
    impact: string;
  };
  riskAssessment?: {
    painRisk?: Array<{ area: string; likelihood: string; cause: string; prevention: string }>;
    organImpact?: Array<{ organ: string; impact: string; reason: string }>;
    progressionRisk?: string;
    overallRisk?: string;
  };
  recommendations?: {
    immediate?: string[];
    shortTerm?: string[];
    longTerm?: string[];
    exercises?: Array<{
      name: string;
      category: string;
      purpose: string;
      method: string;
      duration: string;
      frequency: string;
      cautions?: string[];
    }>;
    lifestyle?: Array<{ area: string; suggestion: string }>;
  };
  tcmPerspective?: {
    constitution: string;
    constitutionReason?: string;
    constitutionFeatures?: string[];
    meridians?: Array<{ name: string; status: string; reason: string; symptoms?: string[] }>;
    acupoints?: Array<{ name: string; location: string; benefit: string; method: string; contraindications?: string }>;
    daoyinSuggestions?: string[];
    dietaryAdvice?: { suitable?: string[]; avoid?: string[]; teaRecommendation?: string };
    seasonalAdvice?: string;
    dailyRoutine?: { morning?: string; noon?: string; evening?: string };
  };
  healthPrediction?: {
    shortTerm?: string;
    midTerm?: string;
    longTerm?: string;
    preventiveMeasures?: string[];
  };
  treatmentPlan?: {
    zhengfu?: { name: string; description: string; duration: string; sessions: Array<{ week: string; focus: string; exercises: string[] }> };
    benyuan?: { name: string; description: string; duration: string; sessions: Array<{ week: string; focus: string; exercises: string[] }> };
  };
}

interface AIDeepAnalysisViewProps {
  analysis: AISemanticAnalysis | null;
}

export default function AIDeepAnalysisView({ analysis }: AIDeepAnalysisViewProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    detailedAnalysis: true,
    primaryIssues: true,
    muscleAnalysis: true,
    fasciaChain: false,
    breathing: false,
    risks: true,
    recommendations: true,
    tcm: true,
    prediction: false,
    treatment: false,
  });

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800">AI深度分析</h3>
          <p className="text-gray-500">正在分析中...</p>
        </CardContent>
      </Card>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    if (status.includes('正常')) return 'text-green-600';
    if (status.includes('轻度')) return 'text-yellow-600';
    if (status.includes('中度')) return 'text-orange-600';
    return 'text-red-600';
  };

  // 风险等级颜色
  const getRiskColor = (risk: string) => {
    if (risk === '高' || risk === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (risk === '中' || risk === 'medium') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="space-y-4">
      {/* 分析摘要 */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 深度分析摘要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* 各部位详细分析 */}
      {analysis.detailedAnalysis && (
        <Collapsible open={openSections.detailedAnalysis} onOpenChange={() => toggleSection('detailedAnalysis')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    各部位详细分析
                  </span>
                  {openSections.detailedAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.detailedAnalysis.head && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">头部</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.head.status)}`}>
                          {analysis.detailedAnalysis.head.status}
                        </span>
                      </div>
                      {analysis.detailedAnalysis.head.angle && (
                        <div className="text-xs text-gray-500 mb-1">角度: {analysis.detailedAnalysis.head.angle}</div>
                      )}
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.head.description}</p>
                      {analysis.detailedAnalysis.head.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.head.impact}</div>
                      )}
                    </div>
                  )}
                  
                  {analysis.detailedAnalysis.shoulders && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">肩部</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.shoulders.status)}`}>
                          {analysis.detailedAnalysis.shoulders.status}
                        </span>
                      </div>
                      {analysis.detailedAnalysis.shoulders.leftRightDiff && (
                        <div className="text-xs text-gray-500 mb-1">左右差异: {analysis.detailedAnalysis.shoulders.leftRightDiff}</div>
                      )}
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.shoulders.description}</p>
                      {analysis.detailedAnalysis.shoulders.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.shoulders.impact}</div>
                      )}
                    </div>
                  )}
                  
                  {analysis.detailedAnalysis.spine && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">脊柱</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.spine.status)}`}>
                          {analysis.detailedAnalysis.spine.status}
                        </span>
                      </div>
                      {analysis.detailedAnalysis.spine.curves && (
                        <div className="text-xs text-gray-500 mb-1">
                          颈椎: {analysis.detailedAnalysis.spine.curves.cervical} | 
                          胸椎: {analysis.detailedAnalysis.spine.curves.thoracic} | 
                          腰椎: {analysis.detailedAnalysis.spine.curves.lumbar}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.spine.description}</p>
                      {analysis.detailedAnalysis.spine.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.spine.impact}</div>
                      )}
                    </div>
                  )}
                  
                  {analysis.detailedAnalysis.pelvis && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">骨盆</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.pelvis.status)}`}>
                          {analysis.detailedAnalysis.pelvis.status}
                        </span>
                      </div>
                      {analysis.detailedAnalysis.pelvis.tiltAngle && (
                        <div className="text-xs text-gray-500 mb-1">倾斜角度: {analysis.detailedAnalysis.pelvis.tiltAngle}</div>
                      )}
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.pelvis.description}</p>
                      {analysis.detailedAnalysis.pelvis.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.pelvis.impact}</div>
                      )}
                    </div>
                  )}
                  
                  {analysis.detailedAnalysis.knees && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">膝关节</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.knees.status)}`}>
                          {analysis.detailedAnalysis.knees.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.knees.description}</p>
                      {analysis.detailedAnalysis.knees.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.knees.impact}</div>
                      )}
                    </div>
                  )}
                  
                  {analysis.detailedAnalysis.ankles && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">足踝</span>
                        <span className={`text-sm font-medium ${getStatusColor(analysis.detailedAnalysis.ankles.status)}`}>
                          {analysis.detailedAnalysis.ankles.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analysis.detailedAnalysis.ankles.description}</p>
                      {analysis.detailedAnalysis.ankles.impact && (
                        <div className="text-xs text-red-600 mt-2">影响: {analysis.detailedAnalysis.ankles.impact}</div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 主要问题 */}
      {analysis.primaryIssues && analysis.primaryIssues.length > 0 && (
        <Collapsible open={openSections.primaryIssues} onOpenChange={() => toggleSection('primaryIssues')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    主要问题分析 ({analysis.primaryIssues.length}项)
                  </span>
                  {openSections.primaryIssues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {analysis.primaryIssues.map((issue, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{issue.issue}</span>
                        <Badge variant={issue.severity === '重度' ? 'destructive' : issue.severity === '中度' ? 'default' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                      </div>
                      {issue.angle && <div className="text-xs text-gray-500 mb-1">测量角度: {issue.angle}</div>}
                      {issue.cause && <p className="text-sm text-gray-600 mb-2">{issue.cause}</p>}
                      {issue.relatedMuscles && issue.relatedMuscles.length > 0 && (
                        <div className="text-xs text-gray-500 mb-1">相关肌肉: {issue.relatedMuscles.join('、')}</div>
                      )}
                      {issue.relatedMeridians && issue.relatedMeridians.length > 0 && (
                        <div className="text-xs text-purple-600 mb-1">相关经络: {issue.relatedMeridians.join('、')}</div>
                      )}
                      {issue.recommendation && (
                        <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-2">
                          建议: {issue.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 肌肉分析 */}
      {analysis.muscleAnalysis && (
        <Collapsible open={openSections.muscleAnalysis} onOpenChange={() => toggleSection('muscleAnalysis')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    肌肉功能分析
                  </span>
                  {openSections.muscleAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 紧张肌肉 */}
                  <div>
                    <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      紧张肌肉 ({analysis.muscleAnalysis.tight?.length || 0})
                    </h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {analysis.muscleAnalysis.tight?.map((m, idx) => (
                          <div key={idx} className="p-2 bg-red-50 rounded text-sm">
                            <div className="font-medium text-red-800">{m.muscle}</div>
                            <div className="text-xs text-gray-500">{m.location}</div>
                            <div className="text-xs text-gray-600 mt-1">{m.reason}</div>
                            {m.stretches && m.stretches.length > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                拉伸: {m.stretches.join('、')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* 无力肌肉 */}
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      无力肌肉 ({analysis.muscleAnalysis.weak?.length || 0})
                    </h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {analysis.muscleAnalysis.weak?.map((m, idx) => (
                          <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
                            <div className="font-medium text-blue-800">{m.muscle}</div>
                            <div className="text-xs text-gray-500">{m.location}</div>
                            <div className="text-xs text-gray-600 mt-1">{m.reason}</div>
                            {m.exercises && m.exercises.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                强化: {m.exercises.join('、')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 筋膜链分析 */}
      {analysis.fasciaChainAnalysis && (
        <Collapsible open={openSections.fasciaChain} onOpenChange={() => toggleSection('fasciaChain')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    筋膜链状态分析
                  </span>
                  {openSections.fasciaChain ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.fasciaChainAnalysis.frontLine && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800 mb-1">前表链</div>
                      <div className="text-sm">{analysis.fasciaChainAnalysis.frontLine.status}</div>
                      <div className="text-xs text-gray-500 mt-1">紧张度: {analysis.fasciaChainAnalysis.frontLine.tension}</div>
                      <div className="text-xs text-gray-600 mt-1">{analysis.fasciaChainAnalysis.frontLine.impact}</div>
                    </div>
                  )}
                  {analysis.fasciaChainAnalysis.backLine && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 mb-1">后表链</div>
                      <div className="text-sm">{analysis.fasciaChainAnalysis.backLine.status}</div>
                      <div className="text-xs text-gray-500 mt-1">紧张度: {analysis.fasciaChainAnalysis.backLine.tension}</div>
                      <div className="text-xs text-gray-600 mt-1">{analysis.fasciaChainAnalysis.backLine.impact}</div>
                    </div>
                  )}
                  {analysis.fasciaChainAnalysis.lateralLine && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-1">体侧链</div>
                      <div className="text-sm">{analysis.fasciaChainAnalysis.lateralLine.status}</div>
                      <div className="text-xs text-gray-500 mt-1">紧张度: {analysis.fasciaChainAnalysis.lateralLine.tension}</div>
                      <div className="text-xs text-gray-600 mt-1">{analysis.fasciaChainAnalysis.lateralLine.impact}</div>
                    </div>
                  )}
                  {analysis.fasciaChainAnalysis.spiralLine && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-800 mb-1">螺旋链</div>
                      <div className="text-sm">{analysis.fasciaChainAnalysis.spiralLine.status}</div>
                      <div className="text-xs text-gray-500 mt-1">紧张度: {analysis.fasciaChainAnalysis.spiralLine.tension}</div>
                      <div className="text-xs text-gray-600 mt-1">{analysis.fasciaChainAnalysis.spiralLine.impact}</div>
                    </div>
                  )}
                  {analysis.fasciaChainAnalysis.deepFrontLine && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-800 mb-1">深前线</div>
                      <div className="text-sm">{analysis.fasciaChainAnalysis.deepFrontLine.status}</div>
                      <div className="text-xs text-gray-500 mt-1">紧张度: {analysis.fasciaChainAnalysis.deepFrontLine.tension}</div>
                      <div className="text-xs text-gray-600 mt-1">{analysis.fasciaChainAnalysis.deepFrontLine.impact}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 健康风险评估 */}
      {analysis.riskAssessment && (
        <Collapsible open={openSections.risks} onOpenChange={() => toggleSection('risks')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    健康风险评估
                  </span>
                  {openSections.risks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {/* 整体风险 */}
                {analysis.riskAssessment.overallRisk && (
                  <div className={`p-3 rounded-lg mb-4 border ${getRiskColor(analysis.riskAssessment.overallRisk)}`}>
                    <div className="font-medium">整体风险等级: {analysis.riskAssessment.overallRisk}</div>
                  </div>
                )}
                
                {/* 疼痛风险 */}
                {analysis.riskAssessment.painRisk && analysis.riskAssessment.painRisk.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-orange-600 mb-2">疼痛风险</h4>
                    <div className="space-y-2">
                      {analysis.riskAssessment.painRisk.map((risk, idx) => (
                        <div key={idx} className="p-2 bg-orange-50 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{risk.area}</span>
                            <Badge variant={risk.likelihood === '高' ? 'destructive' : 'secondary'}>{risk.likelihood}</Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">原因: {risk.cause}</div>
                          <div className="text-xs text-green-600 mt-1">预防: {risk.prevention}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 脏器影响 */}
                {analysis.riskAssessment.organImpact && analysis.riskAssessment.organImpact.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-600 mb-2">可能的脏器影响</h4>
                    <div className="space-y-2">
                      {analysis.riskAssessment.organImpact.map((impact, idx) => (
                        <div key={idx} className="p-2 bg-red-50 rounded text-sm">
                          <span className="font-medium text-red-800">{impact.organ}</span>
                          <div className="text-xs text-gray-600 mt-1">{impact.impact}</div>
                          <div className="text-xs text-gray-500">原因: {impact.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 发展趋势 */}
                {analysis.riskAssessment.progressionRisk && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700 mb-1">发展趋势预测</div>
                    <p className="text-sm text-gray-600">{analysis.riskAssessment.progressionRisk}</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 改善建议 */}
      {analysis.recommendations && (
        <Collapsible open={openSections.recommendations} onOpenChange={() => toggleSection('recommendations')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    改善建议与训练方案
                  </span>
                  {openSections.recommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {/* 立即建议 */}
                {analysis.recommendations.immediate && analysis.recommendations.immediate.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      立即行动
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {analysis.recommendations.immediate.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 短期建议 */}
                {analysis.recommendations.shortTerm && analysis.recommendations.shortTerm.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      短期计划 (1-4周)
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {analysis.recommendations.shortTerm.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 长期建议 */}
                {analysis.recommendations.longTerm && analysis.recommendations.longTerm.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      长期策略 (1-3个月)
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {analysis.recommendations.longTerm.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 推荐动作 */}
                {analysis.recommendations.exercises && analysis.recommendations.exercises.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                      <Dumbbell className="h-4 w-4" />
                      推荐训练动作
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.recommendations.exercises.map((ex, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-800">{ex.name}</span>
                            <Badge variant="outline">{ex.category}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">{ex.purpose}</div>
                          <div className="text-sm text-gray-600">{ex.method}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ex.duration} | {ex.frequency}
                          </div>
                          {ex.cautions && ex.cautions.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              注意: {ex.cautions.join('、')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 生活建议 */}
                {analysis.recommendations.lifestyle && analysis.recommendations.lifestyle.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-600 mb-2">生活建议</h4>
                    <div className="space-y-2">
                      {analysis.recommendations.lifestyle.map((lifestyle, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 rounded text-sm">
                          <span className="font-medium text-purple-800">{lifestyle.area}:</span>{' '}
                          <span className="text-gray-600">{lifestyle.suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 中医分析 */}
      {analysis.tcmPerspective && (
        <Collapsible open={openSections.tcm} onOpenChange={() => toggleSection('tcm')}>
          <Card className="border-l-4 border-l-amber-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-amber-500" />
                    中医视角分析
                  </span>
                  {openSections.tcm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {/* 体质 */}
                <div className="p-3 bg-amber-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">体质辨识:</span>
                    <span className="text-lg font-bold text-amber-700">{analysis.tcmPerspective.constitution}</span>
                  </div>
                  {analysis.tcmPerspective.constitutionReason && (
                    <p className="text-sm text-gray-600">{analysis.tcmPerspective.constitutionReason}</p>
                  )}
                  {analysis.tcmPerspective.constitutionFeatures && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {analysis.tcmPerspective.constitutionFeatures.map((f, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 经络 */}
                {analysis.tcmPerspective.meridians && analysis.tcmPerspective.meridians.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-600 mb-2">经络状态</h4>
                    <div className="space-y-2">
                      {analysis.tcmPerspective.meridians.map((m, idx) => (
                        <div key={idx} className="p-2 bg-red-50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-800">{m.name}</span>
                            <Badge variant={m.status === '受阻' ? 'destructive' : 'secondary'}>{m.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{m.reason}</p>
                          {m.symptoms && m.symptoms.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">症状: {m.symptoms.join('、')}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 穴位 */}
                {analysis.tcmPerspective.acupoints && analysis.tcmPerspective.acupoints.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-600 mb-2">穴位调理</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.tcmPerspective.acupoints.slice(0, 8).map((a, idx) => (
                        <div key={idx} className="p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-800">{a.name}</div>
                          <div className="text-xs text-gray-500">{a.location}</div>
                          <div className="text-xs text-gray-600 mt-1">{a.benefit}</div>
                          <div className="text-xs text-green-600 mt-1 bg-green-100 p-1 rounded">
                            {a.method}
                          </div>
                          {a.contraindications && (
                            <div className="text-xs text-orange-600 mt-1">⚠️ {a.contraindications}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 导引建议 */}
                {analysis.tcmPerspective.daoyinSuggestions && analysis.tcmPerspective.daoyinSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-purple-600 mb-2">导引养生</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.tcmPerspective.daoyinSuggestions.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="bg-purple-50">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 食疗 */}
                {analysis.tcmPerspective.dietaryAdvice && (
                  <div className="mb-4">
                    <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                      <Apple className="h-4 w-4" />
                      食疗建议
                    </h4>
                    <div className="p-3 bg-orange-50 rounded">
                      {analysis.tcmPerspective.dietaryAdvice.suitable && (
                        <div className="text-sm mb-1">
                          <span className="font-medium text-green-700">宜食:</span>{' '}
                          {analysis.tcmPerspective.dietaryAdvice.suitable.join('、')}
                        </div>
                      )}
                      {analysis.tcmPerspective.dietaryAdvice.avoid && (
                        <div className="text-sm mb-1">
                          <span className="font-medium text-red-700">忌食:</span>{' '}
                          {analysis.tcmPerspective.dietaryAdvice.avoid.join('、')}
                        </div>
                      )}
                      {analysis.tcmPerspective.dietaryAdvice.teaRecommendation && (
                        <div className="text-sm">
                          <span className="font-medium text-amber-700">代茶饮:</span>{' '}
                          {analysis.tcmPerspective.dietaryAdvice.teaRecommendation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 日常作息 */}
                {analysis.tcmPerspective.dailyRoutine && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">日常养生</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {analysis.tcmPerspective.dailyRoutine.morning && (
                        <div className="p-2 bg-blue-50 rounded text-center">
                          <div className="text-xs text-blue-600 font-medium">早晨</div>
                          <div className="text-xs text-gray-600 mt-1">{analysis.tcmPerspective.dailyRoutine.morning}</div>
                        </div>
                      )}
                      {analysis.tcmPerspective.dailyRoutine.noon && (
                        <div className="p-2 bg-yellow-50 rounded text-center">
                          <div className="text-xs text-yellow-600 font-medium">中午</div>
                          <div className="text-xs text-gray-600 mt-1">{analysis.tcmPerspective.dailyRoutine.noon}</div>
                        </div>
                      )}
                      {analysis.tcmPerspective.dailyRoutine.evening && (
                        <div className="p-2 bg-purple-50 rounded text-center">
                          <div className="text-xs text-purple-600 font-medium">晚间</div>
                          <div className="text-xs text-gray-600 mt-1">{analysis.tcmPerspective.dailyRoutine.evening}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 健康预测 */}
      {analysis.healthPrediction && (
        <Collapsible open={openSections.prediction} onOpenChange={() => toggleSection('prediction')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    健康发展预测
                  </span>
                  {openSections.prediction ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {analysis.healthPrediction.shortTerm && (
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <div className="font-medium text-yellow-800 mb-1">短期预测 (1-3个月)</div>
                      <p className="text-sm text-gray-600">{analysis.healthPrediction.shortTerm}</p>
                    </div>
                  )}
                  {analysis.healthPrediction.midTerm && (
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <div className="font-medium text-orange-800 mb-1">中期预测 (6-12个月)</div>
                      <p className="text-sm text-gray-600">{analysis.healthPrediction.midTerm}</p>
                    </div>
                  )}
                  {analysis.healthPrediction.longTerm && (
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <div className="font-medium text-red-800 mb-1">长期预测 (3年以上)</div>
                      <p className="text-sm text-gray-600">{analysis.healthPrediction.longTerm}</p>
                    </div>
                  )}
                  {analysis.healthPrediction.preventiveMeasures && analysis.healthPrediction.preventiveMeasures.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-1">预防措施</div>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {analysis.healthPrediction.preventiveMeasures.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 训练方案 */}
      {analysis.treatmentPlan && (
        <Collapsible open={openSections.treatment} onOpenChange={() => toggleSection('treatment')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-green-500" />
                    分阶段训练方案
                  </span>
                  {openSections.treatment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 整复训练 */}
                  {analysis.treatmentPlan.zhengfu && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 mb-2">{analysis.treatmentPlan.zhengfu.name}</div>
                      <p className="text-sm text-gray-600 mb-2">{analysis.treatmentPlan.zhengfu.description}</p>
                      <div className="text-xs text-blue-600 mb-3">周期: {analysis.treatmentPlan.zhengfu.duration}</div>
                      {analysis.treatmentPlan.zhengfu.sessions && (
                        <div className="space-y-2">
                          {analysis.treatmentPlan.zhengfu.sessions.map((session, idx) => (
                            <div key={idx} className="p-2 bg-white rounded text-sm">
                              <div className="font-medium">{session.week}</div>
                              <div className="text-xs text-gray-500">{session.focus}</div>
                              <div className="text-xs text-gray-600 mt-1">{session.exercises.join('、')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 本源训练 */}
                  {analysis.treatmentPlan.benyuan && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">{analysis.treatmentPlan.benyuan.name}</div>
                      <p className="text-sm text-gray-600 mb-2">{analysis.treatmentPlan.benyuan.description}</p>
                      <div className="text-xs text-green-600 mb-3">周期: {analysis.treatmentPlan.benyuan.duration}</div>
                      {analysis.treatmentPlan.benyuan.sessions && (
                        <div className="space-y-2">
                          {analysis.treatmentPlan.benyuan.sessions.map((session, idx) => (
                            <div key={idx} className="p-2 bg-white rounded text-sm">
                              <div className="font-medium">{session.week}</div>
                              <div className="text-xs text-gray-500">{session.focus}</div>
                              <div className="text-xs text-gray-600 mt-1">{session.exercises.join('、')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
