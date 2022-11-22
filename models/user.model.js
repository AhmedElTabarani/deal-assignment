const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      validate: [isEmail, 'Email is not valid'],
    },
    role: {
      type: String,
      default: 'USER',
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) return next();

  this.passwordChangedAt = Date.now();

  this.password = await bcrypt.hash(
    this.password + process.env.SALT_PASSWORD,
    12
  );
  next();
});

userSchema.methods.isCorrectPassword = async function (
  testPassword,
  userPassword
) {
  return await bcrypt.compare(
    testPassword + process.env.SALT_PASSWORD,
    userPassword
  );
};

userSchema.methods.isPasswordChange = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // return true if jwt token time is (old) less than last time password changed
    return passwordChangedTimestamp > JWTTimestamp;
  }
  return false;
};
module.exports = mongoose.model('User', userSchema);
