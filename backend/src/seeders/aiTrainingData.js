const mongoose = require('mongoose');
const AITrainingData = require('../models/AITrainingData');
const Product = require('../models/Product');
require('dotenv').config();

// 학습 데이터 생성을 위한 시드 데이터
const generateTrainingData = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verachain');
    console.log('Connected to MongoDB');

    // 기존 학습 데이터 삭제
    await AITrainingData.deleteMany({});
    console.log('Cleared existing training data');

    // 제품 데이터 가져오기
    const products = await Product.find({}).limit(20);
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }

    const trainingDataSet = [];

    // 각 제품에 대해 정품과 가품 데이터 생성
    for (const product of products) {
      // 정품 데이터 (5개 변형)
      for (let i = 0; i < 5; i++) {
        trainingDataSet.push(generateAuthenticData(product, i));
      }

      // 가품 데이터 (3개 변형)
      for (let i = 0; i < 3; i++) {
        trainingDataSet.push(generateCounterfeitData(product, i));
      }
    }

    // 데이터베이스에 저장
    const savedData = await AITrainingData.insertMany(trainingDataSet);
    console.log(`Created ${savedData.length} training data entries`);

    // 통계 출력
    const authenticCount = trainingDataSet.filter(d => d.labelInfo.isAuthentic).length;
    const counterfeitCount = trainingDataSet.filter(d => !d.labelInfo.isAuthentic).length;
    
    console.log('\n=== Training Data Statistics ===');
    console.log(`Total samples: ${trainingDataSet.length}`);
    console.log(`Authentic samples: ${authenticCount}`);
    console.log(`Counterfeit samples: ${counterfeitCount}`);
    console.log(`Ratio: ${(authenticCount / trainingDataSet.length * 100).toFixed(1)}% authentic`);

    return savedData;
  } catch (error) {
    console.error('Error generating training data:', error);
    throw error;
  }
};

// 정품 데이터 생성
function generateAuthenticData(product, variation) {
  const baseFeatures = generateBaseImageFeatures(true, variation);
  
  return {
    productId: product._id,
    
    imageFeatures: {
      colorHistogram: generateColorHistogram(true, variation),
      
      textureFeatures: {
        contrast: 45 + Math.random() * 10,
        dissimilarity: 8 + Math.random() * 2,
        homogeneity: 0.85 + Math.random() * 0.1,
        energy: 0.7 + Math.random() * 0.15,
        correlation: 0.9 + Math.random() * 0.08,
        entropy: 6.5 + Math.random() * 0.5
      },
      
      edgeFeatures: {
        cannyEdgeCount: 2500 + Math.floor(Math.random() * 500),
        sobelMagnitude: 120 + Math.random() * 30,
        laplacianVariance: 850 + Math.random() * 150
      },
      
      shapeFeatures: {
        aspectRatio: 1.4 + Math.random() * 0.2,
        circularity: 0.85 + Math.random() * 0.1,
        solidity: 0.92 + Math.random() * 0.05,
        extent: 0.75 + Math.random() * 0.15,
        perimeter: 800 + Math.random() * 200,
        area: 45000 + Math.random() * 10000
      },
      
      keypoints: generateKeypoints(true, 50 + variation * 10),
      
      deepFeatures: {
        resnetEmbedding: generateEmbedding(2048, true),
        vggEmbedding: generateEmbedding(4096, true),
        efficientnetEmbedding: generateEmbedding(1280, true)
      }
    },
    
    textFeatures: {
      extractedTexts: generateExtractedTexts(product, true),
      serialNumber: generateSerialNumber(product, true),
      batchCode: `BATCH-${Date.now()}-${variation}`,
      manufacturingDate: generateManufacturingDate(true),
      brandName: product.brand,
      modelNumber: `MODEL-${product.category.toUpperCase()}-${variation}`,
      
      textPatterns: {
        hasSerialFormat: true,
        fontConsistency: 0.95 + Math.random() * 0.05,
        textAlignment: 'justified',
        languageDetected: ['en', 'ko']
      }
    },
    
    codeFeatures: {
      qrCodeData: generateQRCode(product, true),
      barcodeData: generateBarcode(product, true),
      dataMatrixData: `DM-${product._id}-${variation}`,
      codeQuality: 0.9 + Math.random() * 0.1,
      errorCorrectionLevel: 'H'
    },
    
    securityFeatures: {
      hasHologram: true,
      hologramPattern: 'authentic_pattern_' + variation,
      uvReflection: 0.85 + Math.random() * 0.15,
      microprinting: true,
      watermark: true,
      securityThread: true,
      colorShifting: true
    },
    
    materialFeatures: {
      reflectance: 0.7 + Math.random() * 0.2,
      transparency: 0.1 + Math.random() * 0.05,
      roughness: 0.3 + Math.random() * 0.1,
      glossiness: 0.8 + Math.random() * 0.15,
      materialType: getMaterialType(product.category)
    },
    
    brandSpecificFeatures: {
      logoPosition: {
        x: 100 + variation * 10,
        y: 50 + variation * 5,
        width: 200,
        height: 100
      },
      logoClarity: 0.95 + Math.random() * 0.05,
      stitchingPattern: 'authentic_stitch_' + variation,
      hardwareFinish: 'premium',
      packagingQuality: 0.9 + Math.random() * 0.1
    },
    
    labelInfo: {
      isAuthentic: true,
      authenticityScore: 0.9 + Math.random() * 0.1,
      verificationMethod: 'manufacturer',
      fakeType: null
    },
    
    scanConditions: {
      lightingCondition: ['natural', 'fluorescent', 'led'][variation % 3],
      cameraQuality: 'high',
      imageResolution: {
        width: 1920,
        height: 1080
      },
      deviceType: 'smartphone',
      location: {
        type: 'Point',
        coordinates: [126.9780 + Math.random() * 0.1, 37.5665 + Math.random() * 0.1]
      }
    },
    
    userFeedback: {
      reportedAsAuthentic: true,
      userConfidence: 0.85 + Math.random() * 0.15,
      feedbackText: 'Verified authentic product',
      reportCount: Math.floor(Math.random() * 10)
    },
    
    metadata: {
      dataSource: 'manufacturer',
      tags: ['authentic', 'verified', product.category, product.brand]
    }
  };
}

