// frontend/src/contexts/JobContext.tsx
import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { Job, JobFilters as BaseJobFilters } from '../types';
import { jobService } from '../services/jobService';

// 🎯 تعريف أنواع البيانات
export interface JobFilters extends BaseJobFilters {
  page?: number;
  limit?: number;
}

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  loading: boolean;
  error: string | null;
}

// أنواع الـ Actions
type JobAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'SET_SELECTED_JOB'; payload: Job | null }
  | { type: 'SET_FILTERS'; payload: JobFilters }
  | { type: 'SET_ERROR'; payload: string | null };

// واجهة الـ Context
interface JobContextType {
  state: JobState;
  actions: {
    fetchJobs: (filters?: JobFilters) => Promise<void>;
    fetchJobById: (id: number) => Promise<void>;
    applyFilters: (filters: JobFilters) => void;
    clearFilters: () => void;
    clearError: () => void;
    setSelectedJob: (job: Job | null) => void;
  };
}

// الحالة الأولية
const initialState: JobState = {
  jobs: [],
  selectedJob: null,
  filters: {
    search: '',
    location: '',
    employment_type: '',
    page: 1,
    limit: 10
  },
  loading: false,
  error: null,
};

// الـ Reducer الرئيسي
const jobReducer = (state: JobState, action: JobAction): JobState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_JOBS':
      return { 
        ...state, 
        jobs: action.payload, 
        error: null,
        loading: false 
      };

    case 'SET_SELECTED_JOB':
      return { 
        ...state, 
        selectedJob: action.payload,
        loading: false 
      };

    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };

    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };

    default:
      return state;
  }
};

// إنشاء Context
const JobContext = createContext<JobContextType | undefined>(undefined);

// مكون Provider
export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);
  const [isFetching, setIsFetching] = useState(false);

  // 🔄 جلب جميع الوظائف
  const fetchJobs = useCallback(async (filters?: JobFilters): Promise<void> => {
    if (isFetching) return;
    
    setIsFetching(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const jobs = await jobService.jobs.getAll(filters || state.filters);
      dispatch({ type: 'SET_JOBS', payload: jobs });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, state.filters]);

  // 🔍 جلب وظيفة محددة
  const fetchJobById = useCallback(async (id: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const job = await jobService.jobs.getById(id);
      dispatch({ type: 'SET_SELECTED_JOB', payload: job });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // 🎯 تطبيق الفلترز
  const applyFilters = useCallback((newFilters: JobFilters): void => {
    const updatedFilters = { ...state.filters, ...newFilters, page: 1 };
    dispatch({ type: 'SET_FILTERS', payload: updatedFilters });
    fetchJobs(updatedFilters);
  }, [state.filters, fetchJobs]);

  // 🗑️ مسح الفلترز
  const clearFilters = useCallback((): void => {
    const resetFilters = {
      search: '',
      location: '',
      employment_type: '',
      page: 1,
      limit: 10
    };
    
    dispatch({ type: 'SET_FILTERS', payload: resetFilters });
    fetchJobs(resetFilters);
  }, [fetchJobs]);

  // ❌ مسح الخطأ
  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // 👆 تحديد وظيفة
  const setSelectedJob = useCallback((job: Job | null): void => {
    dispatch({ type: 'SET_SELECTED_JOB', payload: job });
  }, []);

  // 📦 تجميع جميع الـ Actions
  const actions = {
    fetchJobs,
    fetchJobById,
    applyFilters,
    clearFilters,
    clearError,
    setSelectedJob,
  };

  // 🔄 جلب البيانات الأولية تلقائياً
  useEffect(() => {
    fetchJobs();
  }, []);

  // قيمة الـ Context
  const contextValue: JobContextType = {
    state,
    actions
  };

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

// Hook للاستخدام في المكونات
export const useJobs = (): JobContextType => {
  const context = useContext(JobContext);
  
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  
  return context;
};