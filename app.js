const express = require('express');
const morgan = require('morgan');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) GLOBAL  MIDDLEWARES

// Security http

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit api requests

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Two many requests from this IP, try again in an hour.'
});

app.use('/api', limiter);

// Body parser

app.use(express.json({ limit: '10Kb' }));

// Data Sanitisation against noSQL connection

app.use(mongoSanitize());

// Data Sanitisation against crossside scripting attacks XXS

app.use(xss());

//  Prevent parameter Polution

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage']
  })
);

// Serving Static files

app.use(express.static(`${__dirname}/public`));

//Test middleware

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
