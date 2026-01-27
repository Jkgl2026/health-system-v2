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
import UserDetailHorizon from '@/app/admin/user-detail-horizon';

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

  // 中医深入分析
  const analyzeTCMHealth = () => {
    if (!selectedUser) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = selectedUser.requirements?.badHabitsChecklist || [];
    const symptoms300 = selectedUser.requirements?.symptoms300Checklist || [];
    const sevenQuestionsAnswers = selectedUser.requirements?.sevenQuestionsAnswers || {};

    // 转换为数字数组
    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    const totalSymptoms = bodySymptomIds.length + habitIds.length + symptom300Ids.length;

    // 体质辨识
    const getConstitution = () => {
      if (totalSymptoms < 10) return { type: '平和质', color: 'green', desc: '阴阳气血调和，体态适中，面色红润，精力充沛' };
      if (totalSymptoms < 20) return { type: '气虚质', color: 'blue', desc: '元气不足，疲乏无力，气短懒言，易出汗，易感冒' };
      if (totalSymptoms < 30) return { type: '痰湿质', color: 'yellow', desc: '体内湿气重，体型肥胖，胸闷痰多，身重不爽' };
      if (totalSymptoms < 40) return { type: '湿热质', color: 'orange', desc: '湿热内蕴，面垢油光，易生痤疮，口苦口臭，大便黏滞' };
      return { type: '血瘀质', color: 'red', desc: '气血运行不畅，肤色晦暗，易有瘀斑，痛经，舌质紫暗' };
    };

    // 气血状态分析
    const getQiBloodStatus = () => {
      const hasFatigue = bodySymptomIds.some(id => [1, 3, 4, 14, 58].includes(id));
      const hasShortness = bodySymptomIds.some(id => [40, 48].includes(id));
      const hasPalpitation = bodySymptomIds.some(id => [49].includes(id));

      if (hasFatigue && hasShortness) return { type: '气血两虚', color: 'red', desc: '面色苍白，乏力少气，心悸失眠，动则气喘' };
      if (hasFatigue && bodySymptomIds.some(id => [55, 57].includes(id))) return { type: '气虚血瘀', color: 'orange', desc: '气短乏力，舌质紫暗，身体疼痛，月经不调' };
      if (hasPalpitation && bodySymptomIds.some(id => [76, 80].includes(id))) return { type: '气血瘀滞', color: 'pink', desc: '胸胁胀痛，月经不调，舌有瘀斑，心悸怔忡' };
      return { type: '气血充盈', color: 'green', desc: '面色红润，精力充沛，舌质淡红，脉象有力' };
    };

    // 脏腑功能评估
    const getOrganFunction = () => {
      const organs = [];
      
      // 心
      if (bodySymptomIds.some(id => [49, 50, 5, 10].includes(id))) {
        organs.push({ organ: '心', status: '异常', color: 'red', symptoms: '心悸、失眠、多梦' });
      }
      // 肝
      if (bodySymptomIds.some(id => [6, 16, 17, 19, 85].includes(id))) {
        organs.push({ organ: '肝', status: '异常', color: 'orange', symptoms: '易怒、头晕、眼干、视力模糊' });
      }
      // 脾
      if (bodySymptomIds.some(id => [41, 42, 43, 86, 87, 88, 89, 90].includes(id))) {
        organs.push({ organ: '脾', status: '异常', color: 'yellow', symptoms: '消化不良、腹胀、便溏、口干口苦' });
      }
      // 肺
      if (bodySymptomIds.some(id => [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].includes(id))) {
        organs.push({ organ: '肺', status: '异常', color: 'blue', symptoms: '咳嗽、气短、易感冒、鼻炎' });
      }
      // 肾
      if (bodySymptomIds.some(id => [25, 55, 62, 63, 67].includes(id))) {
        organs.push({ organ: '肾', status: '异常', color: 'purple', symptoms: '腰酸、耳鸣、畏寒、夜尿多' });
      }

      if (organs.length === 0) {
        organs.push({ organ: '五脏', status: '正常', color: 'green', symptoms: '五脏功能正常' });
      }

      return organs;
    };

    // 经络状态
    const getMeridianStatus = () => {
      const meridians = [];

      // 督脉（脊柱问题）
      if (bodySymptomIds.some(id => [62, 59].includes(id))) {
        meridians.push({ meridian: '督脉', status: '不畅', color: 'red', desc: '脊柱问题、阳气不足、颈腰疼痛' });
      }
      // 任脉（妇科问题）
      if (bodySymptomIds.some(id => [76, 77, 78, 79, 80, 81, 82, 83, 84].includes(id))) {
        meridians.push({ meridian: '任脉', status: '不畅', color: 'pink', desc: '妇科问题、消化问题、月经失调' });
      }
      // 冲脉（气血失调）
      if (bodySymptomIds.some(id => [55, 56, 57, 58].includes(id))) {
        meridians.push({ meridian: '冲脉', status: '不畅', color: 'orange', desc: '月经问题、气血失调、四肢问题' });
      }
      // 带脉（腰腹问题）
      if (bodySymptomIds.some(id => [63, 91, 96].includes(id))) {
        meridians.push({ meridian: '带脉', status: '不畅', color: 'yellow', desc: '腰腹问题、湿气重、体型肥胖' });
      }

      if (meridians.length === 0) {
        meridians.push({ meridian: '经络', status: '通畅', color: 'green', desc: '经络通畅，气血运行正常' });
      }

      return meridians;
    };

    // 阴阳平衡
    const getYinYangBalance = () => {
      const hasColdSymptoms = bodySymptomIds.some(id => [4, 5, 42, 55].includes(id)) ||
                              habitIds.some(id => BAD_HABITS_CHECKLIST.some(h => h.id === id && h.habit.includes('生冷')));
      const hasHeatSymptoms = bodySymptomIds.some(id => [16, 35, 36, 37, 95].includes(id)) ||
                              habitIds.some(id => BAD_HABITS_CHECKLIST.some(h => h.id === id && h.habit.includes('辛辣')));

      if (hasColdSymptoms && hasHeatSymptoms) return { type: '阴阳两虚', color: 'purple', desc: '时而怕冷时而怕热，自汗盗汗，脉象细数' };
      if (hasHeatSymptoms) return { type: '阳盛阴衰', color: 'red', desc: '面红目赤，烦躁易怒，便秘尿黄，舌红苔黄' };
      if (hasColdSymptoms) return { type: '阴盛阳衰', color: 'blue', desc: '面色苍白，畏寒肢冷，精神萎靡，舌淡苔白' };
      return { type: '阴阳平衡', color: 'green', desc: '正常状态，阴阳协调' };
    };

    // 湿热寒凉
    const getColdHeatDampness = () => {
      const hasCold = bodySymptomIds.some(id => [4, 5, 42, 55].includes(id));
      const hasHeat = bodySymptomIds.some(id => [16, 35, 36, 37, 41, 95].includes(id));
      const hasDampness = bodySymptomIds.some(id => [11, 39, 68, 69, 70, 91].includes(id)) ||
                           habitIds.some(id => BAD_HABITS_CHECKLIST.some(h => h.id === id && (h.habit.includes('甜') || h.habit.includes('油腻'))));
      const hasDryness = bodySymptomIds.some(id => [16, 42, 53].includes(id));

      if (hasCold && hasDampness) return { type: '寒湿', color: 'blue', desc: '寒湿内盛，关节冷痛，身体困重，舌淡苔腻' };
      if (hasHeat && hasDampness) return { type: '湿热', color: 'orange', desc: '湿热内蕴，面垢油光，口苦口臭，大便黏滞' };
      if (hasCold) return { type: '寒证', color: 'cyan', desc: '畏寒肢冷，面色苍白，舌淡苔白，脉沉紧' };
      if (hasHeat) return { type: '热证', color: 'red', desc: '发热面赤，口渴喜冷饮，舌红苔黄，脉数有力' };
      if (hasDampness) return { type: '湿证', color: 'yellow', desc: '头重如裹，胸闷腹胀，舌苔厚腻，身体困重' };
      if (hasDryness) return { type: '燥证', color: 'amber', desc: '口干咽燥，皮肤干燥，便干尿少，舌红少津' };
      return { type: '平和', color: 'green', desc: '寒热适中，无明显异常' };
    };

    return {
      constitution: getConstitution(),
      qiBloodStatus: getQiBloodStatus(),
      organFunction: getOrganFunction(),
      meridianStatus: getMeridianStatus(),
      yinYangBalance: getYinYangBalance(),
      coldHeatDampness: getColdHeatDampness(),
      totalSymptoms,
    };
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

      {/* 用户详情对话框 - 横向布局 */}
      <UserDetailHorizon
        user={selectedUser}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

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
