const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const User = require('./../models/userModel');

const AppError = require('./../utils/appError');

const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const catchAsync = require('./../utils/catchAsync');

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are valid

  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password'));
  }

  //check if user exist and password is valid

  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // if everything is good, login
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token); //

  if (!token) {
    return next(
      new AppError('You are not logged in. Log in now to get access.', 401)
    );
  }
  //2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user does not exist', 401));
  }
  //4) Check if user changed password after the token was issued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('The user recently changed password', 401));
  }

  req.user = freshUser;
  // grant acess to protected route
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array [admin, lead-guide] role is now just user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this role', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('This is no user with that email', 404));
  }
  //generate random token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //send it back as an email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? password Confirm to: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password has been reset',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email '
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending your password reset email'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) set new passsword if token nor expired
  if (!user) {
    return next(
      new AppError('Password reset token is invalid or expired', 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordReserToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) update the changedPasswordAt property for the user

  // 4) Log the user in, JWT

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) check if postd current password is correct;

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) if so , update password,

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log in user
  createSendToken(user, 201, res);
});
