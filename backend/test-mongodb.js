const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      authSource: 'admin'
    });
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('🗄️ Database:', conn.connection.name);
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testConnection();