const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true }, // e.g., "Counter 1", "Dr. Smith's Room"
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // What services this counter handles
  currentStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  status: { type: String, enum: ['active', 'inactive', 'break'], default: 'inactive' },
  currentQueueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Counter', counterSchema);
