const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    sparse: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  walletAddress: {
    type: String,
    sparse: true
  },
  membershipTier: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'basic'
  },
  stats: {
    totalVerifications: { type: Number, default: 0 },
    successfulVerifications: { type: Number, default: 0 }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'ko' }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'your-secret-key-here',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

userSchema.methods.incrementVerificationCount = async function(successful = true) {
  this.stats.totalVerifications += 1;
  if (successful) {
    this.stats.successfulVerifications += 1;
  }
  
  // Update membership tier based on successful verifications
  if (this.stats.successfulVerifications >= 100) {
    this.membershipTier = 'vip';
  } else if (this.stats.successfulVerifications >= 25) {
    this.membershipTier = 'premium';
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);