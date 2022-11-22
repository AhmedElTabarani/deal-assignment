require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const errorController = require('./controllers/error.controller');
const AppError = require('./utils/AppError');

const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.routes');
const commentRouter = require('./routes/comment.routes');
const interactionRouter = require('./routes/interaction.routes');
const adminRouter = require('./routes/admin.routes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security headers
app.use(helmet());

app.use(
  rateLimit({
    max: 500,
    windowMs: 60 * 60 * 1000,
    message:
      'Too many requests from this IP, please try again in an hour!',
  })
);

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/interactions', interactionRouter);
app.use('/api/admin', adminRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't ${req.method} ${req.url}`, 501));
});

app.use(errorController.globalErrorHandler);

module.exports = app;
