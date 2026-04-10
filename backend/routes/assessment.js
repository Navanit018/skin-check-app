const express = require('express');
const router = express.Router();
const {
  analyze,
  getHistory,
  getAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyze);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAssessment);
router.delete('/:id', protect, deleteAssessment);

module.exports = router;
