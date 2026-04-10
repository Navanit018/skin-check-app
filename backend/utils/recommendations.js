const Product = require('../models/Product');

/**
 * Returns recommended products grouped by category.
 *
 * Priority scoring:
 *   +3 if skinType matches
 *   +2 per matching concern
 *   +1 if dermatologistApproved
 *
 * @param {string} skinType
 * @param {string[]} conditions  - condition names from skin analysis
 * @param {string[]} concerns    - concern keywords from skin analysis
 * @param {string|null} budget   - 'budget' | 'mid-range' | 'luxury' | null
 * @returns {Promise<Array>}     - up to 20 products sorted by relevance
 */
async function getProductRecommendations(skinType, conditions = [], concerns = [], budget = null) {
  const allConcerns = Array.from(new Set([...conditions, ...concerns]));

  const filter = {
    isActive: true,
    skinTypes: { $in: [skinType, 'all'] },
  };

  if (budget && ['budget', 'mid-range', 'luxury'].includes(budget)) {
    filter.priceRange = budget;
  }

  const products = await Product.find(filter).lean();

  const scored = products.map((product) => {
    let score = 0;

    // Skin type match (already filtered, give extra weight)
    if (product.skinTypes.includes(skinType)) score += 3;

    // Concern overlap
    const overlap = allConcerns.filter((c) => product.concerns.includes(c));
    score += overlap.length * 2;

    // Dermatologist approval bonus
    if (product.dermatologistApproved) score += 1;

    // Rating contribution
    score += (product.rating || 4.0) - 3.5;

    return { ...product, _relevanceScore: score };
  });

  // Sort by relevance then by category for variety
  scored.sort((a, b) => b._relevanceScore - a._relevanceScore || b.rating - a.rating);

  // Return top 2 per category (max 20 total)
  const byCategory = {};
  const result = [];

  for (const product of scored) {
    const cat = product.category;
    if (!byCategory[cat]) byCategory[cat] = 0;
    if (byCategory[cat] < 2) {
      byCategory[cat]++;
      const { _relevanceScore, ...cleanProduct } = product;
      result.push(cleanProduct);
    }
    if (result.length >= 20) break;
  }

  return result;
}

module.exports = { getProductRecommendations };
