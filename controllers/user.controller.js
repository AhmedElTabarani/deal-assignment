const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const AppError = require('../utils/AppError');

class UserController {
  getAll = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    sendSuccess(users, 200, res);
  });
}

module.exports = new UserController();
