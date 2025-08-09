import api from './api';

const aiService = {
  async analyzeProductImage(imageBase64) {
    try {
      const response = await api.post('/ai/analyze-product', {
        image: imageBase64
      });
      
      return {
        isGenuine: response.data.genuine,
        confidence: response.data.confidence,
        features: response.data.detectedFeatures,
        anomalies: response.data.anomalies || []
      };
    } catch (error) {
      console.error('AI product analysis failed:', error);
      throw error.response?.data || error;
    }
  },

  async detectBrandFromImage(imageBase64) {
    try {
      const response = await api.post('/ai/detect-brand', {
        image: imageBase64
      });
      
      return {
        brand: response.data.brand,
        confidence: response.data.confidence,
        model: response.data.model
      };
    } catch (error) {
      console.error('Brand detection failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractSerialNumber(imageBase64) {
    try {
      const response = await api.post('/ai/extract-serial', {
        image: imageBase64
      });
      
      return {
        serial: response.data.serial,
        confidence: response.data.confidence,
        location: response.data.location
      };
    } catch (error) {
      console.error('Serial extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  async compareProductImages(image1Base64, image2Base64) {
    try {
      const response = await api.post('/ai/compare-products', {
        image1: image1Base64,
        image2: image2Base64
      });
      
      return {
        match: response.data.match,
        similarity: response.data.similarity,
        differences: response.data.differences || []
      };
    } catch (error) {
      console.error('Product comparison failed:', error);
      throw error.response?.data || error;
    }
  },

  async detectCounterfeitPatterns(imageBase64, brand) {
    try {
      const response = await api.post('/ai/detect-counterfeit', {
        image: imageBase64,
        brand: brand
      });
      
      return {
        isCounterfeit: response.data.isCounterfeit,
        confidence: response.data.confidence,
        suspiciousFeatures: response.data.suspiciousFeatures || [],
        recommendation: response.data.recommendation
      };
    } catch (error) {
      console.error('Counterfeit detection failed:', error);
      throw error.response?.data || error;
    }
  },

  async enhanceImage(imageBase64) {
    try {
      const response = await api.post('/ai/enhance-image', {
        image: imageBase64
      });
      
      return response.data.enhancedImage; // Returns enhanced base64 image
    } catch (error) {
      console.error('Image enhancement failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractQRCode(imageBase64) {
    try {
      const response = await api.post('/ai/extract-qr', {
        image: imageBase64
      });
      
      return {
        qrData: response.data.data,
        confidence: response.data.confidence,
        type: response.data.type
      };
    } catch (error) {
      console.error('QR extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractBarcode(imageBase64) {
    try {
      const response = await api.post('/ai/extract-barcode', {
        image: imageBase64
      });
      
      return {
        barcode: response.data.barcode,
        type: response.data.type,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Barcode extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to preprocess image before AI analysis
  preprocessImage(imageBase64, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize if needed
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply filters if needed
        if (options.grayscale) {
          ctx.filter = 'grayscale(1)';
        }
        if (options.contrast) {
          ctx.filter += ` contrast(${options.contrast})`;
        }
        if (options.brightness) {
          ctx.filter += ` brightness(${options.brightness})`;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert back to base64
        const processedBase64 = canvas.toDataURL('image/jpeg', options.quality || 0.9).split(',')[1];
        resolve(processedBase64);
      };
      img.src = `data:image/jpeg;base64,${imageBase64}`;
    });
  }
};

export default aiService;
export { aiService };
