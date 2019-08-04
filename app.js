const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Set HTTP Security Headers
app.use(helmet());

// Logger for Development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Prevent Request Body Overload
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Prevent Malicious NoSQL Queries
app.use(mongoSanitize());

// Prevent Cross-Site-Scripting
app.use(xss());

// Compress Responses
app.use(compression());

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Limit Requests from an IP
app.use(
  '/api/',
  rateLimit({
    max: 120,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from your IP, Please try again in an hour.'
  })
);

app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(404, `Can not find '${req.originalUrl}' on the server! 😕`)
  );
});

app.use(globalErrorHandler);

module.exports = app;
