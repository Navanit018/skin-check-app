const mongoose = require('mongoose');

const routineStepSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    productCategory: {
      type: String,
      enum: [
        'cleanser',
        'toner',
        'serum',
        'moisturizer',
        'sunscreen',
        'treatment',
        'mask',
        'eye-cream',
        'lip-care',
        'body-care',
        'makeup-remover',
        'exfoliant',
      ],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    instruction: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Routine name is required'],
      trim: true,
      maxlength: [100, 'Routine name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
    },
    morning: [routineStepSchema],
    evening: [routineStepSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

routineSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Routine', routineSchema);
