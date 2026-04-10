const User = require('../models/User');
const Assessment = require('../models/Assessment');
const path = require('path');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const recentAssessments = await Assessment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('results.skinType results.overallScore results.concerns status createdAt');

    res.json({
      success: true,
      data: {
        user,
        recentAssessments,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'skinProfile', 'preferences'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const avatarPath = path.join('uploads', 'avatars', req.file.filename).replace(/\\/g, '/');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Profile photo updated successfully.',
      data: { avatar: avatarPath, user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadPhoto };
