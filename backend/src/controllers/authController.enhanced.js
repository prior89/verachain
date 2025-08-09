const passport = require('passport');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Enhanced login with Passport Local Strategy
const loginWithPassport = async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Invalid credentials'
      });
    }

    try {
      const token = generateToken(user._id || user.id);
      
      const userData = {
        _id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || false,
        authProvider: user.authProvider || 'local',
        avatar: user.avatar,
        token
      };

      res.status(200).json({
        success: true,
        data: userData,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

// Google OAuth login
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

const googleCallback = async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=oauth_error`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=oauth_cancelled`);
    }

    try {
      const token = generateToken(user._id || user.id);
      const userData = {
        _id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || true,
        authProvider: 'google',
        avatar: user.avatar,
        token
      };

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=token_generation_failed`);
    }
  })(req, res, next);
};

// Facebook OAuth login
const facebookAuth = passport.authenticate('facebook', {
  scope: ['email']
});

const facebookCallback = async (req, res, next) => {
  passport.authenticate('facebook', { session: false }, async (err, user) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=oauth_error`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=oauth_cancelled`);
    }

    try {
      const token = generateToken(user._id || user.id);
      const userData = {
        _id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || true,
        authProvider: 'facebook',
        avatar: user.avatar,
        token
      };

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=token_generation_failed`);
    }
  })(req, res, next);
};

// Enhanced registration with additional validation
const registerEnhanced = async (req, res, next) => {
  try {
    const { name, email, password, phone, acceptTerms, newsletter } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
      });
    }

    const db = getDB();
    let userExists;
    let user;

    if (db.isMemoryDB) {
      userExists = await db.memoryDB.findUserByEmail(email);
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await db.memoryDB.createUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone?.trim(),
        membershipTier: 'basic',
        isVerified: false,
        authProvider: 'local',
        newsletter: newsletter || false,
        createdAt: new Date(),
        lastLogin: null
      });
    } else {
      userExists = await User.findOne({ email: email.toLowerCase().trim() });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone?.trim(),
        authProvider: 'local',
        newsletter: newsletter || false
      });
    }

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      data: {
        _id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || false,
        authProvider: user.authProvider || 'local',
        token
      },
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
};

// JWT Protected route middleware
const jwtAuth = passport.authenticate('jwt', { session: false });

// Get user profile with JWT
const getProfileJWT = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        _id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || false,
        authProvider: user.authProvider || 'local',
        avatar: user.avatar,
        phone: user.phone,
        newsletter: user.newsletter,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// Two-factor authentication setup (basic implementation)
const setupTwoFactor = async (req, res, next) => {
  try {
    const user = req.user;
    const secret = crypto.randomBytes(32).toString('hex');

    const db = getDB();
    
    if (db.isMemoryDB) {
      await db.memoryDB.updateUser(user._id || user.id, {
        twoFactorSecret: secret,
        twoFactorEnabled: false
      });
    } else {
      await User.findByIdAndUpdate(user._id || user.id, {
        twoFactorSecret: secret,
        twoFactorEnabled: false
      });
    }

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/VeraChain:${user.email}?secret=${secret}&issuer=VeraChain`)}`
      },
      message: 'Two-factor authentication secret generated'
    });
  } catch (error) {
    next(error);
  }
};

// Enhanced password reset with better security
const forgotPasswordEnhanced = async (req, res, next) => {
  try {
    const { email } = req.body;
    const db = getDB();
    let user;

    if (db.isMemoryDB) {
      user = await db.memoryDB.findUserByEmail(email.toLowerCase().trim());
    } else {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    if (db.isMemoryDB) {
      await db.memoryDB.updateUser(user._id || user.id, {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire
      });
    } else {
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpire = resetTokenExpire;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken: resetToken // In production, send this via email
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginWithPassport,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  registerEnhanced,
  jwtAuth,
  getProfileJWT,
  setupTwoFactor,
  forgotPasswordEnhanced
};