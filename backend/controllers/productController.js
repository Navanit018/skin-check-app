const Product = require('../models/Product');

const VALID_CATEGORIES = [
  'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen',
  'treatment', 'mask', 'eye-cream', 'lip-care', 'body-care',
];
const VALID_SKIN_TYPES = ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'];
const VALID_PRICE_RANGES = ['budget', 'mid-range', 'luxury'];

const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category;
    }
    if (req.query.skinType && VALID_SKIN_TYPES.includes(req.query.skinType)) {
      filter.skinTypes = { $in: [req.query.skinType, 'all'] };
    }
    if (req.query.concerns) {
      const concerns = req.query.concerns.split(',').map((c) => c.trim()).filter(Boolean);
      if (concerns.length > 0) filter.concerns = { $in: concerns };
    }
    if (req.query.priceRange && VALID_PRICE_RANGES.includes(req.query.priceRange)) {
      filter.priceRange = req.query.priceRange;
    }
    if (req.query.dermatologistApproved === 'true') {
      filter.dermatologistApproved = true;
    }
    if (req.query.search) {
      const regex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { brand: regex }];
    }

    const sortField = req.query.sortBy || 'rating';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const products = await Product.find({
      isActive: true,
      $or: [{ name: regex }, { brand: regex }, { description: regex }],
    })
      .sort({ rating: -1 })
      .limit(limit);

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true, category };
    if (req.query.skinType && VALID_SKIN_TYPES.includes(req.query.skinType)) {
      filter.skinTypes = { $in: [req.query.skinType, 'all'] };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ rating: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { skinType, concerns = [], budget } = req.body;

    if (!skinType) {
      return res.status(400).json({ success: false, message: 'skinType is required.' });
    }

    if (!VALID_SKIN_TYPES.includes(skinType)) {
      return res.status(400).json({ success: false, message: 'Invalid skin type.' });
    }

    const filter = {
      isActive: true,
      skinTypes: { $in: [skinType, 'all'] },
    };

    if (Array.isArray(concerns) && concerns.length > 0) {
      filter.concerns = { $in: concerns };
    }

    if (budget && VALID_PRICE_RANGES.includes(budget)) {
      filter.priceRange = budget;
    }

    const products = await Product.find(filter).sort({ dermatologistApproved: -1, rating: -1 }).limit(20);

    const grouped = VALID_CATEGORIES.reduce((acc, cat) => {
      const catProducts = products.filter((p) => p.category === cat);
      if (catProducts.length > 0) acc[cat] = catProducts;
      return acc;
    }, {});

    res.json({ success: true, count: products.length, data: grouped });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, searchProducts, getProduct, getByCategory, getRecommendations };
