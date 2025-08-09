/**
 * Sample data seeder for VeraChain
 * Creates test users and products
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Certificate = require('../models/Certificate');
const dotenv = require('dotenv');

dotenv.config();

// Sample users
const sampleUsers = [
  {
    email: 'test1@test.com',
    password: 'password',
    name: 'Test User 1',
    membershipTier: 'basic'
  },
  {
    email: 'test2@test.com',
    password: 'password',
    name: 'Test User 2',
    membershipTier: 'premium'
  },
  {
    email: 'admin@test.com',
    password: 'password',
    name: 'Admin User',
    membershipTier: 'vip',
    isAdmin: true
  }
];

// Sample products (will be created with owners assigned)
const sampleProductTemplates = [
  {
    name: 'Chanel Classic Flap Bag',
    brand: 'Chanel',
    category: 'handbag',
    description: 'Iconic quilted leather shoulder bag with chain strap',
    serialNumber: 'CH' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    manufacturingDate: new Date('2024-01-15'),
    verificationStatus: 'verified'
  },
  {
    name: 'Louis Vuitton Neverfull Tote',
    brand: 'Louis Vuitton',
    category: 'handbag',
    description: 'Spacious tote bag in signature Monogram canvas',
    serialNumber: 'LV' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    manufacturingDate: new Date('2024-02-10'),
    verificationStatus: 'verified'
  },
  {
    name: 'Hermes Birkin 35',
    brand: 'Hermes',
    category: 'handbag',
    description: 'Handcrafted luxury handbag in premium leather',
    serialNumber: 'HE' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    manufacturingDate: new Date('2024-03-05'),
    verificationStatus: 'verified'
  },
  {
    name: 'Rolex Submariner Date',
    brand: 'Rolex',
    category: 'watch',
    description: 'Professional diving watch with ceramic bezel',
    serialNumber: 'RX' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    manufacturingDate: new Date('2024-04-20'),
    verificationStatus: 'verified'
  },
  {
    name: 'Gucci GG Marmont Shoulder Bag',
    brand: 'Gucci',
    category: 'handbag',
    description: 'Matelassé leather shoulder bag with Double G hardware',
    serialNumber: 'GU' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    manufacturingDate: new Date('2024-05-12'),
    verificationStatus: 'verified'
  }
];

// Sample certificates
const generateCertificate = (product, userId) => ({
  displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  currentOwner: userId,
  productInfo: {
    brand: product.brand,
    model: product.name, // Using the full name as model
    category: product.category
  },
  verification: {
    aiConfidence: 85 + Math.floor(Math.random() * 15),
    ocrConfidence: 80 + Math.floor(Math.random() * 20),
    timestamp: new Date(),
    status: 'verified'
  },
  nft: {
    tokenId: Math.floor(Math.random() * 100000).toString(),
    contractAddress: '0x742d35Cc6634C0532925a3b8D4C529c2e12c4a42',
    mintDate: new Date()
  },
  _private: {
    previousDisplayIds: [],
    transferHistory: [],
    originalProductImages: [],
    originalCertificateImages: [],
    actualSerialNumber: product.serialNumber,
    internalNotes: `Created for testing - ${product.brand} ${product.name}`
  }
});

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verachain');
    
    console.log('Clearing existing data and indexes...');
    
    // Drop old indexes that might cause conflicts
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log('Dropped old username index');
    } catch (error) {
      console.log('No username index to drop (expected)');
    }
    
    try {
      await mongoose.connection.db.collection('certificates').dropIndex('certificateId_1');
      console.log('Dropped old certificateId index');
    } catch (error) {
      console.log('No certificateId index to drop (expected)');
    }
    
    try {
      await mongoose.connection.db.collection('certificates').dropIndex('certNumber_1');
      console.log('Dropped old certNumber index');
    } catch (error) {
      console.log('No certNumber index to drop (expected)');
    }
    
    await User.deleteMany({});
    await Product.deleteMany({});
    await Certificate.deleteMany({});
    
    console.log('Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        walletAddress: '0x' + Array(40).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      });
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('Creating sample products...');
    const createdProducts = [];
    
    for (let i = 0; i < sampleProductTemplates.length; i++) {
      const productData = sampleProductTemplates[i];
      const owner = createdUsers[i % createdUsers.length]; // Assign to rotating users
      
      const product = await Product.create({
        ...productData,
        owner: owner._id,
        verificationDetails: {
          verifiedBy: createdUsers.find(u => u.email === 'admin@test.com')._id,
          verifiedAt: new Date(),
          authenticityScore: 90 + Math.floor(Math.random() * 10)
        }
      });
      createdProducts.push(product);
      console.log(`Created product: ${product.name} (Owner: ${owner.email})`);
    }
    
    console.log('Creating sample certificates...');
    
    // Assign some products to users
    for (let i = 0; i < Math.min(createdProducts.length, 3); i++) {
      const product = createdProducts[i];
      const user = createdUsers[i % createdUsers.length];
      
      const certificate = await Certificate.create(
        generateCertificate(product, user._id)
      );
      
      console.log(`Created certificate for ${product.brand} ${product.model} -> ${user.email}`);
    }
    
    console.log('\n=================================');
    console.log('Sample data created successfully!');
    console.log('=================================\n');
    console.log('Test Accounts:');
    sampleUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('  ---');
    });
    
    console.log('\nSample Products:');
    createdProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category})`);
    });
    
    console.log('\nDatabase seeding completed!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  sampleUsers,
  sampleProductTemplates,
  generateCertificate,
  seedDatabase
};