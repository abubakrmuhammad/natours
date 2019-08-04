const AppError = require('../utils/appError');

function castErrorHandler(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(400, message);
}

function validationErrorHandler(err) {
  const errors = Object.values(err.errors).map(error => error.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(400, message);
}

function duplicateKeyHandler(err) {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Field Value: ${value} alreay exists. Please use another value.`;

  return new AppError(400, message);
}

function jwtErrorHandler() {
  return new AppError(401, 'Invalid Token. Please Login Again!');
}

function jwtTokenExpiredHandler() {
  return new AppError(401, 'Your token has been expired! Please Login Again.');
}

function sendErrorDev(err, req, res) {
  const { statusCode, status, message, stack } = err;

  if (req.originalUrl.startsWith('/api'))
    return res.status(statusCode).json({
      status,
      message,
      stack,
      error: err
    });

  console.error('Error 💥', err);
  return res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    message
  });
}

function sendErrorProd(err, req, res) {
  const { statusCode, status, message } = err;

  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(statusCode).json({
        status,
        message
      });

    console.error('Error 💥', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went Wrong!'
    });
  }

  if (err.isOperational)
    return res.status(statusCode).render('error', {
      title: 'Something went wrong!',
      message
    });

  console.error('Error 💥', err);

  res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    message: 'Please try again later.'
  });
}

module.exports = function(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = castErrorHandler(error);
    if (error.name === 'ValidationError') error = validationErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyHandler(error);
    if (error.name === 'JsonWebTokenError') error = jwtErrorHandler();
    if (error.name === 'TokenExpiredError') error = jwtTokenExpiredHandler();

    sendErrorProd(error, req, res);
  }
};
