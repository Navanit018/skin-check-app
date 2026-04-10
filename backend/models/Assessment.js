const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const routineStepSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    category: { type: String, required: true },
    instruction: { type: String, default: '' },
    duration: { type: String, default: '' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      required: true,
    },
    results: {
      skinType: {
        type: { type: String, enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'], default: 'normal' },
        score: { type: Number, default: 0, min: 0, max: 100 },
      },
      conditions: [conditionSchema],
      hydrationLevel: { type: Number, default: 0, min: 0, max: 100 },
      sensitivityLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'very-high'],
        default: 'low',
      },
      concerns: { type: [String], default: [] },
      overallScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    routine: {
      morning: [routineStepSchema],
      evening: [routineStepSchema],
    },
    status: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

assessmentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
