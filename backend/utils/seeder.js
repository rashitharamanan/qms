require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const categories = [
  {
    name: 'Food & Restaurant',
    icon: '🍽️',
    description: 'Restaurants, cafes, and food outlets',
    subcategories: [
      { name: 'Dosa', icon: '🫓' },
      { name: 'Idli', icon: '🍚' },
      { name: 'Parotta', icon: '🫓' },
      { name: 'Pizza', icon: '🍕' },
      { name: 'Juice', icon: '🥤' },
      { name: 'Cake', icon: '🎂' },
      { name: 'Biryani', icon: '🍛' },
      { name: 'Burger', icon: '🍔' }
    ]
  },
  {
    name: 'Grocery Store',
    icon: '🛒',
    description: 'Supermarkets and grocery shops',
    subcategories: [
      { name: 'Vegetables', icon: '🥦' },
      { name: 'Fruits', icon: '🍎' },
      { name: 'Dairy', icon: '🥛' },
      { name: 'Bakery', icon: '🍞' },
      { name: 'Meat & Fish', icon: '🐟' }
    ]
  },
  {
    name: 'Pharmacy',
    icon: '💊',
    description: 'Medical stores and pharmacies',
    subcategories: [
      { name: 'Medicine', icon: '💊' },
      { name: 'Prescription Pickup', icon: '📋' },
      { name: 'Health Products', icon: '🏥' },
      { name: 'Baby Care', icon: '👶' }
    ]
  },
  {
    name: 'Electronics',
    icon: '📱',
    description: 'Electronic goods and gadgets',
    subcategories: [
      { name: 'Mobile', icon: '📱' },
      { name: 'Laptop', icon: '💻' },
      { name: 'TV', icon: '📺' },
      { name: 'Refrigerator', icon: '❄️' },
      { name: 'Washing Machine', icon: '🫧' },
      { name: 'AC', icon: '🌀' }
    ]
  },
  {
    name: 'Home Appliances',
    icon: '🏠',
    description: 'Home appliance services and sales',
    subcategories: [
      { name: 'Mixer Grinder', icon: '🔧' },
      { name: 'Water Purifier', icon: '💧' },
      { name: 'Microwave', icon: '📦' },
      { name: 'Furniture', icon: '🪑' }
    ]
  },
  {
    name: 'Salon & Beauty',
    icon: '✂️',
    description: 'Salons, spas, and beauty services',
    subcategories: [
      { name: 'Haircut', icon: '✂️' },
      { name: 'Facial', icon: '💆' },
      { name: 'Shaving', icon: '🪒' },
      { name: 'Spa', icon: '🧖' },
      { name: 'Manicure', icon: '💅' },
      { name: 'Hair Color', icon: '🎨' }
    ]
  },
  {
    name: 'Hospital / Clinic',
    icon: '🏥',
    description: 'Medical clinics and hospitals',
    subcategories: [
      { name: 'General Consultation', icon: '🩺' },
      { name: 'Dental', icon: '🦷' },
      { name: 'Eye Care', icon: '👁️' },
      { name: 'Physiotherapy', icon: '🏃' },
      { name: 'Lab Tests', icon: '🧪' }
    ]
  },
  {
    name: 'Government Services',
    icon: '🏛️',
    description: 'Government offices and services',
    subcategories: [
      { name: 'Aadhaar', icon: '🪪' },
      { name: 'Passport', icon: '📔' },
      { name: 'Ration Card', icon: '📄' },
      { name: 'Driving License', icon: '🚗' },
      { name: 'PAN Card', icon: '📋' }
    ]
  }
];

const seed = async () => {
  await connectDB();

  try {
    // Clear existing
    await Category.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@qms.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create categories
    await Category.insertMany(categories.map(c => ({ ...c, createdBy: admin._id })));

    console.log('✅ Seeding complete!');
    console.log('📧 Admin Email: admin@qms.com');
    console.log('🔑 Admin Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
