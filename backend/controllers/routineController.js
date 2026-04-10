const Routine = require('../models/Routine');
const Assessment = require('../models/Assessment');
const { generateRoutine } = require('../utils/routineGenerator');

const createRoutine = async (req, res, next) => {
  try {
    const { name, description, assessmentId, morning, evening } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Routine name is required.' });
    }

    let morningSteps = morning || [];
    let eveningSteps = evening || [];

    if (assessmentId) {
      const assessment = await Assessment.findById(assessmentId).populate('recommendations');
      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found.' });
      }
      if (assessment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const generated = generateRoutine(
        assessment.results.skinType.type,
        assessment.results.conditions,
        assessment.recommendations
      );
      morningSteps = generated.morning;
      eveningSteps = generated.evening;
    }

    const routine = await Routine.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      assessment: assessmentId || null,
      morning: morningSteps,
      evening: eveningSteps,
    });

    res.status(201).json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

const getUserRoutines = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.activeOnly !== 'false') filter.isActive = true;

    const routines = await Routine.find(filter)
      .sort({ createdAt: -1 })
      .populate('morning.product', 'name brand imageUrl price')
      .populate('evening.product', 'name brand imageUrl price')
      .populate('assessment', 'results.skinType createdAt');

    res.json({ success: true, count: routines.length, data: routines });
  } catch (err) {
    next(err);
  }
};

const getRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('morning.product')
      .populate('evening.product')
      .populate('assessment');

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found.' });
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

const updateRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found.' });
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allowedFields = ['name', 'description', 'morning', 'evening', 'isActive'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        routine[field] = req.body[field];
      }
    });

    await routine.save();

    res.json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

const deleteRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found.' });
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await routine.deleteOne();

    res.json({ success: true, message: 'Routine deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRoutine, getUserRoutines, getRoutine, updateRoutine, deleteRoutine };
