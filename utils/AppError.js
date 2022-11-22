module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = `${statusCode}`[0] === '4' ? 'fail' : 'error';
    this.statusCode = statusCode || 500;
    this.isOperation = true;

    Error.captureStackTrace(this, this.constructor);
  }
};
