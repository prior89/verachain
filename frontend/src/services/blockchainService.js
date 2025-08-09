import api from './api';

const blockchainService = {
  async connectWallet() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      return {
        address: accounts[0],
        chainId: chainId,
        connected: true
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  },

  async switchToPolygon() {
    try {
      const polygonChainId = '0x89'; // 137 in hex for Polygon Mainnet
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: polygonChainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/']
            }],
          });
        } catch (addError) {
          console.error('Failed to add Polygon network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  },

  async getWalletBalance(address) {
    try {
      const response = await api.get(`/blockchain/balance/${address}`);
      return response.data.balance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error.response?.data || error;
    }
  },

  async getTransactionStatus(txHash) {
    try {
      const response = await api.get(`/blockchain/tx/${txHash}`);
      return {
        status: response.data.status,
        blockNumber: response.data.blockNumber,
        confirmations: response.data.confirmations,
        gasUsed: response.data.gasUsed
      };
    } catch (error) {
      console.error('Failed to fetch transaction status:', error);
      throw error.response?.data || error;
    }
  },

  async getContractInfo() {
    try {
      const response = await api.get('/blockchain/contract-info');
      return {
        address: response.data.contractAddress,
        abi: response.data.abi,
        network: response.data.network
      };
    } catch (error) {
      console.error('Failed to fetch contract info:', error);
      throw error.response?.data || error;
    }
  },

  async verifyOnChain(certificateId) {
    try {
      const response = await api.post('/blockchain/verify', {
        certificateId: certificateId
      });
      
      return {
        exists: response.data.exists,
        owner: response.data.owner,
        tokenId: response.data.tokenId,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('On-chain verification failed:', error);
      throw error.response?.data || error;
    }
  },

  async getGasPrice() {
    try {
      const response = await api.get('/blockchain/gas-price');
      return {
        standard: response.data.standard,
        fast: response.data.fast,
        instant: response.data.instant
      };
    } catch (error) {
      console.error('Failed to fetch gas price:', error);
      throw error.response?.data || error;
    }
  },

  async signMessage(message) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      });
      
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  },

  async verifySignature(message, signature, address) {
    try {
      const response = await api.post('/blockchain/verify-signature', {
        message,
        signature,
        address
      });
      
      return response.data.isValid;
    } catch (error) {
      console.error('Signature verification failed:', error);
      throw error.response?.data || error;
    }
  },

  // Event listeners for wallet events
  setupWalletListeners(callbacks = {}) {
    if (typeof window.ethereum === 'undefined') return;

    // Account changed
    window.ethereum.on('accountsChanged', (accounts) => {
      if (callbacks.onAccountsChanged) {
        callbacks.onAccountsChanged(accounts);
      }
    });

    // Chain changed
    window.ethereum.on('chainChanged', (chainId) => {
      if (callbacks.onChainChanged) {
        callbacks.onChainChanged(chainId);
      }
    });

    // Disconnect
    window.ethereum.on('disconnect', (error) => {
      if (callbacks.onDisconnect) {
        callbacks.onDisconnect(error);
      }
    });
  },

  // Helper function to format wallet address
  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  // Helper function to convert Wei to Ether
  weiToEther(wei) {
    return parseFloat(wei) / 1e18;
  },

  // Helper function to convert Ether to Wei
  etherToWei(ether) {
    return Math.floor(parseFloat(ether) * 1e18);
  }
};

export default blockchainService;
export { blockchainService };