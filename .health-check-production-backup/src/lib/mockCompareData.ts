/**
 * 模拟用户历史对比数据
 * 用于数据对比分析功能的演示
 */

export interface MockUserData {
  id: string;
  name: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  weight: string | null;
  height: string | null;
  bmi: string | null;
  bloodPressure: string | null;
  occupation: string | null;
  createdAt: Date;
  isLatestVersion: boolean;
  phoneGroupId: string | null;
}

export interface MockFullUserData extends MockUserData {
  symptomChecks?: any[];
  healthAnalysis?: any[];
  userChoices?: any[];
  requirements?: any;
}

// 模拟用户历史记录
export const MOCK_USER_HISTORY: MockUserData[] = [
  {
    id: "mock-user-001",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "75.5",
    height: "175",
    bmi: "24.7",
    bloodPressure: "120/80",
    occupation: "程序员",
    createdAt: new Date("2025-01-10T08:30:00"),
    isLatestVersion: false
  },
  {
    id: "mock-user-002",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "73.0",
    height: "175",
    bmi: "23.9",
    bloodPressure: "118/78",
    occupation: "程序员",
    createdAt: new Date("2025-01-15T09:15:00"),
    isLatestVersion: false
  },
  {
    id: "mock-user-003",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "71.5",
    height: "175",
    bmi: "23.4",
    bloodPressure: "115/75",
    occupation: "程序员",
    createdAt: new Date("2025-01-20T10:00:00"),
    isLatestVersion: true
  },
  {
    id: "mock-user-004",
    name: "李四",
    phone: "13900139001",
    phoneGroupId: "group-002",
    age: 42,
    gender: "女",
    weight: "58.0",
    height: "160",
    bmi: "22.7",
    bloodPressure: "110/70",
    occupation: "教师",
    createdAt: new Date("2025-01-08T14:20:00"),
    isLatestVersion: false
  },
  {
    id: "mock-user-005",
    name: "李四",
    phone: "13900139001",
    phoneGroupId: "group-002",
    age: 42,
    gender: "女",
    weight: "56.5",
    height: "160",
    bmi: "22.1",
    bloodPressure: "108/68",
    occupation: "教师",
    createdAt: new Date("2025-01-18T15:30:00"),
    isLatestVersion: true
  }
];

