/**
 * Real OCR Service using Tesseract.js
 * Certificate text extraction and verification
 */

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');

class OCRService {
  constructor() {
    this.worker = null;
    this.initialized = false;
    this.languages = process.env.TESSERACT_LANG || 'kor+eng';
    this.initializeWorker();
  }

  /**
   * Initialize Tesseract worker
   */
  async initializeWorker() {
    try {
      console.log('Initializing Tesseract.js OCR worker...');
      
      // Create worker
      this.worker = await Tesseract.createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        langPath: path.join(__dirname, '../../tessdata'),
        cachePath: path.join(__dirname, '../../.tesseract-cache')
      });
      
      // Load languages (Korean + English)
      await this.worker.loadLanguage(this.languages);
      await this.worker.initialize(this.languages);
      
      // Set OCR parameters for better accuracy
      await this.worker.setParameters({
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/:.,() 가-힣',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });
      
      this.initialized = true;
      console.log('OCR worker initialized successfully with languages:', this.languages);
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      this.initialized = false;
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  async preprocessImage(imageBuffer) {
    try {
      // Apply image enhancements
      const processedImage = await sharp(imageBuffer)
        // Convert to grayscale
        .grayscale()
        // Increase contrast
        .normalize()
        // Sharpen the image
        .sharpen()
        // Remove noise
        .median(3)
        // Resize if too small
        .resize(null, null, {
          width: 2000,
          height: 2000,
          fit: 'inside',
          withoutEnlargement: false
        })
        // Adjust threshold for better text visibility
        .threshold(128)
        // Convert to buffer
        .toBuffer();
      
      return processedImage;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Extract text from certificate image
   */
  async extractText(imageBuffer) {
    try {
      if (!this.initialized) {
        await this.initializeWorker();
      }

      console.log('Starting OCR text extraction...');
      
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Perform OCR
      const result = await this.worker.recognize(processedImage);
      
      console.log('OCR confidence:', result.data.confidence);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        lines: result.data.lines.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox
        })),
        words: result.data.words.map(word => ({
          text: word.text,
          confidence: word.confidence
        }))
      };
    } catch (error) {
      console.error('OCR text extraction error:', error);
      throw error;
    }
  }

  /**
   * Parse certificate data from extracted text
   */
  parseCertificateData(text) {
    const data = {
      certNumber: null,
      brand: null,
      model: null,
      date: null,
      serialNumber: null,
      issuer: null,
      authenticity: null
    };

    // Certificate number patterns
    const certPatterns = [
      /CERT[-\s]?\d{4}[-\s]?\d{6}/i,
      /Certificate\s*#?\s*:?\s*([A-Z0-9-]+)/i,
      /인증번호\s*:?\s*([A-Z0-9-]+)/i, // Korean
      /証明書番号\s*:?\s*([A-Z0-9-]+)/i  // Japanese
    ];

    for (const pattern of certPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.certNumber = match[0].replace(/[^\w-]/g, '');
        break;
      }
    }

    // Brand detection
    const brands = [
      'Chanel', 'Louis Vuitton', 'Hermès', 'Hermes', 
      'Gucci', 'Rolex', 'Cartier', 'Prada', 'Dior',
      '샤넬', '루이비통', '에르메스', '구찌', '롤렉스' // Korean brands
    ];

    for (const brand of brands) {
      if (text.toLowerCase().includes(brand.toLowerCase())) {
        data.brand = brand.replace('è', 'e'); // Normalize Hermès
        break;
      }
    }

