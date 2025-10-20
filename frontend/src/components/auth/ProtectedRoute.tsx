import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';    // ⬅️ تغيير من ../ إلى ../../
import { UserRole } from '../../types';                  // ⬅️ نفس التغيير

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * 🛡️ مكون لحماية المسارات
 * - يتحقق من تسجيل الدخول
 * - يتحقق من الصلاحيات إذا طُلب
 * - يوجه لصفحة Login إذا لزم
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 🎯 المعيار 1: التعامل مع حالة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحقق...</div>
      </div>
    );
  }

  // 🎯 المعيار 2: التحقق من المصادقة
  if (!isAuthenticated) {
    // حفظ المسار الحالي لإعادته بعد Login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🎯 المعيار 3: التحقق من الصلاحيات (إذا طُلب)
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</div>
      </div>
    );
  }

  // 🎯 المعيار 4: كل شيء صحيح - عرض المحتوى
  return <>{children}</>;
};

export default ProtectedRoute;