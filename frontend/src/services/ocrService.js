import api from './api';

const ocrService = {
  async extractText(imageBase64, language = 'eng') {
    try {
      const response = await api.post('/ocr/extract', {
        image: imageBase64,
        language: language // 'eng', 'kor', 'chi', 'jpn', etc.
      });
      
      return {
        text: response.data.text,
        confidence: response.data.confidence,
        structuredData: response.data.structuredData
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractCertificateData(imageBase64) {
    try {
      const response = await api.post('/ocr/certificate', {
        image: imageBase64
      });
      
      return {
        certNumber: response.data.certNumber,
        issueDate: response.data.issueDate,
        issuer: response.data.issuer,
        brand: response.data.brand,
        model: response.data.model,
        serial: response.data.serial,
        confidence: response.data.confidence,
        rawText: response.data.rawText
      };
    } catch (error) {
      console.error('Certificate data extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  async analyzeTextureAndInk(imageBase64) {
    try {
      const response = await api.post('/ocr/analyze-texture', {
        image: imageBase64
      });
      
      return {
        textureScore: response.data.textureScore,
        inkScore: response.data.inkScore,
        watermarkDetected: response.data.watermarkDetected,
        paperQuality: response.data.paperQuality,
        isAuthentic: response.data.isAuthentic
      };
    } catch (error) {
      console.error('Texture analysis failed:', error);
      throw error.response?.data || error;
    }
  },

  async verifySignature(imageBase64, expectedSignature) {
    try {
      const response = await api.post('/ocr/verify-signature', {
        image: imageBase64,
        expectedSignature: expectedSignature
      });
      
      return {
        isValid: response.data.isValid,
        confidence: response.data.confidence,
        extractedSignature: response.data.extractedSignature
      };
    } catch (error) {
      console.error('Signature verification failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractHologramData(imageBase64) {
    try {
      const response = await api.post('/ocr/hologram', {
        image: imageBase64
      });
      
      return {
        hologramDetected: response.data.detected,
        authenticity: response.data.authenticity,
        features: response.data.features || []
      };
    } catch (error) {
      console.error('Hologram extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  async detectLanguage(imageBase64) {
    try {
      const response = await api.post('/ocr/detect-language', {
        image: imageBase64
      });
      
      return {
        language: response.data.language,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      throw error.response?.data || error;
    }
  },

  async extractTableData(imageBase64) {
    try {
      const response = await api.post('/ocr/extract-table', {
        image: imageBase64
      });
      
      return {
        headers: response.data.headers,
        rows: response.data.rows,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Table extraction failed:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to parse certificate patterns
  parseCertificatePatterns(text) {
    const patterns = {
      certNumber: /(?:CERT|Certificate|?몄쬆??[\s-]*(?:No|踰덊샇)?[\s:]*([A-Z0-9-]+)/i,
      date: /(\d{4}[-/]\d{2}[-/]\d{2})/,
      brand: /(Chanel|Herm챔s|Louis Vuitton|Gucci|Rolex|?ㅻ꽟|?먮Ⅴ硫붿뒪|猷⑥씠鍮꾪넻|援ъ컡|濡ㅻ젆??/i,
      serial: /(?:Serial|?쒕━??[\s:]*([A-Z0-9]+)/i,
      model: /(?:Model|紐⑤뜽)[\s:]*([A-Z0-9\s]+)/i
    };

    const extracted = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        extracted[key] = match[1].trim();
      }
    }

    return extracted;
  },

  // Helper function to validate certificate format
  validateCertificateFormat(certData) {
    const errors = [];
    
    if (!certData.certNumber || !/^[A-Z]{2,4}-\d{4}-\d{6}$/.test(certData.certNumber)) {
      errors.push('Invalid certificate number format');
    }
    
    if (!certData.issueDate || !Date.parse(certData.issueDate)) {
      errors.push('Invalid issue date');
    }
    
    if (!certData.brand) {
      errors.push('Brand not detected');
    }
    
    if (!certData.serial || certData.serial.length < 6) {
      errors.push('Invalid or missing serial number');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

export default ocrService;
export { ocrService };
