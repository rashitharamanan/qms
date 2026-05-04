const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addReview, getShopReviews, hasReviewed } = require('../controllers/reviewController');

router.get('/shops/:shopId/reviews', getShopReviews);
router.post('/reviews', protect, addReview);
router.get('/shops/:shopId/reviews/check', protect, hasReviewed);

module.exports = router;