// 模拟用户完整数据（包含症状、健康分析等）
export const MOCK_USER_FULL_DATA: Record<string, MockFullUserData> = {
  "mock-user-001": {
    id: "mock-user-001",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "75.5",
    height: "175",
    bmi: "24.7",
    bloodPressure: "120/80",
    occupation: "程序员",
    createdAt: new Date("2025-01-10T08:30:00"),
    isLatestVersion: false,
    symptomChecks: [
      {
        id: "symptom-001",
        userId: "mock-user-001",
        checkedSymptoms: [1, 3, 5, 8, 12, 15],
        totalScore: 18,
        checkedAt: new Date("2025-01-10T08:35:00")
      }
    ],
    healthAnalysis: [
      {
        id: "analysis-001",
        userId: "mock-user-001",
        qiAndBlood: 55,
        circulation: 60,
        toxins: 45,
        bloodLipids: 65,
        coldness: 50,
        immunity: 58,
        emotions: 62,
        overallHealth: 56,
        analyzedAt: new Date("2025-01-10T08:40:00")
      }
    ],
    userChoices: [
      {
        id: "choice-001",
        userId: "mock-user-001",
        planType: "气血调理",
        planDescription: "补气血方案，推荐红枣、桂圆等食物",
        selectedAt: new Date("2025-01-10T08:45:00")
      }
    ],
    requirements: {
      id: "req-001",
      userId: "mock-user-001",
      requirement1Completed: true,
      requirement2Completed: false,
      requirement3Completed: true,
      requirement4Completed: false,
      completedAt: null
    }
  },
  "mock-user-002": {
    id: "mock-user-002",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "73.0",
    height: "175",
    bmi: "23.9",
    bloodPressure: "118/78",
    occupation: "程序员",
    createdAt: new Date("2025-01-15T09:15:00"),
    isLatestVersion: false,
    symptomChecks: [
      {
        id: "symptom-002",
        userId: "mock-user-002",
        checkedSymptoms: [1, 2, 5, 9, 13],
        totalScore: 15,
        checkedAt: new Date("2025-01-15T09:20:00")
      }
    ],
    healthAnalysis: [
      {
        id: "analysis-002",
        userId: "mock-user-002",
        qiAndBlood: 62,
        circulation: 65,
        toxins: 52,
        bloodLipids: 68,
        coldness: 55,
        immunity: 63,
        emotions: 68,
        overallHealth: 62,
        analyzedAt: new Date("2025-01-15T09:25:00")
      }
    ],
    userChoices: [
      {
        id: "choice-002",
        userId: "mock-user-002",
        planType: "全面调理",
        planDescription: "综合调理方案，注重气血循环",
        selectedAt: new Date("2025-01-15T09:30:00")
      }
    ],
    requirements: {
      id: "req-002",
      userId: "mock-user-002",
      requirement1Completed: true,
      requirement2Completed: true,
      requirement3Completed: true,
      requirement4Completed: false,
      completedAt: null
    }
  },
  "mock-user-003": {
    id: "mock-user-003",
    name: "张三",
    phone: "13800138001",
    phoneGroupId: "group-001",
    age: 35,
    gender: "男",
    weight: "71.5",
    height: "175",
    bmi: "23.4",
    bloodPressure: "115/75",
    occupation: "程序员",
    createdAt: new Date("2025-01-20T10:00:00"),
    isLatestVersion: true,
    symptomChecks: [
      {
        id: "symptom-003",
        userId: "mock-user-003",
        checkedSymptoms: [2, 6, 10, 14],
        totalScore: 12,
        checkedAt: new Date("2025-01-20T10:05:00")
      }
    ],
    healthAnalysis: [
      {
        id: "analysis-003",
        userId: "mock-user-003",
        qiAndBlood: 68,
        circulation: 70,
        toxins: 58,
        bloodLipids: 72,
        coldness: 60,
        immunity: 70,
        emotions: 75,
        overallHealth: 68,
        analyzedAt: new Date("2025-01-20T10:10:00")
      }
    ],
    userChoices: [
      {
        id: "choice-003",
        userId: "mock-user-003",
        planType: "循环改善",
        planDescription: "加强循环系统，推荐有氧运动",
        selectedAt: new Date("2025-01-20T10:15:00")
      }
    ],
    requirements: {
      id: "req-003",
      userId: "mock-user-003",
      requirement1Completed: true,
      requirement2Completed: true,
      requirement3Completed: true,
      requirement4Completed: true,
      completedAt: new Date("2025-01-20T10:20:00")
    }
  },
  "mock-user-004": {
    id: "mock-user-004",
    name: "李四",
    phone: "13900139001",
    phoneGroupId: "group-002",
    age: 42,
    gender: "女",
    weight: "58.0",
    height: "160",
    bmi: "22.7",
    bloodPressure: "110/70",
    occupation: "教师",
    createdAt: new Date("2025-01-08T14:20:00"),
    isLatestVersion: false,
    symptomChecks: [
      {
        id: "symptom-004",
        userId: "mock-user-004",
        checkedSymptoms: [3, 7, 11, 16, 18],
        totalScore: 20,
        checkedAt: new Date("2025-01-08T14:25:00")
      }
    ],
    healthAnalysis: [
      {
        id: "analysis-004",
        userId: "mock-user-004",
        qiAndBlood: 58,
        circulation: 62,
        toxins: 50,
        bloodLipids: 60,
        coldness: 55,
        immunity: 60,
        emotions: 65,
        overallHealth: 58,
        analyzedAt: new Date("2025-01-08T14:30:00")
      }
    ],
    userChoices: [
      {
        id: "choice-004",
        userId: "mock-user-004",
        planType: "毒素清理",
        planDescription: "排毒养颜方案，推荐绿茶、蔬菜",
        selectedAt: new Date("2025-01-08T14:35:00")
      }
    ],
    requirements: {
      id: "req-004",
      userId: "mock-user-004",
      requirement1Completed: true,
      requirement2Completed: false,
      requirement3Completed: true,
      requirement4Completed: false,
      completedAt: null
    }
  },
  "mock-user-005": {
    id: "mock-user-005",
    name: "李四",
    phone: "13900139001",
    phoneGroupId: "group-002",
    age: 42,
    gender: "女",
    weight: "56.5",
    height: "160",
    bmi: "22.1",
    bloodPressure: "108/68",
    occupation: "教师",
    createdAt: new Date("2025-01-18T15:30:00"),
    isLatestVersion: true,
    symptomChecks: [
      {
        id: "symptom-005",
        userId: "mock-user-005",
        checkedSymptoms: [4, 8, 12],
        totalScore: 14,
        checkedAt: new Date("2025-01-18T15:35:00")
      }
    ],
    healthAnalysis: [
      {
        id: "analysis-005",
        userId: "mock-user-005",
        qiAndBlood: 65,
        circulation: 68,
        toxins: 56,
        bloodLipids: 64,
        coldness: 60,
        immunity: 66,
        emotions: 72,
        overallHealth: 64,
        analyzedAt: new Date("2025-01-18T15:40:00")
      }
    ],
    userChoices: [
      {
        id: "choice-005",
        userId: "mock-user-005",
        planType: "情绪管理",
        planDescription: "情绪调节方案，推荐瑜伽、冥想",
        selectedAt: new Date("2025-01-18T15:45:00")
      }
    ],
    requirements: {
      id: "req-005",
      userId: "mock-user-005",
      requirement1Completed: true,
      requirement2Completed: true,
      requirement3Completed: true,
      requirement4Completed: true,
      completedAt: new Date("2025-01-18T15:50:00")
    }
  }
};

// 模拟API：获取用户历史记录
export const mockFetchUserHistory = async (phone: string, name?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let users = MOCK_USER_HISTORY;
      
      if (phone) {
        users = users.filter(u => u.phone === phone);
      } else if (name) {
        users = users.filter(u => u.name?.includes(name));
      }
      
      resolve({
        success: true,
        users: users
      });
    }, 300); // 模拟网络延迟
  });
};

// 模拟API：获取用户完整数据
export const mockFetchUserFullData = async (userId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userData = MOCK_USER_FULL_DATA[userId];
      
      if (userData) {
        resolve({
          success: true,
          data: { user: userData }
        });
      } else {
        resolve({
          success: false,
          error: "用户数据不存在"
        });
      }
    }, 300);
  });
};
