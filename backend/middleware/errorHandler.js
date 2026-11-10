const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const payload = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
