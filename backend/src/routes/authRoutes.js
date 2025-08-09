const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Debug route to test body parsing
router.post('/test', (req, res) => {
  console.log('Test route - body:', req.body);
  console.log('Test route - headers:', req.headers);
  res.json({ 
    success: true, 
    body: req.body,
    hasEmail: !!req.body?.email,
    hasPassword: !!req.body?.password
  });
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

router.use(protect);

router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/update-password', updatePassword);

module.exports = router;