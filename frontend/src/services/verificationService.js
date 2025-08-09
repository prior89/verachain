import api from './api';

const verificationService = {
  async verifyProduct(imageBase64, type = 'auto') {
    try {
      const response = await api.post('/verify/product', {
        image: imageBase64,
        type: type // 'barcode' | 'qr' | 'serial' | 'auto'
      });
      
      return {
        verified: response.data.verified,
        confidence: response.data.confidence,
        data: response.data.product
      };
    } catch (error) {
      console.error('Product verification failed:', error);
      throw error.response?.data || error;
    }
  },

  async verifyCertificate(imageBase64, productId) {
    try {
      const response = await api.post('/verify/certificate', {
        image: imageBase64,
        productId: productId
      });
      
      return {
        verified: response.data.verified,
        confidence: response.data.ocrConfidence,
        data: response.data.extractedData
      };
    } catch (error) {
      console.error('Certificate verification failed:', error);
      throw error.response?.data || error;
    }
  },

  async verifyDualAuthentication(productImage, certificateImage) {
    try {
      // First verify product
      const productResult = await this.verifyProduct(productImage);
      
      if (!productResult.verified) {
        return {
          success: false,
          message: 'Product verification failed',
          productResult
        };
      }

      // Then verify certificate
      const certificateResult = await this.verifyCertificate(
        certificateImage, 
        productResult.data.id
      );

      if (!certificateResult.verified) {
        return {
          success: false,
          message: 'Certificate verification failed',
          productResult,
          certificateResult
        };
      }

      // Both verifications passed
      return {
        success: true,
        message: 'Dual authentication successful',
        productResult,
        certificateResult,
        verificationId: `VERA-${Date.now()}`
      };
    } catch (error) {
      console.error('Dual authentication failed:', error);
      throw error;
    }
  },

  async getVerificationHistory(userId) {
    try {
      const response = await api.get(`/verify/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch verification history:', error);
      throw error.response?.data || error;
    }
  },

  async getVerificationDetails(verificationId) {
    try {
      const response = await api.get(`/verify/details/${verificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch verification details:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to convert image file to base64
  async imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  // Helper function to capture image from video stream
  async captureFromVideo(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];
    
    return base64;
  }
};

export default verificationService;
export { verificationService };