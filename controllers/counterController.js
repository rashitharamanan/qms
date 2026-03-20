const Counter = require('../models/Counter');
const Shop = require('../models/Shop');

exports.getCounters = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    const counters = await Counter.find({ shopId: shop._id }).populate('currentStaffId', 'name').populate('services', 'serviceName');
    res.json({ success: true, data: counters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCounter = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    const counter = await Counter.create({ ...req.body, shopId: shop._id });
    res.status(201).json({ success: true, data: counter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCounter = async (req, res) => {
  try {
    const counter = await Counter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: counter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCounter = async (req, res) => {
  try {
    await Counter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Counter deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
