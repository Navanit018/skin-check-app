/**
 * Skin Analysis Engine
 *
 * Processes questionnaire answers and returns a detailed skin profile.
 *
 * Questions:
 *  q1  - Morning skin feel            (tight|normal|shiny|very-oily)
 *  q2  - Midday T-zone appearance     (same|slightly-oily|very-oily|dry)
 *  q3  - Breakout frequency           (rarely|sometimes|often|always)
 *  q4  - Reaction to new products     (fine|slightly-red|breaks-out|very-reactive)
 *  q5  - Skin texture                 (smooth|rough|uneven|bumpy)
 *  q6  - Enlarged pores               (no|a-few|moderate|many)
 *  q7  - Post-cleanse feeling         (comfortable|tight|dry|oily-within-hour)
 *  q8  - Redness / flushing           (never|sometimes|often|always)
 *  q9  - Dark spots / uneven tone     (no|a-few|moderate|many)
 *  q10 - Primary skin concern         (aging|acne|dryness|brightness|texture)
 *  q11 - Age range                    (teens|20s|30s|40s|50plus)
 *  q12 - Daily water intake (cups)    (less-than-4|4-6|6-8|more-than-8)
 *  q13 - SPF frequency                (never|sometimes|daily|always)
 *  q14 - Smoking / vaping             (no|occasionally|yes)
 *  q15 - Hours of sleep               (less-than-5|5-6|7-8|more-than-8)
 */

// ---------------------------------------------------------------------------
// Score maps — each answer yields a delta on the skin-type axis scores
// Axes: dry, oily, sensitive (normalness is inferred from the residual)
// ---------------------------------------------------------------------------

const SKIN_TYPE_SCORES = {
  q1: {
    tight: { dry: 3, oily: 0 },
    normal: { dry: 0, oily: 0 },
    shiny: { dry: 0, oily: 2 },
    'very-oily': { dry: 0, oily: 3 },
  },
  q2: {
    same: { dry: 0, oily: 0 },
    'slightly-oily': { dry: 0, oily: 1 },
    'very-oily': { dry: 0, oily: 3 },
    dry: { dry: 2, oily: 0 },
  },
  q7: {
    comfortable: { dry: 0, oily: 0 },
    tight: { dry: 2, oily: 0 },
    dry: { dry: 3, oily: 0 },
    'oily-within-hour': { dry: 0, oily: 3 },
  },
};

const SENSITIVITY_SCORES = {
  q4: { fine: 0, 'slightly-red': 1, 'breaks-out': 2, 'very-reactive': 3 },
  q8: { never: 0, sometimes: 1, often: 2, always: 3 },
};

