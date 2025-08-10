/**
 * VeraChain 인증 컨트롤러 (Authentication Controller)
 * 사용자 인증, 등록, 프로필 관리를 담당하는 핵심 컨트롤러
 * Handles user authentication, registration, and profile management
 * 
 * 주요 기능 (Main Features):
 * - 사용자 등록 및 로그인 (User registration and login)
 * - JWT 토큰 기반 인증 (JWT token-based authentication)
 * - 비밀번호 재설정 (Password reset functionality)
 * - 프로필 업데이트 (Profile updates)
 * 
 * 개발자 참고사항 (Developer Notes):
 * - 모든 비밀번호는 bcrypt로 해싱됨 (All passwords are hashed with bcrypt)
 * - JWT 토큰은 generateToken 유틸리티로 생성 (JWT tokens generated via generateToken utility)
 * - 에러 처리는 전역 에러 핸들러로 위임 (Error handling delegated to global error handler)
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * 사용자 등록 (User Registration)
 * 새로운 사용자 계정을 생성하고 JWT 토큰을 발급합니다
 * Creates a new user account and issues JWT token
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // MongoDB에서 이메일 중복 확인
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // MongoDB User 모델의 pre-save 미들웨어가 비밀번호 해싱 처리
    const user = await User.create({
      name,
      email,
      password, // 원본 비밀번호, 모델에서 해싱 처리
      phone
    });

    // JWT 토큰 생성
    const token = generateToken(user._id);

    // 성공 응답 반환
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

/**
 * 사용자 로그인 (User Login)
 * 이메일과 비밀번호로 사용자 인증을 처리하고 JWT 토큰을 발급합니다
 * Handles user authentication with email and password, issues JWT token
 */
const login = async (req, res, next) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // 입력 유효성 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // MongoDB에서 사용자 조회 (+password: 기본적으로 select되지 않는 password 필드 포함)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // User 모델의 matchPassword 인스턴스 메소드 사용
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user._id);

    // 응답 데이터 준비 (비밀번호 제외)
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

/**
 * 현재 사용자 정보 조회 (Get Current User Profile)
 * JWT 토큰으로 인증된 사용자의 프로필 정보를 반환합니다
 * Returns authenticated user's profile information based on JWT token
 */
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

/**
 * 사용자 프로필 업데이트 (Update User Profile)
 * 인증된 사용자의 프로필 정보를 업데이트합니다
 * Updates authenticated user's profile information
 */
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

/**
 * 비밀번호 변경 (Update Password)
 * 현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다
 * Verifies current password and updates to new password
 */
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // 현재 비밀번호 검증
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 새 비밀번호 설정
    user.password = req.body.newPassword;
    await user.save();

    // 새 JWT 토큰 생성
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

/**
 * 비밀번호 재설정 요청 (Forgot Password Request)
 * 이메일로 비밀번호 재설정 토큰을 생성합니다
 * Generates password reset token for given email
 */
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // 무작위 재설정 토큰 생성
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 토큰을 해싱하여 데이터베이스에 저장
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 토큰 만료시간 설정 (10분)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // TODO: 실제 환경에서는 이메일로 resetToken 발송
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken // 개발용으로만 반환
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 비밀번호 재설정 실행 (Reset Password Execution)
 * 재설정 토큰을 검증하고 새 비밀번호로 변경합니다
 * Verifies reset token and changes to new password
 */
const resetPassword = async (req, res, next) => {
  try {
    // URL에서 받은 재설정 토큰을 해싱
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // 해시된 토큰과 만료시간으로 사용자 찾기
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

    // 새 비밀번호 설정 및 토큰 정보 삭제
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 새 JWT 토큰 생성
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

// 인증 컨트롤러 함수들 내보내기
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
};