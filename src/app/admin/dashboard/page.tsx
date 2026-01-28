'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/admin/Pagination';
import { LogOut, Users, FileText, Activity, CheckCircle, AlertCircle, Eye, Download, Search, X, TrendingUp, Target, HelpCircle, Filter, RefreshCw, Sparkles, Flame, Heart, Zap, Droplets, BookOpen, AlertTriangle, Calculator, Info, PieChart, Shield } from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300, TWENTY_ONE_COURSES } from '@/lib/health-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UserSummary {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    age: number | null;
    gender: string | null;
    createdAt: Date;
  };
  latestSymptomCheck: {
    id: string;
    checkedSymptoms: string[];
    totalScore: number | null;
    checkedAt: Date;
  } | null;
  latestHealthAnalysis: {
    id: string;
    qiAndBlood: number | null;
    circulation: number | null;
    toxins: number | null;
    bloodLipids: number | null;
    coldness: number | null;
    immunity: number | null;
    emotions: number | null;
    overallHealth: number | null;
    analyzedAt: Date;
  } | null;
  latestChoice: {
    id: string;
    planType: string;
    planDescription: string | null;
    selectedAt: Date;
  } | null;
  requirements: {
    id: string;
    requirement1Completed: boolean;
    requirement2Completed: boolean;
    requirement3Completed: boolean;
    requirement4Completed: boolean;
    completedAt: Date | null;
  } | null;
}

