const express = require('express');
const router = express.Router();
const {
  createRoutine,
  getUserRoutines,
  getRoutine,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').post(createRoutine).get(getUserRoutines);
router.route('/:id').get(getRoutine).put(updateRoutine).delete(deleteRoutine);

module.exports = router;
