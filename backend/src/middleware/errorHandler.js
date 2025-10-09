// src/middleware/errorHandler.js - النسخة المحسنة
const { AppError, ValidationError, UnauthorizedError } = require('../utils/errors/AppError');

const errorHandler = (err, req, res, next) => {



  // if (err instanceof ValidationError) {
  //   res.status(err.statusCode).json({
  //     zb: err.message
  //   })
  // }




  console.error('❌ Error:', err.message);

  // 🔹 معالجة أخطاء Multer
  // if (err.code === 'LIMIT_FILE_SIZE') {
  //   error = new ValidationError('File too large');
   
  // }
  
  // if (err.code === 'LIMIT_UNEXPECTED_FILE') {
  //   error = new ValidationError('Unexpected file field');
  // }

  // if (err.message.includes('File type not allowed')) {
  //   error = new ValidationError(err.message);
  // }

  // if (err instanceof AppError) {
  //   res.status(err.statusCode).json({
  //     message: err.message
  //   })
  // }

  if (err instanceof UnauthorizedError) {
    res.status(err.statusCode).json({
      message: err.message
    })
  }


// if (err instanceof UnauthorizedError) {
//   res.status(err.statusCode).json({
//     messagee: err.message
//   })
// }
  // 🔹 معالجة AppErrors المخصصة
  // if (err instanceof AppError) {
  //   return res.status(err.statusCode).json({
  //     success: false,
  //     error: err.message
  //   });
  // }

  // 🔹 الخطأ العام
  // res.status(500).json({
  //   success: false,
  //   error: err.message || 'Internal Server Error'
  // });
};

module.exports = errorHandler;