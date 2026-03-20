const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shop = require('./models/Shop');

dotenv.config();

const validateDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const shops = await Shop.find({}).lean();
    console.log('Total Shops:', shops.length);
    
    for (const shop of shops) {
      const isId = mongoose.Types.ObjectId.isValid(shop.category);
      console.log(`Shop: ${shop.shopName}, Category: ${shop.category}, Valid ID: ${isId}`);
      if (!isId) {
          console.log(`!!! Found Malformed Category ID at shop: ${shop.shopName}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
};

validateDB();
