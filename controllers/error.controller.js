const { sendError } = require('../utils/sendResponse');
const errorDetection = require('../utils/errorDetection');

class ErrorController {
  globalErrorHandler = (err, req, res, next) => {
    err = errorDetection(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    sendError(err, res);
  };
}

module.exports = new ErrorController();
