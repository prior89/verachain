const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 메모리 DB 모드 체크
    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('🗄️ Using in-memory database (no MongoDB required)');
      return;
    }

    let mongoURI;
    
    // MongoDB Atlas 연결 (환경변수 분리 방식)
    if (process.env.MONGODB_HOST && process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
      const username = encodeURIComponent(process.env.MONGODB_USERNAME);
      const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
      const host = process.env.MONGODB_HOST;
      const database = process.env.MONGODB_DATABASE || 'verachain';
      
      mongoURI = `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`;
      console.log('🌐 Connecting to MongoDB Atlas...');
    } 
    // 기존 MONGODB_URI 방식 (하위 호환성)
    else if (process.env.MONGODB_URI) {
      mongoURI = process.env.MONGODB_URI;
      console.log('🔗 Using MONGODB_URI...');
    } 
    // 로컬 MongoDB
    else {
      mongoURI = 'mongodb://localhost:27017/verachain';
      console.log('🏠 Connecting to local MongoDB...');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB };