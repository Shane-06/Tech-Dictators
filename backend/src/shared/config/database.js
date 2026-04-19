const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery-db';
    await mongoose.connect(uri);
    console.log(`✓ MongoDB connected: ${uri}`);
  } catch (err) {
    console.error(`✗ MongoDB connection error: ${err.message}`);
    console.warn('⚠ Server will continue without MongoDB - some features may not work');
  }
};

module.exports = connectDB;