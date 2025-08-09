const blockchainService = require('../services/blockchainService');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Mint NFT - Creates COMPLETELY NEW certificate with new displayId
 */
const mintNFT = async (req, res, next) => {
  try {
    const { certificateId } = req.body;
    const userId = req.user?._id;
    
    if (!certificateId) {
      return res.status(400).json({
        success: false,
        error: 'Certificate ID is required'
      });
    }
    
    // Find certificate
    const certificate = await Certificate.findOne({ 
      displayId: certificateId,
      currentOwner: userId 
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
    
    if (certificate.nft?.tokenId) {
      // Already minted - return with FRESH display ID
      return res.json({
        success: true,
        displayId: Certificate.generateDisplayId(), // Always new
        tokenId: certificate.nft.tokenId,
        message: 'NFT already minted'
        // NO mint history
      });
    }
    
    // Mint new NFT
    const nftResult = await blockchainService.mintNFT(
      req.user?.walletAddress || userId.toString(),
      certificate.productInfo
    );
    
    // Update certificate with NFT data
    certificate.nft = {
      tokenId: nftResult.tokenId,
      contractAddress: process.env.CONTRACT_ADDRESS || '0x0',
      mintDate: new Date()
    };
    
    // Generate new display ID
    const oldDisplayId = certificate.displayId;
    certificate.displayId = Certificate.generateDisplayId();
    
    // Store old ID in private history
    if (!certificate._private) certificate._private = {};
    if (!certificate._private.previousDisplayIds) certificate._private.previousDisplayIds = [];
    certificate._private.previousDisplayIds.push(oldDisplayId);
    
    await certificate.save();
    
    res.json({
      success: true,
      displayId: certificate.displayId, // New ID
      tokenId: nftResult.tokenId,
      txHash: nftResult.txHash,
      blockNumber: nftResult.blockNumber,
      explorer: `https://amoy.polygonscan.com/tx/${nftResult.txHash}`
      // NO connection to previous certificates
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint NFT'
    });
  }
};

/**
 * Transfer NFT - Burns old, mints new with no trace
 */
const transferNFT = async (req, res, next) => {
  try {
    const { tokenId, toAddress, certificateId } = req.body;
    const fromUserId = req.user?._id;
    
    if (!toAddress) {
      return res.status(400).json({
        success: false,
        error: 'Recipient address is required'
      });
    }
    
    // Find certificate by current owner
    const certificate = await Certificate.findOne({
      'nft.tokenId': tokenId,
      currentOwner: fromUserId
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or not owned by you'
      });
    }
    
    // Find recipient user
    const toUser = await User.findOne({ walletAddress: toAddress });
    const toUserId = toUser?._id || toAddress;
    
    // Burn old and mint new NFT
    const transferResult = await blockchainService.transferNFT(
      req.user?.walletAddress || fromUserId.toString(),
      toAddress,
      tokenId
    );
    
    // Update certificate with transfer (hidden in private)
    if (!certificate._private) certificate._private = {};
    if (!certificate._private.transferHistory) certificate._private.transferHistory = [];
    certificate._private.transferHistory.push({
      from: fromUserId.toString(),
      to: toUserId.toString(),
      timestamp: new Date(),
      txHash: transferResult.txHash
    });
    
    // Archive old display ID
    if (!certificate._private.previousDisplayIds) certificate._private.previousDisplayIds = [];
    certificate._private.previousDisplayIds.push(certificate.displayId);
    
    // Set new owner and generate completely new display ID
    certificate.currentOwner = toUserId;
    certificate.displayId = transferResult.displayId; // New from blockchain service
    certificate.nft.tokenId = transferResult.tokenId; // New token ID
    
    await certificate.save();
    
    res.json({
      success: true,
      displayId: certificate.displayId, // Completely new ID
      newTokenId: transferResult.tokenId, // New token
      txHash: transferResult.txHash,
      blockNumber: transferResult.blockNumber,
      explorer: `https://amoy.polygonscan.com/tx/${transferResult.txHash}`,
      message: 'Transfer complete. New certificate issued.'
      // NO connection to old certificate visible
    });
  } catch (error) {
    console.error('Transfer NFT error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transfer NFT'
    });
  }
};

/**
 * Burn NFT - Permanently destroys with no recovery
 */
const burnNFT = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    const userId = req.user?._id;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Token ID is required'
      });
    }
    
    // Find certificate
    const certificate = await Certificate.findOne({
      'nft.tokenId': tokenId,
      currentOwner: userId
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or not owned by you'
      });
    }
    
    // Burn on blockchain
    const burnResult = await blockchainService.burnNFT(tokenId);
    
    if (burnResult.success) {
      // Mark as burned in database
      certificate.verification.status = 'burned';
      if (!certificate._private) certificate._private = {};
      certificate._private.internalNotes = `Burned at ${new Date().toISOString()}`;
      await certificate.save();
      
      res.json({
        success: true,
        message: 'NFT permanently burned',
        txHash: burnResult.txHash,
        explorer: `https://amoy.polygonscan.com/tx/${burnResult.txHash}`
        // NO recovery information
      });
    } else {
      res.status(400).json({
        success: false,
        error: burnResult.error || 'Failed to burn NFT'
      });
    }
  } catch (error) {
    console.error('Burn NFT error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to burn NFT'
    });
  }
};

/**
 * Get user's NFTs - Returns only current certificates with fresh IDs
 */
const getUserNFTs = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    
    // Find user's certificates
    const certificates = await Certificate.find({
      currentOwner: userId,
      'verification.status': 'verified'
    });
    
    // Return public data with fresh display IDs
    const nfts = certificates.map(cert => ({
      displayId: Certificate.generateDisplayId(), // Always new
      brand: cert.productInfo.brand,
      model: cert.productInfo.model,
      category: cert.productInfo.category,
      tokenId: cert.nft?.tokenId,
      status: cert.verification.status,
      verifiedDate: new Date().toISOString() // Always current
      // NO transfer count or history
    }));
    
    res.json({
      success: true,
      count: nfts.length,
      nfts
      // NO historical data
    });
  } catch (error) {
    console.error('Get user NFTs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFTs'
    });
  }
};

/**
 * Get NFT details - Returns public data only
 */
const getNFTDetails = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    
    // Find certificate by token ID
    const certificate = await Certificate.findOne({
      'nft.tokenId': tokenId
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Get blockchain data
    const gasPrice = await blockchainService.getGasPrice();
    
    res.json({
      success: true,
      nft: {
        displayId: Certificate.generateDisplayId(), // Fresh ID
        tokenId: certificate.nft.tokenId,
        brand: certificate.productInfo.brand,
        model: certificate.productInfo.model,
        category: certificate.productInfo.category,
        status: certificate.verification.status,
        blockchain: {
          network: 'Polygon Amoy',
          contractAddress: certificate.nft.contractAddress,
          gasPrice: gasPrice.gasPrice + ' GWEI',
          explorer: `https://amoy.polygonscan.com/token/${certificate.nft.contractAddress}?a=${tokenId}`
        },
        verifiedDate: new Date().toISOString() // Always current
        // NO ownership history or transfer count
      }
    });
  } catch (error) {
    console.error('Get NFT details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFT details'
    });
  }
};

module.exports = {
  mintNFT,
  transferNFT,
  burnNFT,
  getUserNFTs,
  getNFTDetails
};