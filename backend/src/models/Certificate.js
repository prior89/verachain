const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  // Public display ID - always generated fresh
  displayId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Current owner only - no history
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Public product information
  productInfo: {
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['handbag', 'watch', 'jewelry', 'clothing', 'shoes', 'accessories', 'other'],
      required: true
    }
  },
  
  // Verification data (current only)
  verification: {
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100
    },
    ocrConfidence: {
      type: Number,
      min: 0,
      max: 100
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['verified', 'pending', 'failed'],
      default: 'pending'
    }
  },
  
  // NFT data (minimal public info)
  nft: {
    tokenId: String,
    contractAddress: String,
    mintDate: Date
  },
  
  // Private data - NEVER sent to frontend
  _private: {
    previousDisplayIds: [String],
    transferHistory: [{
      from: String,
      to: String,
      timestamp: Date,
      txHash: String
    }],
    originalProductImages: [String],
    originalCertificateImages: [String],
    actualSerialNumber: String,
    internalNotes: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
certificateSchema.index({ displayId: 1 });
certificateSchema.index({ currentOwner: 1 });
certificateSchema.index({ 'productInfo.brand': 1 });
certificateSchema.index({ 'verification.status': 1 });

// Generate new display ID
certificateSchema.statics.generateDisplayId = function() {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VERA-${year}-${randomPart}`;
};

// Method to create public JSON (hides private data)
certificateSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  
  // Remove all private fields
  delete obj._private;
  delete obj.__v;
  
  // Always generate a fresh display ID for each view
  obj.displayId = certificateSchema.statics.generateDisplayId();
  
  // Show only current verification
  obj.verification = {
    status: obj.verification.status,
    timestamp: new Date(), // Always show current time
    confidence: Math.round((obj.verification.aiConfidence + obj.verification.ocrConfidence) / 2)
  };
  
  // Remove any tracking data
  delete obj.createdAt;
  delete obj.updatedAt;
  
  return obj;
};

// Method to transfer (creates new certificate, archives old)
certificateSchema.methods.transfer = async function(newOwner, txHash) {
  // Store transfer in private history
  this._private.transferHistory.push({
    from: this.currentOwner.toString(),
    to: newOwner.toString(),
    timestamp: new Date(),
    txHash
  });
  
  // Archive old display ID
  this._private.previousDisplayIds.push(this.displayId);
  
  // Generate completely new display ID
  this.displayId = certificateSchema.statics.generateDisplayId();
  this.currentOwner = newOwner;
  
  await this.save();
  
  // Return only new public data
  return this.toPublicJSON();
};

// Method to verify authenticity
certificateSchema.methods.verify = async function(aiScore, ocrScore) {
  this.verification.aiConfidence = aiScore;
  this.verification.ocrConfidence = ocrScore;
  this.verification.timestamp = new Date();
  
  const avgScore = (aiScore + ocrScore) / 2;
  this.verification.status = avgScore >= 80 ? 'verified' : 'failed';
  
  await this.save();
  return this.toPublicJSON();
};

// Static method to find without exposing history
certificateSchema.statics.findPublic = async function(query) {
  const certificates = await this.find(query);
  return certificates.map(cert => cert.toPublicJSON());
};

// Pre-save hook to ensure display ID
certificateSchema.pre('save', function(next) {
  if (!this.displayId) {
    this.displayId = certificateSchema.statics.generateDisplayId();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);