const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  category: { type: String },
  estimatedTime: { type: Number, default: 15 },
  price: { type: Number, default: 0 },
  description: { type: String },
  tokenPrefix: { type: String, default: 'T' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
