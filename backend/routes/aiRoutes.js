const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { 
  getWaitTimePrediction, 
  handleChat, 
  getShopRecommendations 
} = require("../controllers/aiController");

router.post("/predict-wait", getWaitTimePrediction);
router.post("/chat", handleChat);
router.get("/recommendations", protect, getShopRecommendations);

module.exports = router;
