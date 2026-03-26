const Shop = require('../models/Shop');
const Service = require('../models/Service');
const Queue = require('../models/Queue');
const Category = require('../models/Category');

const calculateAvgServiceTime = async (serviceId, fallbackTime) => {
  return Number(fallbackTime) || 15;
};

const getDetailedWaitTime = async (token) => {
  const serviceId = token.serviceId?._id || token.serviceId;
  const shopId = token.shopId?._id || token.shopId;
  const avgServiceTime = await calculateAvgServiceTime(serviceId, token.serviceId?.estimatedTime || 15);

  // Find current in-service or called token
  const currentInService = await Queue.findOne({
    shopId,
    serviceId,
    date: token.date,
    status: { $in: ['called', 'in-service'] }
  }).sort({ calledAt: 1 });

  let remainingTime = 0;
  if (currentInService && currentInService.calledAt) {
    const elapsed = (new Date() - currentInService.calledAt) / (1000 * 60);
    remainingTime = Math.max(0, avgServiceTime - elapsed);
  }

  // Count people ahead who are waiting or pending
  const ahead = await Queue.countDocuments({
    shopId,
    serviceId,
    date: token.date,
    status: { $in: ['waiting', 'pending'] },
    tokenIndex: { $lt: token.tokenIndex }
  });

  let estimatedWaitTime = Math.round(remainingTime + (ahead * avgServiceTime));
  if (isNaN(estimatedWaitTime)) estimatedWaitTime = 15;

  return { ahead, position: ahead + 1, estimatedWaitTime, avgServiceTime };
};

