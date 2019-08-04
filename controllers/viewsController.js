const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

async function getOverview(req, res, next) {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
}

async function getTour(req, res, next) {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError(404, 'There is no tour with that name.'));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
}

function getLoginForm(req, res, next) {
  if (res.locals.user) res.redirect('/me');

  res.status(200).render('login', {
    title: 'Login to your account'
  });
}
function getSignupForm(req, res, next) {
  if (res.locals.user) res.redirect('/me');

  res.status(200).render('signup', {
    title: 'Create your account'
  });
}

function getAccount(req, res) {
  res.status(200).render('account', {
    title: 'Your account'
  });
}

async function getMyBookings(req, res, next) {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map(booking => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
}

function alerts(req, res, next) {
  const { alert } = req.query;

  if (alert === 'booking') res.locals.alert = 'Your Booking was successful!';

  next();
}

module.exports = {
  getOverview: catchAsync(getOverview),
  getTour: catchAsync(getTour),
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyBookings: catchAsync(getMyBookings),
  alerts
};
