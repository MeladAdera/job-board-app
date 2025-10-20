// frontend/src/pages/CreateJobPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { jobService } from '../services/jobService';
import type { CreateJobData } from '../services/jobService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// أنواع التوظيف المتاحة
const employmentTypes = [
  'دوام كامل',
  'دوام جزئي', 
  'عن بعد',
  'تعاقد',
  'تدريب'
];

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // حالة النموذج الأساسية
  const initialJobData: CreateJobData = {
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary_range: '',
    employment_type: 'دوام كامل',
    skills: []
  };

  // 🎯 إدارة حالة النموذج
  const [jobData, setJobData] = useState<CreateJobData>(initialJobData);
  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 🛡️ التحقق من أن المستخدم مسؤول توظيف
  useEffect(() => {
    if (user && user.role !== 'recruiter') {
      navigate('/dashboard', { 
        replace: true,
        state: { error: 'ليس لديك صلاحية لنشر الوظائف' }
      });
    }
  }, [user, navigate]);

  // 🛠️ إضافة مهارة جديدة
  const addSkill = () => {
    if (currentSkill.trim() && !jobData.skills.includes(currentSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  // 🗑️ حذف مهارة
  const removeSkill = (skillToRemove: string) => {
    setJobData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // ✅ التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // التحقق من الحقول المطلوبة
    if (!jobData.title.trim()) newErrors.title = 'عنوان الوظيفة مطلوب';
    if (!jobData.company.trim()) newErrors.company = 'اسم الشركة مطلوب';
    if (!jobData.location.trim()) newErrors.location = 'موقع العمل مطلوب';
    if (!jobData.description.trim()) newErrors.description = 'وصف الوظيفة مطلوب';
    if (!jobData.requirements.trim()) newErrors.requirements = 'المتطلبات مطلوبة';
    if (!jobData.salary_range.trim()) newErrors.salary_range = 'نطاق الراتب مطلوب';

    // التحقق من الطول الأدنى
    if (jobData.description.trim().length < 50) {
      newErrors.description = 'وصف الوظيفة يجب أن يكون至少 50 حرف';
    }

    if (jobData.requirements.trim().length < 30) {
      newErrors.requirements = 'المتطلبات يجب أن تكون至少 30 حرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📤 إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await jobService.management.create(jobData);
      
      navigate('/recruiter/dashboard', {
        state: { message: 'تم نشر الوظيفة بنجاح!' }
      });
      
    } catch (error: any) {
      setSubmitError(error.message || 'فشل في نشر الوظيفة. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // إذا لم يكن المستخدم مسؤولاً، لا تعرض anything
  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
       <LoadingSpinner 
  size="medium"
  speed="medium"
  text="جاري التحقق من الصلاحيات..." 
/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* 🧭 شريط التنقل */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← العودة للوحة التحكم
          </button>
        </div>

        {/* 🎯 عنوان الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            نشر وظيفة جديدة
          </h1>
          <p className="text-gray-600">
            املأ البيانات التالية لنشر وظيفة جديدة على المنصة
          </p>
        </div>

        {/* 📋 النموذج الرئيسي */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          
          {/* ❌ خطأ الإرسال العام */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 ml-2">⚠️</span>
                <span className="text-red-800">{submitError}</span>
              </div>
            </div>
          )}

          {/* 📝 القسم 1: المعلومات الأساسية */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              المعلومات الأساسية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* عنوان الوظيفة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الوظيفة *
                </label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: مطور ويب Frontend"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* اسم الشركة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الشركة *
                </label>
                <input
                  type="text"
                  value={jobData.company}
                  onChange={(e) => setJobData(prev => ({ ...prev, company: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: شركة التقنية المحدودة"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company}</p>
                )}
              </div>

              {/* موقع العمل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موقع العمل *
                </label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: الرياض، السعودية"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* نوع الوظيفة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الوظيفة *
                </label>
                <select
                  value={jobData.employment_type}
                  onChange={(e) => setJobData(prev => ({ ...prev, employment_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {employmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* 📄 القسم 2: التفاصيل والراتب */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              التفاصيل والراتب
            </h2>
            
            <div className="space-y-6">
              
              {/* وصف الوظيفة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الوظيفة *
                </label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="صف المهام والمسؤوليات المطلوبة لهذه الوظيفة..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {jobData.description.length}/50 حرف (至少 50 حرف مطلوب)
                </p>
              </div>

              {/* المتطلبات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المتطلبات والمؤهلات *
                </label>
                <textarea
                  value={jobData.requirements}
                  onChange={(e) => setJobData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.requirements ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="اذكر المهارات والخبرات والشهادات المطلوبة..."
                />
                {errors.requirements && (
                  <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {jobData.requirements.length}/30 حرف (至少 30 حرف مطلوب)
                </p>
              </div>

              {/* نطاق الراتب */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق الراتب *
                </label>
                <input
                  type="text"
                  value={jobData.salary_range}
                  onChange={(e) => setJobData(prev => ({ ...prev, salary_range: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.salary_range ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: 10,000 - 15,000 ريال"
                />
                {errors.salary_range && (
                  <p className="text-red-600 text-sm mt-1">{errors.salary_range}</p>
                )}
              </div>

            </div>
          </div>

          {/* 🛠️ القسم 3: المهارات المطلوبة */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              المهارات المطلوبة
            </h2>
            
            <div className="space-y-4">
              
              {/* إدخال المهارات */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أضف مهارة مطلوبة..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة
                </button>
              </div>

              {/* عرض المهارات المضافة */}
              {jobData.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">المهارات المضافة:</p>
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 🎯 أزرار الإجراءات */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  جاري النشر...
                </>
              ) : (
                <>
                  📝 نشر الوظيفة
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;