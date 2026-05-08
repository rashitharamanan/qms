const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenNumber: { type: String, required: true },
  tokenIndex: { type: Number, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'pending', 'waiting', 'called', 'in-service', 'completed', 'skipped', 'cancelled', 'rejected'],
    default: 'pending'
  },
  estimatedWaitTime: { type: Number, default: 0 },
  position: { type: Number },
  notes: { type: String },
  date: { type: String, required: true },
  isPreBooked: { type: Boolean, default: false },
  scheduledDate: { type: String },
  scheduledTime: { type: String },
  calledAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

queueSchema.index({ shopId: 1, serviceId: 1, date: 1 });

module.exports = mongoose.model('Queue', queueSchema);
