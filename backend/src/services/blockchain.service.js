/**
 * Real Blockchain Service using Ethers.js
 * Connects to Polygon Amoy via Alchemy
 */

const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

// ABI for VeraChain NFT contract
const NFT_ABI = [
  // ERC721 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Custom VeraChain functions
  "function mintCertificate(address recipient, string memory brand, string memory model, string memory certNumber) returns (uint256)",
  "function burnCertificate(uint256 tokenId)",
  "function transferWithPrivacy(address to, uint256 tokenId)",
  "function getCertificate(uint256 tokenId) view returns (tuple(string brand, string model, string certNumber, uint256 timestamp, bool burned))",
  
  // Events
  "event CertificateMinted(uint256 indexed tokenId, address indexed owner, string certNumber)",
  "event CertificateBurned(uint256 indexed tokenId)",
  "event CertificateTransferred(uint256 indexed tokenId, address indexed from, address indexed to)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS || null;
    this.initialized = false;
    
    this.initialize();
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      console.log('Initializing blockchain service...');
      
      // Connect to Polygon Amoy via Alchemy
      const alchemyUrl = process.env.POLYGON_RPC_URL || 
        `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      
      this.provider = new ethers.JsonRpcProvider(alchemyUrl);
      
      // Verify network
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', {
        name: network.name,
        chainId: network.chainId.toString()
      });
      
      // Verify we're on Polygon Amoy (chainId: 80002)
      if (network.chainId !== 80002n) {
        console.warn(`Warning: Not on Polygon Amoy. Current chain ID: ${network.chainId}`);
      }
      
      // Initialize wallet
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('Wallet initialized:', this.wallet.address);
        
        // Check wallet balance
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log('Wallet balance:', ethers.formatEther(balance), 'MATIC');
      }
      
      // Initialize contract if address is provided
      if (this.contractAddress && this.wallet) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          NFT_ABI,
          this.wallet
        );
        console.log('Contract initialized at:', this.contractAddress);
      }
      
      this.initialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      this.initialized = false;
    }
  }

  /**
   * Deploy new NFT contract
   */
  async deployContract() {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      // Contract bytecode (simplified example)
      const contractFactory = new ethers.ContractFactory(
        NFT_ABI,
        "0x608060405234801561001057600080fd5b50...", // Actual bytecode would go here
        this.wallet
      );

      console.log('Deploying contract...');
      const contract = await contractFactory.deploy();
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log('Contract deployed at:', address);
      
      this.contractAddress = address;
      this.contract = contract;
      
      return {
        success: true,
        address,
        txHash: contract.deploymentTransaction().hash
      };
    } catch (error) {
      console.error('Contract deployment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mint new NFT certificate
   */
  async mintNFT(recipient, brand, model, certNumber) {
    try {
      if (!this.contract) {
        // Return mock result if contract not deployed
        return {
          success: true,
          tokenId: Math.floor(Math.random() * 100000),
          txHash: '0x' + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          mock: true
        };
      }

      console.log('Minting NFT certificate...');
      
      // Estimate gas
      const gasEstimate = await this.contract.mintCertificate.estimateGas(
        recipient,
        brand,
        model,
        certNumber
      );
      
      console.log('Estimated gas:', gasEstimate.toString());
      
      // Send transaction with 20% gas buffer
      const tx = await this.contract.mintCertificate(
        recipient,
        brand,
        model,
        certNumber,
        {
          gasLimit: gasEstimate * 120n / 100n
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('CertificateMinted(uint256,address,string)')
      );
      
      const tokenId = mintEvent ? parseInt(mintEvent.topics[1], 16) : 0;
      
      return {
        success: true,
        tokenId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('NFT minting failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Burn NFT certificate
   */
  async burnNFT(tokenId) {
    try {
      if (!this.contract) {
        return {
          success: true,
          mock: true
        };
      }

      console.log('Burning NFT:', tokenId);
      
      const tx = await this.contract.burnCertificate(tokenId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('NFT burning failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Transfer NFT with privacy (burn and mint)
   */
  async transferWithPrivacy(from, to, tokenId) {
    try {
      if (!this.contract) {
        return {
          success: true,
          newTokenId: Math.floor(Math.random() * 100000),
          mock: true
        };
      }

      console.log('Privacy transfer:', { from, to, tokenId });
      
      // Get certificate data before burning
      const certData = await this.contract.getCertificate(tokenId);
      
      // Burn old NFT
      const burnTx = await this.contract.burnCertificate(tokenId);
      await burnTx.wait();
      
      // Mint new NFT with same data but new ID
      const mintTx = await this.contract.mintCertificate(
        to,
        certData.brand,
        certData.model,
        certData.certNumber
      );
      const mintReceipt = await mintTx.wait();
      
      // Extract new token ID
      const mintEvent = mintReceipt.logs.find(
        log => log.topics[0] === ethers.id('CertificateMinted(uint256,address,string)')
      );
      const newTokenId = mintEvent ? parseInt(mintEvent.topics[1], 16) : 0;
      
      return {
        success: true,
        oldTokenId: tokenId,
        newTokenId,
        burnTxHash: burnTx.hash,
        mintTxHash: mintTx.hash
      };
    } catch (error) {
      console.error('Privacy transfer failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get NFT metadata
   */
  async getNFTMetadata(tokenId) {
    try {
      if (!this.contract) {
        // Return mock data
        return {
          tokenId,
          brand: 'Chanel',
          model: 'Classic Flap',
          certNumber: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          owner: '0x' + Array(40).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          timestamp: Date.now(),
          mock: true
        };
      }

      const [owner, certData, tokenURI] = await Promise.all([
        this.contract.ownerOf(tokenId),
        this.contract.getCertificate(tokenId),
        this.contract.tokenURI(tokenId)
      ]);
      
      return {
        tokenId,
        owner,
        brand: certData.brand,
        model: certData.model,
        certNumber: certData.certNumber,
        timestamp: certData.timestamp.toString(),
        burned: certData.burned,
        tokenURI
      };
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  /**
   * Get user's NFT balance
   */
  async getUserBalance(address) {
    try {
      if (!this.contract) {
        return 0;
      }

      const balance = await this.contract.balanceOf(address);
      return balance.toString();
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return 0;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(method, params) {
    try {
      if (!this.contract) {
        return {
          gasLimit: '100000',
          gasPrice: '30000000000', // 30 Gwei
          estimatedCost: '0.003'
        };
      }

      const gasEstimate = await this.contract[method].estimateGas(...params);
      const gasPrice = await this.provider.getFeeData();
      
      const estimatedCost = ethers.formatEther(
        gasEstimate * gasPrice.gasPrice
      );
      
      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice.toString(),
        estimatedCost
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }

  /**
   * Check transaction status
   */
  async checkTransaction(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: await this.provider.getBlockNumber() - receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to check transaction:', error);
      return { status: 'unknown' };
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('Failed to get block number:', error);
      return 0;
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus() {
    try {
      const [network, blockNumber, gasPrice] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ]);
      
      return {
        connected: true,
        network: {
          name: network.name || 'Polygon Amoy',
          chainId: network.chainId.toString()
        },
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei') + ' Gwei',
        walletAddress: this.wallet?.address,
        contractAddress: this.contractAddress
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Connect to MetaMask (for frontend)
   */
  async connectWallet() {
    // This would be called from frontend with window.ethereum
    return {
      message: 'Wallet connection should be handled in frontend',
      walletAddress: this.wallet?.address
    };
  }
}

// Export singleton instance
module.exports = new BlockchainService();