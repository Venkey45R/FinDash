require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();
    if (user) {
      user.email = 'venkateshamulraj@gmail.com';
      user.password = await bcrypt.hash('1234', 12);
      user.authProvider = 'local';
      user.isOnboarded = true; // since they already have data
      await user.save();
      console.log('User migrated successfully:', user.email);
    } else {
      console.log('No user found to migrate.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
  }
};

migrate();
