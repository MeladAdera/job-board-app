// frontend/src/pages/JobsPage.tsx
import React, { useEffect } from 'react';
import { useJobs } from '../contexts/JobContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const JobsPage: React.FC = () => {
  const { state, actions } = useJobs();

  useEffect(() => {
    actions.fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          الوظائف المتاحة
        </h1>
        <p className="text-gray-600 mb-8">
          ابحث عن الوظيفة التي تناسب مهاراتك وطموحاتك
        </p>

        {/* حالة التحميل */}
        {state.loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner 
              size="large" 
              text="جاري تحميل الوظائف..." 
            />
          </div>
        )}

        {/* حالة الخطأ */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 ml-2">⚠️</span>
              <span className="text-red-800">{state.error}</span>
            </div>
            <button
              onClick={actions.clearError}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* حالة عدم وجود وظائف */}
        {!state.loading && state.jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد وظائف متاحة حالياً
            </h3>
            <p className="text-gray-500">
              قم بالتحقق لاحقاً أو تواصل مع المسؤولين
            </p>
          </div>
        )}

        {/* عرض الوظائف */}
        {!state.loading && state.jobs.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                عرض <span className="font-semibold">{state.jobs.length}</span> وظيفة
              </p>
              
              <button
                onClick={() => actions.fetchJobs()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 تحديث
              </button>
            </div>

            {/* شبكة الوظائف */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="ml-2">🏢</span>
                    <span>{job.company}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="ml-2">📍</span>
                    <span>{job.location}</span>
                  </div>

                  {job.salary_range && (
                    <div className="flex items-center text-green-600 mb-3">
                      <span className="ml-2">💰</span>
                      <span className="font-semibold">{job.salary_range}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString('ar-SA')}
                    </span>
                    
                    <button
                      onClick={() => actions.fetchJobById(job.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;