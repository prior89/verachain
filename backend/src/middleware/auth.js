/**
 * JWT 인증 미들웨어 (JWT Authentication Middleware)
 * JWT 토큰을 검증하고 사용자 정보를 요청 객체에 추가합니다
 * Verifies JWT tokens and adds user information to request object
 * 
 * 개발자 참고사항 (Developer Notes):
 * - 메모리 DB와 MongoDB 모두 지원 (Supports both memory DB and MongoDB)
 * - Bearer 토큰 형식만 허용 (Only accepts Bearer token format)
 * - 토큰 검증 실패시 401 에러 반환 (Returns 401 error on token verification failure)
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDB } = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Authorization 헤더에서 토큰 추출 (Extract token from Authorization header)
      token = req.headers.authorization.split(' ')[1];
      
      // JWT 토큰 검증 (Verify JWT token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 데이터베이스 타입에 따른 사용자 조회 (Query user based on database type)
      const db = getDB();
      let user;
      
      if (db.isMemoryDB) {
        // 메모리 데이터베이스에서 사용자 조회 (Query user from memory database)
        user = await db.memoryDB.findUserById(decoded.id);
        if (user) {
          // 비밀번호 제거 (Remove password from user object)
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
        }
      } else {
        // MongoDB에서 사용자 조회 (Query user from MongoDB)
        req.user = await User.findById(decoded.id).select('-password');
      }
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'  // 사용자를 찾을 수 없음 (User not found)
        });
      }
      
      next(); // 다음 미들웨어로 진행 (Proceed to next middleware)
    } catch (error) {
      console.error('JWT verification error:', error.message); // 디버깅용 로그 (Debug log)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'  // 토큰 검증 실패 (Token verification failed)
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'  // 토큰이 제공되지 않음 (No token provided)
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * 선택적 인증 미들웨어 (Optional Authentication Middleware)
 * 토큰이 있으면 사용자 정보를 추가하고, 없어도 계속 진행합니다
 * Adds user information if token exists, but continues even without token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 데이터베이스 타입에 따른 사용자 조회 (Query user based on database type)
      const db = getDB();
      
      if (db.isMemoryDB) {
        // 메모리 데이터베이스에서 사용자 조회 (Query user from memory database)
        const user = await db.memoryDB.findUserById(decoded.id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
        }
      } else {
        // MongoDB에서 사용자 조회 (Query user from MongoDB)
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // 토큰 검증 실패시에도 계속 진행 (Continue even if token verification fails)
      req.user = null;
    }
  }
  
  next(); // 항상 다음 미들웨어로 진행 (Always proceed to next middleware)
};

// 인증 미들웨어 함수들을 모듈로 내보내기 (Export authentication middleware functions as module)
module.exports = { 
  protect,      // 필수 인증 미들웨어 (Required authentication middleware)
  authorize,    // 역할 기반 권한 확인 (Role-based authorization)
  optionalAuth  // 선택적 인증 미들웨어 (Optional authentication middleware)
};