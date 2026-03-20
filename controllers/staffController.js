const Staff = require('../models/Staff');
const Shop = require('../models/Shop');

exports.getStaff = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    const staff = await Staff.find({ shopId: shop._id }).populate('counterId', 'name');
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    const staff = await Staff.create({ ...req.body, shopId: shop._id });
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
