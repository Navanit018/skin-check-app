const express = require('express');
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getProduct,
  getByCategory,
  getRecommendations,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getByCategory);
router.post('/recommendations', getRecommendations);
router.get('/:id', getProduct);

module.exports = router;
