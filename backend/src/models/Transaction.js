const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mint', 'transfer', 'burn', 'verify', 'scan'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  blockchain: {
    txHash: String,
    blockNumber: Number,
    gasUsed: String,
    gasPrice: String,
    network: {
      type: String,
      default: 'polygon'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending'
    },
    confirmations: {
      type: Number,
      default: 0
    }
  },
  details: {
    from: String,
    to: String,
    tokenId: String,
    contractAddress: String,
    method: String,
    value: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    device: {
      type: String,
      model: String,
      os: String
    }
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
TransactionSchema.index({ userId: 1, timestamp: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ 'blockchain.txHash': 1 });
TransactionSchema.index({ 'blockchain.status': 1 });
TransactionSchema.index({ certificateId: 1 });

// Update transaction status
TransactionSchema.methods.updateStatus = async function(status, txData) {
  this.blockchain.status = status;
  
  if (status === 'confirmed') {
    this.completedAt = new Date();
    if (txData) {
      this.blockchain.blockNumber = txData.blockNumber;
      this.blockchain.gasUsed = txData.gasUsed;
      this.blockchain.confirmations = txData.confirmations;
    }
  } else if (status === 'failed' && txData) {
    this.error = {
      message: txData.message || 'Transaction failed',
      code: txData.code
    };
  }
  
  await this.save();
};

// Static method to get user transactions
TransactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const query = { userId };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.status) {
    query['blockchain.status'] = options.status;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 50)
    .populate('certificateId')
    .populate('productId');
};

// Static method to get pending transactions
TransactionSchema.statics.getPendingTransactions = function() {
  return this.find({ 'blockchain.status': 'pending' })
    .sort({ timestamp: 1 });
};

module.exports = mongoose.model('Transaction', TransactionSchema);