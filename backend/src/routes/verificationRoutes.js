const express = require('express');
const router = express.Router();
const { verifyProduct, verifyCertificate } = require('../controllers/verificationController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public verification endpoints (no auth required)
router.post('/barcode', optionalAuth, async (req, res) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }
    
    // Simulate verification logic
    const verification = {
      barcode,
      status: 'not_found',
      message: 'Product not found in database',
      timestamp: new Date()
    };
    
    res.json({
      success: false,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

router.post('/serial', optionalAuth, async (req, res) => {
  try {
    const { serialNumber } = req.body;
    
    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Serial number is required'
      });
    }
    
    const verification = {
      serialNumber,
      status: 'not_found',
      message: 'Serial number not found in database',
      timestamp: new Date()
    };
    
    res.json({
      success: false,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

router.post('/qr', optionalAuth, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }
    
    const verification = {
      qrData,
      status: 'not_found',
      message: 'QR code not recognized',
      timestamp: new Date()
    };
    
    res.json({
      success: false,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

router.post('/ocr', optionalAuth, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    const ocrResult = {
      text: 'Sample OCR text extracted',
      confidence: 0.85,
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      data: ocrResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'OCR processing failed'
    });
  }
});

// Protected endpoints
router.use(protect);

router.post('/product', verifyProduct);
router.post('/certificate', verifyCertificate);

module.exports = router;