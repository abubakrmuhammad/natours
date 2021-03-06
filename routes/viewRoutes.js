const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewController.alerts);

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get(
  '/register',
  authController.isLoggedIn,
  viewController.getSignupForm
);

router.get('/me', authController.protect, viewController.getAccount);
router.get('/me/tours', authController.protect, viewController.getMyBookings);

module.exports = router;
