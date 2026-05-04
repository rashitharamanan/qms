const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

// One review per customer per shop per day
reviewSchema.index({ shopId: 1, customerId: 1 }, { unique: false });

module.exports = mongoose.model('Review', reviewSchema);
