const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const db = getDB();

    let userExists;
    let user;

    if (db.isMemoryDB) {
      // Using in-memory database
      userExists = await db.memoryDB.findUserByEmail(email);
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await db.memoryDB.createUser({
        name,
        email,
        password: hashedPassword,
        phone,
        membershipTier: 'basic',
        isVerified: false
      });
    } else {
      // Using MongoDB
      userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      user = await User.create({
        name,
        email,
        password,
        phone
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        membershipTier: user.membershipTier || 'basic',
        isVerified: user.isVerified || false,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    const db = getDB();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    let user;
    let isPasswordMatch = false;

    if (db.isMemoryDB) {
      // Using in-memory database
      user = await db.memoryDB.findUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Compare password
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Using MongoDB
      user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      isPasswordMatch = await user.matchPassword(password);
    }

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    // Ensure we have all user data
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      membershipTier: user.membershipTier,
      isVerified: user.isVerified,
      token
    };

    console.log('Login response data:', userData);

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
};