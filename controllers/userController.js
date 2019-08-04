const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory');

// const upload = multer({ dest: 'public/img/users' });

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else
    cb(new AppError(400, 'Not an image! Please upload only an image.'), false);
};

const uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter
}).single('photo');

async function resizeUserPhoto(req, res, next) {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
}

function filterObject(obj, ...allowedFields) {
  const newObj = {};

  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });

  return newObj;
}

function getMe(req, res, next) {
  req.params.id = req.user.id;

  next();
}

async function updateMe(req, res, next) {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        400,
        'This route is not for password updates. Please use /updateMyPassword'
      )
    );

  const filteredBody = filterObject(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}

async function deleteMe(req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
}

module.exports = {
  getAllUsers: factory.getAll(User),
  getUser: factory.getOne(User),
  updateUser: factory.updateOne(User),
  deleteUser: factory.deleteOne(User),
  getMe,
  updateMe: catchAsync(updateMe),
  deleteMe: catchAsync(deleteMe),
  uploadUserPhoto: uploadUserPhoto,
  resizeUserPhoto: catchAsync(resizeUserPhoto)
};