// 가품 데이터 생성
function generateCounterfeitData(product, variation) {
  const fakeTypes = ['replica', 'counterfeit', 'refurbished', 'gray_market'];
  const fakeType = fakeTypes[variation % fakeTypes.length];
  
  return {
    productId: product._id,
    
    imageFeatures: {
      colorHistogram: generateColorHistogram(false, variation),
      
      textureFeatures: {
        contrast: 25 + Math.random() * 15, // 낮은 대비
        dissimilarity: 12 + Math.random() * 5, // 높은 불일치
        homogeneity: 0.6 + Math.random() * 0.15, // 낮은 균질성
        energy: 0.4 + Math.random() * 0.2, // 낮은 에너지
        correlation: 0.65 + Math.random() * 0.15, // 낮은 상관관계
        entropy: 4.5 + Math.random() * 1.5 // 낮은 엔트로피
      },
      
      edgeFeatures: {
        cannyEdgeCount: 1200 + Math.floor(Math.random() * 800), // 적은 엣지
        sobelMagnitude: 60 + Math.random() * 40, // 낮은 강도
        laplacianVariance: 400 + Math.random() * 300 // 낮은 변동성
      },
      
      shapeFeatures: {
        aspectRatio: 1.2 + Math.random() * 0.5, // 왜곡된 비율
        circularity: 0.6 + Math.random() * 0.2, // 낮은 원형도
        solidity: 0.7 + Math.random() * 0.15, // 낮은 견고성
        extent: 0.5 + Math.random() * 0.25, // 낮은 범위
        perimeter: 600 + Math.random() * 400,
        area: 30000 + Math.random() * 20000
      },
      
      keypoints: generateKeypoints(false, 20 + variation * 5),
      
      deepFeatures: {
        resnetEmbedding: generateEmbedding(2048, false),
        vggEmbedding: generateEmbedding(4096, false),
        efficientnetEmbedding: generateEmbedding(1280, false)
      }
    },
    
    textFeatures: {
      extractedTexts: generateExtractedTexts(product, false),
      serialNumber: generateSerialNumber(product, false), // 잘못된 형식
      batchCode: `FAKE-${variation}`,
      manufacturingDate: generateManufacturingDate(false),
      brandName: product.brand + (variation % 2 === 0 ? '' : ' '), // 때때로 오타
      modelNumber: `MDL-${variation}`, // 잘못된 형식
      
      textPatterns: {
        hasSerialFormat: false,
        fontConsistency: 0.5 + Math.random() * 0.3, // 일관성 없는 폰트
        textAlignment: 'mixed',
        languageDetected: ['en', 'cn', 'unknown'] // 의심스러운 언어 혼합
      }
    },
    
    codeFeatures: {
      qrCodeData: generateQRCode(product, false),
      barcodeData: generateBarcode(product, false),
      dataMatrixData: variation % 2 === 0 ? '' : `INVALID-${variation}`,
      codeQuality: 0.3 + Math.random() * 0.4, // 낮은 품질
      errorCorrectionLevel: 'L'
    },
    
    securityFeatures: {
      hasHologram: variation % 2 === 0,
      hologramPattern: 'fake_pattern_' + variation,
      uvReflection: 0.2 + Math.random() * 0.3, // 낮은 UV 반사
      microprinting: false,
      watermark: false,
      securityThread: false,
      colorShifting: variation % 3 === 0
    },
    
    materialFeatures: {
      reflectance: 0.3 + Math.random() * 0.3, // 낮은 반사도
      transparency: 0.2 + Math.random() * 0.2,
      roughness: 0.6 + Math.random() * 0.3, // 높은 거칠기
      glossiness: 0.3 + Math.random() * 0.3, // 낮은 광택
      materialType: 'plastic' // 대부분 저급 플라스틱
    },
    
    brandSpecificFeatures: {
      logoPosition: {
        x: 80 + variation * 20, // 잘못된 위치
        y: 30 + variation * 15,
        width: 180,
        height: 90
      },
      logoClarity: 0.4 + Math.random() * 0.3, // 흐릿한 로고
      stitchingPattern: 'irregular_' + variation,
      hardwareFinish: 'low_quality',
      packagingQuality: 0.3 + Math.random() * 0.3 // 낮은 패키징 품질
    },
    
    labelInfo: {
      isAuthentic: false,
      authenticityScore: 0.1 + Math.random() * 0.3,
      verificationMethod: 'expert',
      fakeType: fakeType
    },
    
    scanConditions: {
      lightingCondition: 'low_light', // 의도적으로 어두운 조명
      cameraQuality: 'low',
      imageResolution: {
        width: 640,
        height: 480
      },
      deviceType: 'unknown',
      location: {
        type: 'Point',
        coordinates: [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1] // 의심스러운 위치
      }
    },
    
    userFeedback: {
      reportedAsAuthentic: false,
      userConfidence: 0.2 + Math.random() * 0.3,
      feedbackText: 'Suspected counterfeit',
      reportCount: 10 + Math.floor(Math.random() * 20)
    },
    
    metadata: {
      dataSource: 'expert_validation',
      tags: ['counterfeit', 'fake', fakeType, product.category]
    }
  };
}