exports.getShops = async (req, res) => {
  try {
    const { category, city, search } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (search) filter.shopName = new RegExp(search, 'i');

    const rawShops = await Shop.find(filter).lean();

    // Process each shop safely
    const today = new Date().toISOString().split('T')[0];
    const shopsWithData = await Promise.all(rawShops.map(async (shop) => {
      try {
        // Safe population
        const populatedShop = await Shop.populate(shop, [
          { path: 'category', select: 'name icon' },
          { path: 'vendorId', select: 'name' }
        ]);

        const services = await Service.find({ shopId: shop._id, isActive: true });
        if (services.length === 0) return { ...populatedShop, waitTime: 0, totalAhead: 0, avgServiceTime: 15 };

        const serviceMetrics = await Promise.all(services.map(async (service) => {
          try {
            const ahead = await Queue.countDocuments({
              shopId: shop._id, serviceId: service._id, date: today,
              status: { $in: ['waiting', 'pending'] }
            });

            const inService = await Queue.findOne({
              shopId: shop._id, serviceId: service._id, date: today,
              status: { $in: ['called', 'in-service'] }
            }).sort({ calledAt: 1 });

            const avgTime = await calculateAvgServiceTime(service._id, service.estimatedTime || 15);
            let remaining = 0;
            if (inService && inService.calledAt) {
              const elapsed = (new Date() - inService.calledAt) / (1000 * 60);
              remaining = Math.max(0, avgTime - elapsed);
            }
            return { waitTime: Math.round(remaining + (ahead * avgTime)), ahead, avgTime };
          } catch (e) {
            return { waitTime: 15, ahead: 0, avgTime: 15 };
          }
        }));

        const minWait = Math.min(...serviceMetrics.map(m => m.waitTime));
        const totalAhead = serviceMetrics.reduce((acc, m) => acc + m.ahead, 0);
        const avgServiceTime = services[0]?.estimatedTime || 15;

        return { ...populatedShop, waitTime: minWait, totalAhead, avgServiceTime };
      } catch (err) {
        // Fallback for malformed shop or population error
        console.error('Error processing shop:', shop.shopName, err.message);
        return { ...shop, waitTime: 10, totalAhead: 0, avgServiceTime: 15 };
      }
    }));

    res.json({ success: true, data: shopsWithData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShopDetails = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('category').populate('vendorId', 'name');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShopServices = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const services = await Service.find({ shopId: req.params.shopId, isActive: true }).lean();

    const servicesWithWait = await Promise.all(services.map(async (service) => {
      const ahead = await Queue.countDocuments({
        shopId: req.params.shopId, serviceId: service._id, date: today,
        status: { $in: ['waiting', 'pending'] }
      });

      const inService = await Queue.findOne({
        shopId: req.params.shopId, serviceId: service._id, date: today,
        status: { $in: ['called', 'in-service'] }
      }).sort({ calledAt: 1 });

      const avgTime = await calculateAvgServiceTime(service._id, service.estimatedTime || 15);
      let remaining = 0;
      if (inService && inService.calledAt) {
        const elapsed = (new Date() - inService.calledAt) / (1000 * 60);
        remaining = Math.max(0, avgTime - elapsed);
      }
      const waitTime = Math.round(remaining + (ahead * avgTime));

      return { ...service, waitTime, ahead };
    }));

    res.json({ success: true, data: servicesWithWait });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.joinQueue = async (req, res) => {
  try {
    const { shopId, serviceId } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isOpen) return res.status(400).json({ success: false, message: 'Shop is closed' });
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    const today = new Date().toISOString().split('T')[0];
    // Check if customer already in queue
    const existing = await Queue.findOne({ shopId, serviceId, customerId: req.user._id, date: today, status: { $in: ['pending', 'waiting', 'called', 'in-service'] } });
    if (existing) return res.status(400).json({ success: false, message: 'Already in queue', data: existing });
    // Count today's tokens
    const count = await Queue.countDocuments({ shopId, serviceId, date: today });
    if (count >= shop.maxQueueLimit) return res.status(400).json({ success: false, message: 'Queue is full' });
    const tokenIndex = count + 1;
    const prefix = service.tokenPrefix || 'T';
    const tokenNumber = `${prefix}${String(tokenIndex).padStart(3, '0')}`;
    // Calculate estimated wait
    const { position, ahead, estimatedWaitTime } = await getDetailedWaitTime({
      shopId, serviceId: service, date: today, tokenIndex
    });
    const token = await Queue.create({
      shopId, serviceId, customerId: req.user._id, tokenNumber, tokenIndex,
      date: today, estimatedWaitTime, position, status: 'pending'
    });
    req.io.to(shopId.toString()).emit('new-token', { token, shopId });
    res.status(201).json({ success: true, data: { ...token.toObject(), serviceName: service.serviceName, shopName: shop.shopName } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyTokens = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tokens = await Queue.find({ customerId: req.user._id, date: today })
      .populate('shopId', 'shopName location isOpen')
      .populate('serviceId', 'serviceName estimatedTime tokenPrefix')
      .sort({ createdAt: -1 });

    const liveTokens = await Promise.all(tokens.map(async (token) => {
      let position = token.position;
      let ahead = 0;
      let estimatedWaitTime = token.estimatedWaitTime;

      if (['waiting', 'pending'].includes(token.status)) {
        const details = await getDetailedWaitTime(token);
        position = details.position;
        ahead = details.ahead;
        estimatedWaitTime = details.estimatedWaitTime;
      }

      return { ...token.toObject(), position, ahead, estimatedWaitTime };
    }));

    res.json({ success: true, data: liveTokens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getToken = async (req, res) => {
  try {
    const token = await Queue.findById(req.params.id)
      .populate('shopId', 'shopName location')
      .populate('serviceId', 'serviceName estimatedTime tokenPrefix');

    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

    let position = token.position;
    let ahead = 0;
    let estimatedWaitTime = token.estimatedWaitTime;
    let avgServiceTime = token.serviceId?.estimatedTime || 15;

    const details = await getDetailedWaitTime(token);
    avgServiceTime = details.avgServiceTime;

    if (['waiting', 'pending'].includes(token.status)) {
      position = details.position;
      ahead = details.ahead;
      estimatedWaitTime = details.estimatedWaitTime;
    }

    res.json({ success: true, token, position, ahead, estimatedWaitTime, avgServiceTime });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const { shopId, serviceId } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const queue = await Queue.find({ shopId, serviceId, date: today, status: { $in: ['pending', 'waiting', 'called', 'in-service'] } })
      .sort({ tokenIndex: 1 }).select('tokenNumber status position');
    res.json({ success: true, data: queue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelToken = async (req, res) => {
  try {
    const token = await Queue.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user._id, status: { $in: ['pending', 'waiting'] } },
      { status: 'cancelled' }, { new: true }
    );
    if (!token) return res.status(404).json({ success: false, message: 'Token not found or cannot be cancelled' });
    req.io.to(token.shopId.toString()).emit('token-cancelled', { tokenId: token._id, shopId: token.shopId });
    req.io.to(token.shopId.toString()).emit('queue_updated', { shopId: token.shopId });
    res.json({ success: true, message: 'Token cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const tokenId = req.params.id;
    const userId = req.user._id;
    console.log('Check-in Request:', { tokenId, userId });

    // Find the token first to see its status regardless of user
    const token = await Queue.findById(tokenId);
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    console.log('Token found for check-in:', {
      status: token.status,
      tokenUser: token.customerId,
      currentUser: userId,
      match: token.customerId.toString() === userId.toString()
    });

    // Check ownership
    if (token.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'This token does not belong to you' });
    }

    // Check status
    if (token.status === 'in-service') {
      return res.json({ success: true, message: 'Check-in already confirmed!', data: token });
    }

    if (token.status !== 'called') {
      return res.status(400).json({ success: false, message: `Token must be in "called" status to check in. (Current: ${token.status})` });
    }

    // Perform transition
    token.status = 'in-service';
    token.startedAt = new Date();
    await token.save();

    req.io.to(token.shopId.toString()).emit('queue_updated', { shopId: token.shopId });
    res.json({ success: true, message: 'Checked in successfully!', data: token });
  } catch (err) {
    console.error('Check-in backend error:', err);
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
