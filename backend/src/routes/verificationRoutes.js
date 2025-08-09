const express = require('express');
const router = express.Router();
const { verifyProduct, verifyCertificate } = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/product', verifyProduct);
router.post('/certificate', verifyCertificate);

module.exports = router;