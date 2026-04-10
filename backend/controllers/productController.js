const Product = require('../models/Product');

const VALID_CATEGORIES = [
  'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen',
  'treatment', 'mask', 'eye-cream', 'lip-care', 'body-care',
];
const VALID_SKIN_TYPES = ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'];
const VALID_PRICE_RANGES = ['budget', 'mid-range', 'luxury'];
const VALID_SORT_FIELDS = ['rating', 'price', 'reviewCount', 'createdAt', 'name'];

/**
 * Coerces a value to a plain string and strips any object-like input to prevent
 * NoSQL operator injection via user-supplied query parameters.
 */
function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return '';
  return value;
}

const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    const category = safeString(req.query.category);
    if (category && VALID_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const skinType = safeString(req.query.skinType);
    if (skinType && VALID_SKIN_TYPES.includes(skinType)) {
      filter.skinTypes = { $in: [skinType, 'all'] };
    }

    if (req.query.concerns) {
      const concerns = safeString(req.query.concerns)
        .split(',')
        .map((c) => c.trim().replace(/[^a-zA-Z0-9\-_]/g, ''))
        .filter(Boolean);
      if (concerns.length > 0) filter.concerns = { $in: concerns };
    }

    const priceRange = safeString(req.query.priceRange);
    if (priceRange && VALID_PRICE_RANGES.includes(priceRange)) {
      filter.priceRange = priceRange;
    }

    if (req.query.dermatologistApproved === 'true') {
      filter.dermatologistApproved = true;
    }
    if (req.query.search) {
      const regex = new RegExp(safeString(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { brand: regex }];
    }

    const sortByRaw = safeString(req.query.sortBy);
    const sortField = VALID_SORT_FIELDS.includes(sortByRaw) ? sortByRaw : 'rating';
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
    const rawSkinType = safeString(req.body.skinType);
    const rawBudget = safeString(req.body.budget);

    if (!rawSkinType) {
      return res.status(400).json({ success: false, message: 'skinType is required.' });
    }

    if (!VALID_SKIN_TYPES.includes(rawSkinType)) {
      return res.status(400).json({ success: false, message: 'Invalid skin type.' });
    }

    // Sanitize concerns: accept only strings matching safe characters
    const rawConcerns = req.body.concerns;
    const concerns = Array.isArray(rawConcerns)
      ? rawConcerns
          .map((c) => safeString(c).replace(/[^a-zA-Z0-9\-_]/g, ''))
          .filter(Boolean)
      : [];

    const filter = {
      isActive: true,
      skinTypes: { $in: [rawSkinType, 'all'] },
    };

    if (concerns.length > 0) {
      filter.concerns = { $in: concerns };
    }

    if (rawBudget && VALID_PRICE_RANGES.includes(rawBudget)) {
      filter.priceRange = rawBudget;
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
