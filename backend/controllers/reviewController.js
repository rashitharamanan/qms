const Review = require('../models/Review');
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');

// Submit a review
exports.addReview = async (req, res) => {
  try {
    const { shopId, rating, comment, tokenId } = req.body;
    if (!shopId || !rating) return res.status(400).json({ success: false, message: 'shopId and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    // Verify customer has visited this shop (has a completed token)
    const completedToken = await Queue.findOne({
      shopId,
      customerId: req.user._id,
      status: 'completed'
    });
    if (!completedToken) {
      return res.status(400).json({ success: false, message: 'You can only review shops you have visited' });
    }

    const review = await Review.create({
      shopId,
      customerId: req.user._id,
      tokenId: tokenId || completedToken._id,
      rating,
      comment
    });

    // Update shop average rating
    const allReviews = await Review.find({ shopId });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await Shop.findByIdAndUpdate(shopId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get reviews for a shop
exports.getShopReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ shopId: req.params.shopId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if customer already reviewed a shop
exports.hasReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({ shopId: req.params.shopId, customerId: req.user._id });
    res.json({ success: true, hasReviewed: !!review, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
