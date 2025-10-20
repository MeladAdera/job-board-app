// frontend/src/pages/JobDetailsPage.tsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../contexts/JobContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, actions } = useJobs();

  useEffect(() => {
    if (id) {
      actions.fetchJobById(parseInt(id));
    }
  }, [id]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل تفاصيل الوظيفة..." />
      </div>
    );
  }

  if (!state.selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            الوظيفة غير موجودة
          </h1>
          <Link 
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للوظائف
          </Link>
        </div>
      </div>
    );
  }

  const job = state.selectedJob;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* زر العودة */}
        <Link 
          to="/jobs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← العودة للوظائف
        </Link>

        {/* بطاقة الوظيفة */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* الهيدر */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="ml-2">🏢</span>
                <span className="font-semibold">{job.company}</span>
              </div>
              <div className="flex items-center">
                <span className="ml-2">📍</span>
                <span>{job.location}</span>
              </div>
              {job.salary_range && (
                <div className="flex items-center">
                  <span className="ml-2">💰</span>
                  <span className="font-semibold">{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* التفاصيل الرئيسية */}
              <div className="lg:col-span-2">
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">وصف الوظيفة</h2>
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">المتطلبات</h2>
                  <p className="text-gray-700 leading-relaxed">{job.requirements}</p>
                </section>
              </div>

              {/* المعلومات الجانبية */}
              <div className="lg:col-span-1">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">معلومات سريعة</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">نوع الوظيفة:</span>
                      <p className="text-gray-600">{job.employment_type}</p>
                    </div>
                    
                    {job.skills && job.skills.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">المهارات المطلوبة:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-semibold text-gray-700">تاريخ النشر:</span>
                      <p className="text-gray-600">
                        {new Date(job.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  {/* زر التقديم */}
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-6">
                    📝 التقديم على الوظيفة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;