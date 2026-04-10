const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
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
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    skinTypes: {
      type: [String],
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
      default: ['all'],
    },
    concerns: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    priceRange: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury'],
      required: [true, 'Price range is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    buyUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dermatologistApproved: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ skinTypes: 1 });
productSchema.index({ concerns: 1 });
productSchema.index({ priceRange: 1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
