/**
 * Routine Generator
 *
 * Builds morning and evening skincare routine steps from recommended products.
 * Each step contains: step number, productCategory, optional product ref, instruction, duration.
 */

const MORNING_TEMPLATE = [
  {
    step: 1,
    productCategory: 'cleanser',
    instruction: 'Gently massage onto damp skin in circular motions for 60 seconds, then rinse with lukewarm water.',
    duration: '60 seconds',
  },
  {
    step: 2,
    productCategory: 'toner',
    instruction: 'Apply to a cotton pad or directly to clean hands and pat gently into skin.',
    duration: '30 seconds',
  },
  {
    step: 3,
    productCategory: 'serum',
    instruction: 'Apply 2–3 drops to fingertips and press gently into skin until absorbed.',
    duration: '1–2 minutes',
  },
  {
    step: 4,
    productCategory: 'eye-cream',
    instruction: 'Using your ring finger, tap a pea-sized amount around the orbital bone.',
    duration: '30 seconds',
  },
  {
    step: 5,
    productCategory: 'moisturizer',
    instruction: 'Warm between fingertips and press into skin using upward strokes.',
    duration: '1 minute',
  },
  {
    step: 6,
    productCategory: 'sunscreen',
    instruction: 'Apply generously to face and neck as the final step. Reapply every 2 hours when outdoors.',
    duration: '1 minute',
  },
];

const EVENING_TEMPLATE = [
  {
    step: 1,
    productCategory: 'makeup-remover',
    instruction: 'Apply to a cotton pad and gently sweep across face, eyes, and lips to remove makeup.',
    duration: '1–2 minutes',
  },
  {
    step: 2,
    productCategory: 'cleanser',
    instruction: 'Double-cleanse with a gentle formula. Massage onto damp skin and rinse thoroughly.',
    duration: '60 seconds',
  },
  {
    step: 3,
    productCategory: 'toner',
    instruction: 'Pat onto skin to restore pH balance and prepare skin for treatments.',
    duration: '30 seconds',
  },
  {
    step: 4,
    productCategory: 'treatment',
    instruction: 'Apply targeted treatment to problem areas. Allow to absorb fully before layering.',
    duration: '2–3 minutes',
  },
  {
    step: 5,
    productCategory: 'serum',
    instruction: 'Apply 2–3 drops and press into skin. Layer lighter serums before heavier ones.',
    duration: '1–2 minutes',
  },
  {
    step: 6,
    productCategory: 'eye-cream',
    instruction: 'Gently tap around the eye area with your ring finger. Do not rub.',
    duration: '30 seconds',
  },
  {
    step: 7,
    productCategory: 'moisturizer',
    instruction: 'Apply a slightly richer moisturizer than your morning routine to support overnight repair.',
    duration: '1 minute',
  },
];

// Skin-type-specific instruction overrides
const SKIN_TYPE_OVERRIDES = {
  oily: {
    moisturizer: 'Apply a lightweight, oil-free moisturizer sparingly to avoid clogging pores.',
    cleanser: 'Use a foaming or gel cleanser to effectively remove excess oil.',
  },
  dry: {
    cleanser: 'Use a creamy, hydrating cleanser. Avoid rubbing — pat dry with a soft towel.',
    moisturizer: 'Apply a rich moisturizer to slightly damp skin to lock in hydration.',
  },
  sensitive: {
    cleanser: 'Use a fragrance-free, soap-free cleanser with cool to lukewarm water.',
    treatment: 'Introduce treatment products slowly — patch test first and start every third night.',
  },
  combination: {
    moisturizer: 'Apply a lightweight moisturizer all over; use a richer formula on dry patches only.',
    toner: 'Focus toner on the T-zone to control oil without over-drying cheeks.',
  },
};

/**
 * Finds the best product for a given category from the recommendations list.
 * Returns the product _id or null.
 */
function pickProduct(recommendations, category) {
  const product = recommendations.find((p) => p.category === category);
  return product ? product._id || product.id || null : null;
}

/**
 * Adds skin-type specific instruction overrides to a step.
 */
function applyOverride(step, skinType) {
  const overrides = SKIN_TYPE_OVERRIDES[skinType];
  if (overrides && overrides[step.productCategory]) {
    return { ...step, instruction: overrides[step.productCategory] };
  }
  return step;
}

/**
 * Adjusts routine based on skin conditions.
 * E.g. adds mask step for acne-prone skin, removes makeup-remover if not needed.
 */
function applyConditionAdjustments(morningSteps, eveningSteps, conditions) {
  const conditionNames = conditions.map((c) => (typeof c === 'string' ? c : c.name));

  const hasAcne = conditionNames.some((c) => c === 'acne' || c === 'blackheads');
  const hasAging = conditionNames.some((c) => c === 'fine-lines' || c === 'wrinkles');

  const adjustedEvening = [...eveningSteps];

  if (hasAcne) {
    const existingTreatmentIdx = adjustedEvening.findIndex((s) => s.productCategory === 'treatment');
    if (existingTreatmentIdx !== -1) {
      adjustedEvening[existingTreatmentIdx] = {
        ...adjustedEvening[existingTreatmentIdx],
        instruction:
          'Apply a salicylic acid or benzoyl peroxide treatment to active breakouts. Use sparingly and only on affected areas.',
      };
    }
  }

  if (hasAging) {
    const existingTreatmentIdx = adjustedEvening.findIndex((s) => s.productCategory === 'treatment');
    if (existingTreatmentIdx !== -1) {
      adjustedEvening[existingTreatmentIdx] = {
        ...adjustedEvening[existingTreatmentIdx],
        instruction:
          'Apply a retinol or retinoid treatment to clean, dry skin. Begin with 2–3 nights per week and increase gradually.',
      };
    }
  }

  return { morning: morningSteps, evening: adjustedEvening };
}

/**
 * Main routine generator.
 *
 * @param {string}   skinType        - 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal'
 * @param {Array}    conditions      - condition objects or name strings from skin analysis
 * @param {Array}    recommendations - product objects (must have category and _id)
 * @returns {{ morning: Array, evening: Array }}
 */
function generateRoutine(skinType, conditions = [], recommendations = []) {
  const morning = MORNING_TEMPLATE.map((template) => {
    const step = applyOverride({ ...template }, skinType);
    const productId = pickProduct(recommendations, step.productCategory);
    return {
      ...step,
      product: productId,
    };
  });

  const evening = EVENING_TEMPLATE.map((template) => {
    const step = applyOverride({ ...template }, skinType);
    const productId = pickProduct(recommendations, step.productCategory);
    return {
      ...step,
      product: productId,
    };
  });

  const adjusted = applyConditionAdjustments(morning, evening, conditions);

  return adjusted;
}

module.exports = { generateRoutine };
