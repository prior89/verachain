import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Privacy-first NFT service
 * Always returns fresh display IDs, no history exposed
 */
const nftService = {
  /**
   * Mint new NFT certificate
   * Returns fresh display ID, no connection to previous certificates
   */
  async mintNFT(mintData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/nft/mint`, {
        certificateId: mintData.certificateId,
        productData: mintData.productData,
        certificateData: mintData.certificateData
      });
      
      return {
        success: true,
        displayId: response.data.displayId, // Always fresh
        tokenId: response.data.tokenId,
        txHash: response.data.txHash,
        blockNumber: response.data.blockNumber,
        explorer: response.data.explorer
      };
    } catch (error) {
      console.error('NFT minting failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Minting failed'
      };
    }
  },

  /**
   * Transfer NFT - Burns old, mints new
   * No connection between old and new certificate
   */
  async transferNFT(tokenId, toAddress) {
    try {
      const response = await axios.post(`${API_BASE_URL}/nft/transfer`, {
        tokenId,
        toAddress
      });
      
      return {
        success: true,
        displayId: response.data.displayId, // Completely new ID
        newTokenId: response.data.newTokenId,
        txHash: response.data.txHash,
        message: response.data.message
      };
    } catch (error) {
      console.error('NFT transfer failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Transfer failed'
      };
    }
  },

  /**
   * Burn NFT permanently
   * No recovery possible
   */
  async burnNFT(tokenId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/nft/burn`, {
        tokenId
      });
      
      return {
        success: true,
        message: response.data.message,
        txHash: response.data.txHash
      };
    } catch (error) {
      console.error('NFT burning failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Burn failed'
      };
    }
  },

  /**
   * Get NFT details
   * Returns public data only with fresh display ID
   */
  async getNFTDetails(tokenId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/nft/${tokenId}`);
      
      return {
        success: true,
        nft: response.data.nft // Contains fresh display ID
      };
    } catch (error) {
      console.error('Failed to fetch NFT details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get NFT'
      };
    }
  },

  /**
   * Get user's NFTs
   * Returns current certificates with fresh IDs only
   */
  async getUserNFTs(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/nft/user/${userId || 'me'}`);
      
      return {
        success: true,
        count: response.data.count,
        nfts: response.data.nfts // Each has fresh display ID
      };
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get NFTs'
      };
    }
  },

  /**
   * NO TRANSFER HISTORY METHOD
   * This violates privacy-first principle
   */

  /**
   * Generate QR code for NFT
   * Returns QR with fresh display ID
   */
  async generateQR(certificateId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/nft/qr/${certificateId}`);
      
      return {
        success: true,
        qrCode: response.data.qrCode,
        displayId: response.data.displayId, // Fresh ID in QR
        expiresIn: response.data.expiresIn
      };
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'QR generation failed'
      };
    }
  },

  /**
   * Scan QR for transfer
   * Initiates burn-and-mint transfer
   */
  async scanQRForTransfer(qrData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/nft/scan-transfer`, {
        qrData
      });
      
      return {
        success: true,
        readyForTransfer: response.data.readyForTransfer,
        certificateInfo: response.data.certificateInfo // Public data only
      };
    } catch (error) {
      console.error('QR scan for transfer failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'QR scan failed'
      };
    }
  },

  /**
   * Format certificate for display
   * Always shows fresh data, no history
   */
  formatCertificateData(certificate) {
    return {
      displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Always fresh
      tokenId: certificate.tokenId,
      brand: certificate.brand || certificate.productInfo?.brand,
      model: certificate.model || certificate.productInfo?.model,
      category: certificate.category || certificate.productInfo?.category,
      status: certificate.status || 'verified',
      verifiedDate: new Date().toISOString(), // Always current
      confidence: certificate.confidence || 95,
      // NO serial numbers, owner info, or transfer history
    };
  },

  /**
   * Get gas estimate for operation
   */
  async estimateGas(operation = 'mint') {
    try {
      const response = await axios.post(`${API_BASE_URL}/nft/estimate-gas`, {
        operation
      });
      
      return {
        success: true,
        gasPrice: response.data.gasPrice,
        estimatedCost: response.data.estimatedCost,
        network: 'Polygon Amoy'
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return {
        success: false,
        error: 'Unable to estimate gas'
      };
    }
  }
};

// Export both named and default
export { nftService };
export default nftService;
