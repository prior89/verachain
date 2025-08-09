const mongoose = require('mongoose');
const memoryDB = require('../database/memoryDB');

let useMemoryDB = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/verachain';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1
    });

    useMemoryDB = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.log('🔄 Switching to in-memory database for development...');
    useMemoryDB = true;
    console.log('✅ In-Memory Database Active');
  }
};

// Database abstraction layer
const getDB = () => {
  return {
    isMemoryDB: useMemoryDB,
    memoryDB: useMemoryDB ? memoryDB : null,
    mongoose: !useMemoryDB ? mongoose : null
  };
};

module.exports = { connectDB, getDB };