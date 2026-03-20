const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, default: 'operator' },
  counterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter', default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Staff', staffSchema);