    // Date extraction
    const datePatterns = [
      /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/,
      /\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.date = match[0];
        break;
      }
    }

    // Serial number extraction
    const serialPatterns = [
      /Serial\s*#?\s*:?\s*([A-Z0-9]+)/i,
      /S\/N\s*:?\s*([A-Z0-9]+)/i,
      /일련번호\s*:?\s*([A-Z0-9]+)/i // Korean
    ];

    for (const pattern of serialPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.serialNumber = match[1];
        break;
      }
    }

    // Model extraction (simplified)
    const modelKeywords = ['model', 'style', '모델', 'スタイル'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      for (const keyword of modelKeywords) {
        if (line.toLowerCase().includes(keyword)) {
          // Extract text after the keyword
          const parts = line.split(/[:\s]+/);
          const keywordIndex = parts.findIndex(p => 
            p.toLowerCase().includes(keyword)
          );
          if (keywordIndex >= 0 && keywordIndex < parts.length - 1) {
            data.model = parts.slice(keywordIndex + 1).join(' ').trim();
            break;
          }
        }
      }
      if (data.model) break;
    }

    // Issuer detection
    const issuerPatterns = [
      /Issued by\s*:?\s*(.+)/i,
      /Certified by\s*:?\s*(.+)/i,
      /발행처\s*:?\s*(.+)/i, // Korean
      /認定者\s*:?\s*(.+)/i  // Japanese
    ];

    for (const pattern of issuerPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.issuer = match[1].trim();
        break;
      }
    }

    return data;
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(imageBuffer) {
    try {
      // Extract text
      const ocrResult = await this.extractText(imageBuffer);
      
      // Parse certificate data
      const certificateData = this.parseCertificateData(ocrResult.text);
      
      // Analyze paper texture
      const textureAnalysis = await this.analyzePaperTexture(imageBuffer);
      
      // Analyze ink patterns
      const inkAnalysis = await this.analyzeInkPattern(imageBuffer);
      
      // Calculate authenticity score
      const authenticityScore = this.calculateAuthenticityScore({
        ocrConfidence: ocrResult.confidence,
        certificateData,
        textureAnalysis,
        inkAnalysis
      });
      
      return {
        success: true,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        data: certificateData,
        analysis: {
          texture: textureAnalysis,
          ink: inkAnalysis,
          authenticity: authenticityScore
        },
        isAuthentic: authenticityScore.overall > 0.8,
        details: {
          hasWatermark: textureAnalysis.hasWatermark,
          paperQuality: textureAnalysis.quality,
          inkQuality: inkAnalysis.quality,
          textClarity: ocrResult.confidence > 80 ? 'high' : 'low'
        }
      };
    } catch (error) {
      console.error('Certificate verification error:', error);
      return {
        success: false,
        error: error.message,
        isAuthentic: false
      };
    }
  }

  /**
   * Analyze paper texture for authenticity
   */
  async analyzePaperTexture(imageBuffer) {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const stats = await image.stats();
      
      // Analyze color channels for paper quality
      const redChannel = stats.channels[0];
      const greenChannel = stats.channels[1];
      const blueChannel = stats.channels[2];
      
      // High-quality paper has consistent color distribution
      const colorConsistency = 1 - (
        Math.abs(redChannel.mean - greenChannel.mean) +
        Math.abs(greenChannel.mean - blueChannel.mean) +
        Math.abs(blueChannel.mean - redChannel.mean)
      ) / (3 * 255);
      
      // Check for watermark patterns (simplified)
      const hasWatermark = this.detectWatermark(stats);
      
      // Calculate paper quality score
      const quality = (colorConsistency + (hasWatermark ? 0.3 : 0)) / 1.3;
      
      return {
        quality: Math.min(1, quality),
        hasWatermark,
        colorConsistency,
        brightness: (redChannel.mean + greenChannel.mean + blueChannel.mean) / 3,
        contrast: Math.max(
          redChannel.stdev,
          greenChannel.stdev,
          blueChannel.stdev
        )
      };
    } catch (error) {
      console.error('Paper texture analysis error:', error);
      return {
        quality: 0.5,
        hasWatermark: false,
        colorConsistency: 0.5
      };
    }
  }

  /**
   * Detect watermark patterns
   */
  detectWatermark(stats) {
    // Simplified watermark detection based on subtle variations
    const channels = stats.channels;
    
    // Watermarks often create subtle patterns in standard deviation
    const patternScore = channels.reduce((score, channel) => {
      // Look for specific variance patterns that indicate watermarks
      if (channel.stdev > 10 && channel.stdev < 30) {
        return score + 0.33;
      }
      return score;
    }, 0);
    
    return patternScore > 0.6;
  }

  /**
   * Analyze ink patterns for forgery detection
   */
  async analyzeInkPattern(imageBuffer) {
    try {
      const image = sharp(imageBuffer);
      
      // Extract edges to analyze ink bleeding
      const edges = await image
        .grayscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Edge detection kernel
        })
        .raw()
        .toBuffer();
      
      // Analyze edge sharpness (sharp edges = good ink quality)
      const edgeStats = this.analyzeEdgeSharpness(edges);
      
      // Check for consistent ink density
      const densityConsistency = await this.checkInkDensity(imageBuffer);
      
      return {
        quality: (edgeStats.sharpness + densityConsistency) / 2,
        bleeding: edgeStats.bleeding,
        consistency: densityConsistency,
        printMethod: edgeStats.sharpness > 0.7 ? 'professional' : 'consumer'
      };
    } catch (error) {
      console.error('Ink pattern analysis error:', error);
      return {
        quality: 0.5,
        bleeding: 'unknown',
        consistency: 0.5
      };
    }
  }

  /**
   * Analyze edge sharpness
   */
  analyzeEdgeSharpness(edgeBuffer) {
    // Calculate edge statistics
    let sharpPixels = 0;
    let totalPixels = edgeBuffer.length;
    
    for (let i = 0; i < edgeBuffer.length; i++) {
      if (edgeBuffer[i] > 128) {
        sharpPixels++;
      }
    }
    
    const sharpness = sharpPixels / totalPixels;
    
    return {
      sharpness: Math.min(1, sharpness * 10), // Normalize
      bleeding: sharpness < 0.05 ? 'high' : sharpness < 0.1 ? 'medium' : 'low'
    };
  }

  /**
   * Check ink density consistency
   */
  async checkInkDensity(imageBuffer) {
    try {
      const image = sharp(imageBuffer);
      const { data, info } = await image
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Sample ink density at different points
      const samples = [];
      const sampleSize = 100;
      
      for (let i = 0; i < 10; i++) {
        const offset = Math.floor((data.length / 10) * i);
        const sample = data.slice(offset, offset + sampleSize);
        
        const avgDensity = sample.reduce((sum, val) => sum + val, 0) / sampleSize;
        samples.push(avgDensity);
      }
      
      // Calculate consistency (lower variance = more consistent)
      const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
      const variance = samples.reduce((sum, val) => 
        sum + Math.pow(val - mean, 2), 0
      ) / samples.length;
      
      // Normalize to 0-1 scale (lower variance is better)
      const consistency = Math.max(0, 1 - (variance / 10000));
      
      return consistency;
    } catch (error) {
      console.error('Ink density check error:', error);
      return 0.5;
    }
  }

  /**
   * Calculate overall authenticity score
   */
  calculateAuthenticityScore({ ocrConfidence, certificateData, textureAnalysis, inkAnalysis }) {
    // Weight different factors
    const weights = {
      ocr: 0.25,
      dataCompleteness: 0.25,
      texture: 0.25,
      ink: 0.25
    };
    
    // Calculate data completeness score
    const requiredFields = ['certNumber', 'brand', 'date'];
    const presentFields = requiredFields.filter(field => certificateData[field]);
    const dataCompleteness = presentFields.length / requiredFields.length;
    
    // Calculate weighted score
    const overall = 
      (ocrConfidence / 100) * weights.ocr +
      dataCompleteness * weights.dataCompleteness +
      textureAnalysis.quality * weights.texture +
      inkAnalysis.quality * weights.ink;
    
    return {
      overall: Math.min(1, overall),
      components: {
        ocr: ocrConfidence / 100,
        data: dataCompleteness,
        texture: textureAnalysis.quality,
        ink: inkAnalysis.quality
      }
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      languages: this.languages,
      ready: this.initialized
    };
  }
}

// Export singleton instance
module.exports = new OCRService();