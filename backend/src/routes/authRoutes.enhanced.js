const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const {
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
} = require('../controllers/authController.enhanced');

// Import original controllers for backwards compatibility
const {
  login,
  register,
  getMe,
  updateProfile,
  updatePassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Session configuration for OAuth
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'verachain-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use MongoDB session store if available
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // 24 hours
  });
}

router.use(session(sessionConfig));

// Original routes (backwards compatibility)
router.post('/login', login);
router.post('/register', register);
router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/update-password', updatePassword);
router.post('/forgot-password', forgotPasswordEnhanced);
router.put('/reset-password/:resettoken', resetPassword);

// Enhanced authentication routes
router.post('/login-enhanced', loginWithPassport);
router.post('/register-enhanced', registerEnhanced);
router.get('/profile', jwtAuth, getProfileJWT);
router.post('/setup-2fa', jwtAuth, setupTwoFactor);

// OAuth Routes
// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook OAuth  
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// OAuth success/error pages for frontend
router.get('/success', (req, res) => {
  const { token, user } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Successful</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #28a745; }
        </style>
    </head>
    <body>
        <div class="success">
            <h1>Authentication Successful!</h1>
            <p>You will be redirected shortly...</p>
        </div>
        <script>
            const token = "${token}";
            const user = ${user || '{}'};
            
            if (token && window.opener) {
                window.opener.postMessage({ token, user, success: true }, '*');
                window.close();
            } else {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        </script>
    </body>
    </html>
  `);
});

router.get('/error', (req, res) => {
  const { message } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Error</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="error">
            <h1>Authentication Error</h1>
            <p>Error: ${message || 'Unknown error'}</p>
            <p><a href="/">Go back to login</a></p>
        </div>
        <script>
            if (window.opener) {
                window.opener.postMessage({ error: "${message}", success: false }, '*');
                window.close();
            }
        </script>
    </body>
    </html>
  `);
});

// Health check for authentication service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication service is running',
    features: {
      local: true,
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      jwt: true,
      twoFactor: true,
      session: true
    }
  });
});

module.exports = router;