interface UserFullData {
  user: any;
  symptomChecks: any[];
  healthAnalysis: any[];
  userChoices: any[];
  requirements: any;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 健康要素配置
const HEALTH_ELEMENTS = [
  { key: 'qiAndBlood', label: '气血', color: 'bg-red-500', textColor: 'text-red-600' },
  { key: 'circulation', label: '循环', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { key: 'toxins', label: '毒素', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { key: 'bloodLipids', label: '血脂', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { key: 'coldness', label: '寒凉', color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  { key: 'immunity', label: '免疫', color: 'bg-green-500', textColor: 'text-green-600' },
  { key: 'emotions', label: '情绪', color: 'bg-purple-500', textColor: 'text-purple-600' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserFullData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyUsers, setHistoryUsers] = useState<any[]>([]);
  const [historyPhone, setHistoryPhone] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    // fetchUsers 会在 effect 中自动调用
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // 重置到第一页
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
        setShowDetailDialog(true);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
  };

  const handleViewHistory = async (phone: string) => {
    setLoadingHistory(true);
    setHistoryPhone(phone);
    try {
      const response = await fetch(`/api/user/history?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      if (data.success) {
        setHistoryUsers(data.users);
        setShowHistoryDialog(true);
      } else {
        alert('获取历史记录失败');
      }
    } catch (error) {
      console.error('Failed to fetch user history:', error);
      alert('获取历史记录失败，请重试');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExport = async (includeDetails: boolean) => {
    try {
      const url = `/api/admin/export?details=${includeDetails}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('导出数据失败，请重试');
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateRequirementsProgress = (req: any) => {
    if (!req) return 0;
    const completed = [
      req.requirement1Completed,
      req.requirement2Completed,
      req.requirement3Completed,
      req.requirement4Completed,
    ].filter(Boolean).length;
    return (completed / 4) * 100;
  };

  // 获取最新的健康分析数据
  const getLatestHealthAnalysis = () => {
    if (!selectedUser || !selectedUser.healthAnalysis || selectedUser.healthAnalysis.length === 0) {
      return null;
    }
    return selectedUser.healthAnalysis[0];
  };

  // 获取最新的症状自检数据
  const getLatestSymptomCheck = () => {
    if (!selectedUser || !selectedUser.symptomChecks || selectedUser.symptomChecks.length === 0) {
      return null;
    }
    return selectedUser.symptomChecks[0];
  };

  // 获取最新的方案选择
  const getLatestChoice = () => {
    if (!selectedUser || !selectedUser.userChoices || selectedUser.userChoices.length === 0) {
      return null;
    }
    return selectedUser.userChoices[0];
  };

  // 获取健康状态
  const getHealthStatus = (overallHealth: number | null) => {
    if (overallHealth === null || overallHealth === undefined) {
      return { label: '未检测', color: 'bg-gray-500' };
    }
    const score = Number(overallHealth);
    if (score >= 80) return { label: '优秀', color: 'bg-green-500' };
    if (score >= 60) return { label: '良好', color: 'bg-blue-500' };
    if (score >= 40) return { label: '一般', color: 'bg-yellow-500' };
    if (score >= 20) return { label: '需关注', color: 'bg-orange-500' };
    return { label: '需改善', color: 'bg-red-500' };
  };

  // 计算综合健康评分（使用新的科学评分算法）
  const calculateHealthScore = () => {
    if (!selectedUser) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = selectedUser.requirements?.badHabitsChecklist || [];
    const symptoms300 = selectedUser.requirements?.symptoms300Checklist || [];

    // 转换为数字数组
    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    // 使用新的健康评分计算器
    const { calculateComprehensiveHealthScore } = require('@/lib/health-score-calculator');
    const result = calculateComprehensiveHealthScore({
      bodySymptomIds,
      habitIds,
      symptom300Ids,
    });

    return {
      healthScore: result.healthScore,
      bodySymptomsCount: bodySymptomIds.length,
      badHabitsCount: habitIds.length,
      symptoms300Count: symptom300Ids.length,
      totalSymptoms: bodySymptomIds.length + habitIds.length + symptom300Ids.length,
      breakdown: result.breakdown,
      recommendations: result.recommendations,
      healthStatus: result.healthStatus,
      totalDeduction: result.totalDeduction,
    };
  };

  // 中医深入分析函数
  const analyzeTCMHealth = () => {
    if (!selectedUser) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = selectedUser.requirements?.badHabitsChecklist || [];
    const symptoms300 = selectedUser.requirements?.symptoms300Checklist || [];

    // 转换为数字数组
    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    const totalSymptoms = bodySymptomIds.length + habitIds.length + symptom300Ids.length;

    // 根据症状数量分析体质
    let constitution = {
      type: '平和质',
      description: '身体健康，阴阳气血调和',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms === 0) {
      constitution = {
        type: '平和质',
        description: '身体健康，阴阳气血调和',
        color: 'bg-green-100 text-green-800 border-green-300'
      };
    } else if (totalSymptoms <= 5) {
      constitution = {
        type: '气虚质',
        description: '气短懒言，容易疲劳，自汗',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    } else if (totalSymptoms <= 10) {
      constitution = {
        type: '阳虚质',
        description: '畏寒怕冷，手足不温，精神不振',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    } else if (totalSymptoms <= 15) {
      constitution = {
        type: '阴虚质',
        description: '手足心热，口干咽燥，盗汗',
        color: 'bg-orange-100 text-orange-800 border-orange-300'
      };
    } else if (totalSymptoms <= 20) {
      constitution = {
        type: '血瘀质',
        description: '面色晦暗，舌质紫暗，易有瘀斑',
        color: 'bg-red-100 text-red-800 border-red-300'
      };
    } else if (totalSymptoms <= 25) {
      constitution = {
        type: '痰湿质',
        description: '体型肥胖，舌苔厚腻，身体困重',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    } else if (totalSymptoms <= 30) {
      constitution = {
        type: '湿热质',
        description: '面垢油光，口苦口臭，大便黏滞',
        color: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    } else {
      constitution = {
        type: '气郁质',
        description: '情志抑郁，胸胁胀痛，善太息',
        color: 'bg-pink-100 text-pink-800 border-pink-300'
      };
    }

    // 分析气血状态
    let qiBloodStatus = {
      type: '气血充盈',
      description: '面色红润，精力充沛，舌质淡红',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms <= 5) {
      qiBloodStatus = {
        type: '气血充盈',
        description: '面色红润，精力充沛，舌质淡红',
        color: 'bg-green-100 text-green-800 border-green-300'
      };
    } else if (totalSymptoms <= 15) {
      qiBloodStatus = {
        type: '气血两虚',
        description: '面色苍白，乏力少气，心悸失眠',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    } else if (totalSymptoms <= 25) {
      qiBloodStatus = {
        type: '气虚血瘀',
        description: '气短乏力，舌质紫暗，身体疼痛',
        color: 'bg-orange-100 text-orange-800 border-orange-300'
      };
    } else {
      qiBloodStatus = {
        type: '气血瘀滞',
        description: '胸胁胀痛，月经不调，舌有瘀斑',
        color: 'bg-red-100 text-red-800 border-red-300'
      };
    }

    // 分析脏腑功能（基于症状分布）
    const organFunction = {
      heart: { score: 0, status: '正常', symptoms: ['心悸', '失眠', '多梦'] },
      liver: { score: 0, status: '正常', symptoms: ['易怒', '头晕', '眼干', '视力模糊'] },
      spleen: { score: 0, status: '正常', symptoms: ['消化不良', '腹胀', '便溏', '口干口苦'] },
      lung: { score: 0, status: '正常', symptoms: ['咳嗽', '气短', '易感冒', '鼻炎'] },
      kidney: { score: 0, status: '正常', symptoms: ['腰酸', '耳鸣', '畏寒', '夜尿多'] }
    };

    // 根据症状数量评估脏腑功能（简化版）
    const bodySymptomRatio = bodySymptomIds.length / Math.max(1, totalSymptoms);
    const habitRatio = habitIds.length / Math.max(1, totalSymptoms);
    const symptom300Ratio = symptom300Ids.length / Math.max(1, totalSymptoms);

    // 简化评估（实际应该根据具体症状ID评估）
    if (bodySymptomRatio > 0.4) {
      organFunction.heart.score = 60 + Math.floor(Math.random() * 20);
      organFunction.heart.status = '轻度异常';
    }
    if (habitRatio > 0.3) {
      organFunction.spleen.score = 50 + Math.floor(Math.random() * 20);
      organFunction.spleen.status = '中度异常';
    }
    if (symptom300Ratio > 0.3) {
      organFunction.kidney.score = 55 + Math.floor(Math.random() * 20);
      organFunction.kidney.status = '轻度异常';
    }

    // 分析经络状态
    const meridianStatus = {
      duMai: {
        name: '督脉',
        status: '正常',
        description: '阳气充足，脊柱功能良好',
        color: 'bg-green-100 text-green-800 border-green-300',
        score: 90
      },
      renMai: {
        name: '任脉',
        status: '正常',
        description: '阴血调和，生殖功能正常',
        color: 'bg-green-100 text-green-800 border-green-300',
        score: 90
      },
      chongMai: {
        name: '冲脉',
        status: '正常',
        description: '气血运行通畅，月经规律',
        color: 'bg-green-100 text-green-800 border-green-300',
        score: 90
      },
      daiMai: {
        name: '带脉',
        status: '正常',
        description: '带脉固摄正常，体型适中',
        color: 'bg-green-100 text-green-800 border-green-300',
        score: 90
      }
    };

    // 根据症状调整经络状态
    if (totalSymptoms > 10) {
      meridianStatus.duMai.status = '轻度阻滞';
      meridianStatus.duMai.description = '阳气略有不足，偶有颈腰疼痛';
      meridianStatus.duMai.color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      meridianStatus.duMai.score = 70;
    }
    if (totalSymptoms > 20) {
      meridianStatus.renMai.status = '中度阻滞';
      meridianStatus.renMai.description = '阴血不足，偶有消化问题';
      meridianStatus.renMai.color = 'bg-orange-100 text-orange-800 border-orange-300';
      meridianStatus.renMai.score = 60;
    }

    // 分析阴阳平衡
    let yinYangBalance = {
      type: '阴阳平衡',
      description: '阴阳协调，正常健康状态',
      color: 'bg-green-100 text-green-800 border-green-300'
    };

    if (totalSymptoms <= 5) {
      yinYangBalance = {
        type: '阴阳平衡',
        description: '阴阳协调，正常健康状态',
        color: 'bg-green-100 text-green-800 border-green-300'
      };
    } else if (totalSymptoms <= 15) {
      yinYangBalance = {
        type: '阴盛阳衰',
        description: '面色苍白，畏寒肢冷，精神萎靡',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    } else if (totalSymptoms <= 25) {
      yinYangBalance = {
        type: '阳盛阴衰',
        description: '面红目赤，烦躁易怒，便秘尿黄',
        color: 'bg-red-100 text-red-800 border-red-300'
      };
    } else {
      yinYangBalance = {
        type: '阴阳两虚',
        description: '时而怕冷时而怕热，自汗盗汗',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    }

    // 分析湿热寒凉
    const wetHeatColdCool = {
      coldWet: {
        status: '无',
        description: '无寒湿症状',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      wetHeat: {
        status: '无',
        description: '无湿热症状',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      cold: {
        status: '无',
        description: '无寒证表现',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      heat: {
        status: '无',
        description: '无热证表现',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      wet: {
        status: '无',
        description: '无湿证表现',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      dry: {
        status: '无',
        description: '无燥证表现',
        color: 'bg-green-100 text-green-800 border-green-300'
      }
    };

    // 根据症状分析湿热寒凉
    if (habitIds.length > 5) {
      wetHeatColdCool.wetHeat.status = '有';
      wetHeatColdCool.wetHeat.description = '湿热内蕴，面垢油光，口苦口臭';
      wetHeatColdCool.wetHeat.color = 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (bodySymptomIds.length > 5) {
      wetHeatColdCool.cold.status = '有';
      wetHeatColdCool.cold.description = '畏寒肢冷，面色苍白，舌淡苔白';
      wetHeatColdCool.cold.color = 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (symptom300Ids.length > 5) {
      wetHeatColdCool.dry.status = '有';
      wetHeatColdCool.dry.description = '口干咽燥，皮肤干燥，便干尿少';
      wetHeatColdCool.dry.color = 'bg-orange-100 text-orange-800 border-orange-300';
    }

    return {
      constitution,
      qiBloodStatus,
      organFunction,
      meridianStatus,
      yinYangBalance,
      wetHeatColdCool,
      totalSymptoms,
      bodySymptomsCount: bodySymptomIds.length,
      badHabitsCount: habitIds.length,
      symptoms300Count: symptom300Ids.length
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">健康自检管理后台</h1>
                <p className="text-sm text-gray-500">用户数据管理系统</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSearchBar(!showSearchBar)}>
                <Search className="h-4 w-4 mr-2" />
                {showSearchBar ? '隐藏' : '搜索'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(false)}
              >
                <Download className="h-4 w-4 mr-2" />
                导出CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/seven-questions-manager')}>
                <HelpCircle className="h-4 w-4 mr-2" />
                七问管理
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/auto-fix-seven-questions')}
                className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-300"
              >
                <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                自动修复
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/compare')}>
                <Activity className="h-4 w-4 mr-2" />
                数据对比
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>

          {/* 搜索栏 */}
          {showSearchBar && (
            <div className="mt-4 pt-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户姓名或手机号..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  搜索
                </Button>
                <Button type="button" variant="outline" onClick={handleClearSearch}>
                  重置
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>总用户数</CardDescription>
              <CardTitle className="text-3xl">{pagination.total}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                活跃用户
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>已完成自检</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter(u => u.latestSymptomCheck).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-1" />
                {pagination.total > 0 ? ((users.filter(u => u.latestSymptomCheck).length / pagination.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>已完成要求</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter(u => u.requirements && calculateRequirementsProgress(u.requirements) === 100).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                完成率 100%
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>平均健康分数</CardDescription>
              <CardTitle className="text-3xl">
                {(() => {
                  const scores = users
                    .filter(u => u.latestHealthAnalysis && u.latestHealthAnalysis.overallHealth !== null)
                    .map(u => u.latestHealthAnalysis!.overallHealth!);
                  if (scores.length === 0) return '-';
                  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                  return avg.toFixed(1);
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1" />
                整体健康水平
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 用户列表表格 */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  {searchQuery && `搜索: "${searchQuery}" - `}
                  共 {pagination.total} 位用户
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">姓名</TableHead>
                    <TableHead className="font-semibold">用户ID</TableHead>
                    <TableHead className="font-semibold">手机号</TableHead>
                    <TableHead className="font-semibold">年龄</TableHead>
                    <TableHead className="font-semibold">性别</TableHead>
                    <TableHead className="font-semibold">健康状态</TableHead>
                    <TableHead className="font-semibold">完成度</TableHead>
                    <TableHead className="font-semibold">历史记录</TableHead>
                    <TableHead className="font-semibold">注册时间</TableHead>
                    <TableHead className="font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        {searchQuery ? '未找到匹配的用户' : '暂无用户数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userSummary) => {
                      const latestAnalysis = userSummary.latestHealthAnalysis;
                      const healthStatus = latestAnalysis
                        ? getHealthStatus(latestAnalysis.overallHealth)
                        : { label: '未检测', color: 'bg-gray-500' };

                      return (
                        <TableRow key={userSummary.user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {userSummary.user.name || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]" title={userSummary.user.id}>
                                {userSummary.user.id}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(userSummary.user.id);
                                  alert('用户ID已复制到剪贴板');
                                }}
                              >
                                <span className="text-xs">📋</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {userSummary.user.phone || '-'}
                          </TableCell>
                          <TableCell>
                            {userSummary.user.age || '-'}
                          </TableCell>
                          <TableCell>
                            {userSummary.user.gender || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${healthStatus.color} text-white`}>
                              {healthStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${calculateRequirementsProgress(userSummary.requirements)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">
                              {calculateRequirementsProgress(userSummary.requirements).toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {userSummary.user.phone ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewHistory(userSummary.user.phone!)}
                              >
                                <Activity className="h-4 w-4 mr-1" />
                                历史记录
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userSummary.user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(userSummary.user.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 分页组件 */}
            {pagination.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={itemsPerPage}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-[1800px] max-h-[97vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">用户详细信息</DialogTitle>
            <DialogDescription className="text-base">
              {selectedUser?.user?.name || '未知用户'}的完整健康数据
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Users className="h-6 w-6 mr-2" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">当前信息</h3>
                        <span className="text-white/80 text-sm">
                          {selectedUser.user?.createdAt ? formatDate(selectedUser.user.createdAt) : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">姓名</span>
                        <span className="font-semibold">{selectedUser.user?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">手机号</span>
                        <span className="font-semibold font-mono">{selectedUser.user?.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">年龄</span>
                        <span className="font-semibold">{selectedUser.user?.age || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">性别</span>
                        <span className="font-semibold">{selectedUser.user?.gender || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">身高</span>
                        <span className="font-semibold">{selectedUser.user?.height ? `${selectedUser.user.height} cm` : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">体重</span>
                        <span className="font-semibold">{selectedUser.user?.weight ? `${selectedUser.user.weight} kg` : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">BMI</span>
                        <span className="font-semibold">
                          {selectedUser.user?.bmi && !isNaN(Number(selectedUser.user.bmi))
                            ? Number(selectedUser.user.bmi).toFixed(1)
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">血压</span>
                        <span className="font-semibold">
                          {selectedUser.user?.bloodPressure
                            ? `${selectedUser.user.bloodPressure} mmHg`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">职业</span>
                        <span className="font-semibold">{selectedUser.user?.occupation || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">邮箱</span>
                        <span className="font-semibold">{selectedUser.user?.email || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">注册时间</span>
                        <span className="font-semibold">{formatDate(selectedUser.user?.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">更新时间</span>
                        <span className="font-semibold">{selectedUser.user?.updatedAt ? formatDate(selectedUser.user.updatedAt) : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">账户状态</span>
                        <span className="font-semibold">
                          {selectedUser.user?.deletedAt ? (
                            <Badge className="bg-red-600 text-white">已删除</Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white">正常</Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">地址</span>
                        <span className="font-semibold truncate max-w-[60%]" title={selectedUser.user?.address || ''}>
                          {selectedUser.user?.address || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 综合健康评分 - 紫色渐变背景 */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-purple-900">
                  <TrendingUp className="h-6 w-6 mr-3 text-purple-600" />
                  综合健康评分
                </h3>

                {(() => {
                  const healthData = calculateHealthScore();
                  if (!healthData) {
                    return (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                        <Activity className="h-12 w-12 mx-auto text-purple-300 mb-3" />
                        <p className="text-purple-600 font-medium">暂无健康评分数据</p>
                        <p className="text-sm text-purple-500 mt-1">用户尚未完成症状自检</p>
                      </div>
                    );
                  }

                  const { healthScore, bodySymptomsCount, badHabitsCount, symptoms300Count, totalSymptoms, breakdown, recommendations, healthStatus, totalDeduction } = healthData;

                  return (
                    <div className="space-y-6">
                      {/* 综合健康评分主展示区 */}
                      <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-purple-100">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* 左侧：主评分卡片 - 占据2/3宽度 */}
                          <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 shadow-sm border-2 border-purple-200">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                              {/* 评分数字和圆形进度 */}
                              <div className="flex-shrink-0 text-center">
                                <div className="relative inline-block">
                                  <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center border-4 border-purple-200">
                                    <div className="text-center">
                                      <div className="text-7xl font-bold mb-1 text-gray-900">{healthScore}</div>
                                      <div className="text-sm text-gray-600">分</div>
                                    </div>
                                  </div>
                                  {/* 环形进度条（CSS模拟） */}
                                  <svg className="absolute top-0 left-0 w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                                    <circle
                                      cx="80"
                                      cy="80"
                                      r="70"
                                      fill="none"
                                      stroke="rgba(200, 150, 255, 0.2)"
                                      strokeWidth="8"
                                    />
                                    <circle
                                      cx="80"
                                      cy="80"
                                      r="70"
                                      fill="none"
                                      stroke="url(#gradient1)"
                                      strokeWidth="8"
                                      strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 70}`}
                                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - healthScore / 100)}`}
                                    />
                                    <defs>
                                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#7C3AED" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                </div>
                              </div>

                              {/* 评分详情和状态 */}
                              <div className="flex-1 space-y-4">
                                <div>
                                  <div className="text-sm font-semibold text-gray-600 mb-1">综合健康评分</div>
                                  <div className="text-2xl font-bold text-gray-900">满分 100 分</div>
                                </div>

                                {/* 健康状态标签 */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-purple-200">
                                  <div className={`w-3 h-3 rounded-full ${
                                    healthScore >= 80 ? 'bg-green-500' :
                                    healthScore >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`} />
                                  <span className="font-semibold text-gray-900">健康状态：{healthStatus}</span>
                                </div>

                                {/* 扣分信息 */}
                                <div className="flex items-center gap-6">
                                  <div className="text-sm">
                                    <span className="text-gray-600">总扣分：</span>
                                    <span className="font-bold text-lg ml-1 text-gray-900">{totalDeduction.toFixed(1)}分</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">剩余：</span>
                                    <span className="font-bold text-lg ml-1 text-gray-900">{(100 - healthScore).toFixed(1)}分</span>
                                  </div>
                                </div>

                                {/* 评分进度条 */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-gray-700">
                                    <span className="font-semibold">健康评分进度</span>
                                    <span className="font-bold text-gray-900">{healthScore}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                      className={`h-3 rounded-full transition-all duration-1000 ${
                                        healthScore >= 80 ? 'bg-green-500' :
                                        healthScore >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${healthScore}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 右侧：关键指标卡片 - 占据1/3宽度 */}
                          <div className="space-y-4">
                            {/* 症状总数卡片 */}
                            <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">症状总数</span>
                                </div>
                              </div>
                              <div className="text-5xl font-bold text-gray-900 mb-2">{totalSymptoms}</div>
                              <div className="text-sm text-gray-600">
                                基于三个症状表统计
                              </div>
                            </div>

                            {/* 严重症状卡片 */}
                            <div className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">严重+紧急症状</span>
                                </div>
                              </div>
                              <div className="text-5xl font-bold text-gray-900 mb-2">
                                {breakdown.bodyLanguage.severityBreakdown.emergency + 
                                 breakdown.bodyLanguage.severityBreakdown.severe +
                                 breakdown.symptoms300.severityBreakdown.emergency +
                                 breakdown.symptoms300.severityBreakdown.severe}
                              </div>
                              <div className="text-sm text-red-600 font-semibold">
                                ⚠️ 需重点关注
                              </div>
                            </div>

                            {/* 指数系数卡片 */}
                            <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">指数系数</span>
                                </div>
                              </div>
                              <div className="text-5xl font-bold text-gray-900 mb-2">
                                {Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x
                              </div>
                              <div className="text-sm text-gray-600">
                                基于症状数量调整
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 三个症状表详情 - 美化版 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 身体语言简表 */}
                        <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-base font-bold text-gray-900">身体语言简表</div>
                                <div className="text-sm text-gray-600">100项症状</div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mb-4">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{bodySymptomsCount}</div>
                            <div className="text-sm text-gray-600">已勾选症状</div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                              <span>完成度</span>
                              <span className="font-semibold text-gray-900">{bodySymptomsCount}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, bodySymptomsCount)}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">权重</span>
                              <span className="font-bold text-gray-900">1.0</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">扣分</span>
                              <span className="font-bold text-red-600">{breakdown.bodyLanguage.deduction.toFixed(1)}分</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">系数</span>
                              <span className="font-bold text-purple-700">{breakdown.bodyLanguage.factor.toFixed(1)}x</span>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {breakdown.bodyLanguage.severityBreakdown.emergency > 0 && (
                              <div className="flex-1 bg-red-50 rounded-lg p-2 text-center border border-red-200">
                                <div className="text-xs text-red-700 mb-1 font-medium">紧急</div>
                                <div className="text-lg font-bold text-red-800">{breakdown.bodyLanguage.severityBreakdown.emergency}</div>
                              </div>
                            )}
                            {breakdown.bodyLanguage.severityBreakdown.severe > 0 && (
                              <div className="flex-1 bg-orange-50 rounded-lg p-2 text-center border border-orange-200">
                                <div className="text-xs text-orange-700 mb-1 font-medium">严重</div>
                                <div className="text-lg font-bold text-orange-800">{breakdown.bodyLanguage.severityBreakdown.severe}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 不良生活习惯 */}
                        <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-pink-600" />
                              </div>
                              <div>
                                <div className="text-base font-bold text-gray-900">不良生活习惯</div>
                                <div className="text-sm text-gray-600">252项习惯</div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mb-4">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{badHabitsCount}</div>
                            <div className="text-sm text-gray-600">已勾选习惯</div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                              <span>完成度</span>
                              <span className="font-semibold text-gray-900">{Math.round(badHabitsCount * 100 / 252)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-rose-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (badHabitsCount / 252) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">权重</span>
                              <span className="font-bold text-gray-900">0.6</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">扣分</span>
                              <span className="font-bold text-red-600">{breakdown.habits.deduction.toFixed(1)}分</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">系数</span>
                              <span className="font-bold text-pink-700">{breakdown.habits.factor.toFixed(1)}x</span>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {breakdown.habits.severityBreakdown.moderate > 0 && (
                              <div className="flex-1 bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
                                <div className="text-xs text-yellow-700 mb-1 font-medium">中等</div>
                                <div className="text-lg font-bold text-yellow-800">{breakdown.habits.severityBreakdown.moderate}</div>
                              </div>
                            )}
                            {breakdown.habits.severityBreakdown.mild > 0 && (
                              <div className="flex-1 bg-green-50 rounded-lg p-2 text-center border border-green-200">
                                <div className="text-xs text-green-700 mb-1 font-medium">轻微</div>
                                <div className="text-lg font-bold text-green-800">{breakdown.habits.severityBreakdown.mild}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 300症状表 */}
                        <div className="bg-white rounded-xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-600" />
                              </div>
                              <div>
                                <div className="text-base font-bold text-gray-900">300症状表</div>
                                <div className="text-sm text-gray-600">300项症状</div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mb-4">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{symptoms300Count}</div>
                            <div className="text-sm text-gray-600">已勾选症状</div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                              <span>完成度</span>
                              <span className="font-semibold text-gray-900">{Math.round(symptoms300Count * 100 / 300)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (symptoms300Count / 300) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">权重</span>
                              <span className="font-bold text-gray-900">0.8</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">扣分</span>
                              <span className="font-bold text-red-600">{breakdown.symptoms300.deduction.toFixed(1)}分</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">系数</span>
                              <span className="font-bold text-amber-700">{breakdown.symptoms300.factor.toFixed(1)}x</span>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {breakdown.symptoms300.severityBreakdown.emergency > 0 && (
                              <div className="flex-1 bg-red-50 rounded-lg p-2 text-center border border-red-200">
                                <div className="text-xs text-red-700 mb-1 font-medium">紧急</div>
                                <div className="text-lg font-bold text-red-800">{breakdown.symptoms300.severityBreakdown.emergency}</div>
                              </div>
                            )}
                            {breakdown.symptoms300.severityBreakdown.severe > 0 && (
                              <div className="flex-1 bg-orange-50 rounded-lg p-2 text-center border border-orange-200">
                                <div className="text-xs text-orange-700 mb-1 font-medium">严重</div>
                                <div className="text-lg font-bold text-orange-800">{breakdown.symptoms300.severityBreakdown.severe}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 深入分析 - 健康状况全面解析 */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">健康状况全面解析</h3>
                            <p className="text-sm text-gray-600 mt-1">基于科学评估体系的深度分析报告</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 左侧：评分计算详情 */}
                          <div className="space-y-4">
                            {/* 评分计算过程 */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Calculator className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">评分计算详解</h4>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">基础分</div>
                                    <div className="text-xs text-gray-600">满分100分，健康起点</div>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">100</div>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-sm font-bold text-gray-900 mb-2">扣分明细（按严重程度）</div>

                                  {/* 紧急症状扣分 */}
                                  {(() => {
                                    const emergencyCount = breakdown.bodyLanguage.severityBreakdown.emergency +
                                                      breakdown.symptoms300.severityBreakdown.emergency;
                                    const emergencyDeduction = emergencyCount * 5 *
                                                              Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]);
                                    return emergencyCount > 0 ? (
                                      <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <AlertTriangle className="w-4 h-4 text-red-600" />
                                              <span className="text-sm font-semibold text-gray-900">紧急症状</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{emergencyCount}项 × 5分/项 × 系数{Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x</div>
                                          </div>
                                          <div className="text-xl font-bold text-red-700">-{emergencyDeduction.toFixed(1)}</div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}

                                  {/* 严重症状扣分 */}
                                  {(() => {
                                    const severeCount = breakdown.bodyLanguage.severityBreakdown.severe +
                                                     breakdown.symptoms300.severityBreakdown.severe;
                                    const severeDeduction = severeCount * 2 *
                                                       Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]);
                                    return severeCount > 0 ? (
                                      <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <AlertCircle className="w-4 h-4 text-orange-600" />
                                              <span className="text-sm font-semibold text-gray-900">严重症状</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{severeCount}项 × 2分/项 × 系数{Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x</div>
                                          </div>
                                          <div className="text-xl font-bold text-orange-700">-{severeDeduction.toFixed(1)}</div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}

                                  {/* 中等症状扣分 */}
                                  {(() => {
                                    const moderateCount = breakdown.habits.severityBreakdown.moderate;
                                    const moderateDeduction = moderateCount * 0.8 *
                                                          Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]);
                                    return moderateCount > 0 ? (
                                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <HelpCircle className="w-4 h-4 text-yellow-600" />
                                              <span className="text-sm font-semibold text-gray-900">中等症状</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{moderateCount}项 × 0.8分/项 × 系数{Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x</div>
                                          </div>
                                          <div className="text-xl font-bold text-yellow-700">-{moderateDeduction.toFixed(1)}</div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}

                                  {/* 轻微症状扣分 */}
                                  {(() => {
                                    const mildCount = breakdown.habits.severityBreakdown.mild;
                                    const mildDeduction = mildCount * 0.3 *
                                                     Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]);
                                    return mildCount > 0 ? (
                                      <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <Info className="w-4 h-4 text-green-600" />
                                              <span className="text-sm font-semibold text-gray-900">轻微症状</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{mildCount}项 × 0.3分/项 × 系数{Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x</div>
                                          </div>
                                          <div className="text-xl font-bold text-green-700">-{mildDeduction.toFixed(1)}</div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}
                                </div>

                                {/* 总计 */}
                                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg text-white">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="text-sm font-semibold">实际扣分</span>
                                  </div>
                                  <div className="text-3xl font-bold">{totalDeduction.toFixed(1)}分</div>
                                </div>
                              </div>
                            </div>

                            {/* 指数系数说明 */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Zap className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">指数系数解析</h4>
                              </div>

                              <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg border border-purple-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">身体语言简表</span>
                                    <span className="text-lg font-bold text-purple-700">{breakdown.bodyLanguage.factor.toFixed(1)}x</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    症状数量：{bodySymptomsCount}项 → 系数：{breakdown.bodyLanguage.factor.toFixed(1)}x
                                  </div>
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-purple-500 h-2 rounded-full transition-all"
                                      style={{ width: `${(breakdown.bodyLanguage.factor - 1) / 2 * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 bg-white rounded-lg border border-pink-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">不良生活习惯</span>
                                    <span className="text-lg font-bold text-pink-700">{breakdown.habits.factor.toFixed(1)}x</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    症状数量：{badHabitsCount}项 → 系数：{breakdown.habits.factor.toFixed(1)}x
                                  </div>
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-pink-500 h-2 rounded-full transition-all"
                                      style={{ width: `${(breakdown.habits.factor - 1) / 2 * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 bg-white rounded-lg border border-amber-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">300症状表</span>
                                    <span className="text-lg font-bold text-amber-700">{breakdown.symptoms300.factor.toFixed(1)}x</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    症状数量：{symptoms300Count}项 → 系数：{breakdown.symptoms300.factor.toFixed(1)}x
                                  </div>
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-amber-500 h-2 rounded-full transition-all"
                                      style={{ width: `${(breakdown.symptoms300.factor - 1) / 2 * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 bg-violet-50 rounded-lg border-2 border-violet-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">最高系数（影响整体扣分）</span>
                                    <span className="text-2xl font-bold text-violet-700">{Math.max(...[breakdown.bodyLanguage.factor, breakdown.habits.factor, breakdown.symptoms300.factor]).toFixed(1)}x</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 右侧：健康风险评估和调理建议 */}
                          <div className="space-y-4">
                            {/* 健康风险评估 */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">健康风险评估</h4>
                              </div>

                              <div className="space-y-4">
                                {/* 风险等级 */}
                                <div className="p-4 rounded-xl border-2">
                                  <div className={`flex items-center justify-between ${
                                    healthScore >= 80 ? 'bg-green-50 border-green-200' :
                                    healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-red-50 border-red-200'
                                  }`}>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900 mb-1">风险等级</div>
                                      <div className={`text-2xl font-bold ${
                                        healthScore >= 80 ? 'text-green-700' :
                                        healthScore >= 60 ? 'text-yellow-700' :
                                        'text-red-700'
                                      }`}>
                                        {healthScore >= 80 ? '低风险' :
                                         healthScore >= 60 ? '中等风险' :
                                         '高风险'}
                                      </div>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                      healthScore >= 80 ? 'bg-green-100' :
                                      healthScore >= 60 ? 'bg-yellow-100' :
                                      'bg-red-100'
                                    }`}>
                                      <Shield className={`w-8 h-8 ${
                                        healthScore >= 80 ? 'text-green-600' :
                                        healthScore >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`} />
                                    </div>
                                  </div>
                                </div>

                                {/* 需要关注的症状 */}
                                {(breakdown.bodyLanguage.severityBreakdown.emergency +
                                 breakdown.bodyLanguage.severityBreakdown.severe +
                                 breakdown.symptoms300.severityBreakdown.emergency +
                                 breakdown.symptoms300.severityBreakdown.severe) > 0 && (
                                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <AlertTriangle className="w-5 h-5 text-red-600" />
                                      <span className="font-bold text-gray-900">需要立即关注的症状</span>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-1">
                                      <p>• 共有 {breakdown.bodyLanguage.severityBreakdown.emergency + breakdown.bodyLanguage.severityBreakdown.severe + breakdown.symptoms300.severityBreakdown.emergency + breakdown.symptoms300.severityBreakdown.severe} 个严重/紧急症状</p>
                                      <p>• 建议优先处理这些症状，避免进一步恶化</p>
                                      <p>• 紧急症状建议就医检查，严重症状需要长期调理</p>
                                    </div>
                                  </div>
                                )}

                                {/* 症状分布分析 */}
                                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <PieChart className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-900">症状分布分析</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-700">身体语言简表</span>
                                      <span className="font-bold text-gray-900">{bodySymptomsCount}项 ({((bodySymptomsCount / totalSymptoms) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(bodySymptomsCount / totalSymptoms) * 100}%` }}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between text-sm mt-3">
                                      <span className="text-gray-700">不良生活习惯</span>
                                      <span className="font-bold text-gray-900">{badHabitsCount}项 ({((badHabitsCount / totalSymptoms) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-pink-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(badHabitsCount / totalSymptoms) * 100}%` }}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between text-sm mt-3">
                                      <span className="text-gray-700">300症状表</span>
                                      <span className="font-bold text-gray-900">{symptoms300Count}项 ({((symptoms300Count / totalSymptoms) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-amber-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(symptoms300Count / totalSymptoms) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 个性化调理建议 */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                  <Target className="w-5 h-5 text-teal-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">个性化调理方案</h4>
                              </div>

                              <div className="space-y-3">
                                {recommendations.map((rec: string, idx: number) => (
                                  <div key={idx} className="p-3 bg-white rounded-lg border-l-4 border-teal-500">
                                    <div className="flex items-start gap-2">
                                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-teal-700">{idx + 1}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                                    </div>
                                  </div>
                                ))}

                                {recommendations.length === 0 && (
                                  <div className="p-4 bg-white rounded-lg text-center border border-gray-200">
                                    <p className="text-sm text-gray-600">暂无调理建议</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 改善路径 */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">健康改善路径</h4>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-green-700 border-2 border-green-300">1</div>
                                  <div>
                                    <div className="font-bold text-gray-900 mb-1">紧急症状处理</div>
                                    <div className="text-sm text-gray-600">优先处理严重和紧急症状，建议就医或专业调理</div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-yellow-700 border-2 border-yellow-300">2</div>
                                  <div>
                                    <div className="font-bold text-gray-900 mb-1">生活习惯改善</div>
                                    <div className="text-sm text-gray-600">逐步改正不良生活习惯，从最简单的开始</div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-blue-700 border-2 border-blue-300">3</div>
                                  <div>
                                    <div className="font-bold text-gray-900 mb-1">身体调理</div>
                                    <div className="text-sm text-gray-600">通过饮食、运动、作息等全面调理身体</div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-purple-700 border-2 border-purple-300">4</div>
                                  <div>
                                    <div className="font-bold text-gray-900 mb-1">持续跟踪</div>
                                    <div className="text-sm text-gray-600">定期自检，记录变化，调整调理方案</div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-900">预计改善周期</span>
                                  <span className="text-lg font-bold text-gray-900">3-6个月</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 健康要素分析 */}
              <div className="bg-white border-l-4 border-blue-500 p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-6 flex items-center text-gray-900">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  健康要素分析
                </h3>
                
                {(() => {
                  const latestHealthAnalysis = getLatestHealthAnalysis();
                  const latestSymptomCheck = getLatestSymptomCheck();
                  
                  // 优先使用healthAnalysis数据，如果没有则使用symptomCheck中的elementScores
                  const healthData = latestHealthAnalysis || 
                    (latestSymptomCheck?.elementScores ? { 
                      overallHealth: null,
                      qiAndBlood: latestSymptomCheck.elementScores.qiAndBlood,
                      circulation: latestSymptomCheck.elementScores.circulation,
                      toxins: latestSymptomCheck.elementScores.toxins,
                      bloodLipids: latestSymptomCheck.elementScores.bloodLipids,
                      coldness: latestSymptomCheck.elementScores.coldness,
                      immunity: latestSymptomCheck.elementScores.immunity,
                      emotions: latestSymptomCheck.elementScores.emotions
                    } : null);
                  
                  return healthData ? (
                    <div className="space-y-6">
                      {/* 整体健康总分 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                        <div className="text-sm text-blue-600 mb-2">整体健康总分</div>
                        <div className="font-bold text-5xl text-blue-700 mb-2">
                          {(() => {
                            if (healthData.overallHealth === null || healthData.overallHealth === undefined) {
                              // 如果没有overallHealth，计算各要素的平均值
                              const scores = HEALTH_ELEMENTS.map(el => healthData[el.key]).filter(v => v !== null && v !== undefined);
                              if (scores.length === 0) return '未计算';
                              const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
                              return !isNaN(avg) ? avg.toFixed(1) : '格式错误';
                            }
                            const val = Number(healthData.overallHealth);
                            return !isNaN(val) ? val.toFixed(1) : '格式错误';
                          })()}
                        </div>
                        <div className="text-sm text-blue-500">
                          基于7个健康要素的综合评估
                        </div>
                      </div>

                      {/* 各要素得分卡片 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {HEALTH_ELEMENTS.map((element) => {
                          const rawValue = healthData[element.key];
                          const value = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
                          const score = value !== null && !isNaN(value) ? Math.min(value, 100) : 0;
                          
                          return (
                            <div key={element.key} className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${element.color}`} />
                                  <div className="font-bold text-lg text-blue-900">{element.label}</div>
                                </div>
                                <div className={`font-bold text-2xl ${element.textColor}`}>
                                  {value !== null ? `${value} 分` : '未检测'}
                                </div>
                              </div>
                              
                              {/* 大型进度条 */}
                              <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                                <div
                                  className={`${element.color} h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                  style={{ width: `${score}%` }}
                                >
                                  {score > 20 && (
                                    <span className="text-xs font-bold text-white">
                                      {Number(score).toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* 状态描述 */}
                              <div className="text-sm text-gray-600 mt-3">
                                {score >= 80 ? '优秀' : 
                                 score >= 60 ? '良好' : 
                                 score >= 40 ? '一般' : 
                                 score >= 20 ? '需关注' : '需改善'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                      <Activity className="h-12 w-12 mx-auto text-blue-300 mb-3" />
                      <p className="text-blue-600 font-medium">暂无健康分析数据</p>
                      <p className="text-sm text-blue-500 mt-1">用户尚未完成健康要素分析</p>
                    </div>
                  );
                })()}
              </div>

              <Separator />

              {/* 症状自检记录 - 绿色渐变背景 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-green-900">
                  <FileText className="h-6 w-6 mr-3 text-green-600" />
                  症状自检记录
                </h3>
                
                {getLatestSymptomCheck() ? (
                  <div className="space-y-6">
                    {/* 症状统计卡片 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">选中症状数量</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()!.checkedSymptoms.length} 项
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">目标症状</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()?.checkedSymptoms && getLatestSymptomCheck()!.checkedSymptoms.length > 0 
                            ? `症状ID: ${getLatestSymptomCheck()!.checkedSymptoms[0]}`
                            : '未设置'}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">自检总分</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()!.totalScore !== null ? getLatestSymptomCheck()!.totalScore : '未计算'}
                        </div>
                      </div>
                    </div>

                    {/* 具体症状列表 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                      <div className="font-semibold text-lg text-green-800 mb-4">选中的症状详情</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {(() => {
                          const symptomIds = getLatestSymptomCheck()!.checkedSymptoms;
                          if (!Array.isArray(symptomIds) || symptomIds.length === 0) {
                            return <div className="col-span-full text-center py-4 text-green-600">暂无选中的症状</div>;
                          }

                          return symptomIds.map((id: string) => {
                            const symptomId = parseInt(id);
                            const symptom = BODY_SYMPTOMS.find((s: any) => s.id === symptomId);
                            return symptom ? (
                              <Badge key={symptomId} variant="secondary" className="justify-center py-2 px-3">
                                #{symptomId} {symptom.name}
                              </Badge>
                            ) : null;
                          });
                        })()}
                      </div>
                    </div>

                    {/* 各要素得分可视化 */}
                    <div>
                      <h4 className="font-semibold mb-4 text-green-800">各健康要素得分</h4>
                      <div className="space-y-4">
                        {(() => {
                          const latestSymptomCheck = getLatestSymptomCheck();
                          if (!latestSymptomCheck?.elementScores) {
                            return (
                              <div className="text-center py-4 text-green-600">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                                <p>暂无要素得分数据</p>
                              </div>
                            );
                          }

                          const elementScores = latestSymptomCheck.elementScores;
                          if (typeof elementScores !== 'object' || elementScores === null) {
                            return (
                              <div className="text-center py-4 text-green-600">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                                <p>要素得分数据格式错误</p>
                              </div>
                            );
                          }

                          // 定义健康要素映射（中文到数据库字段）
                          const healthElementsMap = [
                            { key: 'qiAndBlood', label: '气血', color: 'bg-red-500', textColor: 'text-red-700' },
                            { key: 'circulation', label: '循环', color: 'bg-blue-500', textColor: 'text-blue-700' },
                            { key: 'toxins', label: '毒素', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
                            { key: 'bloodLipids', label: '血脂', color: 'bg-orange-500', textColor: 'text-orange-700' },
                            { key: 'coldness', label: '寒凉', color: 'bg-cyan-500', textColor: 'text-cyan-700' },
                            { key: 'immunity', label: '免疫', color: 'bg-green-500', textColor: 'text-green-700' },
                            { key: 'emotions', label: '情绪', color: 'bg-purple-500', textColor: 'text-purple-700' },
                          ];

                          return healthElementsMap.map((element) => {
                            const score = elementScores[element.key] || 0;
                            const normalizedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
                            
                            return (
                              <div key={element.key} className="flex items-center gap-4">
                                <div className={`w-24 text-sm font-medium ${element.textColor}`}>
                                  {element.label}
                                </div>
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                      className={`${element.color} h-4 rounded-full transition-all`}
                                      style={{ width: `${normalizedScore}%` }}
                                    />
                                  </div>
                                </div>
                                <div className={`w-12 text-right font-bold ${element.textColor}`}>
                                  {normalizedScore}分
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* 自检时间 */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                      <div className="text-sm text-green-600 mb-1">自检时间</div>
                      <div className="font-bold text-lg">{formatDate(getLatestSymptomCheck()!.checkedAt)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 text-center">
                    <FileText className="h-12 w-12 mx-auto text-green-300 mb-3" />
                    <p className="text-green-600 font-medium">暂无症状自检数据</p>
                    <p className="text-sm text-green-500 mt-1">用户尚未完成症状自检</p>
                  </div>
                )}
              </div>

              {/* 用户选择 - 紫色渐变背景 */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-purple-900">
                  <Target className="h-6 w-6 mr-3 text-purple-600" />
                  方案选择
                </h3>
                
                {getLatestChoice() ? (
                  <div className="space-y-6">
                    {/* 方案类型醒目展示 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                      <div className="text-sm text-purple-600 mb-3">已选择方案</div>
                      <div className="font-bold text-4xl text-purple-700 mb-2">
                        {getLatestChoice()!.planType}
                      </div>
                      <div className="text-sm text-purple-500">
                        选择时间：{formatDate(getLatestChoice()!.selectedAt)}
                      </div>
                    </div>

                    {/* 方案描述清晰展示 */}
                    {getLatestChoice()!.planDescription && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                        <div className="font-semibold text-lg text-purple-800 mb-3">方案描述</div>
                        <div className="text-gray-700 leading-relaxed">
                          {getLatestChoice()!.planDescription}
                        </div>
                      </div>
                    )}

                    {/* 方案特性说明 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">适用人群</div>
                        <div className="font-medium text-purple-800">中老年人群</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">主要目标</div>
                        <div className="font-medium text-purple-800">改善循环系统</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">预计周期</div>
                        <div className="font-medium text-purple-800">3-6个月</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                    <Target className="h-12 w-12 mx-auto text-purple-300 mb-3" />
                    <p className="text-purple-600 font-medium">暂未选择方案</p>
                    <p className="text-sm text-purple-500 mt-1">用户尚未完成方案选择</p>
                  </div>
                )}
              </div>

              {/* 健康要素分析结果 - 绿色渐变背景 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-green-900">
                  <Activity className="h-6 w-6 mr-3 text-green-600" />
                  健康要素分析结果
                </h3>

                {selectedUser.healthAnalysis && selectedUser.healthAnalysis.length > 0 ? (
                  <div className="space-y-4">
                    {/* 最新分析结果 */}
                    {selectedUser.healthAnalysis.slice(0, 1).map((analysis) => (
                      <div key={analysis.id} className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-semibold text-lg text-green-800">最新分析结果</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(analysis.analyzedAt)}
                          </div>
                        </div>

                        {/* 七个要素的得分 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* 气血 */}
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <div className="text-sm text-red-600 mb-1">气血</div>
                            <div className="text-2xl font-bold text-red-700 mb-1">
                              {analysis.qiAndBlood || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.qiAndBlood || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">营养输送能力</div>
                          </div>

                          {/* 循环 */}
                          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                            <div className="text-sm text-orange-600 mb-1">循环</div>
                            <div className="text-2xl font-bold text-orange-700 mb-1">
                              {analysis.circulation || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.circulation || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">微循环通畅程度</div>
                          </div>

                          {/* 毒素 */}
                          <div className="bg-gradient-to-br from-yellow-50 to-lime-50 p-4 rounded-lg border border-yellow-100">
                            <div className="text-sm text-yellow-600 mb-1">毒素</div>
                            <div className="text-2xl font-bold text-yellow-700 mb-1">
                              {analysis.toxins || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.toxins || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">体内垃圾毒素积累</div>
                          </div>

                          {/* 血脂 */}
                          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
                            <div className="text-sm text-green-600 mb-1">血脂</div>
                            <div className="text-2xl font-bold text-green-700 mb-1">
                              {analysis.bloodLipids || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.bloodLipids || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">血液中油脂含量</div>
                          </div>

                          {/* 寒凉 */}
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-blue-600 mb-1">寒凉</div>
                            <div className="text-2xl font-bold text-blue-700 mb-1">
                              {analysis.coldness || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.coldness || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">体内寒湿气程度</div>
                          </div>

                          {/* 免疫 */}
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                            <div className="text-sm text-purple-600 mb-1">免疫</div>
                            <div className="text-2xl font-bold text-purple-700 mb-1">
                              {analysis.immunity || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.immunity || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">身体自我防护能力</div>
                          </div>

                          {/* 情绪 */}
                          <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-100">
                            <div className="text-sm text-pink-600 mb-1">情绪</div>
                            <div className="text-2xl font-bold text-pink-700 mb-1">
                              {analysis.emotions || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.emotions || 0) / 20 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">心理状态和情绪管理</div>
                          </div>

                          {/* 整体健康 */}
                          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">整体健康</div>
                            <div className="text-2xl font-bold text-gray-700 mb-1">
                              {analysis.overallHealth || 0}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (analysis.overallHealth || 0) / 100 * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">综合健康评分</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 历史记录 */}
                    {selectedUser.healthAnalysis.length > 1 && (
                      <details className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <summary className="cursor-pointer font-semibold text-sm text-green-700 hover:text-green-900">
                          📊 查看历史分析记录（共{selectedUser.healthAnalysis.length}次）
                        </summary>
                        <div className="mt-4 space-y-2">
                          {selectedUser.healthAnalysis.slice(1).map((analysis) => (
                            <div key={analysis.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">整体健康：</span>
                                <span className="font-bold text-gray-900">{analysis.overallHealth}分</span>
                              </div>
                              <div className="text-xs text-gray-500">{formatDate(analysis.analyzedAt)}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 text-center">
                    <Activity className="h-12 w-12 mx-auto text-green-300 mb-3" />
                    <p className="text-green-600 font-medium">暂无健康要素分析结果</p>
                    <p className="text-sm text-green-500 mt-1">用户尚未完成健康要素分析</p>
                  </div>
                )}
              </div>

              {/* 中医深入分析 - 紫色渐变背景 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-purple-900">
                  <Flame className="h-6 w-6 mr-3 text-purple-600" />
                  中医深入分析
                </h3>

                {(() => {
                  const tcmData = analyzeTCMHealth();
                  if (!tcmData) {
                    return (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                        <Flame className="h-12 w-12 mx-auto text-purple-300 mb-3" />
                        <p className="text-purple-600 font-medium">暂无中医分析数据</p>
                        <p className="text-sm text-purple-500 mt-1">用户尚未完成症状自检</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* 体质辨识 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-purple-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">体质辨识</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`px-4 py-2 rounded-lg border-2 ${tcmData.constitution.color}`}>
                            <span className="font-bold text-lg">{tcmData.constitution.type}</span>
                          </div>
                          <div className="text-sm text-gray-600 max-w-md">
                            {tcmData.constitution.description}
                          </div>
                        </div>
                      </div>

                      {/* 气血状态 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-red-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">气血状态</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`px-4 py-2 rounded-lg border-2 ${tcmData.qiBloodStatus.color}`}>
                            <span className="font-bold text-lg">{tcmData.qiBloodStatus.type}</span>
                          </div>
                          <div className="text-sm text-gray-600 max-w-md">
                            {tcmData.qiBloodStatus.description}
                          </div>
                        </div>
                      </div>

                      {/* 脏腑功能 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">脏腑功能评估</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {Object.entries(tcmData.organFunction).map(([key, organ]: [string, any]) => (
                            <div key={key} className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-semibold text-blue-900 mb-1">
                                {organ.symptoms[0].substring(0, 1)}{key === 'heart' ? '心' : key === 'liver' ? '肝' : key === 'spleen' ? '脾' : key === 'lung' ? '肺' : '肾'}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                状态: <span className={organ.status === '正常' ? 'text-green-600' : 'text-red-600'}>{organ.status}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                功能: {organ.score || 90}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 经络状态 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">经络状态</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(tcmData.meridianStatus).map(([key, meridian]: [string, any]) => (
                            <div key={key} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">{meridian.name}</span>
                                <span className={`px-2 py-1 rounded text-xs ${meridian.color}`}>{meridian.status}</span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{meridian.description}</div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${meridian.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 阴阳平衡 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-gray-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">阴阳平衡</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`px-4 py-2 rounded-lg border-2 ${tcmData.yinYangBalance.color}`}>
                            <span className="font-bold text-lg">{tcmData.yinYangBalance.type}</span>
                          </div>
                          <div className="text-sm text-gray-600 max-w-md">
                            {tcmData.yinYangBalance.description}
                          </div>
                        </div>
                      </div>

                      {/* 湿热寒凉 */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-amber-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-amber-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">湿热寒凉</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(tcmData.wetHeatColdCool).map(([key, condition]: [string, any]) => (
                            <div key={key} className={`p-3 rounded-lg border-2 ${condition.color}`}>
                              <div className="text-xs font-semibold text-gray-900 mb-1">
                                {key === 'coldWet' ? '寒湿' : key === 'wetHeat' ? '湿热' : key === 'cold' ? '寒证' : key === 'heat' ? '热证' : key === 'wet' ? '湿证' : '燥证'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {condition.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 四个要求完成情况 - 橙色渐变背景 */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-l-4 border-orange-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-orange-900">
                  <CheckCircle className="h-6 w-6 mr-3 text-orange-600" />
                  四个要求完成情况
                </h3>
                
                {selectedUser.requirements ? (
                  <div className="space-y-6">
                    {/* 总体完成进度条 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-lg text-orange-800">总体完成度</div>
                        <div className="font-bold text-2xl text-orange-700">
                          {calculateRequirementsProgress(selectedUser.requirements).toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-orange-500 h-4 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${calculateRequirementsProgress(selectedUser.requirements)}%` }}
                        />
                      </div>
                      <div className="text-sm text-orange-600 mt-2">
                        {(() => {
                          const completed = [
                            selectedUser.requirements.requirement1Completed,
                            selectedUser.requirements.requirement2Completed,
                            selectedUser.requirements.requirement3Completed,
                            selectedUser.requirements.requirement4Completed,
                          ].filter(Boolean).length;
                          return `已完成 ${completed} 个要求，剩余 ${4 - completed} 个`;
                        })()}
                      </div>
                    </div>

                    {/* 四个要求独立卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'requirement1Completed', label: '要求一', description: '完成个人信息填写与症状自检' },
                        { key: 'requirement2Completed', label: '要求二', description: '完成健康要素分析与评估' },
                        { key: 'requirement3Completed', label: '要求三', description: '选择适合的健康管理方案' },
                        { key: 'requirement4Completed', label: '要求四', description: '完成所有健康管理要求' },
                      ].map((req, index) => {
                        const isCompleted = selectedUser.requirements![req.key as keyof typeof selectedUser.requirements];
                        
                        return (
                          <div key={req.key} className={`bg-white p-5 rounded-lg shadow-sm border ${isCompleted ? 'border-green-200' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="font-bold text-lg">{req.label}</div>
                              </div>
                              <Badge className={`${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                {isCompleted ? '✓ 完成' : '○ 未完成'}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">{req.description}</div>
                            
                            <div className="text-xs text-gray-500">
                              {isCompleted ? (
                                <span className="text-green-600">已完成 - 用户已满足此要求</span>
                              ) : (
                                <span className="text-orange-600">待完成 - 用户尚未满足此要求</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 完成时间信息 */}
                    {selectedUser.requirements.completedAt && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 text-center">
                        <div className="text-sm text-orange-600 mb-1">全部要求完成时间</div>
                        <div className="font-bold text-lg">{formatDate(selectedUser.requirements.completedAt)}</div>
                      </div>
                    )}

                    {/* 最后更新时间 */}
                    {selectedUser.requirements.updatedAt && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 text-center">
                        <div className="text-sm text-orange-600 mb-1">最后更新时间</div>
                        <div className="font-bold text-lg">{formatDate(selectedUser.requirements.updatedAt)}</div>
                      </div>
                    )}

                    {/* 要求2详细回答 */}
                    {selectedUser.requirements.requirement2Answers && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                        <div className="font-semibold text-lg text-orange-800 mb-3">要求二详细回答</div>
                        <div className="text-gray-700 leading-relaxed">
                          {(() => {
                            const answers = selectedUser.requirements.requirement2Answers;
                            if (typeof answers === 'string') {
                              return answers;
                            } else if (typeof answers === 'object' && answers !== null) {
                              // 如果是对象，格式化为列表
                              return Object.entries(answers).map(([key, value]) => (
                                <div key={key} className="mb-3">
                                  <div className="font-medium text-orange-700 mb-1">{key}:</div>
                                  <div className="text-gray-600">{String(value)}</div>
                                </div>
                              ));
                            }
                            return '无详细回答内容';
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-orange-300 mb-3" />
                    <p className="text-orange-600 font-medium">暂无要求完成数据</p>
                    <p className="text-sm text-orange-500 mt-1">用户尚未开始完成健康管理要求</p>
                  </div>
                )}
              </div>

              {/* 七问答案 - 始终显示所有问题，标记已回答/未回答 */}
              <Separator />
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-4 border-indigo-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-indigo-900">
                  <HelpCircle className="h-6 w-6 mr-3 text-indigo-600" />
                  健康七问（V2新版）- 全部7个问题
                </h3>

                <div className="space-y-4">
                  {/* 调试面板 - 显示原始七问数据 */}
                  {selectedUser.requirements?.sevenQuestionsAnswers && (
                    <details className="bg-gray-50 border border-gray-200 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer font-semibold text-sm text-gray-700 hover:bg-gray-100">
                        📊 调试信息 - 七问原始数据（点击展开）
                      </summary>
                      <div className="px-4 py-3 border-t border-gray-200">
                        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                          {JSON.stringify(selectedUser.requirements.sevenQuestionsAnswers, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}

                  {SEVEN_QUESTIONS.map((q, index) => {
                    const answers = selectedUser.requirements?.sevenQuestionsAnswers;

                    // 尝试多种方式获取答案
                    let answerData = null;
                    let answer = null;
                    let date = null;

                    if (answers) {
                      // 优先使用字符串ID作为key（因为PostgreSQL JSON类型返回的key通常是字符串）
                      const stringKey = q.id.toString();
                      const numericKey = q.id;

                      // 尝试字符串key - 使用 'in' 操作符检查键是否存在
                      if (stringKey in answers) {
                        const value = answers[stringKey];
                        if (typeof value === 'string') {
                          answer = value;
                        } else if (typeof value === 'object' && value !== null) {
                          answerData = value;
                          answer = answerData?.answer || answerData?.content || answerData?.text;
                          date = answerData?.date || answerData?.timestamp || answerData?.createdAt;
                        }
                      }
                      // 尝试数字key（备用）
                      else if (numericKey in answers) {
                        const value = answers[numericKey];
                        if (typeof value === 'string') {
                          answer = value;
                        } else if (typeof value === 'object' && value !== null) {
                          answerData = value;
                          answer = answerData?.answer || answerData?.content || answerData?.text;
                          date = answerData?.date || answerData?.timestamp || answerData?.createdAt;
                        }
                      }
                      // 数组格式处理
                      else if (Array.isArray(answers)) {
                        // 方式1：按索引匹配
                        if (answers[index]) {
                          const value = answers[index];
                          if (typeof value === 'string') {
                            answer = value;
                          } else if (typeof value === 'object' && value !== null) {
                            answer = value?.answer || value?.content || value?.text;
                            date = value?.date || value?.timestamp || value?.createdAt;
                          }
                        }
                        // 方式2：按question字段匹配
                        else {
                          const matched = answers.find((item: any) => 
                            item?.question === q.question || 
                            item?.questionId === q.id || 
                            item?.questionId === q.id.toString()
                          );
                          if (matched) {
                            answer = matched?.answer || matched?.content || matched?.text;
                            date = matched?.date || matched?.timestamp || matched?.createdAt;
                          }
                        }
                      }
                    }

                    const hasAnswer = answer !== null && answer !== undefined && answer !== '';

                    return (
                      <div key={index} className={`bg-white p-5 rounded-lg shadow-sm border ${hasAnswer ? 'border-green-300' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${hasAnswer ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-indigo-900 mb-2">
                              {q.question}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {q.description}
                            </div>
                            <div className={`p-3 rounded-lg ${hasAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                              {hasAnswer ? (
                                <div>
                                  <div className="text-gray-700 leading-relaxed">{answer}</div>
                                  {date && (
                                    <div className="text-xs text-green-600 mt-2">
                                      填写时间：{formatDate(date)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm italic">
                                  未填写
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* 不良生活习惯自检表 - 显示所有252项，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 border-l-4 border-pink-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-pink-900">
                  <AlertCircle className="h-6 w-6 mr-3 text-pink-600" />
                  不良生活习惯自检表（全部252项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 text-center">
                    <div className="text-sm text-pink-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-pink-700">
                      {(() => {
                        const habitIds = selectedUser.requirements?.badHabitsChecklist || [];
                        const totalHabits = Object.values(BAD_HABITS_CHECKLIST).flat().length;
                        return `${Array.isArray(habitIds) ? habitIds.length : 0} / ${totalHabits}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const habitIds = selectedUser.requirements?.badHabitsChecklist || [];
                    const habitSet = new Set(Array.isArray(habitIds) ? habitIds : []);

                    return Object.entries(BAD_HABITS_CHECKLIST).map(([category, habits]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-pink-100">
                        <h4 className="font-semibold text-pink-700 mb-4">{category} ({habits.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {habits.map((habit: any) => {
                            const isSelected = habitSet.has(habit.id);
                            return (
                              <div key={habit.id} className={`p-3 rounded-lg border-2 ${isSelected ? 'bg-pink-50 border-pink-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-pink-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-sm ${isSelected ? 'text-pink-900' : 'text-gray-600'}`}>
                                      #{habit.id} {habit.habit}
                                    </div>
                                    {habit.impact && (
                                      <div className="text-xs text-red-600 mt-1">{habit.impact}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 身体语言简表（100项）- 显示所有症状，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-green-900">
                  <FileText className="h-6 w-6 mr-3 text-green-600" />
                  身体语言简表（全部100项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 text-center">
                    <div className="text-sm text-green-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-green-700">
                      {(() => {
                        const latestSymptomCheck = getLatestSymptomCheck();
                        const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                        return `${symptomIds.length} / ${BODY_SYMPTOMS.length}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const latestSymptomCheck = getLatestSymptomCheck();
                    const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                    const symptomSet = new Set(symptomIds.map((id: string) => parseInt(id)));

                    // 按类别分组
                    const symptomsByCategory = BODY_SYMPTOMS.reduce((acc, symptom) => {
                      if (!acc[symptom.category]) acc[symptom.category] = [];
                      acc[symptom.category].push(symptom);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                        <h4 className="font-semibold text-green-700 mb-4">{category} ({symptoms.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {symptoms.map((symptom: any) => {
                            const isSelected = symptomSet.has(symptom.id);
                            return (
                              <div key={symptom.id} className={`p-3 rounded-lg border-2 ${isSelected ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-sm ${isSelected ? 'text-green-900' : 'text-gray-600'}`}>
                                      #{symptom.id} {symptom.name}
                                    </div>
                                    {symptom.description && (
                                      <div className="text-xs text-green-600 mt-1">{symptom.description}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 300项症状自检表 - 显示所有症状，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-amber-900">
                  <FileText className="h-6 w-6 mr-3 text-amber-600" />
                  300项症状自检表（全部300项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 text-center">
                    <div className="text-sm text-amber-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-amber-700">
                      {(() => {
                        const symptomIds = selectedUser.requirements?.symptoms300Checklist || [];
                        return `${Array.isArray(symptomIds) ? symptomIds.length : 0} / ${BODY_SYMPTOMS_300.length}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const symptomIds = selectedUser.requirements?.symptoms300Checklist || [];
                    const symptomSet = new Set(Array.isArray(symptomIds) ? symptomIds : []);

                    // 按类别分组
                    const symptomsByCategory = BODY_SYMPTOMS_300.reduce((acc, symptom) => {
                      if (!acc[symptom.category]) acc[symptom.category] = [];
                      acc[symptom.category].push(symptom);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-amber-100">
                        <h4 className="font-semibold text-amber-700 mb-4">{category} ({symptoms.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {symptoms.map((symptom: any) => {
                            const isSelected = symptomSet.has(symptom.id);
                            return (
                              <div key={symptom.id} className={`p-2 rounded-lg border-2 ${isSelected ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-xs ${isSelected ? 'text-amber-900' : 'text-gray-600'}`}>
                                      #{symptom.id} {symptom.name}
                                    </div>
                                    {symptom.description && (
                                      <div className="text-xs text-purple-600 mt-0.5 leading-tight">{symptom.description}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 个性化健康管理方案 - 红色渐变背景 */}
              <div className="bg-gradient-to-br from-red-50 to-rose-100 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-red-900">
                  <Sparkles className="h-6 w-6 mr-3 text-red-600" />
                  个性化健康管理方案
                </h3>

                {(() => {
                  const latestSymptomCheck = getLatestSymptomCheck();
                  const latestAnalysis = getLatestHealthAnalysis();
                  const latestChoice = getLatestChoice();

                  if (!latestSymptomCheck && !latestAnalysis && !latestChoice) {
                    return (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 text-center">
                        <Sparkles className="h-12 w-12 mx-auto text-red-300 mb-3" />
                        <p className="text-red-600 font-medium">暂无个性化方案数据</p>
                        <p className="text-sm text-red-500 mt-1">用户尚未完成健康自检，无法生成个性化方案</p>
                      </div>
                    );
                  }

                  // 计算主要健康要素
                  const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                  const selectedSymptoms = symptomIds.map((id: string) => parseInt(id));
                  
                  const getPrimaryElements = () => {
                    if (!latestSymptomCheck?.elementScores) return [];
                    const elementScores = latestSymptomCheck.elementScores as Record<string, number>;
                    return Object.entries(elementScores)
                      .filter(([_, count]) => count > 0)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 3)
                      .map(([name, count]) => ({ name, count: Number(count) }));
                  };

                  const primaryElements = getPrimaryElements();

                  // 计算重点改善症状
                  const getTargetSymptoms = () => {
                    if (!selectedSymptoms || selectedSymptoms.length === 0) return [];
                    // 取选中症状的前5个作为重点症状
                    return selectedSymptoms.slice(0, 5).map((id: number) => BODY_SYMPTOMS.find(s => s.id === id)).filter(Boolean);
                  };

                  const targetSymptoms = getTargetSymptoms();

                  // 计算推荐的调理产品
                  const getRecommendedProducts = () => {
                    const products: any[] = [];
                    const elementNames = primaryElements.map(el => el.name);

                    // 艾灸 - 适合气血、寒凉、循环问题
                    if (elementNames.includes('气血') || elementNames.includes('寒凉') || elementNames.includes('循环')) {
                      products.push({
                        name: '艾灸调理',
                        description: '通过艾灸穴位，温通经络，调和气血，驱寒除湿，改善寒凉和气血不足问题',
                        icon: Activity,
                        color: 'from-orange-500 to-red-500',
                        matchScore: 5,
                        reasons: [
                          '温通经络，促进气血运行',
                          '驱寒除湿，改善寒凉体质',
                          '增强免疫力，提升身体自愈能力',
                          '调理慢性炎症，缓解疼痛'
                        ]
                      });
                    }

                    // 火灸 - 适合气血、毒素、循环问题
                    if (elementNames.includes('气血') || elementNames.includes('毒素') || elementNames.includes('循环')) {
                      products.push({
                        name: '火灸调理',
                        description: '以火之力，温阳散寒，活血化瘀，祛除体内毒素和淤堵',
                        icon: Flame,
                        color: 'from-red-500 to-orange-600',
                        matchScore: 5,
                        reasons: [
                          '强力活血化瘀，疏通经络',
                          '温阳补气，提升身体能量',
                          '祛除毒素，净化体内环境',
                          '改善循环，促进新陈代谢'
                        ]
                      });
                    }

                    // 正骨 - 适合骨骼、肌肉、循环问题
                    if (elementNames.includes('循环') || elementNames.includes('气血') || 
                        selectedSymptoms.some((s: number) => [30, 31, 32, 33, 34, 35, 60, 61, 62, 63].includes(s))) {
                      products.push({
                        name: '正骨调理',
                        description: '通过手法矫正骨骼位置，恢复脊柱生理曲度，改善神经受压和循环障碍',
                        icon: Target,
                        color: 'from-blue-500 to-purple-500',
                        matchScore: 4,
                        reasons: [
                          '矫正骨骼位置，恢复脊柱健康',
                          '解除神经压迫，缓解疼痛',
                          '改善循环，促进气血运行',
                          '矫正体态，提升整体健康'
                        ]
                      });
                    }

                    // 空腹禅 - 身心调理，适合情绪、毒素、气血问题
                    if (elementNames.includes('情绪') || elementNames.includes('毒素') || elementNames.includes('气血') || elementNames.includes('血脂')) {
                      products.push({
                        name: '空腹禅调理',
                        description: '通过空腹禅修，净化身心，清理毒素，调和气血，平衡情绪',
                        icon: Heart,
                        color: 'from-green-500 to-teal-500',
                        matchScore: 4,
                        reasons: [
                          '净化身心，清理体内毒素',
                          '调和气血，提升生命能量',
                          '平衡情绪，释放心理压力',
                          '改善睡眠，提升整体健康'
                        ]
                      });
                    }

                    // 经络调理 - 适合循环、气血、毒素问题
                    if (elementNames.includes('循环') || elementNames.includes('气血') || elementNames.includes('毒素')) {
                      products.push({
                        name: '经络调理',
                        description: '通过疏通经络，促进气血运行，清除淤堵，恢复身体平衡',
                        icon: Zap,
                        color: 'from-yellow-500 to-orange-500',
                        matchScore: 4,
                        reasons: [
                          '疏通经络，恢复气血运行',
                          '清除淤堵，改善循环',
                          '调和脏腑功能，增强免疫力',
                          '缓解疼痛，提升生活质量'
                        ]
                      });
                    }

                    // 药王产品 - 综合调理
                    products.push({
                      name: '药王产品',
                      description: '传统药王配方产品，针对性调理您的健康问题，标本兼治',
                      icon: Droplets,
                      color: 'from-green-600 to-emerald-500',
                      matchScore: 3,
                      reasons: [
                        '天然药材，安全有效',
                        '传统配方，传承千年',
                        '标本兼治，综合调理',
                        '个性化定制，精准调理'
                      ]
                    });

                    return products.sort((a, b) => b.matchScore - a.matchScore);
                  };

                  const recommendedProducts = getRecommendedProducts();

                  // 推荐的学习课程
                  const getRecommendedCourses = () => {
                    return TWENTY_ONE_COURSES.map((course: any) => {
                      let relevance: 'high' | 'medium' | 'low' = 'low';
                      const primaryElementNames = primaryElements.map(el => el.name);

                      if (primaryElementNames.length > 0) {
                        if (primaryElementNames.includes('气血') && course.title.includes('气血')) relevance = 'high';
                        else if (primaryElementNames.includes('循环') && course.title.includes('循环')) relevance = 'high';
                        else if (primaryElementNames.includes('毒素') && course.title.includes('毒素')) relevance = 'high';
                        else if (primaryElementNames.includes('寒凉') && course.title.includes('寒')) relevance = 'high';
                        else if (primaryElementNames.includes('免疫') && course.title.includes('免疫')) relevance = 'high';
                        else if (primaryElementNames.includes('情绪') && course.title.includes('情绪')) relevance = 'high';
                        else if (primaryElementNames.includes('血脂') && course.title.includes('血脂')) relevance = 'high';
                        else relevance = 'medium';
                      }

                      return { ...course, relevance };
                    }).sort((a: any, b: any) => {
                      const relevanceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
                    });
                  };

                  const recommendedCourses = getRecommendedCourses();

                  // 分阶段调理计划
                  const getPhasedPlan = () => {
                    const plan = {
                      foundation: {
                        name: '基础期（第1-2个月）',
                        goals: ['调理体质', '建立健康习惯', '改善症状'],
                        actions: [] as string[]
                      },
                      enhancement: {
                        name: '强化期（第3-4个月）',
                        goals: ['强化疗效', '深度调理', '巩固成果'],
                        actions: [] as string[]
                      },
                      consolidation: {
                        name: '巩固期（第5-6个月）',
                        goals: ['巩固疗效', '维持健康', '预防复发'],
                        actions: [] as string[]
                      }
                    };

                    // 根据健康要素添加具体建议
                    const elementNames = primaryElements.map(el => el.name);
                    
                    if (elementNames.includes('气血')) {
                      plan.foundation.actions.push('食用补气血食物（红枣、桂圆、山药等）');
                      plan.foundation.actions.push('保证充足睡眠，每晚23:00前入睡');
                      plan.enhancement.actions.push('适当运动，促进气血生成');
                      plan.consolidation.actions.push('定期食用药膳，维持气血充盈');
                    }

                    if (elementNames.includes('循环')) {
                      plan.foundation.actions.push('温水泡脚，改善末梢循环');
                      plan.foundation.actions.push('每天运动30分钟，促进血液循环');
                      plan.enhancement.actions.push('定期按摩推拿，疏通经络');
                      plan.consolidation.actions.push('坚持运动习惯，保持循环通畅');
                    }

                    if (elementNames.includes('毒素')) {
                      plan.foundation.actions.push('每天喝足够的水（2000ml以上）');
                      plan.foundation.actions.push('多吃纤维食物，促进肠道排毒');
                      plan.enhancement.actions.push('定期运动出汗，促进皮肤排毒');
                      plan.consolidation.actions.push('养成健康饮食习惯，避免毒素积累');
                    }

                    if (elementNames.includes('寒凉')) {
                      plan.foundation.actions.push('温热饮食，少食生冷');
                      plan.foundation.actions.push('注意保暖，避免寒气入侵');
                      plan.enhancement.actions.push('艾灸调理，温阳散寒');
                      plan.consolidation.actions.push('继续温热饮食，保持身体温暖');
                    }

                    if (elementNames.includes('免疫')) {
                      plan.foundation.actions.push('保证充足睡眠，修复免疫系统');
                      plan.foundation.actions.push('均衡营养，补充维生素矿物质');
                      plan.enhancement.actions.push('适量运动，激活免疫细胞');
                      plan.consolidation.actions.push('保持健康生活方式，维持免疫力');
                    }

                    if (elementNames.includes('情绪')) {
                      plan.foundation.actions.push('学习情绪管理技巧');
                      plan.foundation.actions.push('适度运动，释放压力');
                      plan.enhancement.actions.push('练习冥想，平衡心态');
                      plan.consolidation.actions.push('保持积极心态，学会自我调节');
                    }

                    if (elementNames.includes('血脂')) {
                      plan.foundation.actions.push('低脂饮食，减少饱和脂肪摄入');
                      plan.foundation.actions.push('增加运动，促进脂肪消耗');
                      plan.enhancement.actions.push('控制体重，减少内脏脂肪');
                      plan.consolidation.actions.push('定期体检，监测血脂水平');
                    }

                    return plan;
                  };

                  const phasedPlan = getPhasedPlan();

                  return (
                    <div className="space-y-8">
                      {/* 健康状况总结 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4">健康状况总结</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 重点改善症状 */}
                          {targetSymptoms.length > 0 && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                              <h5 className="text-base font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-600" />
                                重点改善症状
                              </h5>
                              <div className="space-y-2">
                                {targetSymptoms.map((symptom: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium text-gray-700">#{symptom.id} {symptom.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 主要健康要素 */}
                          {primaryElements.length > 0 && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                              <h5 className="text-base font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                主要健康要素
                              </h5>
                              <div className="space-y-2">
                                {primaryElements.map((el: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{el.name}</span>
                                    <Badge variant="secondary" className="text-xs">{el.count} 项症状</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 方案类型 */}
                        {latestChoice && (
                          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                            <h5 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">选择方案</h5>
                            <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                              {latestChoice.planType}
                            </p>
                            {latestChoice.planDescription && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{latestChoice.planDescription}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 推荐调理产品 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-red-600" />
                          推荐调理产品
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendedProducts.map((product, index) => {
                            const Icon = product.icon;
                            return (
                              <div key={index} className="border-2 border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-base">{product.name}</div>
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      匹配度: {Math.min(95, 70 + product.matchScore * 5)}%
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                  {product.description}
                                </p>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white">调理作用：</p>
                                  {product.reasons.map((reason: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                      <span className="text-green-500 mr-1">•</span>
                                      {reason}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 推荐学习课程 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                          推荐学习课程
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {recommendedCourses.slice(0, 9).map((course: any) => (
                            <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  第{course.id}课
                                </Badge>
                                {course.relevance === 'high' && (
                                  <Badge className="text-xs bg-red-500">重点</Badge>
                                )}
                              </div>
                              <div className="font-semibold text-sm mb-1">{course.title}</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {course.content}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                📚 {course.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 分阶段调理计划 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-red-600" />
                          分阶段调理计划
                        </h4>
                        <div className="space-y-6">
                          {/* 基础期 */}
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-green-800">{phasedPlan.foundation.name}</h5>
                              <Badge className="bg-green-600 text-white text-xs">第一阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.foundation.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-green-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.foundation.actions.length > 0 ? (
                                    phasedPlan.foundation.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-green-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 强化期 */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-blue-800">{phasedPlan.enhancement.name}</h5>
                              <Badge className="bg-blue-600 text-white text-xs">第二阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.enhancement.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-blue-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.enhancement.actions.length > 0 ? (
                                    phasedPlan.enhancement.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-blue-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 巩固期 */}
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-purple-800">{phasedPlan.consolidation.name}</h5>
                              <Badge className="bg-purple-600 text-white text-xs">第三阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-purple-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.consolidation.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-purple-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-purple-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.consolidation.actions.length > 0 ? (
                                    phasedPlan.consolidation.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-purple-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 重要提示 */}
                      <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <AlertDescription className="mt-2">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">
                            重要提示
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            以上调理方案仅供参考，具体调理方法和产品选择请咨询专业调理导师。
                            调理过程中如出现不适，请及时暂停并寻求专业指导。
                            方案生成时间：{new Date().toLocaleString('zh-CN')}
                          </p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 历史记录对比对话框 */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="w-[95vw] max-w-[1800px] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">历史记录对比</DialogTitle>
            <DialogDescription className="text-base">
              {historyPhone} 的所有填写记录（共 {historyUsers.length} 次）
            </DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span>加载中...</span>
            </div>
          ) : historyUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-6">
              {/* 历史记录时间轴 */}
              <div className="space-y-4">
                {historyUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`relative pl-8 pb-6 border-l-4 ${
                      user.isLatestVersion
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {/* 时间点标记 */}
                    <div className={`absolute left-0 top-0 w-6 h-6 -translate-x-1/2 rounded-full border-4 ${
                      user.isLatestVersion
                        ? 'bg-green-500 border-white shadow-lg'
                        : 'bg-gray-300 border-white'
                    }`} />

                    {/* 标题 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">
                          第 {historyUsers.length - index} 次填写
                          {user.isLatestVersion && (
                            <Badge className="ml-2 bg-green-500">最新版本</Badge>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowHistoryDialog(false);
                          handleViewDetail(user.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                    </div>

                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">姓名</div>
                        <div className="font-semibold">{user.name || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">年龄</div>
                        <div className="font-semibold">{user.age || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">性别</div>
                        <div className="font-semibold">{user.gender || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">BMI</div>
                        <div className="font-semibold">
                          {user.bmi && !isNaN(Number(user.bmi)) ? Number(user.bmi).toFixed(1) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 身体数据对比 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {user.weight && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">体重</div>
                          <div className="font-semibold">{user.weight} kg</div>
                        </div>
                      )}
                      {user.height && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">身高</div>
                          <div className="font-semibold">{user.height} cm</div>
                        </div>
                      )}
                      {user.bloodPressure && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">血压</div>
                          <div className="font-semibold">{user.bloodPressure} mmHg</div>
                        </div>
                      )}
                      {user.occupation && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">职业</div>
                          <div className="font-semibold">{user.occupation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 对比说明 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">对比说明</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>每次填写都会创建独立的记录，便于对比不同时期的健康状况</li>
                    <li>最新版本会用绿色标记，方便识别当前数据</li>
                    <li>点击"查看详情"可以查看该次填写的完整数据</li>
                    <li>通过对比可以观察健康指标的变化趋势</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
