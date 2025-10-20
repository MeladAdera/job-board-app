import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import DashboardPage from './pages/DashboardPage';
import CreateJobPage from './pages/CreateJobPage'; // 🆕 استيراد CreateJobPage
import { JobProvider } from './contexts/JobContext';

// مكون التنقل مع حالة المستخدم
const Navigation = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              الرئيسية
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              الوظائف
            </Link>
            
            {/* روابط للمستخدمين المسجلين */}
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  لوحة التحكم
                </Link>
                {/* 🆕 رابط لنشر الوظائف للمسؤولين فقط */}
                {user.role === 'recruiter' && (
                  <Link 
                    to="/jobs/create" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    ➕ نشر وظيفة
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              // عرض عند تسجيل الدخول
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-gray-700 text-sm">
                  مرحباً، <strong>{user.name}</strong>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'candidate' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'candidate' ? 'مرشح' : 'مسؤول توظيف'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              // عرض عند عدم تسجيل الدخول
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  تسجيل الدخول
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

// المكون الرئيسي للتطبيق
const AppContent = () => {
  return (
    <div className="App pt-16"> {/* padding-top لتعويض الـ fixed navigation */}
      <Navigation />
      
      <Routes>
        {/* 🏠 المسارات العامة */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        {/* 🆕 مسار نشر الوظائف (للمسؤولين فقط) */}
        <Route path="/jobs/create" element={
          <ProtectedRoute requiredRole="recruiter">
            <CreateJobPage />
          </ProtectedRoute>
        } />

        {/* 🛡️ المسارات المحمية */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/candidate/dashboard" element={
          <ProtectedRoute requiredRole="candidate">
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/recruiter/dashboard" element={
          <ProtectedRoute requiredRole="recruiter">
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* 📄 صفحة 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-4">الصفحة غير موجودة</p>
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

// المكون الرئيسي مع AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <AppContent />
        </Router>
      </JobProvider>
    </AuthProvider>
  );
};

export default App;