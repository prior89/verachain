const aiService = require('../services/aiService');
const ocrService = require('../services/ocrService');
const blockchainService = require('../services/blockchainService');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Product verification - AI-powered with NO history
 */
const verifyProduct = async (req, res, next) => {
  try {
    const { image, type } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }
    
    // Run AI verification
    const aiResult = await aiService.verifyProduct(image);
    
    // Detect brand
    const brandResult = await aiService.detectBrand(image);
    
    // Extract features
    const features = await aiService.extractFeatures(image);
    
    // Check for counterfeits
    const counterfeitCheck = await aiService.detectCounterfeit(image, brandResult.brand);
    
    // Generate temporary session ID for this scan
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // Store in session for certificate scan (expires in 5 minutes)
    req.session = req.session || {};
    req.session.verificationData = {
      sessionId,
      productData: {
        brand: brandResult.brand,
        verified: aiResult.verified && !counterfeitCheck.isCounterfeit,
        confidence: aiResult.confidence,
        features: features.features,
        timestamp: new Date()
      },
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    // Return verification result WITHOUT any historical data
    res.json({
      verified: aiResult.verified && !counterfeitCheck.isCounterfeit,
      confidence: aiResult.confidence,
      product: {
        id: `prod_${sessionId}`, // Temporary ID
        brand: brandResult.brand,
        model: 'Detected Model', // Would be extracted from image
        serial: 'HIDDEN' // Never expose real serial
      },
      features: features.features,
      recommendation: counterfeitCheck.recommendation,
      nextStep: aiResult.verified ? 'Proceed with certificate scan' : 'Verification failed'
      // NO previous verifications or comparisons
    });
  } catch (error) {
    console.error('Product verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
};

/**
 * Certificate verification - OCR with NO previous certificates
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { image, productId } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Certificate image is required'
      });
    }
    
    // Check if product was verified first
    if (!req.session || !req.session.verificationData || 
        req.session.verificationData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Please verify product first'
      });
    }
    
    // Run OCR extraction
    const ocrResult = await ocrService.extractCertificateData(image);
    
    // Analyze document quality
    const qualityAnalysis = await ocrService.analyzeDocumentQuality(image);
    
    // Check for hologram
    const hologramCheck = await ocrService.detectHologram(image);
    
    // Combined verification
    const isVerified = ocrResult.authentic && 
                      qualityAnalysis.authentic && 
                      ocrResult.confidence > 0.8;
    
    if (isVerified) {
      // Create new certificate with fresh ID
      const certificate = new Certificate({
        displayId: Certificate.generateDisplayId(),
        currentOwner: req.user?._id || req.session.verificationData.sessionId,
        productInfo: {
          brand: req.session.verificationData.productData.brand,
          model: ocrResult.extractedData.model || 'Classic',
          category: 'handbag' // Would be determined by AI
        },
        verification: {
          aiConfidence: req.session.verificationData.productData.confidence * 100,
          ocrConfidence: ocrResult.confidence * 100,
          status: 'verified',
          timestamp: new Date()
        },
        _private: {
          // Store actual data privately
          actualSerialNumber: ocrResult.extractedData.serial,
          originalProductImages: [image],
          originalCertificateImages: [image]
        }
      });
      
      await certificate.save();
      
      // Mint NFT
      const nftResult = await blockchainService.mintNFT(
        req.user?.walletAddress || req.user?._id?.toString() || certificate.displayId,
        certificate.productInfo
      );
      
      // Update certificate with NFT data
      certificate.nft = {
        tokenId: nftResult.tokenId,
        contractAddress: process.env.CONTRACT_ADDRESS || '0x0',
        mintDate: new Date()
      };
      await certificate.save();
      
      // Clear session data
      delete req.session.verificationData;
      
      // Return success with public data only
      res.json({
        verified: true,
        ocrConfidence: ocrResult.confidence,
        extractedData: {
          certNumber: certificate.displayId, // Fresh ID
          issueDate: new Date().toISOString().split('T')[0],
          issuer: ocrResult.extractedData.issuer || 'Official Boutique'
          // NO historical certificate data
        },
        certificate: certificate.toPublicJSON(),
        nft: {
          tokenId: nftResult.tokenId,
          txHash: nftResult.txHash,
          explorer: `https://amoy.polygonscan.com/tx/${nftResult.txHash}`
        }
      });
    } else {
      res.json({
        verified: false,
        ocrConfidence: ocrResult.confidence,
        reason: 'Certificate authentication failed',
        qualityScore: qualityAnalysis.textureScore
      });
    }
  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Certificate verification failed'
    });
  }
};

/**
 * Verify QR code from NFT certificate
 */
const verifyQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: 'QR data is required'
      });
    }
    
    // Parse QR data (should contain certificate ID)
    const certId = qrData.certificateId || qrData;
    
    // Find certificate
    const certificate = await Certificate.findOne({ displayId: certId })
      .populate('currentOwner', 'name');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
    
    // Verify on blockchain
    const isValid = await blockchainService.verifyOwnership(
      certificate.nft.tokenId,
      certificate.currentOwner.walletAddress || certificate.currentOwner._id.toString()
    );
    
    // Return verification result with fresh display ID
    res.json({
      valid: isValid,
      certificate: {
        displayId: Certificate.generateDisplayId(), // Always new
        brand: certificate.productInfo.brand,
        model: certificate.productInfo.model,
        status: certificate.verification.status,
        verifiedDate: new Date().toISOString()
        // NO ownership history
      }
    });
  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({
      success: false,
      error: 'QR verification failed'
    });
  }
};

/**
 * Get verification statistics (no individual history)
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user?._id || 'anonymous';
    
    // Get aggregated stats only
    const totalCerts = await Certificate.countDocuments({ currentOwner: userId });
    const verifiedCerts = await Certificate.countDocuments({ 
      currentOwner: userId,
      'verification.status': 'verified'
    });
    
    res.json({
      stats: {
        totalCertificates: totalCerts,
        verifiedCertificates: verifiedCerts,
        successRate: totalCerts > 0 ? (verifiedCerts / totalCerts * 100).toFixed(1) : 0,
        memberSince: req.user?.createdAt || new Date()
        // NO individual verification history
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
};

module.exports = {
  verifyProduct,
  verifyCertificate,
  verifyQR,
  getStats
};