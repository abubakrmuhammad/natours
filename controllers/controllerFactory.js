const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

function getAll(Model) {
  return catchAsync(async function getAllTours(req, res, next) {
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    // Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.dbQuery;

    // Send Response
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs }
    });
  });
}

function getOne(Model, populateOptions) {
  return catchAsync(async function getTour(req, res, next) {
    let queryDB = Model.findById(req.params.id);
    if (populateOptions) queryDB = queryDB.populate(populateOptions);

    const doc = await queryDB;

    if (!doc) return next(new AppError(404, 'No Document found with that ID.'));

    res.status(200).json({
      status: 'success',
      data: { data: doc }
    });
  });
}

function createOne(Model) {
  return catchAsync(async function(req, res, next) {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc }
    });
  });
}

function updateOne(Model) {
  return catchAsync(async function(req, res, next) {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) return next(new AppError(404, 'No Document found with that ID.'));

    res.status(200).json({ status: 'success', data: { data: doc } });
  });
}

function deleteOne(Model) {
  return catchAsync(async function(req, res, next) {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(404, 'No Document found with that ID.'));

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne
};
