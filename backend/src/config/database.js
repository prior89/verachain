const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/verachain';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('🔍 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // 재시도 로직
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB;