//frontend/src/services/apiService.ts
import { toast } from 'react-hot-toast';

import axios from 'axios';

// 🔴 تحقق صارم في التطوير
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor لإضافة التوكن - مع إصلاح TypeScript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // ✅ الحل: تأكد من وجود headers أو أنشئها
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🅱️ Interceptor للأخطاء العامة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // سنستخدم router عندما يكون جاهزاً
    }
    return Promise.reject(error);
  }
);

// 🅰️ دالة مساعدة للتحكم الدقيق
export const handleApiError = (error: any): string => {
  const message = error.response?.data?.message || 'حدث خطأ غير متوقع';
  return message;
};

export default api;