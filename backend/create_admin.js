require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        let user = await User.findOne({ email: 'admin@gamil.com' });
        if (user) {
            user.password = 'admin 123';
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log(`Updated admin@gamil.com to have password "admin 123"`);
        } else {
            user = new User({
                name: 'Admin User',
                email: 'admin@gamil.com',
                password: 'admin 123',
                role: 'admin',
                isVerified: true
            });
            await user.save();
            console.log(`Created admin@gamil.com with password "admin 123"`);
        }

        console.log('Admin user setup complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error connecting to database:', err);
        process.exit(1);
    });
