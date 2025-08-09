const mongoose = require('mongoose');

// AI 학습 데이터 스키마
const aiTrainingDataSchema = new mongoose.Schema({
  // 제품 정보
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // 스캔된 이미지 특징
  imageFeatures: {
    // 색상 히스토그램
    colorHistogram: {
      red: [Number],   // 256개 bins
      green: [Number], // 256개 bins
      blue: [Number]   // 256개 bins
    },
    
    // 텍스처 특징 (GLCM - Gray Level Co-occurrence Matrix)
    textureFeatures: {
      contrast: Number,
      dissimilarity: Number,
      homogeneity: Number,
      energy: Number,
      correlation: Number,
      entropy: Number
    },
    
    // 엣지 특징
    edgeFeatures: {
      cannyEdgeCount: Number,
      sobelMagnitude: Number,
      laplacianVariance: Number
    },
    
    // 형태학적 특징
    shapeFeatures: {
      aspectRatio: Number,
      circularity: Number,
      solidity: Number,
      extent: Number,
      perimeter: Number,
      area: Number
    },
    
    // SIFT/SURF 특징점
    keypoints: [{
      x: Number,
      y: Number,
      size: Number,
      angle: Number,
      descriptor: [Number] // 128차원 벡터
    }],
    
    // 딥러닝 특징 (CNN에서 추출)
    deepFeatures: {
      resnetEmbedding: [Number], // 2048차원
      vggEmbedding: [Number],    // 4096차원
      efficientnetEmbedding: [Number] // 1280차원
    }
  },
  
  // OCR 텍스트 특징
  textFeatures: {
    extractedTexts: [String],
    serialNumber: String,
    batchCode: String,
    manufacturingDate: String,
    brandName: String,
    modelNumber: String,
    
    // 텍스트 패턴 분석
    textPatterns: {
      hasSerialFormat: Boolean,
      fontConsistency: Number, // 0-1 점수
      textAlignment: String,
      languageDetected: [String]
    }
  },
  
  // QR/바코드 특징
  codeFeatures: {
    qrCodeData: String,
    barcodeData: String,
    dataMatrixData: String,
    codeQuality: Number, // 0-1 점수
    errorCorrectionLevel: String
  },
  
  // 홀로그램/보안 특징
  securityFeatures: {
    hasHologram: Boolean,
    hologramPattern: String,
    uvReflection: Number,
    microprinting: Boolean,
    watermark: Boolean,
    securityThread: Boolean,
    colorShifting: Boolean
  },
  
  // 재질 특징
  materialFeatures: {
    reflectance: Number,
    transparency: Number,
    roughness: Number,
    glossiness: Number,
    materialType: {
      type: String,
      enum: ['leather', 'fabric', 'metal', 'plastic', 'glass', 'paper', 'wood', 'ceramic', 'other']
    }
  },
  
  // 브랜드별 특징
  brandSpecificFeatures: {
    logoPosition: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    logoClarity: Number, // 0-1 점수
    stitchingPattern: String,
    hardwareFinish: String,
    packagingQuality: Number // 0-1 점수
  },
  
  // 라벨 정보
  labelInfo: {
    // 정품 라벨 (Ground Truth)
    isAuthentic: {
      type: Boolean,
      required: true
    },
    
    // 신뢰도 점수
    authenticityScore: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    
    // 검증 방법
    verificationMethod: {
      type: String,
      enum: ['expert', 'manufacturer', 'blockchain', 'ai_consensus', 'user_report']
    },
    
    // 가짜 유형 (가품인 경우)
    fakeType: {
      type: String,
      enum: ['replica', 'counterfeit', 'refurbished', 'gray_market', 'stolen', null]
    }
  },
  
  // 환경 조건 (스캔 시)
  scanConditions: {
    lightingCondition: {
      type: String,
      enum: ['natural', 'fluorescent', 'led', 'mixed', 'low_light']
    },
    cameraQuality: String,
    imageResolution: {
      width: Number,
      height: Number
    },
    deviceType: String,
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  // 사용자 피드백
  userFeedback: {
    reportedAsAuthentic: Boolean,
    userConfidence: Number, // 0-1
    feedbackText: String,
    reportCount: {
      type: Number,
      default: 0
    }
  },
  
  // 메타데이터
  metadata: {
    dataSource: {
      type: String,
      enum: ['user_upload', 'manufacturer', 'retailer', 'expert_validation', 'web_scraping']
    },
    collectionDate: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [String]
  }
}, {
  timestamps: true,
  collection: 'ai_training_data'
});

// 인덱스 설정
aiTrainingDataSchema.index({ productId: 1 });
aiTrainingDataSchema.index({ 'labelInfo.isAuthentic': 1 });
aiTrainingDataSchema.index({ 'labelInfo.authenticityScore': 1 });
aiTrainingDataSchema.index({ 'metadata.dataSource': 1 });
aiTrainingDataSchema.index({ 'textFeatures.serialNumber': 1 });
aiTrainingDataSchema.index({ 'textFeatures.brandName': 1 });

// 가상 필드: 특징 벡터 차원
aiTrainingDataSchema.virtual('featureVectorDimension').get(function() {
  let dimension = 0;
  
  // 색상 히스토그램: 256 * 3 = 768
  dimension += 768;
  
  // 텍스처 특징: 6
  dimension += 6;
  
  // 엣지 특징: 3
  dimension += 3;
  
  // 형태 특징: 6
  dimension += 6;
  
  // 딥러닝 특징
  if (this.imageFeatures.deepFeatures) {
    dimension += 2048 + 4096 + 1280; // ResNet + VGG + EfficientNet
  }
  
  return dimension;
});

// 메서드: 특징 벡터 추출
aiTrainingDataSchema.methods.extractFeatureVector = function() {
  const features = [];
  
  // 색상 히스토그램 평탄화
  if (this.imageFeatures.colorHistogram) {
    features.push(...this.imageFeatures.colorHistogram.red);
    features.push(...this.imageFeatures.colorHistogram.green);
    features.push(...this.imageFeatures.colorHistogram.blue);
  }
  
  // 텍스처 특징
  if (this.imageFeatures.textureFeatures) {
    features.push(
      this.imageFeatures.textureFeatures.contrast || 0,
      this.imageFeatures.textureFeatures.dissimilarity || 0,
      this.imageFeatures.textureFeatures.homogeneity || 0,
      this.imageFeatures.textureFeatures.energy || 0,
      this.imageFeatures.textureFeatures.correlation || 0,
      this.imageFeatures.textureFeatures.entropy || 0
    );
  }
  
  // 엣지 특징
  if (this.imageFeatures.edgeFeatures) {
    features.push(
      this.imageFeatures.edgeFeatures.cannyEdgeCount || 0,
      this.imageFeatures.edgeFeatures.sobelMagnitude || 0,
      this.imageFeatures.edgeFeatures.laplacianVariance || 0
    );
  }
  
  // 형태 특징
  if (this.imageFeatures.shapeFeatures) {
    features.push(
      this.imageFeatures.shapeFeatures.aspectRatio || 0,
      this.imageFeatures.shapeFeatures.circularity || 0,
      this.imageFeatures.shapeFeatures.solidity || 0,
      this.imageFeatures.shapeFeatures.extent || 0,
      this.imageFeatures.shapeFeatures.perimeter || 0,
      this.imageFeatures.shapeFeatures.area || 0
    );
  }
  
  // 딥러닝 특징
  if (this.imageFeatures.deepFeatures) {
    features.push(...(this.imageFeatures.deepFeatures.resnetEmbedding || []));
    features.push(...(this.imageFeatures.deepFeatures.vggEmbedding || []));
    features.push(...(this.imageFeatures.deepFeatures.efficientnetEmbedding || []));
  }
  
  return features;
};

// 정적 메서드: 유사도 계산
aiTrainingDataSchema.statics.calculateSimilarity = function(features1, features2) {
  if (features1.length !== features2.length) {
    throw new Error('Feature vectors must have the same dimension');
  }
  
  // 코사인 유사도 계산
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < features1.length; i++) {
    dotProduct += features1[i] * features2[i];
    norm1 += features1[i] * features1[i];
    norm2 += features2[i] * features2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }
  
  return dotProduct / (norm1 * norm2);
};

module.exports = mongoose.model('AITrainingData', aiTrainingDataSchema);