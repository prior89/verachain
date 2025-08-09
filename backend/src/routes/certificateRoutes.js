const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get user's certificates
router.get('/my-certificates', async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ 
      owner: req.user._id,
      status: { $ne: 'BURNED' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
});

// Get single certificate
router.get('/:id', async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('owner', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;