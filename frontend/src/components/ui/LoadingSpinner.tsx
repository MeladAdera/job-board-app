// frontend/src/components/ui/LoadingSpinner.tsx
import React, { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
  speed?: 'slow' | 'medium' | 'fast'; // 🆕 خاصية السرعة الجديدة
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'جاري التحميل...',
  className = '',
  speed = 'medium' // 🆕 سرعة متوسطة افتراضياً
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  // 🆕 كلاسات السرعة المعدلة
  const speedClasses = {
    slow: 'duration-1500',    // ⏳ 1.5 ثانية - بطيء
    medium: 'duration-700',   // ⚡ 0.7 ثانية - متوسط (محسن)
    fast: 'duration-300'      // 🚀 0.3 ثانية - سريع
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner محسن */}
      <div 
        className={`
          ${sizeClasses[size]}
          ${speedClasses[speed]} // 🆕 نضيف السرعة هنا
          animate-spin rounded-full 
          border-3 border-gray-200 border-t-blue-500 // 🆕 سمك وإلوان محسنة
        `}
      />
      
      {/* Text محسن */}
      {text && (
        <p className="mt-3 text-sm text-gray-700 font-medium"> {/* 🆕 تحسينات النص */}
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;