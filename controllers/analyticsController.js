const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const Service = require('../models/Service');

// Get vendor analytics
exports.getAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const today = new Date().toISOString().split('T')[0];

    // Last 7 days stats
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const [total, completed, cancelled, skipped] = await Promise.all([
        Queue.countDocuments({ shopId: shop._id, date: dateStr }),
        Queue.countDocuments({ shopId: shop._id, date: dateStr, status: 'completed' }),
        Queue.countDocuments({ shopId: shop._id, date: dateStr, status: 'cancelled' }),
        Queue.countDocuments({ shopId: shop._id, date: dateStr, status: 'skipped' }),
      ]);

      last7Days.push({ date: dateStr, day: dayName, total, completed, cancelled, skipped });
    }

    // Average wait time (from completed tokens today)
    const completedTokens = await Queue.find({
      shopId: shop._id, date: today, status: 'completed',
      calledAt: { $exists: true }, createdAt: { $exists: true }
    });

    let avgWaitTime = 0;
    if (completedTokens.length > 0) {
      const totalWait = completedTokens.reduce((acc, t) => {
        const wait = (new Date(t.calledAt) - new Date(t.createdAt)) / (1000 * 60);
        return acc + Math.max(0, wait);
      }, 0);
      avgWaitTime = Math.round(totalWait / completedTokens.length);
    }

    // Average service time (from completed tokens today)
    let avgServiceTime = 0;
    const servedTokens = completedTokens.filter(t => t.startedAt && t.completedAt);
    if (servedTokens.length > 0) {
      const totalService = servedTokens.reduce((acc, t) => {
        return acc + (new Date(t.completedAt) - new Date(t.startedAt)) / (1000 * 60);
      }, 0);
      avgServiceTime = Math.round(totalService / servedTokens.length);
    }

    // Service breakdown
    const services = await Service.find({ shopId: shop._id });
    const serviceBreakdown = await Promise.all(services.map(async (svc) => {
      const total = await Queue.countDocuments({ shopId: shop._id, serviceId: svc._id, date: today });
      const completed = await Queue.countDocuments({ shopId: shop._id, serviceId: svc._id, date: today, status: 'completed' });
      return { name: svc.serviceName, total, completed };
    }));

    // Peak hours (hourly distribution for today)
    const todayTokens = await Queue.find({ shopId: shop._id, date: today }).select('createdAt');
    const hourlyDist = new Array(24).fill(0);
    todayTokens.forEach(t => {
      const hour = new Date(t.createdAt).getHours();
      hourlyDist[hour]++;
    });
    const peakHours = hourlyDist.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    })).filter(h => h.count > 0);

    // Overall totals
    const allTimeTotal = await Queue.countDocuments({ shopId: shop._id });
    const allTimeCompleted = await Queue.countDocuments({ shopId: shop._id, status: 'completed' });

    res.json({
      success: true,
      data: {
        today: last7Days[last7Days.length - 1],
        last7Days,
        avgWaitTime,
        avgServiceTime,
        serviceBreakdown,
        peakHours,
        allTime: { total: allTimeTotal, completed: allTimeCompleted, rate: allTimeTotal > 0 ? Math.round((allTimeCompleted / allTimeTotal) * 100) : 0 }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
