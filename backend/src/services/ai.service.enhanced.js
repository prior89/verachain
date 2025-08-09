const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const redisService = require('./redis.service');
const queueService = require('./queue.service');
const monitoringService = require('./monitoring.service');

class EnhancedAIService {
  constructor() {
    this.models = new Map();
    this.worker = null;
    this.initialized = false;
  }

  /**
   * Initialize AI Service with multiple models
   */
  async initialize() {
    try {
      // Initialize OCR worker
      this.worker = await Tesseract.createWorker({
        logger: m => monitoringService.debug('OCR Progress', m)
      });
      
      await this.worker.loadLanguage('eng+kor+chi_sim');
      await this.worker.initialize('eng+kor+chi_sim');
      
      // Load pre-trained models
      await this.loadModels();
      
      this.initialized = true;
      monitoringService.info('Enhanced AI Service initialized');
      
      return true;
    } catch (error) {
      monitoringService.error('AI Service initialization failed', error);
      throw error;
    }
  }

  /**
   * Load multiple AI models
   */
  async loadModels() {
    // Product authenticity model
    // In production, load actual trained models
    this.models.set('authenticity', await this.createAuthenticityModel());
    
    // Image quality assessment model
    this.models.set('quality', await this.createQualityModel());
    
    // Anomaly detection model
    this.models.set('anomaly', await this.createAnomalyModel());
    
    // Price prediction model
    this.models.set('price', await this.createPriceModel());
    
    monitoringService.info('AI models loaded successfully');
  }

