const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

function createSendToken(user, statusCode, res) {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.scure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

async function signup(req, res, next) {
  const { name, email, password, passwordConfirm, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  createSendToken(user, 201, res);
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email) return next(new AppError(400, 'Please provide an email'));
  if (!password) return next(new AppError(400, 'Please provide a password'));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError(401, 'Incorrect Email or Password'));

  createSendToken(user, 200, res);
}

function logout(req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
}

async function protect(req, res, next) {
  let token;

  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer'))
    token = authorization.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError(401, 'You are not logged in! Please Login to get access.')
    );

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user)
    return next(
      new AppError(
        401,
        'The user belonging to this token does no longer exist.'
      )
    );

  if (await user.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(401, 'User Recently changed password! Please Login Again.')
    );
  }

  req.user = user;
  res.locals.user = user;

  next();
}

async function isLoggedIn(req, res, next) {
  if (req.cookies.jwt) {
    try {
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decodedToken.id);

      if (!user) return next();

      if (await user.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }

      res.locals.user = user;

      return next();
    } catch (err) {
      return next();
    }
  }

  next();
}

function restrictTo(...roles) {
  return function(req, res, next) {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, 'You do not have permission to perform this action')
      );

    next();
  };
}

async function forgotPassword(req, res, next) {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError(404, 'There is no user with that email address'));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        500,
        'There was an error sending the email. Please Try again later.'
      )
    );
  }
}

async function resetPassword(req, res, next) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user)
    return next(
      new AppError(400, 'Invalid Token or the token has been expired')
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
}

async function updatePassword(req, res, next) {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong.', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
}

module.exports = {
  signup: catchAsync(signup),
  login: catchAsync(login),
  logout,
  protect: catchAsync(protect),
  restrictTo,
  forgotPassword: catchAsync(forgotPassword),
  resetPassword: catchAsync(resetPassword),
  updatePassword: catchAsync(updatePassword),
  isLoggedIn
};
