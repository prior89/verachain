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
 * - 이중 데이터베이스 지원 (Dual database support: MongoDB/Memory)
 * 
 * 개발자 참고사항 (Developer Notes):
 * - 모든 비밀번호는 bcrypt로 해싱됨 (All passwords are hashed with bcrypt)
 * - JWT 토큰은 generateToken 유틸리티로 생성 (JWT tokens generated via generateToken utility)
 * - 메모리 DB와 MongoDB 모두 지원 (Supports both memory DB and MongoDB)
 * - 에러 처리는 전역 에러 핸들러로 위임 (Error handling delegated to global error handler)
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * 사용자 등록 (User Registration)
 * 새로운 사용자 계정을 생성하고 JWT 토큰을 발급합니다
 * Creates a new user account and issues JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - 요청 본문 (Request body)
 * @param {string} req.body.name - 사용자 이름 (User name)
 * @param {string} req.body.email - 이메일 주소 (Email address)
 * @param {string} req.body.password - 비밀번호 (Password)
 * @param {string} req.body.phone - 전화번호 (Phone number)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 개발자 노트 (Developer Notes):
 * - 이메일 중복 확인 후 계정 생성 (Check email duplication before account creation)
 * - 메모리 DB 사용시 수동 bcrypt 해싱 (Manual bcrypt hashing when using memory DB)
 * - MongoDB 사용시 모델의 pre-save 미들웨어가 해싱 처리 (MongoDB model pre-save middleware handles hashing)
 * - 기본 멤버십 티어는 'basic' (Default membership tier is 'basic')
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const db = getDB();

    let userExists;
    let user;

    if (db.isMemoryDB) {
      // 메모리 데이터베이스 사용 (Using in-memory database)
      // 개발 및 테스트 환경에서 MongoDB 없이 실행 가능 (Can run without MongoDB in dev/test environments)
      userExists = await db.memoryDB.findUserByEmail(email);
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // 비밀번호 해싱 (Hash password)
      // 메모리 DB에서는 수동으로 bcrypt 처리 필요 (Manual bcrypt processing required for memory DB)
      const salt = await bcrypt.genSalt(10); // 솔트 생성 (Generate salt)
      const hashedPassword = await bcrypt.hash(password, salt); // 비밀번호 해싱 (Hash password)

      user = await db.memoryDB.createUser({
        name,
        email,
        password: hashedPassword,
        phone,
        membershipTier: 'basic',  // 기본 멤버십 (Default membership)
        isVerified: false         // 이메일 인증 대기 (Email verification pending)
      });
    } else {
      // MongoDB 사용 (Using MongoDB)
      // 프로덕션 환경에서 권장되는 데이터베이스 (Recommended database for production)
      userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // MongoDB User 모델의 pre-save 미들웨어가 비밀번호 해싱 처리
      // User model pre-save middleware handles password hashing
      user = await User.create({
        name,
        email,
        password, // 원본 비밀번호, 모델에서 해싱 처리 (Raw password, hashed in model)
        phone
      });
    }

    // JWT 토큰 생성 (Generate JWT token)
    // 사용자 인증 상태 유지를 위한 토큰 (Token for maintaining user authentication state)
    const token = generateToken(user._id);

    // 성공 응답 반환 (Return success response)
    // 민감한 정보(비밀번호) 제외하고 사용자 정보 반환 (Return user info excluding sensitive data like password)
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
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 사용자 로그인 (User Login)
 * 이메일과 비밀번호로 사용자 인증을 처리하고 JWT 토큰을 발급합니다
 * Handles user authentication with email and password, issues JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - 요청 본문 (Request body)
 * @param {string} req.body.email - 로그인 이메일 (Login email)
 * @param {string} req.body.password - 로그인 비밀번호 (Login password)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 보안 고려사항 (Security Considerations):
 * - 비밀번호 비교시 해시 비교 사용 (Uses hash comparison for password verification)
 * - 실패시 구체적인 오류 정보 노출하지 않음 (Doesn't expose specific error details on failure)
 * - 로그인 시도 로깅 (Login attempt logging)
 * 
 * 개발자 노트 (Developer Notes):
 * - MongoDB 사용시 User 모델의 matchPassword 메소드 활용 (Uses User model's matchPassword method for MongoDB)
 * - 메모리 DB 사용시 직접 bcrypt.compare 사용 (Direct bcrypt.compare for memory DB)
 */
const login = async (req, res, next) => {
  try {
    console.log('Login request body:', req.body); // 로그인 시도 로깅 (Log login attempts)
    const { email, password } = req.body;
    const db = getDB();

    // 입력 유효성 검증 (Input validation)
    // 필수 필드 확인 (Check required fields)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    let user;
    let isPasswordMatch = false;

    if (db.isMemoryDB) {
      // 메모리 데이터베이스 사용 (Using in-memory database)
      user = await db.memoryDB.findUserByEmail(email);
      
      if (!user) {
        // 보안상 구체적인 오류 정보 노출하지 않음 (Don't expose specific error for security)
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // 비밀번호 비교 (Compare password)
      // 메모리 DB에 저장된 해시와 입력 비밀번호 비교 (Compare input password with stored hash in memory DB)
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      // MongoDB 사용 (Using MongoDB)
      // +password: 기본적으로 select되지 않는 password 필드 포함 (Include password field not selected by default)
      user = await User.findOne({ email }).select('+password');

      if (!user) {
        // 보안상 이메일이 존재하지 않음을 구체적으로 알려주지 않음 (Don't reveal if email doesn't exist for security)
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // User 모델의 matchPassword 인스턴스 메소드 사용 (Use User model's matchPassword instance method)
      isPasswordMatch = await user.matchPassword(password);
    }

    // 비밀번호 일치 여부 확인 (Check password match)
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // JWT 토큰 생성 (Generate JWT token)
    const token = generateToken(user._id);

    // 응답 데이터 준비 (Prepare response data)
    // 비밀번호 등 민감한 정보는 제외 (Exclude sensitive information like password)
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      membershipTier: user.membershipTier,
      isVerified: user.isVerified,
      token
    };

    console.log('Login response data:', userData); // 성공 로그인 로깅 (Log successful login)

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 현재 사용자 정보 조회 (Get Current User Profile)
 * JWT 토큰으로 인증된 사용자의 프로필 정보를 반환합니다
 * Returns authenticated user's profile information based on JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - JWT 미들웨어에서 설정된 사용자 정보 (User info set by JWT middleware)
 * @param {string} req.user.id - 사용자 ID (User ID)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 개발자 노트 (Developer Notes):
 * - JWT 인증 미들웨어 통과 후 호출됨 (Called after JWT auth middleware)
 * - req.user는 토큰 검증 후 자동 설정됨 (req.user is automatically set after token verification)
 */
const getMe = async (req, res, next) => {
  try {
    // JWT 토큰에서 추출된 사용자 ID로 사용자 정보 조회 (Query user info using user ID from JWT token)
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 사용자 프로필 업데이트 (Update User Profile)
 * 인증된 사용자의 프로필 정보를 업데이트합니다
 * Updates authenticated user's profile information
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - 업데이트할 정보 (Information to update)
 * @param {string} req.body.username - 새 사용자명 (New username)
 * @param {string} req.body.email - 새 이메일 (New email)
 * @param {Object} req.user - JWT에서 추출된 사용자 정보 (User info from JWT)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 개발자 노트 (Developer Notes):
 * - 업데이트 가능한 필드만 선별하여 처리 (Only selected fields are updatable)
 * - MongoDB 검증기가 자동 실행됨 (MongoDB validators run automatically)
 * - new: true 옵션으로 업데이트된 문서 반환 (Returns updated document with new: true option)
 */
const updateProfile = async (req, res, next) => {
  try {
    // 업데이트 가능한 필드만 선별 (Select only updatable fields)
    // 보안상 모든 req.body를 그대로 사용하지 않음 (Don't use entire req.body for security)
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email
    };

    // 사용자 정보 업데이트 (Update user information)
    const user = await User.findByIdAndUpdate(
      req.user.id,                    // JWT에서 추출된 사용자 ID (User ID from JWT)
      fieldsToUpdate,                 // 업데이트할 필드들 (Fields to update)
      {
        new: true,                    // 업데이트된 문서 반환 (Return updated document)
        runValidators: true           // 스키마 검증기 실행 (Run schema validators)
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 비밀번호 변경 (Update Password)
 * 현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다
 * Verifies current password and updates to new password
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - 요청 본문 (Request body)
 * @param {string} req.body.currentPassword - 현재 비밀번호 (Current password)
 * @param {string} req.body.newPassword - 새 비밀번호 (New password)
 * @param {Object} req.user - JWT에서 추출된 사용자 정보 (User info from JWT)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 보안 고려사항 (Security Considerations):
 * - 현재 비밀번호 검증 필수 (Current password verification required)
 * - 새 토큰 발급으로 기존 세션 무효화 (Invalidate existing sessions with new token)
 * - 비밀번호 해싱은 모델의 pre-save 미들웨어에서 처리 (Password hashing handled by model pre-save middleware)
 */
const updatePassword = async (req, res, next) => {
  try {
    // 현재 사용자의 비밀번호 포함하여 조회 (Get current user including password)
    // +password: 기본적으로 select되지 않는 password 필드 포함 (Include password field not selected by default)
    const user = await User.findById(req.user.id).select('+password');

    // 현재 비밀번호 검증 (Verify current password)
    // 보안상 현재 비밀번호가 맞아야만 변경 허용 (Only allow change if current password is correct for security)
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 새 비밀번호 설정 (Set new password)
    // User 모델의 pre-save 미들웨어가 자동으로 해싱 처리 (User model pre-save middleware handles hashing automatically)
    user.password = req.body.newPassword;
    await user.save(); // save() 호출시 비밀번호 해싱 실행됨 (Password hashing executed on save())

    // 새 JWT 토큰 생성 (Generate new JWT token)
    // 비밀번호 변경 후 보안을 위해 새 토큰 발급 (Issue new token for security after password change)
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token // 클라이언트가 새 토큰으로 갱신해야 함 (Client must refresh with new token)
      }
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 비밀번호 재설정 요청 (Forgot Password Request)
 * 이메일로 비밀번호 재설정 토큰을 생성합니다
 * Generates password reset token for given email
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - 요청 본문 (Request body)
 * @param {string} req.body.email - 재설정 요청 이메일 (Email for password reset)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 보안 고려사항 (Security Considerations):
 * - 토큰은 SHA-256으로 해싱되어 저장 (Token is hashed with SHA-256 before storage)
 * - 토큰 유효시간 10분으로 제한 (Token expires after 10 minutes)
 * - 실제 환경에서는 이메일 발송 필요 (Email sending required in real environment)
 * 
 * TODO: 프로덕션에서는 이메일 발송 서비스 통합 필요
 * TODO: Production requires email service integration
 */
const forgotPassword = async (req, res, next) => {
  try {
    // 이메일로 사용자 찾기 (Find user by email)
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // 무작위 재설정 토큰 생성 (Generate random reset token)
    // 20바이트 랜덤 값을 16진수 문자열로 변환 (Convert 20-byte random value to hex string)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 토큰을 해싱하여 데이터베이스에 저장 (Hash token before storing in database)
    // 보안상 원본 토큰이 아닌 해시를 저장 (Store hash instead of raw token for security)
    user.resetPasswordToken = crypto
      .createHash('sha256')    // SHA-256 해시 사용 (Use SHA-256 hash)
      .update(resetToken)      // 원본 토큰 입력 (Input raw token)
      .digest('hex');          // 16진수 문자열로 출력 (Output as hex string)

    // 토큰 만료시간 설정 (Set token expiration)
    // 현재시간 + 10분 (10 minutes from now)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // 검증 없이 저장 (Save without validation)
    // 비밀번호 재설정시에는 기존 검증 규칙 건너뛰기 (Skip existing validation rules for password reset)
    await user.save({ validateBeforeSave: false });

    // TODO: 실제 환경에서는 이메일로 resetToken 발송
    // TODO: In production, send resetToken via email
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken // 개발용으로만 반환, 실제로는 이메일로 발송 (For dev only, should be sent via email in production)
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

/**
 * 비밀번호 재설정 실행 (Reset Password Execution)
 * 재설정 토큰을 검증하고 새 비밀번호로 변경합니다
 * Verifies reset token and changes to new password
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL 매개변수 (URL parameters)
 * @param {string} req.params.resettoken - 비밀번호 재설정 토큰 (Password reset token)
 * @param {Object} req.body - 요청 본문 (Request body)
 * @param {string} req.body.password - 새 비밀번호 (New password)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * 보안 고려사항 (Security Considerations):
 * - 토큰 만료시간 검증 (Token expiration verification)
 * - 사용된 토큰 즐시 삭제 (Immediate token deletion after use)
 * - 새 JWT 토큰 발급 (New JWT token issuance)
 * 
 * 개발자 노트 (Developer Notes):
 * - 토큰은 SHA-256으로 해싱하여 비교 (Token is hashed with SHA-256 for comparison)
 * - 만료시간은 MongoDB $gt 연산자로 비교 (Expiration compared using MongoDB $gt operator)
 */
const resetPassword = async (req, res, next) => {
  try {
    // URL에서 받은 재설정 토큰을 해싱 (Hash the reset token from URL)
    // 데이터베이스에 저장된 해시와 비교하기 위해 (For comparison with stored hash in database)
    const resetPasswordToken = crypto
      .createHash('sha256')         // SHA-256 해시 사용 (Use SHA-256 hash)
      .update(req.params.resettoken) // URL 파라미터의 토큰 (Token from URL parameter)
      .digest('hex');               // 16진수 문자열로 출력 (Output as hex string)

    // 해시된 토큰과 만료시간으로 사용자 찾기 (Find user by hashed token and expiration)
    const user = await User.findOne({
      resetPasswordToken,                    // 해시된 토큰 매칭 (Match hashed token)
      resetPasswordExpire: { $gt: Date.now() } // 만료시간이 현재시간보다 큰 경우 (Expiration time greater than now)
    });

    // 토큰이 잘못되었거나 만료된 경우 (If token is invalid or expired)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // 새 비밀번호 설정 및 토큰 정보 삭제 (Set new password and clear token info)
    user.password = req.body.password;           // 새 비밀번호 (모델에서 자동 해싱) (New password, auto-hashed by model)
    user.resetPasswordToken = undefined;         // 재설정 토큰 삭제 (Clear reset token)
    user.resetPasswordExpire = undefined;        // 만료시간 삭제 (Clear expiration time)
    await user.save(); // 저장시 User 모델의 pre-save 미들웨어가 비밀번호 해싱 (Password hashed by User model pre-save middleware)

    // 새 JWT 토큰 생성 (Generate new JWT token)
    // 비밀번호 재설정 후 즉시 로그인 상태로 만들기 (Automatically log in after password reset)
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token // 클라이언트는 이 토큰으로 인증 상태 유지 (Client maintains auth state with this token)
      }
    });
  } catch (error) {
    // 전역 에러 핸들러로 에러 전달 (Pass error to global error handler)
    next(error);
  }
};

// 인증 캬트롤러 함수들 내보내기 (Export authentication controller functions)
// 이 함수들은 /api/auth 라우트에서 사용됩니다 (These functions are used in /api/auth routes)
module.exports = {
  register,        // POST /api/auth/register - 사용자 등록 (User registration)
  login,           // POST /api/auth/login - 사용자 로그인 (User login)
  getMe,           // GET /api/auth/me - 내 정보 조회 (Get my profile)
  updateProfile,   // PUT /api/auth/profile - 프로필 업데이트 (Update profile)
  updatePassword,  // PUT /api/auth/password - 비밀번호 변경 (Change password)
  forgotPassword,  // POST /api/auth/forgotpassword - 비밀번호 재설정 요청 (Request password reset)
  resetPassword    // PUT /api/auth/resetpassword/:resettoken - 비밀번호 재설정 실행 (Execute password reset)
};