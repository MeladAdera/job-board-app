//frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../contexts/authContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              لوحة التحكم - {user?.role === 'candidate' ? 'مرشح' : 'مسؤول توظيف'}
            </h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* بطاقة معلومات المستخدم */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">معلومات الحساب</h3>
              <p className="text-gray-700"><strong>الاسم:</strong> {user?.name}</p>
              <p className="text-gray-700"><strong>البريد:</strong> {user?.email}</p>
              <p className="text-gray-700"><strong>الدور:</strong> {user?.role === 'candidate' ? 'مرشح' : 'مسؤول توظيف'}</p>
            </div>

            {/* إحصائيات سريعة */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">نظرة سريعة</h3>
              {user?.role === 'candidate' ? (
                <>
                  <p className="text-gray-700">✅ يمكنك التقديم على الوظائف</p>
                  <p className="text-gray-700">📊 تتبع طلبات التقديم</p>
                  <p className="text-gray-700">👤 إدارة سيرتك الذاتية</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700">✅ يمكنك نشر الوظائف</p>
                  <p className="text-gray-700">📊 إدارة المتقدمين</p>
                  <p className="text-gray-700">🏢 إدارة الشركة</p>
                </>
              )}
            </div>

            {/* إجراءات سريعة */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">إجراءات سريعة</h3>
              <div className="space-y-2">
                {user?.role === 'candidate' ? (
                  <>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                      📝 التقديم على الوظائف
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                      📄 إدارة السيرة الذاتية
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                      ➕ نشر وظيفة جديدة
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                      👥 إدارة المتقدمين
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* قسم للاختبار فقط */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 منطقة الاختبار</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 block p-2 bg-white rounded border">
                🛡️ /dashboard (محمي عام)
              </a>
              <a href="/candidate/dashboard" className="text-blue-600 hover:text-blue-800 block p-2 bg-white rounded border">
                👤 /candidate/dashboard (للمرشحين فقط)
              </a>
              <a href="/recruiter/dashboard" className="text-blue-600 hover:text-blue-800 block p-2 bg-white rounded border">
                👔 /recruiter/dashboard (للمسؤولين فقط)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;