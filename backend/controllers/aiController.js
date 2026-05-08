const Shop = require("../models/Shop");
const Queue = require("../models/Queue");
const aiService = require("../services/aiService");

/**
 * @desc    Get AI wait time prediction
 * @route   POST /api/ai/predict-wait
 * @access  Public
 */
exports.getWaitTimePrediction = async (req, res) => {
  try {
    const { shopId } = req.body;
    
    const shop = await Shop.findById(shopId).populate('category');
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const pendingTokens = await Queue.countDocuments({
      shopId,
      status: { $in: ["pending", "waiting"] },
      date: new Date().toISOString().split("T")[0]
    });

    const aiResponse = await aiService.predictWaitTime({
      totalPeople: pendingTokens,
      shopType: shop.category?.name || "Service Provider",
      averageServiceTime: shop.avgServiceTime || 15 // default 15 mins
    });

    res.status(200).json(aiResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Handle AI Chat
 * @route   POST /api/ai/chat
 * @access  Public
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, shopId } = req.body;
    
    let context = "You are helping a customer with a general inquiry.";
    if (shopId) {
      const shop = await Shop.findById(shopId).populate('category');
      if (shop) {
        context = `The user is interested in ${shop.shopName}, which is a ${shop.category?.name}. 
        Located at: ${shop.address}. 
        Current status: ${shop.isOpen ? 'Open' : 'Closed'}.`;
      }
    }

    const response = await aiService.getChatResponse(message, context);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get personalized shop recommendations
 * @route   GET /api/ai/recommendations
 * @access  Private (Customer)
 */
exports.getShopRecommendations = async (req, res) => {
  try {
    // Get user's recent visits
    const recentQueues = await Queue.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('shopId');

    const visitHistory = recentQueues.map(q => ({
      shopName: q.shopId?.shopName,
      category: q.shopId?.category
    }));

    const allShops = await Shop.find({ isApproved: true }).populate('category');
    
    const recommendedIds = await aiService.getRecommendations(visitHistory, allShops);
    
    const recommendedShops = await Shop.find({
      _id: { $in: recommendedIds }
    }).populate('category');

    res.status(200).json(recommendedShops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
