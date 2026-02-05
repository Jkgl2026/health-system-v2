/**
 * 客户端数据管理器
 * 用于 Cloudflare Pages 静态导出，使用 localStorage 存储数据
 */

export interface UserData {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  weight: string | null;
  height: string | null;
  bloodPressure: string | null;
  occupation: string | null;
  address: string | null;
  bmi: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomCheckData {
  id: string;
  userId: string;
  selectedSymptoms: number[];
  createdAt: string;
}

export interface HealthAnalysisData {
  id: string;
  userId: string;
  symptoms: number[];
  healthScore: number;
  createdAt: string;
}

export interface UserChoiceData {
  id: string;
  userId: string;
  choice: string;
  createdAt: string;
}

export interface RequirementData {
  id: string;
  userId: string;
  type: 'bodySymptoms' | 'badHabits' | 'symptoms300' | 'targetSymptoms';
  items: number[];
  createdAt: string;
}

class ClientDataManager {
  private readonly STORAGE_PREFIX = 'health_app_';
  private readonly USER_DATA_KEY = `${this.STORAGE_PREFIX}user_data`;
  private readonly SYMPTOM_CHECK_KEY = `${this.STORAGE_PREFIX}symptom_check`;
  private readonly HEALTH_ANALYSIS_KEY = `${this.STORAGE_PREFIX}health_analysis`;
  private readonly USER_CHOICE_KEY = `${this.STORAGE_PREFIX}user_choice`;
  private readonly REQUIREMENTS_KEY = `${this.STORAGE_PREFIX}requirements`;

  /**
   * 保存用户数据
   */
  saveUserData(userData: Partial<UserData>): UserData {
    const existingData = this.getUserData();
    
    const newData: UserData = {
      id: existingData?.id || this.generateId(),
      name: userData.name ?? existingData?.name ?? null,
      phone: userData.phone ?? existingData?.phone ?? null,
      email: userData.email ?? existingData?.email ?? null,
      age: userData.age ?? existingData?.age ?? null,
      gender: userData.gender ?? existingData?.gender ?? null,
      weight: userData.weight ?? existingData?.weight ?? null,
      height: userData.height ?? existingData?.height ?? null,
      bloodPressure: userData.bloodPressure ?? existingData?.bloodPressure ?? null,
      occupation: userData.occupation ?? existingData?.occupation ?? null,
      address: userData.address ?? existingData?.address ?? null,
      bmi: userData.bmi ?? existingData?.bmi ?? null,
      createdAt: existingData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(newData));
    return newData;
  }

  /**
   * 获取用户数据
   */
  getUserData(): UserData | null {
    try {
      const data = localStorage.getItem(this.USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * 保存症状检查数据
   */
  saveSymptomCheck(userId: string, selectedSymptoms: number[]): SymptomCheckData {
    const existingData = this.getSymptomCheck(userId);
    
    const newData: SymptomCheckData = {
      id: existingData?.id || this.generateId(),
      userId,
      selectedSymptoms,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.SYMPTOM_CHECK_KEY, JSON.stringify(newData));
    return newData;
  }

  /**
   * 获取症状检查数据
   */
  getSymptomCheck(userId: string): SymptomCheckData | null {
    try {
      const data = localStorage.getItem(this.SYMPTOM_CHECK_KEY);
      if (!data) return null;
      
      const parsedData = JSON.parse(data) as SymptomCheckData;
      return parsedData.userId === userId ? parsedData : null;
    } catch (error) {
      console.error('Error getting symptom check:', error);
      return null;
    }
  }

  /**
   * 保存健康分析数据
   */
  saveHealthAnalysis(userId: string, symptoms: number[], healthScore: number): HealthAnalysisData {
    const existingData = this.getHealthAnalysis(userId);
    
    const newData: HealthAnalysisData = {
      id: existingData?.id || this.generateId(),
      userId,
      symptoms,
      healthScore,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.HEALTH_ANALYSIS_KEY, JSON.stringify(newData));
    return newData;
  }

  /**
   * 获取健康分析数据
   */
  getHealthAnalysis(userId: string): HealthAnalysisData | null {
    try {
      const data = localStorage.getItem(this.HEALTH_ANALYSIS_KEY);
      if (!data) return null;
      
      const parsedData = JSON.parse(data) as HealthAnalysisData;
      return parsedData.userId === userId ? parsedData : null;
    } catch (error) {
      console.error('Error getting health analysis:', error);
      return null;
    }
  }

  /**
   * 保存用户选择
   */
  saveUserChoice(userId: string, choice: string): UserChoiceData {
    const existingData = this.getUserChoice(userId);
    
    const newData: UserChoiceData = {
      id: existingData?.id || this.generateId(),
      userId,
      choice,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.USER_CHOICE_KEY, JSON.stringify(newData));
    return newData;
  }

  /**
   * 获取用户选择
   */
  getUserChoice(userId: string): UserChoiceData | null {
    try {
      const data = localStorage.getItem(this.USER_CHOICE_KEY);
      if (!data) return null;
      
      const parsedData = JSON.parse(data) as UserChoiceData;
      return parsedData.userId === userId ? parsedData : null;
    } catch (error) {
      console.error('Error getting user choice:', error);
      return null;
    }
  }

  /**
   * 保存需求数据
   */
  saveRequirements(userId: string, type: RequirementData['type'], items: number[]): RequirementData {
    const existingData = this.getRequirements(userId);
    
    const newData: RequirementData = {
      id: existingData?.id || this.generateId(),
      userId,
      type,
      items,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.REQUIREMENTS_KEY, JSON.stringify(newData));
    return newData;
  }

  /**
   * 获取需求数据
   */
  getRequirements(userId: string): RequirementData | null {
    try {
      const data = localStorage.getItem(this.REQUIREMENTS_KEY);
      if (!data) return null;
      
      const parsedData = JSON.parse(data) as RequirementData;
      return parsedData.userId === userId ? parsedData : null;
    } catch (error) {
      console.error('Error getting requirements:', error);
      return null;
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData(): void {
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.SYMPTOM_CHECK_KEY);
    localStorage.removeItem(this.HEALTH_ANALYSIS_KEY);
    localStorage.removeItem(this.USER_CHOICE_KEY);
    localStorage.removeItem(this.REQUIREMENTS_KEY);
  }

  /**
   * 导出所有数据
   */
  exportAllData(): string {
    const data = {
      userData: this.getUserData(),
      symptomCheck: this.getUserData() ? this.getSymptomCheck(this.getUserData()!.id) : null,
      healthAnalysis: this.getUserData() ? this.getHealthAnalysis(this.getUserData()!.id) : null,
      userChoice: this.getUserData() ? this.getUserChoice(this.getUserData()!.id) : null,
      requirements: this.getUserData() ? this.getRequirements(this.getUserData()!.id) : null,
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.userData) {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data.userData));
      }
      if (data.symptomCheck) {
        localStorage.setItem(this.SYMPTOM_CHECK_KEY, JSON.stringify(data.symptomCheck));
      }
      if (data.healthAnalysis) {
        localStorage.setItem(this.HEALTH_ANALYSIS_KEY, JSON.stringify(data.healthAnalysis));
      }
      if (data.userChoice) {
        localStorage.setItem(this.USER_CHOICE_KEY, JSON.stringify(data.userChoice));
      }
      if (data.requirements) {
        localStorage.setItem(this.REQUIREMENTS_KEY, JSON.stringify(data.requirements));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// 导出单例
export const clientDataManager = new ClientDataManager();
