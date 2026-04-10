const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { analyzeSkin } = require('../utils/skinAnalysis');
const { getProductRecommendations } = require('../utils/recommendations');
const { generateRoutine } = require('../utils/routineGenerator');

const analyze = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be a key-value object.' });
    }

    const requiredQuestions = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const missing = requiredQuestions.filter((q) => !answers[q]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required answers: ${missing.join(', ')}`,
      });
    }

    const results = analyzeSkin(answers);

    const recommendations = await getProductRecommendations(
      results.skinType.type,
      results.conditions.map((c) => c.name),
      results.concerns,
      null
    );

    const recommendationIds = recommendations.map((p) => p._id);

    const routine = generateRoutine(results.skinType.type, results.conditions, recommendations);

    const answersMap = new Map(Object.entries(answers));

    const assessment = await Assessment.create({
      user: req.user._id,
      answers: answersMap,
      results,
      recommendations: recommendationIds,
      routine,
      status: 'complete',
    });

    await User.findByIdAndUpdate(req.user._id, {
      'skinProfile.skinType': results.skinType.type,
      'skinProfile.concerns': results.concerns,
      'skinProfile.lastAssessment': new Date(),
    });

    const populated = await Assessment.findById(assessment._id).populate('recommendations');

    res.status(201).json({
      success: true,
      data: {
        assessment: populated,
        recommendations,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      Assessment.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recommendations', 'name brand category imageUrl price'),
      Assessment.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      count: assessments.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: assessments,
    });
  } catch (err) {
    next(err);
  }
};

const getAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate(
      'recommendations',
      'name brand category imageUrl price rating priceRange description'
    );

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await assessment.deleteOne();

    res.json({ success: true, message: 'Assessment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyze, getHistory, getAssessment, deleteAssessment };
