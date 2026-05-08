const User = require('../models/User');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const Queue = require('../models/Queue');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalShops, pendingShops, totalCategories] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Shop.countDocuments({ isApproved: true }),
      Shop.countDocuments({ isApproved: false }),
      Category.countDocuments()
    ]);
    const today = new Date().toISOString().split('T')[0];
    const todayTokens = await Queue.countDocuments({ date: today });
    res.json({ success: true, data: { totalUsers, totalShops, pendingShops, totalCategories, todayTokens } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('vendorId', 'name email').populate('category', 'name icon');
    res.json({ success: true, data: shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, message: 'Shop approved', data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    res.json({ success: true, message: 'Shop rejected', data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
