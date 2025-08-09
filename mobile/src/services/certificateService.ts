import api from './api';

export interface Certificate {
  id: string;
  displayId: string;
  brand: string;
  model: string;
  category: string;
  confidence: number;
  verifiedDate: string;
  status: 'verified' | 'pending' | 'failed';
  tokenId?: string;
  txHash?: string;
  qrCode?: string;
}

interface CertificateResponse {
  success: boolean;
  certificates?: Certificate[];
  certificate?: Certificate;
  message?: string;
}

interface ScanResult {
  success: boolean;
  certificate?: Certificate;
  message?: string;
}

class CertificateService {
  async getUserCertificates(): Promise<CertificateResponse> {
    try {
      const response = await api.get('/certificates');
      return response.data;
    } catch (error: any) {
      console.error('Get certificates error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '인증서를 불러오는데 실패했습니다.',
      };
    }
  }

  async getCertificateById(id: string): Promise<CertificateResponse> {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get certificate error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '인증서를 불러오는데 실패했습니다.',
      };
    }
  }

  async scanProduct(imageData: string): Promise<ScanResult> {
    try {
      const response = await api.post('/scan/product', {
        image: imageData,
      });
      return response.data;
    } catch (error: any) {
      console.error('Product scan error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '제품 스캔에 실패했습니다.',
      };
    }
  }

  async generateQRCode(certificateId: string): Promise<{success: boolean; qrCode?: string; message?: string}> {
    try {
      const response = await api.post('/certificates/generate-qr', {
        certificateId,
      });
      return response.data;
    } catch (error: any) {
      console.error('QR generation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'QR 코드 생성에 실패했습니다.',
      };
    }
  }

  async transferCertificate(certificateId: string, toAddress: string): Promise<{success: boolean; message?: string}> {
    try {
      const response = await api.post('/certificates/transfer', {
        certificateId,
        toAddress,
      });
      return response.data;
    } catch (error: any) {
      console.error('Transfer error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '인증서 전송에 실패했습니다.',
      };
    }
  }

  async burnCertificate(certificateId: string): Promise<{success: boolean; message?: string}> {
    try {
      const response = await api.post('/certificates/burn', {
        certificateId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Burn error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '인증서 폐기에 실패했습니다.',
      };
    }
  }

  // 목업 데이터 생성 (개발용)
  getMockCertificates(): Certificate[] {
    return [
      {
        id: '1',
        displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        brand: 'Chanel',
        model: 'Classic Flap Medium',
        category: 'handbag',
        confidence: 95,
        verifiedDate: new Date().toISOString(),
        status: 'verified',
        tokenId: '12345',
        txHash: '0x1234567890abcdef...',
      },
      {
        id: '2',
        displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        brand: 'Hermès',
        model: 'Birkin 30',
        category: 'handbag',
        confidence: 98,
        verifiedDate: new Date().toISOString(),
        status: 'verified',
        tokenId: '67890',
        txHash: '0xabcdef1234567890...',
      },
      {
        id: '3',
        displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        brand: 'Rolex',
        model: 'Submariner',
        category: 'watch',
        confidence: 92,
        verifiedDate: new Date().toISOString(),
        status: 'verified',
        tokenId: '11111',
        txHash: '0x9876543210fedcba...',
      },
    ];
  }
}

export default new CertificateService();