/**
 * VeraChain 사용자 모델 (VeraChain User Model)
 * MongoDB를 사용한 사용자 데이터 관리 및 인증 기능
 * User data management and authentication functionality using MongoDB
 * 
 * 주요 기능 (Main Features):
 * - 사용자 등록 및 인증 (User registration and authentication)
 * - 비밀번호 암호화 및 검증 (Password encryption and verification) 
 * - JWT 토큰 생성 및 관리 (JWT token generation and management)
 * - 멤버십 등급 자동 관리 (Automatic membership tier management)
 * - 개인정보 보호 강화 (Enhanced privacy protection)
 * 
 * 보안 기능 (Security Features):
 * - bcrypt를 사용한 비밀번호 해싱 (Password hashing with bcrypt)
 * - 국제 전화번호 형식 지원 (International phone number format support)
 * - 이메일 중복 방지 (Email duplication prevention)
 * - 계정 인증 시스템 (Account verification system)
 * 
 * 오픈소스 호환성 (Open Source Compatibility):
 * - 모든 의존성이 오픈소스 라이브러리 (All dependencies are open source libraries)
 * - MIT 라이선스 호환 (MIT license compatible)
 * - 표준 MongoDB/Mongoose 패턴 사용 (Uses standard MongoDB/Mongoose patterns)
 */

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
    // 국제 전화번호 형식 지원 (International phone number format support)
    // 지원 형식 (Supported formats): +82-10-1234-5678, +1 (555) 123-4567, 010-1234-5678, 01012345678
    // 정규식 설명 (Regex explanation):
    // ^: 문자열 시작 (Start of string)
    // (\+\d{1,4}[\s-]?)?: 국가 코드 (optional country code) - +82, +1 등
    // [\s-]?: 공백 또는 하이픈 (optional space or dash)
    // (\(?\d{2,4}\)?[\s-]?)?: 지역 코드 (optional area code) - (010), 010 등  
    // \d{3,4}[\s-]?: 첫번째 번호 그룹 (first number group) - 1234
    // \d{4}: 마지막 번호 그룹 (last number group) - 5678
    // $: 문자열 끝 (End of string)
    match: [
      /^(\+\d{1,4}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}$/, 
      'Please enter a valid phone number (e.g., +82-10-1234-5678, 010-1234-5678, or 01012345678)'
    ],
    // 전화번호 정제 함수 (Phone number sanitization function)
    // 저장 전에 공백과 특수문자를 제거하여 일관성 유지 (Remove spaces and special chars for consistency)
    set: function(phone) {
      if (!phone) return phone;
      // 모든 공백, 하이픈, 괄호를 제거하고 숫자와 + 기호만 유지
      // Remove all spaces, dashes, parentheses, keep only numbers and + symbol
      return phone.replace(/[\s\-\(\)]/g, '');
    }
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