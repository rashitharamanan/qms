const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true, trim: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: { lat: Number, lng: Number }
  },
  phone: { type: String },
  logo: { type: String },
  isOpen: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  maxQueueLimit: { type: Number, default: 50 },
  openingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' }
  },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);
