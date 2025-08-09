const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name must be less than 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['handbag', 'watch', 'jewelry', 'clothing', 'shoes', 'accessories', 'other']
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  images: [{
    url: String,
    public_id: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'counterfeit'],
    default: 'pending'
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    authenticityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  blockchainData: {
    transactionHash: String,
    blockNumber: Number,
    contractAddress: String,
    tokenId: String,
    chainId: Number
  },
  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferDate: {
      type: Date,
      default: Date.now
    },
    transactionHash: String
  }],
  qrCode: {
    data: String,
    image: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ serialNumber: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ verificationStatus: 1 });
productSchema.index({ brand: 1, category: 1 });

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.methods.generateQRCode = async function() {
  const qrData = {
    productId: this._id,
    serialNumber: this.serialNumber,
    brand: this.brand,
    verificationUrl: `${process.env.FRONTEND_URL}/verify/${this._id}`
  };
  
  this.qrCode.data = JSON.stringify(qrData);
  return this.qrCode.data;
};

module.exports = mongoose.model('Product', productSchema);