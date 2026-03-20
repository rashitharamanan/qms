const User = require('../models/User');
const Category = require('../models/Category');

const categories = [
  { name: 'Food & Restaurant', icon: '🍽️', description: 'Restaurants, cafes and food stalls', subcategories: [{ name: 'Dosa', icon: '🥞', estimatedTime: 10 }, { name: 'Idli', icon: '🍚', estimatedTime: 8 }, { name: 'Parotta', icon: '🫓', estimatedTime: 12 }, { name: 'Pizza', icon: '🍕', estimatedTime: 20 }, { name: 'Juice', icon: '🥤', estimatedTime: 5 }, { name: 'Cake', icon: '🎂', estimatedTime: 15 }] },
  { name: 'Grocery Store', icon: '🛒', description: 'Supermarkets and grocery shops', subcategories: [{ name: 'Billing', icon: '🧾', estimatedTime: 8 }, { name: 'Customer Service', icon: '💁', estimatedTime: 15 }] },
  { name: 'Pharmacy', icon: '💊', description: 'Medical stores and pharmacies', subcategories: [{ name: 'Medicine', icon: '💉', estimatedTime: 10 }, { name: 'Prescription Pickup', icon: '📋', estimatedTime: 12 }] },
  { name: 'Electronics', icon: '📱', description: 'Electronic goods stores', subcategories: [{ name: 'Mobile', icon: '📱', estimatedTime: 20 }, { name: 'Laptop', icon: '💻', estimatedTime: 30 }, { name: 'TV', icon: '📺', estimatedTime: 25 }] },
  { name: 'Salon & Beauty', icon: '💇', description: 'Salons and beauty parlors', subcategories: [{ name: 'Haircut', icon: '✂️', estimatedTime: 20 }, { name: 'Facial', icon: '🧖', estimatedTime: 45 }, { name: 'Shaving', icon: '🪒', estimatedTime: 15 }, { name: 'Spa', icon: '🛁', estimatedTime: 60 }] },
  { name: 'Hospital / Clinic', icon: '🏥', description: 'Hospitals and medical clinics', subcategories: [{ name: 'General Consultation', icon: '👨‍⚕️', estimatedTime: 15 }, { name: 'Lab Tests', icon: '🔬', estimatedTime: 20 }] },
  { name: 'Government Services', icon: '🏛️', description: 'Government offices and services', subcategories: [{ name: 'Document Verification', icon: '📄', estimatedTime: 30 }, { name: 'License', icon: '🪪', estimatedTime: 45 }] },
  { name: 'Home Appliances', icon: '🏠', description: 'Home appliance stores', subcategories: [{ name: 'Repair', icon: '🔧', estimatedTime: 40 }, { name: 'Purchase', icon: '🛍️', estimatedTime: 25 }] }
];

const seedDatabase = async () => {
  try {
    for (const cat of categories) {
      await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }
    console.log('Categories seeded');
    const adminExists = await User.findOne({ email: 'admin@qms.com' });
    if (!adminExists) {
      await User.create({ name: 'System Admin', email: 'admin@qms.com', password: 'admin123', role: 'admin' });
      console.log('Admin created: admin@qms.com / admin123');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedDatabase;