// 헬퍼 함수들
function generateColorHistogram(isAuthentic, variation) {
  const histogram = {
    red: [],
    green: [],
    blue: []
  };
  
  for (let i = 0; i < 256; i++) {
    if (isAuthentic) {
      // 정품: 자연스러운 분포
      histogram.red[i] = Math.exp(-Math.pow(i - 128, 2) / 5000) * (1 + Math.random() * 0.1);
      histogram.green[i] = Math.exp(-Math.pow(i - 130, 2) / 5000) * (1 + Math.random() * 0.1);
      histogram.blue[i] = Math.exp(-Math.pow(i - 125, 2) / 5000) * (1 + Math.random() * 0.1);
    } else {
      // 가품: 왜곡된 분포
      histogram.red[i] = Math.random() * 0.01;
      histogram.green[i] = Math.random() * 0.01;
      histogram.blue[i] = Math.random() * 0.01;
      
      // 특정 영역에 스파이크
      if (i % 50 === variation) {
        histogram.red[i] += 0.1;
        histogram.green[i] += 0.08;
        histogram.blue[i] += 0.12;
      }
    }
  }
  
  return histogram;
}

function generateKeypoints(isAuthentic, count) {
  const keypoints = [];
  
  for (let i = 0; i < count; i++) {
    keypoints.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      size: isAuthentic ? 10 + Math.random() * 20 : 5 + Math.random() * 10,
      angle: Math.random() * 360,
      descriptor: generateDescriptor(128, isAuthentic)
    });
  }
  
  return keypoints;
}

