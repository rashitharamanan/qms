const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shop = require('./models/Shop');

dotenv.config();

const checkRawDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const shops = await Shop.find({}).lean();
    console.log('Total Shops:', shops.length);
    console.log('Raw Shops Data:', JSON.stringify(shops, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
};

checkRawDB();
