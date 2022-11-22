module.exports.sendDevError = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

module.exports.sendProdError = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports.sendUnknownError = (err, res) => {
  console.error('Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Unknown error',
  });
};