function generateDescriptor(size, isAuthentic) {
  const descriptor = [];
  
  for (let i = 0; i < size; i++) {
    if (isAuthentic) {
      // 정품: 일관된 패턴
      descriptor.push(Math.sin(i * 0.1) * 0.5 + 0.5 + Math.random() * 0.1);
    } else {
      // 가품: 무작위 패턴
      descriptor.push(Math.random());
    }
  }
  
  return descriptor;
}

function generateEmbedding(size, isAuthentic) {
  const embedding = [];
  
  for (let i = 0; i < size; i++) {
    if (isAuthentic) {
      // 정품: 구조화된 임베딩
      embedding.push(Math.cos(i * 0.01) * 0.3 + Math.sin(i * 0.02) * 0.2 + Math.random() * 0.1);
    } else {
      // 가품: 노이즈가 많은 임베딩
      embedding.push((Math.random() - 0.5) * 2);
    }
  }
  
  return embedding;
}

function generateExtractedTexts(product, isAuthentic) {
  const texts = [product.name, product.brand];
  
  if (isAuthentic) {
    texts.push(
      'Made in ' + ['Italy', 'France', 'Switzerland', 'USA'][Math.floor(Math.random() * 4)],
      'Authentic Product',
      'Quality Guaranteed'
    );
  } else {
    texts.push(
      'Made in ' + ['China', 'Unknown'][Math.floor(Math.random() * 2)],
      'Replicca', // 의도적 오타
      'Best Qualty' // 의도적 오타
    );
  }
  
  return texts;
}

function generateSerialNumber(product, isAuthentic) {
  if (isAuthentic) {
    return `${product.brand.toUpperCase().substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  } else {
    return `FAKE-${Math.floor(Math.random() * 1000)}`;
  }
}

function generateManufacturingDate(isAuthentic) {
  const date = new Date();
  
  if (isAuthentic) {
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
  } else {
    // 가품: 미래 날짜나 너무 오래된 날짜
    if (Math.random() > 0.5) {
      date.setFullYear(date.getFullYear() + 1); // 미래
    } else {
      date.setFullYear(date.getFullYear() - 10); // 너무 오래됨
    }
  }
  
  return date.toISOString().split('T')[0];
}

function generateQRCode(product, isAuthentic) {
  if (isAuthentic) {
    return `https://verachain.com/verify/${product._id}`;
  } else {
    return Math.random() > 0.5 ? 'INVALID_QR_DATA' : '';
  }
}

function generateBarcode(product, isAuthentic) {
  if (isAuthentic) {
    return `${product._id}`.substring(0, 13).padEnd(13, '0');
  } else {
    return '0000000000000';
  }
}

function getMaterialType(category) {
  const materials = {
    watch: 'metal',
    handbag: 'leather',
    shoes: 'leather',
    jewelry: 'metal',
    electronics: 'plastic',
    clothing: 'fabric'
  };
  
  return materials[category] || 'other';
}

function generateBaseImageFeatures(isAuthentic, variation) {
  // 추가 이미지 특징 생성 로직
  return {
    brightness: isAuthentic ? 0.7 + Math.random() * 0.2 : 0.4 + Math.random() * 0.3,
    contrast: isAuthentic ? 0.8 + Math.random() * 0.15 : 0.5 + Math.random() * 0.3,
    saturation: isAuthentic ? 0.75 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4
  };
}

// 스크립트 실행
if (require.main === module) {
  generateTrainingData()
    .then(() => {
      console.log('Training data generation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Training data generation failed:', error);
      process.exit(1);
    });
}

module.exports = generateTrainingData;