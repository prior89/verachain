const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required']
  },
  mediaType: {
    type: String,
    enum: ['video', 'image'],
    required: true
  },
  timeSlots: [{
    start: {
      type: Number, // Hour (0-23)
      min: 0,
      max: 23
    },
    end: {
      type: Number,
      min: 0,
      max: 23
    }
  }],
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  targetAudience: {
    membershipTiers: [{
      type: String,
      enum: ['basic', 'premium', 'vip']
    }],
    regions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
AdvertisementSchema.index({ active: 1, priority: -1 });
AdvertisementSchema.index({ brand: 1 });
AdvertisementSchema.index({ expiresAt: 1 });

// Method to check if ad is active in current time slot
AdvertisementSchema.methods.isActiveNow = function() {
  if (!this.active) return false;
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    return false;
  }
  
  const currentHour = new Date().getHours();
  
  // If no time slots specified, always active
  if (!this.timeSlots || this.timeSlots.length === 0) {
    return true;
  }
  
  // Check if current hour is within any time slot
  return this.timeSlots.some(slot => {
    if (slot.start <= slot.end) {
      return currentHour >= slot.start && currentHour <= slot.end;
    } else {
      // Handle overnight slots (e.g., 22:00 - 02:00)
      return currentHour >= slot.start || currentHour <= slot.end;
    }
  });
};

// Method to increment impressions
AdvertisementSchema.methods.recordImpression = async function() {
  this.impressions += 1;
  await this.save();
};

// Method to increment clicks
AdvertisementSchema.methods.recordClick = async function() {
  this.clicks += 1;
  await this.save();
};

// Static method to get current ad based on time and priority
AdvertisementSchema.statics.getCurrentAd = async function(userTier = 'basic') {
  const currentHour = new Date().getHours();
  
  // Find all active ads
  const ads = await this.find({
    active: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1 });
  
  // Filter by time slot and audience
  const eligibleAds = ads.filter(ad => {
    // Check time slot
    if (!ad.isActiveNow()) return false;
    
    // Check target audience
    if (ad.targetAudience.membershipTiers && ad.targetAudience.membershipTiers.length > 0) {
      if (!ad.targetAudience.membershipTiers.includes(userTier)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Return highest priority ad
  if (eligibleAds.length > 0) {
    const selectedAd = eligibleAds[0];
    await selectedAd.recordImpression();
    return selectedAd;
  }
  
  // Return default ad if no eligible ads
  return {
    brand: 'VeraChain',
    mediaUrl: '/assets/ads/default.mp4',
    mediaType: 'video',
    title: 'Luxury Authentication Redefined'
  };
};

// Static method to get ad schedule
AdvertisementSchema.statics.getSchedule = async function() {
  const ads = await this.find({ active: true })
    .select('brand title timeSlots priority')
    .sort({ priority: -1 });
  
  // Group by time slots
  const schedule = {};
  for (let hour = 0; hour < 24; hour++) {
    schedule[hour] = ads.filter(ad => {
      if (!ad.timeSlots || ad.timeSlots.length === 0) return true;
      
      return ad.timeSlots.some(slot => {
        if (slot.start <= slot.end) {
          return hour >= slot.start && hour <= slot.end;
        } else {
          return hour >= slot.start || hour <= slot.end;
        }
      });
    }).map(ad => ({
      brand: ad.brand,
      title: ad.title,
      priority: ad.priority
    }));
  }
  
  return schedule;
};

module.exports = mongoose.model('Advertisement', AdvertisementSchema);