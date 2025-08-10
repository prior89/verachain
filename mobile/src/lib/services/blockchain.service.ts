import { QRFlowResult, UserRole, UIAdapter, AuthProvider } from '../core/types';
import { ApiService } from '../core/api.service';

export class BlockchainService {
  private apiService: ApiService;
  private uiAdapter: UIAdapter;

  constructor(apiService: ApiService, uiAdapter: UIAdapter) {
    this.apiService = apiService;
    this.uiAdapter = uiAdapter;
  }

  async handleQRFlow(qr: string, role: UserRole): Promise<QRFlowResult> {
    this.uiAdapter.showLoading();

    try {
      const endpoint = role === 'seller' ? '/api/nft/burn' : '/api/nft/mint';
      const payload = role === 'seller' 
        ? { tokenId: qr } 
        : { productId: qr, metadata: { scannedAt: new Date(), role } };
      
      const response = await this.apiService.post(endpoint, payload);
      
      const result: QRFlowResult = { 
        txId: response.transactionHash || response.txHash || '0x...', 
        success: true,
        data: response 
      };

      this.uiAdapter.showSuccess(`Transaction successful: ${result.txId}`);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const result: QRFlowResult = { 
        txId: '0x...', 
        success: false,
        error: errorMessage 
      };

      this.uiAdapter.showError(`Transaction failed: ${errorMessage}`);
      return result;
    } finally {
      this.uiAdapter.hideLoading();
    }
  }

  async getNFTDetails(tokenId: string): Promise<any> {
    try {
      return await this.apiService.get(`/api/nft/${tokenId}`);
    } catch (error) {
      console.error('Failed to get NFT details:', error);
      throw error;
    }
  }

  async getUserNFTs(userId: string): Promise<any[]> {
    try {
      return await this.apiService.get(`/api/nft/user/${userId}`);
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      throw error;
    }
  }
}