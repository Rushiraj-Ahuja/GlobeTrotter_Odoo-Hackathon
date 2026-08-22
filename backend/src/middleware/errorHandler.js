function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong on the server.';

  console.error('Unhandled error:', message);

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
