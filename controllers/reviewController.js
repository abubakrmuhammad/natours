const Review = require('../models/reviewModel');
const factory = require('./controllerFactory');

function setTourAndUserIds(req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
}

module.exports = {
  setTourAndUserIds,
  getAllReviews: factory.getAll(Review),
  getReview: factory.getOne(Review),
  createReview: factory.createOne(Review),
  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review)
};
