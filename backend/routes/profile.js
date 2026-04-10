const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, uploadPhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(protect);

router.route('/').get(getProfile).put(updateProfile);
router.post('/photo', upload.single('avatar'), uploadPhoto);

module.exports = router;
