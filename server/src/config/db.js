const mongoose = require('mongoose');

// Disable Mongoose query buffering so commands never hang for 10000ms when DB is offline/connecting
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('[DB] No MONGO_URI provided in environment');
    return false;
  }

  // Prevent duplicate connections
  if (mongoose.connection.readyState === 1) {
    console.log('[DB] Already connected');
    return true;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('[DB] MongoDB connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;
