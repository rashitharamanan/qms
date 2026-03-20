const Shop = require('../models/Shop');
const Service = require('../models/Service');
const Queue = require('../models/Queue');

exports.createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ vendorId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a shop' });
    const shop = await Shop.create({ ...req.body, vendorId: req.user._id });
    res.status(201).json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id }).populate('category', 'name icon subcategories');
    if (!shop) return res.status(404).json({ success: false, message: 'No shop found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOneAndUpdate({ vendorId: req.user._id }, req.body, { new: true });
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    if (!shop.isApproved) return res.status(400).json({ success: false, message: 'Shop not approved yet' });
    shop.isOpen = !shop.isOpen;
    await shop.save();
    req.io.to(shop._id.toString()).emit('shop-status-changed', { shopId: shop._id, isOpen: shop.isOpen });
    res.json({ success: true, data: { isOpen: shop.isOpen } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    const today = new Date().toISOString().split('T')[0];
    const [total, pending, waiting, completed, called, inService] = await Promise.all([
      Queue.countDocuments({ shopId: shop._id, date: today }),
      Queue.countDocuments({ shopId: shop._id, date: today, status: 'pending' }),
      Queue.countDocuments({ shopId: shop._id, date: today, status: 'waiting' }),
      Queue.countDocuments({ shopId: shop._id, date: today, status: 'completed' }),
      Queue.countDocuments({ shopId: shop._id, date: today, status: 'called' }),
      Queue.countDocuments({ shopId: shop._id, date: today, status: 'in-service' })
    ]);
    res.json({ success: true, data: { total, pending, waiting, completed, called, inService, shop } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    const today = new Date().toISOString().split('T')[0];
    const { serviceId } = req.query;
    const filter = { shopId: shop._id, date: today };
    if (serviceId) filter.serviceId = serviceId;
    const queue = await Queue.find(filter)
      .populate('customerId', 'name phone')
      .populate('serviceId', 'serviceName tokenPrefix')
      .sort({ tokenIndex: 1 });
    res.json({ success: true, data: queue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.callNext = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const today = new Date().toISOString().split('T')[0];
    
    // Complete ANY existing active token (called OR in-service) for this service
    const activeToken = await Queue.findOneAndUpdate(
      { shopId: shop._id, serviceId, date: today, status: { $in: ['called', 'in-service'] } },
      { status: 'completed', completedAt: new Date() }
    );
    
    if (activeToken) {
      req.io.to(shop._id.toString()).emit('token-completed', { tokenId: activeToken._id, shopId: shop._id });
    }

    // Call next waiting
    const next = await Queue.findOneAndUpdate(
      { shopId: shop._id, serviceId, date: today, status: 'waiting' },
      { status: 'called', calledAt: new Date() },
      { new: true, sort: { tokenIndex: 1 } }
    ).populate('customerId', 'name');
    if (!next) return res.json({ success: true, message: 'No more tokens in queue', data: null });
    req.io.to(shop._id.toString()).emit('token-called', { token: next, shopId: shop._id });
    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });
    res.json({ success: true, data: next });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.startService = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Queue.findByIdAndUpdate(tokenId, { status: 'in-service' }, { new: true });
    const shop = await Shop.findOne({ vendorId: req.user._id });
    req.io.to(shop._id.toString()).emit('token-started', { tokenId, shopId: shop._id });
    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });
    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.skipToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Queue.findByIdAndUpdate(tokenId, { status: 'skipped' }, { new: true });
    const shop = await Shop.findOne({ vendorId: req.user._id });
    req.io.to(shop._id.toString()).emit('token-skipped', { tokenId, shopId: shop._id });
    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });
    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Queue.findByIdAndUpdate(tokenId, { status: 'completed', completedAt: new Date() }, { new: true });
    const shop = await Shop.findOne({ vendorId: req.user._id });
    req.io.to(shop._id.toString()).emit('token-completed', { tokenId, shopId: shop._id });

    // Auto-call next waiting token
    const today = new Date().toISOString().split('T')[0];
    const next = await Queue.findOneAndUpdate(
      { shopId: shop._id, serviceId: token.serviceId, date: today, status: 'waiting' },
      { status: 'called', calledAt: new Date() },
      { new: true, sort: { tokenIndex: 1 } }
    ).populate('customerId', 'name');

    if (next) {
      req.io.to(shop._id.toString()).emit('token-called', { token: next, shopId: shop._id });
    }

    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });

    res.json({ success: true, data: token, nextToken: next });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Queue.findByIdAndUpdate(tokenId, { status: 'waiting' }, { new: true });
    const shop = await Shop.findOne({ vendorId: req.user._id });
    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });
    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Queue.findByIdAndUpdate(tokenId, { status: 'rejected' }, { new: true });
    const shop = await Shop.findOne({ vendorId: req.user._id });
    req.io.to(shop._id.toString()).emit('queue_updated', { shopId: shop._id });
    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Services
exports.getServices = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const services = await Service.find({ shopId: shop._id });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const service = await Service.create({ ...req.body, shopId: shop._id });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
