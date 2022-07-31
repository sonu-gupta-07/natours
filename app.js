const path = require('path');

const express = require('express');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

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

const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'), 'views');

// 1) GLOBAL  MIDDLEWARES
// Serving Static files

app.use(express.static(path.join(__dirname, 'public')));

// Security http

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: []
    }
  })
);

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(express.json({ limit: '10Kb' }));

app.use(cookieParser());

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

//Test middleware

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
