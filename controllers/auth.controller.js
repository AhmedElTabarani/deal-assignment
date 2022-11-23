const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const AppError = require('../utils/AppError');

const generateToken = async (user) => {
  const token = await jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return token;
};
class AuthController {
  signup = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
    });

    user.password = undefined;
    const token = await generateToken(user);
    sendSuccess(user, 201, res, { token });
  });

  login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (
      !user ||
      !(await user.isCorrectPassword(password, user.password))
    )
      return next(new AppError('Email or password not correct', 401));

    user.password = undefined;
    const token = await generateToken(user);
    sendSuccess(user, 200, res, { token });
  });

  verification = asyncHandler(async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer'))
      token = authorization.split(' ')[1];

    if (!token)
      return next(new AppError('Please login or signup', 401));

    const data = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(data.id);
    if (!user)
      return next(
        new AppError('Not found user with this token', 401)
      );

    if (user.isPasswordChange(data.iat))
      return next(
        new AppError(
          'Unauthorized, You changed your password, Please login again',
          401
        )
      );

    req.user = user;
    next();
  });

  restrictTo = (role) => {
    return (req, res, next) => {
      if (req.user && req.user.role === role) return next();

      return next(
        new AppError(
          'You are not allow to perform this operation',
          403
        )
      );
    };
  };
}

module.exports = new AuthController();
