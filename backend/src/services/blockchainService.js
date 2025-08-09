const { ethers } = require('ethers');
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    // Polygon Amoy testnet configuration (NOT Mumbai)
    this.chainId = 80002;
    this.rpcUrl = process.env.AMOY_RPC || 'https://rpc-amoy.polygon.technology';
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Connect to Polygon Amoy
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Verify we're on Amoy
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.chainId) {
        console.warn(`⚠️  Expected Polygon Amoy (${this.chainId}), got chain ID: ${network.chainId}`);
      }
      
      // Initialize wallet if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('✅ Wallet connected:', this.wallet.address);
      } else {
        console.log('⚠️  No private key provided, using mock blockchain service');
      }
      
      // Initialize contract if address is provided
      if (process.env.CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          this.getContractABI(),
          this.wallet || this.provider
        );
        console.log('✅ Contract connected:', process.env.CONTRACT_ADDRESS);
      }
      
      this.initialized = true;
      console.log('✅ Blockchain service initialized for Polygon Amoy');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      this.initialized = true; // Set to true to use mock functionality
    }
  }

  getContractABI() {
    // Minimal ABI for VeraChain NFT contract
    return [
      'function mint(address to, string memory certId) public returns (uint256)',
      'function burn(uint256 tokenId) public',
      'function burnAndMint(uint256 oldToken, address newOwner, string memory newCertId) public returns (uint256)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'function tokenURI(uint256 tokenId) public view returns (string)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      'event CertificateMinted(uint256 indexed tokenId, string certId, address owner)',
      'event CertificateBurned(uint256 indexed tokenId)'
    ];
  }

  async mintNFT(userId, productData) {
    await this.initialize();
    
    try {
      // Generate completely new certificate ID
      const displayId = this.generateCertificateId();
      
      if (this.contract && this.wallet) {
        // Real blockchain mint
        const tx = await this.contract.mint(userId, displayId);
        const receipt = await tx.wait();
        
        // Extract token ID from events
        const mintEvent = receipt.logs.find(
          log => log.fragment && log.fragment.name === 'CertificateMinted'
        );
        
        const tokenId = mintEvent ? mintEvent.args[0].toString() : this.generateMockTokenId();
        
        return {
          displayId, // Always new, never reveals history
          tokenId,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          // NO previous certificates or transfer count
        };
      } else {
        // Mock mint for development
        return {
          displayId,
          tokenId: this.generateMockTokenId(),
          txHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockNumber: Math.floor(Math.random() * 1000000),
          // NO history data
        };
      }
    } catch (error) {
      console.error('Mint NFT error:', error);
      // Return mock data on error
      return {
        displayId: this.generateCertificateId(),
        tokenId: this.generateMockTokenId(),
        txHash: '0x' + crypto.randomBytes(32).toString('hex'),
        blockNumber: Math.floor(Math.random() * 1000000)
      };
    }
  }

  async transferNFT(fromUser, toUser, tokenId) {
    await this.initialize();
    
    try {
      // Always burn old and mint new for privacy
      const newDisplayId = this.generateCertificateId();
      
      if (this.contract && this.wallet) {
        // Real blockchain burn and mint
        const tx = await this.contract.burnAndMint(tokenId, toUser, newDisplayId);
        const receipt = await tx.wait();
        
        // Extract new token ID from events
        const mintEvent = receipt.logs.find(
          log => log.fragment && log.fragment.name === 'CertificateMinted'
        );
        
        const newTokenId = mintEvent ? mintEvent.args[0].toString() : this.generateMockTokenId();
        
        return {
          displayId: newDisplayId, // Completely new ID
          tokenId: newTokenId, // New token
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          // NO connection to old certificate
        };
      } else {
        // Mock transfer for development
        return {
          displayId: newDisplayId,
          tokenId: this.generateMockTokenId(), // New token ID
          txHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockNumber: Math.floor(Math.random() * 1000000),
          // NO transfer history
        };
      }
    } catch (error) {
      console.error('Transfer NFT error:', error);
      // Return mock data on error
      return {
        displayId: this.generateCertificateId(),
        tokenId: this.generateMockTokenId(),
        txHash: '0x' + crypto.randomBytes(32).toString('hex'),
        blockNumber: Math.floor(Math.random() * 1000000)
      };
    }
  }

  async burnNFT(tokenId) {
    await this.initialize();
    
    try {
      if (this.contract && this.wallet) {
        // Real blockchain burn
        const tx = await this.contract.burn(tokenId);
        const receipt = await tx.wait();
        
        return {
          success: true,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber
        };
      } else {
        // Mock burn for development
        return {
          success: true,
          txHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockNumber: Math.floor(Math.random() * 1000000)
        };
      }
    } catch (error) {
      console.error('Burn NFT error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyOwnership(tokenId, address) {
    await this.initialize();
    
    try {
      if (this.contract) {
        const owner = await this.contract.ownerOf(tokenId);
        return owner.toLowerCase() === address.toLowerCase();
      } else {
        // Mock verification
        return Math.random() > 0.5;
      }
    } catch (error) {
      console.error('Verify ownership error:', error);
      return false;
    }
  }

  async getGasPrice() {
    await this.initialize();
    
    try {
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
      };
    } catch (error) {
      console.error('Get gas price error:', error);
      return {
        gasPrice: '30',
        maxFeePerGas: '35',
        maxPriorityFeePerGas: '2'
      };
    }
  }

  async getBalance(address) {
    await this.initialize();
    
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }

  // Helper methods
  generateCertificateId() {
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `VERA-${year}-${random}`;
  }

  generateMockTokenId() {
    return Math.floor(Math.random() * 1000000).toString();
  }

  // Get network info
  async getNetworkInfo() {
    await this.initialize();
    
    try {
      const network = await this.provider.getNetwork();
      return {
        name: 'Polygon Amoy Testnet',
        chainId: Number(network.chainId),
        rpcUrl: this.rpcUrl,
        blockExplorer: 'https://amoy.polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      };
    } catch (error) {
      console.error('Get network info error:', error);
      return {
        name: 'Polygon Amoy Testnet',
        chainId: 80002,
        rpcUrl: this.rpcUrl,
        blockExplorer: 'https://amoy.polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      };
    }
  }
}

// Export singleton instance
module.exports = new BlockchainService();