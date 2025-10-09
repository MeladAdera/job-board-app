// src/utils/errors/AppError.js
// const error = new Error("hello world")
// error.message = ""



// class MiladError extends Error {
//   constructor(message) {
//     super(message)
//   }
// }


// const miladError = new MiladError("marhaba")

// miladError.message = "hello"

// const miladObject = new Error("hello ")
// miladObject.statusCode = 
// 🔹 الخطأ الأساسي
class AppError extends Error {
  constructor(message, statusCode ,name) {
    super(message);
    this.statusCode = statusCode;
    this.name = name
    
    // يحفظ مكان الخطأ في الـ stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// 🔹 خطأ 404 - لم يتم العثور على المورد
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// 🔹 خطأ 400 - تحقق من البيانات
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = "ValidationError";
  }
}



// 🔹 خطأ 401 - غير مصرح
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

// 🔹 خطأ 403 - ممنوع
class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError
};