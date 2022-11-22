const {
  sendDevError,
  sendProdError,
  sendUnknownError,
} = require('./sendError');

module.exports.sendSuccess = (data, statusCode, res, extra = {}) => {
  if (statusCode === 204)
    return res.status(statusCode).json({
      status: 'success',
      data: null,
    });

  res.status(statusCode).json({
    status: 'success',
    data: data,
    ...extra,
  });
};

module.exports.sendError = (err, res) => {
  const env = process.env.NODE_ENV;
  if (env === 'development' || env === 'test')
    return sendDevError(err, res);

  // in production
  if (err.isOperational) return sendProdError(err, res);

  // unknown error
  sendUnknownError(err, res);
};