  /**
   * Create authenticity verification model
   */
  async createAuthenticityModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.globalAveragePooling2d(),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Create quality assessment model
   */
  async createQualityModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [128, 128, 3],
          filters: 16,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'softmax' }) // 5 quality levels
      ]
    });
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Create anomaly detection model
   */
  async createAnomalyModel() {
    // Autoencoder for anomaly detection
    const encoder = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' })
      ]
    });
    
    const decoder = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [16], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 100, activation: 'sigmoid' })
      ]
    });
    
    const autoencoder = tf.sequential({
      layers: [...encoder.layers, ...decoder.layers]
    });
    
    autoencoder.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    
    return autoencoder;
  }

  /**
   * Create price prediction model
   */
  async createPriceModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }

  /**
   * Verify product authenticity with multiple checks
   */
  async verifyProductAuthenticity(imageBuffer, metadata = {}) {
    const timer = monitoringService.startTimer('ai-authenticity-verification');
    
    try {
      // Check cache first
      const cacheKey = `authenticity:${Buffer.from(imageBuffer).toString('base64').substring(0, 32)}`;
      const cached = await redisService.get(cacheKey);
      if (cached) {
        monitoringService.trackCacheHit(true);
        return cached;
      }
      
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Run multiple AI checks in parallel
      const [
        authenticityScore,
        qualityScore,
        anomalyScore,
        ocrResult,
        visualFeatures
      ] = await Promise.all([
        this.checkAuthenticity(processedImage),
        this.assessQuality(processedImage),
        this.detectAnomalies(processedImage, metadata),
        this.extractText(imageBuffer),
        this.extractVisualFeatures(processedImage)
      ]);
      
      // Combine scores with weighted average
      const finalScore = this.calculateFinalScore({
        authenticity: authenticityScore,
        quality: qualityScore,
        anomaly: anomalyScore,
        ocr: ocrResult.confidence
      });
      
      // Determine verification status
      const status = this.determineStatus(finalScore);
      
      const result = {
        verified: status === 'authentic',
        confidence: finalScore,
        status,
        details: {
          authenticityScore,
          qualityScore,
          anomalyScore,
          ocrConfidence: ocrResult.confidence,
          extractedText: ocrResult.text,
          visualFeatures
        },
        recommendations: this.generateRecommendations(finalScore, status),
        timestamp: new Date()
      };
      
      // Cache result
      await redisService.set(cacheKey, result, 3600);
      monitoringService.trackCacheHit(false);
      
      // Track metrics
      const duration = monitoringService.endTimer(timer);
      monitoringService.trackProductVerification(status);
      
      // Queue for further analysis if needed
      if (finalScore < 0.7) {
        await queueService.addJob('ai-analysis', {
          type: 'deep-verification',
          data: { imageBuffer, metadata, initialScore: finalScore }
        });
      }
      
      return result;
    } catch (error) {
      monitoringService.error('Product verification failed', error);
      throw error;
    }
  }

  /**
   * Preprocess image for AI models
   */
  async preprocessImage(imageBuffer) {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Resize and normalize
    const resized = await image
      .resize(224, 224, { fit: 'cover' })
      .normalize()
      .toBuffer();
    
    // Convert to tensor
    const tensor = tf.node.decodeImage(resized, 3);
    const normalized = tensor.div(255.0);
    
    return {
      tensor: normalized,
      metadata,
      buffer: resized
    };
  }

  /**
   * Check authenticity using deep learning
   */
  async checkAuthenticity(processedImage) {
    const model = this.models.get('authenticity');
    const input = processedImage.tensor.expandDims(0);
    
    const prediction = await model.predict(input).data();
    
    // Cleanup tensors
    input.dispose();
    
    return prediction[0]; // Returns probability between 0 and 1
  }

  /**
   * Assess image quality
   */
  async assessQuality(processedImage) {
    const model = this.models.get('quality');
    
    // Resize for quality model
    const resized = tf.image.resizeBilinear(processedImage.tensor, [128, 128]);
    const input = resized.expandDims(0);
    
    const prediction = await model.predict(input).data();
    
    // Cleanup
    input.dispose();
    resized.dispose();
    
    // Return weighted quality score
    const qualityLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    let score = 0;
    for (let i = 0; i < prediction.length; i++) {
      score += prediction[i] * qualityLevels[i];
    }
    
    return score;
  }

  /**
   * Detect anomalies in product
   */
  async detectAnomalies(processedImage, metadata) {
    const model = this.models.get('anomaly');
    
    // Extract features from image and metadata
    const features = await this.extractFeatures(processedImage, metadata);
    const input = tf.tensor2d([features], [1, 100]);
    
    // Get reconstruction
    const reconstruction = await model.predict(input).data();
    
    // Calculate reconstruction error
    const error = tf.losses.meanSquaredError(
      tf.tensor1d(features),
      tf.tensor1d(Array.from(reconstruction))
    );
    
    const errorValue = await error.data();
    
    // Cleanup
    input.dispose();
    error.dispose();
    
    // Convert error to anomaly score (lower error = higher score)
    const anomalyScore = Math.max(0, 1 - errorValue[0] * 10);
    
    return anomalyScore;
  }

  /**
   * Extract text using OCR
   */
  async extractText(imageBuffer) {
    try {
      const { data } = await this.worker.recognize(imageBuffer);
      
      return {
        text: data.text,
        confidence: data.confidence / 100,
        words: data.words.map(w => ({
          text: w.text,
          confidence: w.confidence / 100,
          bbox: w.bbox
        }))
      };
    } catch (error) {
      monitoringService.error('OCR extraction failed', error);
      return { text: '', confidence: 0, words: [] };
    }
  }

  /**
   * Extract visual features
   */
  async extractVisualFeatures(processedImage) {
    const { metadata } = processedImage;
    
    // Calculate image statistics
    const stats = await sharp(processedImage.buffer).stats();
    
    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      format: metadata.format,
      colorSpace: metadata.space,
      channels: stats.channels.map(c => ({
        mean: c.mean,
        std: c.std,
        min: c.min,
        max: c.max
      })),
      entropy: stats.entropy,
      sharpness: await this.calculateSharpness(processedImage.buffer),
      dominantColors: await this.extractDominantColors(processedImage.buffer)
    };
  }

  /**
   * Calculate image sharpness
   */
  async calculateSharpness(imageBuffer) {
    const laplacian = await sharp(imageBuffer)
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0]
      })
      .raw()
      .toBuffer();
    
    // Calculate variance of Laplacian
    const variance = this.calculateVariance(laplacian);
    
    return Math.min(1, variance / 1000); // Normalize to 0-1
  }

  /**
   * Extract dominant colors
   */
  async extractDominantColors(imageBuffer) {
    const { dominant } = await sharp(imageBuffer).stats();
    
    return {
      r: dominant.r,
      g: dominant.g,
      b: dominant.b,
      hex: `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`
    };
  }

  /**
   * Predict product price
   */
  async predictPrice(features) {
    const model = this.models.get('price');
    
    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);
    const input = tf.tensor2d([normalizedFeatures], [1, 10]);
    
    const prediction = await model.predict(input).data();
    
    // Cleanup
    input.dispose();
    
    // Denormalize price
    const price = prediction[0] * 10000; // Adjust scale as needed
    
    return {
      estimatedPrice: price,
      confidence: 0.85, // Placeholder
      priceRange: {
        min: price * 0.8,
        max: price * 1.2
      }
    };
  }

  /**
   * Helper methods
   */
  
  extractFeatures(processedImage, metadata) {
    // Extract 100 features from image and metadata
    // This is a simplified version - in production, use proper feature extraction
    const features = new Array(100).fill(0).map(() => Math.random());
    return features;
  }

  normalizeFeatures(features) {
    // Simple normalization
    return features.map(f => (f - 0.5) / 0.5);
  }

  calculateVariance(buffer) {
    const values = Array.from(buffer);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return variance;
  }

  calculateFinalScore(scores) {
    const weights = {
      authenticity: 0.4,
      quality: 0.2,
      anomaly: 0.3,
      ocr: 0.1
    };
    
    let finalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      finalScore += scores[key] * weight;
    }
    
    return Math.min(1, Math.max(0, finalScore));
  }

  determineStatus(score) {
    if (score >= 0.9) return 'authentic';
    if (score >= 0.7) return 'likely_authentic';
    if (score >= 0.5) return 'uncertain';
    if (score >= 0.3) return 'likely_counterfeit';
    return 'counterfeit';
  }

  generateRecommendations(score, status) {
    const recommendations = [];
    
    if (score < 0.5) {
      recommendations.push('Request additional verification documents');
      recommendations.push('Perform physical inspection if possible');
    }
    
    if (score >= 0.5 && score < 0.7) {
      recommendations.push('Compare with known authentic samples');
      recommendations.push('Verify seller credentials');
    }
    
    if (score >= 0.7 && score < 0.9) {
      recommendations.push('Product appears authentic but verify serial number');
    }
    
    if (score >= 0.9) {
      recommendations.push('Product verified as authentic');
    }
    
    return recommendations;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
    }
    
    // Dispose of models
    for (const [name, model] of this.models) {
      model.dispose();
    }
    
    this.models.clear();
    this.initialized = false;
    
    monitoringService.info('AI Service cleaned up');
  }
}

module.exports = new EnhancedAIService();