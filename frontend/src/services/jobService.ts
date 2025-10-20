// frontend/src/services/jobService.ts
import api from './apiService';
import type { Job } from '../types';
import { handleApiError } from './apiService';
import {JobFilters} from '../types/index'



export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range: string;
  employment_type: string;
  skills: string[];
}

export interface UpdateJobData extends Partial<CreateJobData> {}
// 🎯 الخدمة الرئيسية
export const jobService = {
  // 📊 جلب البيانات (للجميع)
  jobs: {
    /**
     * جلب جميع الوظائف مع إمكانية التصفية
     */
    getAll: async (filters?: JobFilters): Promise<Job[]> => {
      try {
        const response = await api.get('/jobs', { 
          params: filters 
        });
        
        // 💡 نعود البيانات من response.data (حسب هيكل الـ API)
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * جلب وظيفة محددة بالـ ID
     */
    getById: async (id: number): Promise<Job> => {
      try {
        const response = await api.get(`/jobs/${id}`);
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ⚡ الإدارة (للمسؤولين فقط)
  management: {
    /**
     * إنشاء وظيفة جديدة
     */
    create: async (jobData: CreateJobData): Promise<Job> => {
      try {
        const response = await api.post('/jobs', jobData);
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * تحديث وظيفة موجودة
     */
    update: async (id: number, jobData: UpdateJobData): Promise<Job> => {
      try {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * حذف وظيفة
     */
    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/jobs/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // 🔍 البحث (إضافي - يمكن تطويره لاحقاً)
  search: {
    /**
     * البحث في الوظائف
     */
    byQuery: async (query: string, filters?: JobFilters): Promise<Job[]> => {
      try {
        const response = await api.get('/jobs', {
          params: { search: query, ...filters }
        });
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  }
};


// 🛠 دوال مساعدة إضافية
export const jobUtils = {
  /**
   * تحويل بيانات التصفية لـ query string
   */
  buildQueryString: (filters: JobFilters): string => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  },

  /**
   * تجهيز بيانات إنشاء وظيفة (تحقق مبدئي)
   */
  validateJobData: (jobData: CreateJobData): boolean => {
    const requiredFields = ['title', 'company', 'location', 'description'];
    return requiredFields.every(field => 
      jobData[field as keyof CreateJobData]?.toString().trim().length > 0
    );
  }
};
// 📦 تصدير الخدمة
export default jobService;

// يمكن استيراد الدوال individually أو ككل
export const { 
  jobs, 
  management, 
  search 
} = jobService;
