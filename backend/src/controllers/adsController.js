const Advertisement = require('../models/Advertisement');
const User = require('../models/User');

/**
 * Get current ad based on time - NO tracking
 */
const getCurrentAd = async (req, res, next) => {
  try {
    const userTier = req.user?.membershipTier || 'basic';
    
    // Get ad based on current time
    const ad = await Advertisement.getCurrentAd(userTier);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'No advertisements available'
      });
    }
    
    res.json({
      success: true,
      ad: {
        brand: ad.brand,
        title: ad.title,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        displayTime: new Date().toISOString() // Always current
        // NO view history or impression tracking
      }
    });
  } catch (error) {
    console.error('Get current ad error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get advertisement'
    });
  }
};

/**
 * Get ad schedule for the day
 */
const getSchedule = async (req, res, next) => {
  try {
    const schedule = await Advertisement.getSchedule();
    
    // Return schedule without tracking data
    const publicSchedule = {};
    for (const [hour, ads] of Object.entries(schedule)) {
      publicSchedule[hour] = ads.map(ad => ({
        brand: ad.brand,
        title: ad.title,
        priority: ad.priority
        // NO impression counts
      }));
    }
    
    res.json({
      success: true,
      schedule: publicSchedule,
      currentHour: new Date().getHours()
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ad schedule'
    });
  }
};

/**
 * Track ad impression (anonymous)
 */
const trackImpression = async (req, res, next) => {
  try {
    const { adId } = req.body;
    
    if (!adId) {
      return res.status(400).json({
        success: false,
        error: 'Ad ID is required'
      });
    }
    
    // Find ad
    const ad = await Advertisement.findById(adId);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    // Record impression anonymously
    await ad.recordImpression();
    
    res.json({
      success: true,
      message: 'Impression recorded'
      // NO user tracking
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track impression'
    });
  }
};

/**
 * Track ad click (anonymous)
 */
const trackClick = async (req, res, next) => {
  try {
    const { adId } = req.body;
    
    if (!adId) {
      return res.status(400).json({
        success: false,
        error: 'Ad ID is required'
      });
    }
    
    // Find ad
    const ad = await Advertisement.findById(adId);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    // Record click anonymously
    await ad.recordClick();
    
    res.json({
      success: true,
      message: 'Click recorded'
      // NO user tracking
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
};

/**
 * Create new advertisement (admin only)
 */
const createAd = async (req, res, next) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const {
      brand,
      title,
      mediaUrl,
      mediaType,
      timeSlots,
      priority,
      expiresAt,
      targetAudience
    } = req.body;
    
    // Validate required fields
    if (!brand || !mediaUrl || !mediaType) {
      return res.status(400).json({
        success: false,
        error: 'Brand, media URL, and media type are required'
      });
    }
    
    // Create advertisement
    const ad = new Advertisement({
      brand,
      title,
      mediaUrl,
      mediaType,
      timeSlots: timeSlots || [],
      priority: priority || 0,
      expiresAt,
      targetAudience: targetAudience || {},
      active: true
    });
    
    await ad.save();
    
    res.status(201).json({
      success: true,
      ad: {
        id: ad._id,
        brand: ad.brand,
        title: ad.title,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        timeSlots: ad.timeSlots,
        priority: ad.priority,
        active: ad.active
      }
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create advertisement'
    });
  }
};

/**
 * Update advertisement (admin only)
 */
const updateAd = async (req, res, next) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { adId } = req.params;
    const updates = req.body;
    
    // Find and update ad
    const ad = await Advertisement.findByIdAndUpdate(
      adId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    res.json({
      success: true,
      ad: {
        id: ad._id,
        brand: ad.brand,
        title: ad.title,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        timeSlots: ad.timeSlots,
        priority: ad.priority,
        active: ad.active
      }
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update advertisement'
    });
  }
};

/**
 * Delete advertisement (admin only)
 */
const deleteAd = async (req, res, next) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { adId } = req.params;
    
    // Soft delete by deactivating
    const ad = await Advertisement.findByIdAndUpdate(
      adId,
      { active: false },
      { new: true }
    );
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Advertisement deactivated'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete advertisement'
    });
  }
};

/**
 * Get all advertisements (admin only)
 */
const getAllAds = async (req, res, next) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const ads = await Advertisement.find()
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: ads.length,
      ads: ads.map(ad => ({
        id: ad._id,
        brand: ad.brand,
        title: ad.title,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        timeSlots: ad.timeSlots,
        priority: ad.priority,
        active: ad.active,
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions * 100).toFixed(2) : 0
      }))
    });
  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get advertisements'
    });
  }
};

module.exports = {
  getCurrentAd,
  getSchedule,
  trackImpression,
  trackClick,
  createAd,
  updateAd,
  deleteAd,
  getAllAds
};