const HYDRATION_PENALTIES = {
  q12: { 'less-than-4': -20, '4-6': -10, '6-8': 0, 'more-than-8': 5 },
  q15: { 'less-than-5': -15, '5-6': -5, '7-8': 0, 'more-than-8': 5 },
  q14: { no: 0, occasionally: -5, yes: -15 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function get(answers, key) {
  return answers[key] || (answers instanceof Map ? answers.get(key) : undefined) || '';
}

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Skin type determination
// ---------------------------------------------------------------------------

function determineSkinType(answers) {
  let dryScore = 0;
  let oilyScore = 0;

  Object.entries(SKIN_TYPE_SCORES).forEach(([qKey, map]) => {
    const answer = get(answers, qKey);
    if (map[answer]) {
      dryScore += map[answer].dry || 0;
      oilyScore += map[answer].oily || 0;
    }
  });

  const sensitivityScore = calcSensitivityRaw(answers);

  // Combination: both dry and oily signals
  if (dryScore >= 2 && oilyScore >= 2) {
    return { type: 'combination', score: clamp(70 - Math.abs(dryScore - oilyScore) * 3) };
  }

  if (sensitivityScore >= 4) {
    return { type: 'sensitive', score: clamp(65 + sensitivityScore * 3) };
  }

  if (dryScore >= oilyScore && dryScore >= 3) {
    return { type: 'dry', score: clamp(60 + dryScore * 5) };
  }

  if (oilyScore > dryScore && oilyScore >= 3) {
    return { type: 'oily', score: clamp(60 + oilyScore * 5) };
  }

  return { type: 'normal', score: 85 };
}

// ---------------------------------------------------------------------------
// Sensitivity
// ---------------------------------------------------------------------------

function calcSensitivityRaw(answers) {
  let score = 0;
  Object.entries(SENSITIVITY_SCORES).forEach(([qKey, map]) => {
    const answer = get(answers, qKey);
    score += map[answer] || 0;
  });
  return score;
}

function determineSensitivityLevel(answers) {
  const score = calcSensitivityRaw(answers);
  if (score >= 5) return 'very-high';
  if (score >= 3) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Hydration level
// ---------------------------------------------------------------------------

function calcHydrationLevel(answers) {
  let base = 70;

  // Dry skin signals lower hydration
  const q1 = get(answers, 'q1');
  const q7 = get(answers, 'q7');
  if (q1 === 'tight') base -= 15;
  if (q7 === 'tight' || q7 === 'dry') base -= 10;

  Object.entries(HYDRATION_PENALTIES).forEach(([qKey, map]) => {
    const answer = get(answers, qKey);
    base += map[answer] || 0;
  });

  return clamp(base);
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

function identifyConditions(answers) {
  const conditions = [];

  const q3 = get(answers, 'q3');
  const q6 = get(answers, 'q6');
  const q5 = get(answers, 'q5');
  const q8 = get(answers, 'q8');
  const q9 = get(answers, 'q9');
  const q4 = get(answers, 'q4');
  const q11 = get(answers, 'q11');
  const q1 = get(answers, 'q1');
  const q7 = get(answers, 'q7');

  // Acne
  if (q3 === 'often' || q3 === 'always') {
    conditions.push({
      name: 'acne',
      severity: q3 === 'always' ? 'severe' : 'moderate',
      description: 'Frequent breakouts indicate active acne-prone skin that benefits from targeted treatments.',
    });
  } else if (q3 === 'sometimes') {
    conditions.push({
      name: 'acne',
      severity: 'mild',
      description: 'Occasional breakouts suggesting mild acne tendency.',
    });
  }

  // Blackheads / enlarged pores
  if (q6 === 'many' || q6 === 'moderate') {
    conditions.push({
      name: 'enlarged-pores',
      severity: q6 === 'many' ? 'moderate' : 'mild',
      description: 'Visibly enlarged pores often associated with excess sebum production.',
    });
  }
  if (q6 !== 'no' && (get(answers, 'q2') === 'very-oily' || get(answers, 'q2') === 'slightly-oily')) {
    conditions.push({
      name: 'blackheads',
      severity: 'mild',
      description: 'Clogged pores and blackheads in oily areas.',
    });
  }

  // Dryness / flaking
  if ((q1 === 'tight' || q7 === 'dry') && get(answers, 'q12') === 'less-than-4') {
    conditions.push({
      name: 'dryness',
      severity: 'moderate',
      description: 'Significant dryness likely compounded by low water intake.',
    });
  } else if (q1 === 'tight' || q7 === 'dry' || q7 === 'tight') {
    conditions.push({
      name: 'dryness',
      severity: 'mild',
      description: 'Skin lacks adequate moisture, appearing tight or dry.',
    });
  }

  if (q5 === 'rough' && (q1 === 'tight' || q7 === 'dry')) {
    conditions.push({
      name: 'flaking',
      severity: 'mild',
      description: 'Rough texture with possible flaking associated with dehydrated skin.',
    });
  }

  // Rosacea / redness
  if (q8 === 'often' || q8 === 'always') {
    conditions.push({
      name: 'rosacea',
      severity: q8 === 'always' ? 'moderate' : 'mild',
      description: 'Persistent redness and flushing are hallmark signs of rosacea-prone skin.',
    });
  }
  if (q8 === 'sometimes' || q4 === 'very-reactive') {
    conditions.push({
      name: 'redness',
      severity: 'mild',
      description: 'Occasional redness and reactivity suggesting sensitive, easily irritated skin.',
    });
  }

  // Hyperpigmentation / dark spots
  if (q9 === 'many' || q9 === 'moderate') {
    conditions.push({
      name: 'hyperpigmentation',
      severity: q9 === 'many' ? 'moderate' : 'mild',
      description: 'Visible dark spots and uneven skin tone caused by excess melanin production.',
    });
  }

  // Melasma (age + dark spots)
  if ((q11 === '30s' || q11 === '40s' || q11 === '50plus') && (q9 === 'many' || q9 === 'moderate')) {
    conditions.push({
      name: 'melasma',
      severity: 'mild',
      description: 'Hormonal pigmentation changes common in the 30s and beyond.',
    });
  }

  // Fine lines / wrinkles
  if (q11 === '40s' || q11 === '50plus') {
    conditions.push({
      name: q11 === '50plus' ? 'wrinkles' : 'fine-lines',
      severity: q11 === '50plus' ? 'moderate' : 'mild',
      description: 'Age-related loss of collagen and elasticity leading to fine lines and wrinkles.',
    });
  } else if (q11 === '30s' && get(answers, 'q15') === 'less-than-5') {
    conditions.push({
      name: 'fine-lines',
      severity: 'mild',
      description: 'Early fine lines potentially accelerated by insufficient sleep.',
    });
  }

  // Dark circles (sleep-related)
  if (get(answers, 'q15') === 'less-than-5') {
    conditions.push({
      name: 'dark-circles',
      severity: 'mild',
      description: 'Under-eye darkness often exacerbated by lack of sleep.',
    });
  }

  // Uneven texture
  if (q5 === 'uneven' || q5 === 'bumpy') {
    conditions.push({
      name: 'uneven-texture',
      severity: q5 === 'bumpy' ? 'moderate' : 'mild',
      description: 'Rough or bumpy skin texture from clogged pores or dehydration.',
    });
  }

  // Eczema signal (very reactive + dry)
  if (q4 === 'very-reactive' && (q1 === 'tight' || q7 === 'dry')) {
    conditions.push({
      name: 'eczema',
      severity: 'mild',
      description: 'Highly reactive and dry skin patterns consistent with eczema-prone skin.',
    });
  }

  // Remove duplicates by name, keeping the first occurrence
  const seen = new Set();
  return conditions.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Concerns
// ---------------------------------------------------------------------------

function identifyConcerns(answers, conditions, skinType) {
  const concerns = new Set();

  const primaryConcern = get(answers, 'q10');
  if (primaryConcern) concerns.add(primaryConcern);

  conditions.forEach((c) => {
    switch (c.name) {
      case 'acne':
        concerns.add('acne');
        break;
      case 'hyperpigmentation':
      case 'melasma':
        concerns.add('hyperpigmentation');
        concerns.add('brightness');
        break;
      case 'fine-lines':
      case 'wrinkles':
        concerns.add('aging');
        break;
      case 'dryness':
      case 'flaking':
        concerns.add('dryness');
        concerns.add('hydration');
        break;
      case 'redness':
      case 'rosacea':
        concerns.add('redness');
        concerns.add('sensitivity');
        break;
      case 'enlarged-pores':
      case 'blackheads':
        concerns.add('pores');
        break;
      case 'uneven-texture':
        concerns.add('texture');
        break;
      case 'dark-circles':
        concerns.add('dark-circles');
        break;
      default:
        break;
    }
  });

  if (skinType === 'oily' || skinType === 'combination') {
    concerns.add('oiliness');
    concerns.add('pores');
  }
  if (skinType === 'dry') {
    concerns.add('dryness');
    concerns.add('hydration');
  }
  if (skinType === 'sensitive') {
    concerns.add('sensitivity');
  }

  const q11 = get(answers, 'q11');
  if (q11 === '40s' || q11 === '50plus') concerns.add('aging');

  const q13 = get(answers, 'q13');
  if (q13 === 'never' || q13 === 'sometimes') concerns.add('sun-protection');

  return Array.from(concerns);
}

// ---------------------------------------------------------------------------
// Overall skin health score
// ---------------------------------------------------------------------------

function calcOverallScore(answers, conditions, hydration, skinType) {
  let score = 80;

  // Deduct for conditions
  conditions.forEach((c) => {
    const penalty = c.severity === 'severe' ? 8 : c.severity === 'moderate' ? 5 : 2;
    score -= penalty;
  });

  // Lifestyle bonuses / penalties
  const sleep = get(answers, 'q15');
  if (sleep === '7-8' || sleep === 'more-than-8') score += 5;
  else if (sleep === 'less-than-5') score -= 10;
  else if (sleep === '5-6') score -= 5;

  const water = get(answers, 'q12');
  if (water === 'more-than-8') score += 5;
  else if (water === 'less-than-4') score -= 8;

  const smoke = get(answers, 'q14');
  if (smoke === 'yes') score -= 10;
  else if (smoke === 'occasionally') score -= 4;

  const spf = get(answers, 'q13');
  if (spf === 'daily' || spf === 'always') score += 5;
  else if (spf === 'never') score -= 5;

  // Hydration factor
  score += Math.round((hydration - 70) / 10);

  return clamp(score);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

function analyzeSkin(answers) {
  const skinTypeResult = determineSkinType(answers);
  const conditions = identifyConditions(answers);
  const hydrationLevel = calcHydrationLevel(answers);
  const sensitivityLevel = determineSensitivityLevel(answers);
  const concerns = identifyConcerns(answers, conditions, skinTypeResult.type);
  const overallScore = calcOverallScore(answers, conditions, hydrationLevel, skinTypeResult.type);

  return {
    skinType: skinTypeResult,
    conditions,
    hydrationLevel,
    sensitivityLevel,
    concerns,
    overallScore,
  };
}

module.exports = { analyzeSkin };
