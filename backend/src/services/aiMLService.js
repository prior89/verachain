const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const AITrainingData = require('../models/AITrainingData');

class AIMLService {
  constructor() {
    this.model = null;
    this.featureExtractor = null;
    this.isModelLoaded = false;
    this.modelVersion = '1.0.0';
  }

  // 모델 초기화
  async initializeModel() {
    try {
      // 사전 훈련된 MobileNet 모델 로드 (특징 추출용)
      this.featureExtractor = await tf.loadLayersModel(
        'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/feature_vector/5'
      );
      
      // 커스텀 분류 모델 생성
      this.model = await this.createAuthenticationModel();
      
      // 저장된 가중치가 있으면 로드
      try {
        await this.model.loadWeights('file://./models/authentication_model/weights.bin');
        console.log('Loaded existing model weights');
      } catch (error) {
        console.log('No existing model weights found, using initial weights');
      }
      
      this.isModelLoaded = true;
      return true;
    } catch (error) {
      console.error('Model initialization error:', error);
      return false;
    }
  }

  // 진품 인증 모델 생성
  createAuthenticationModel() {
    const model = tf.sequential({
      layers: [
        // 입력층: 이미지 특징 + 텍스트 특징 + 메타데이터
        tf.layers.dense({
          inputShape: [8192], // 특징 벡터 차원
          units: 2048,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Dropout for regularization
        tf.layers.dropout({ rate: 0.3 }),
        
        // Hidden layers
        tf.layers.dense({
          units: 1024,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        
        tf.layers.dense({
          units: 512,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 256,
          activation: 'relu'
        }),
        
        tf.layers.dense({
          units: 128,
          activation: 'relu'
        }),
        
        // 출력층: 진품 확률
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    // 모델 컴파일
    model.compile({
      optimizer: tf.train.adam(0.0001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  // 이미지에서 특징 추출
  async extractImageFeatures(imageBuffer) {
    try {
      // Sharp를 사용한 이미지 전처리
      const processedImage = await sharp(imageBuffer)
        .resize(224, 224)
        .normalize()
        .toBuffer();

      // 색상 히스토그램 추출
      const colorHistogram = await this.extractColorHistogram(processedImage);
      
      // 텍스처 특징 추출
      const textureFeatures = await this.extractTextureFeatures(processedImage);
      
      // 엣지 특징 추출
      const edgeFeatures = await this.extractEdgeFeatures(processedImage);
      
      // 형태 특징 추출
      const shapeFeatures = await this.extractShapeFeatures(processedImage);
      
      // 딥러닝 특징 추출
      const deepFeatures = await this.extractDeepFeatures(processedImage);

      return {
        colorHistogram,
        textureFeatures,
        edgeFeatures,
        shapeFeatures,
        deepFeatures
      };
    } catch (error) {
      console.error('Feature extraction error:', error);
      throw error;
    }
  }

  // 색상 히스토그램 추출
  async extractColorHistogram(imageBuffer) {
    const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0)
    };

    for (let i = 0; i < data.length; i += channels) {
      histogram.red[data[i]]++;
      histogram.green[data[i + 1]]++;
      histogram.blue[data[i + 2]]++;
    }

    // 정규화
    const pixelCount = width * height;
    for (let i = 0; i < 256; i++) {
      histogram.red[i] /= pixelCount;
      histogram.green[i] /= pixelCount;
      histogram.blue[i] /= pixelCount;
    }

    return histogram;
  }

  // 텍스처 특징 추출 (GLCM 기반)
  async extractTextureFeatures(imageBuffer) {
    const { data, info } = await sharp(imageBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    
    // Gray Level Co-occurrence Matrix 계산
    const glcm = this.calculateGLCM(data, width, height);
    
    // GLCM에서 텍스처 특징 추출
    return {
      contrast: this.calculateContrast(glcm),
      dissimilarity: this.calculateDissimilarity(glcm),
      homogeneity: this.calculateHomogeneity(glcm),
      energy: this.calculateEnergy(glcm),
      correlation: this.calculateCorrelation(glcm),
      entropy: this.calculateEntropy(glcm)
    };
  }

  // GLCM 계산
  calculateGLCM(data, width, height, distance = 1) {
    const levels = 256;
    const glcm = Array(levels).fill(null).map(() => Array(levels).fill(0));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - distance; x++) {
        const i = data[y * width + x];
        const j = data[y * width + x + distance];
        glcm[i][j]++;
      }
    }
    
    // 정규화
    const total = (width - distance) * height;
    for (let i = 0; i < levels; i++) {
      for (let j = 0; j < levels; j++) {
        glcm[i][j] /= total;
      }
    }
    
    return glcm;
  }

  // GLCM 특징 계산 함수들
  calculateContrast(glcm) {
    let contrast = 0;
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        contrast += Math.pow(i - j, 2) * glcm[i][j];
      }
    }
    return contrast;
  }

  calculateDissimilarity(glcm) {
    let dissimilarity = 0;
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        dissimilarity += Math.abs(i - j) * glcm[i][j];
      }
    }
    return dissimilarity;
  }

  calculateHomogeneity(glcm) {
    let homogeneity = 0;
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        homogeneity += glcm[i][j] / (1 + Math.abs(i - j));
      }
    }
    return homogeneity;
  }

  calculateEnergy(glcm) {
    let energy = 0;
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        energy += Math.pow(glcm[i][j], 2);
      }
    }
    return Math.sqrt(energy);
  }

  calculateCorrelation(glcm) {
    let correlation = 0;
    let meanI = 0, meanJ = 0;
    let stdI = 0, stdJ = 0;
    
    // 평균 계산
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        meanI += i * glcm[i][j];
        meanJ += j * glcm[i][j];
      }
    }
    
    // 표준편차 계산
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        stdI += Math.pow(i - meanI, 2) * glcm[i][j];
        stdJ += Math.pow(j - meanJ, 2) * glcm[i][j];
      }
    }
    
    stdI = Math.sqrt(stdI);
    stdJ = Math.sqrt(stdJ);
    
    // 상관계수 계산
    if (stdI > 0 && stdJ > 0) {
      for (let i = 0; i < glcm.length; i++) {
        for (let j = 0; j < glcm[i].length; j++) {
          correlation += ((i - meanI) * (j - meanJ) * glcm[i][j]) / (stdI * stdJ);
        }
      }
    }
    
    return correlation;
  }

  calculateEntropy(glcm) {
    let entropy = 0;
    for (let i = 0; i < glcm.length; i++) {
      for (let j = 0; j < glcm[i].length; j++) {
        if (glcm[i][j] > 0) {
          entropy -= glcm[i][j] * Math.log2(glcm[i][j]);
        }
      }
    }
    return entropy;
  }

  // 엣지 특징 추출
  async extractEdgeFeatures(imageBuffer) {
    const { data, info } = await sharp(imageBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    
    // Sobel 엣지 검출
    const sobelEdges = this.applySobel(data, width, height);
    
    // Canny 엣지 검출 (카운트)
    const cannyCount = this.countCannyEdges(data, width, height);
    
    // Laplacian variance
    const laplacianVar = this.calculateLaplacianVariance(data, width, height);

    return {
      cannyEdgeCount: cannyCount,
      sobelMagnitude: sobelEdges.avgMagnitude,
      laplacianVariance: laplacianVar
    };
  }

  // Sobel 필터 적용
  applySobel(data, width, height) {
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    let totalMagnitude = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = data[(y + ky) * width + (x + kx)];
            gx += pixel * sobelX[ky + 1][kx + 1];
            gy += pixel * sobelY[ky + 1][kx + 1];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        totalMagnitude += magnitude;
        count++;
      }
    }
    
    return {
      avgMagnitude: totalMagnitude / count
    };
  }

  // Canny 엣지 카운트
  countCannyEdges(data, width, height, lowThreshold = 50, highThreshold = 150) {
    // 간단한 Canny 엣지 검출 구현
    let edgeCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = data[y * width + x];
        
        // 8-방향 이웃과의 차이 계산
        const neighbors = [
          data[(y - 1) * width + (x - 1)],
          data[(y - 1) * width + x],
          data[(y - 1) * width + (x + 1)],
          data[y * width + (x - 1)],
          data[y * width + (x + 1)],
          data[(y + 1) * width + (x - 1)],
          data[(y + 1) * width + x],
          data[(y + 1) * width + (x + 1)]
        ];
        
        const maxDiff = Math.max(...neighbors.map(n => Math.abs(center - n)));
        
        if (maxDiff > highThreshold) {
          edgeCount++;
        }
      }
    }
    
    return edgeCount;
  }

  // Laplacian variance 계산
  calculateLaplacianVariance(data, width, height) {
    const laplacian = [[0, 1, 0], [1, -4, 1], [0, 1, 0]];
    const values = [];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = data[(y + ky) * width + (x + kx)];
            sum += pixel * laplacian[ky + 1][kx + 1];
          }
        }
        
        values.push(sum);
      }
    }
    
    // variance 계산
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return variance;
  }

  // 형태 특징 추출
  async extractShapeFeatures(imageBuffer) {
    const { data, info } = await sharp(imageBuffer)
      .threshold(128)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    
    // 이진 이미지에서 객체 찾기
    const contours = this.findContours(data, width, height);
    
    if (contours.length === 0) {
      return {
        aspectRatio: 0,
        circularity: 0,
        solidity: 0,
        extent: 0,
        perimeter: 0,
        area: 0
      };
    }
    
    // 가장 큰 contour 선택
    const mainContour = contours.reduce((max, curr) => 
      curr.area > max.area ? curr : max
    );
    
    return {
      aspectRatio: mainContour.width / mainContour.height,
      circularity: (4 * Math.PI * mainContour.area) / Math.pow(mainContour.perimeter, 2),
      solidity: mainContour.area / mainContour.convexArea,
      extent: mainContour.area / (mainContour.width * mainContour.height),
      perimeter: mainContour.perimeter,
      area: mainContour.area
    };
  }

  // Contour 찾기 (간단한 구현)
  findContours(data, width, height) {
    const contours = [];
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        if (data[idx] > 0 && !visited[idx]) {
          const contour = this.traceContour(data, width, height, x, y, visited);
          if (contour.area > 100) { // 최소 면적 필터
            contours.push(contour);
          }
        }
      }
    }
    
    return contours;
  }

  // Contour 추적
  traceContour(data, width, height, startX, startY, visited) {
    const points = [];
    const queue = [[startX, startY]];
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const idx = y * width + x;
      
      if (visited[idx]) continue;
      visited[idx] = true;
      
      points.push([x, y]);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // 8-방향 이웃 확인
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (data[nidx] > 0 && !visited[nidx]) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
    
    const contourWidth = maxX - minX + 1;
    const contourHeight = maxY - minY + 1;
    const area = points.length;
    const perimeter = this.calculatePerimeter(points);
    
    return {
      points,
      width: contourWidth,
      height: contourHeight,
      area,
      perimeter,
      convexArea: area * 1.2 // 근사값
    };
  }

  // 둘레 계산
  calculatePerimeter(points) {
    if (points.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      const dx = points[next][0] - points[i][0];
      const dy = points[next][1] - points[i][1];
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    return perimeter;
  }

  // 딥러닝 특징 추출
  async extractDeepFeatures(imageBuffer) {
    if (!this.featureExtractor) {
      return {
        resnetEmbedding: [],
        vggEmbedding: [],
        efficientnetEmbedding: []
      };
    }

    // 이미지를 텐서로 변환
    const imageTensor = await this.imageToTensor(imageBuffer);
    
    // MobileNet 특징 추출
    const features = this.featureExtractor.predict(imageTensor);
    const featureArray = await features.array();
    
    // 메모리 정리
    imageTensor.dispose();
    features.dispose();
    
    return {
      resnetEmbedding: featureArray[0],
      vggEmbedding: [], // 추후 구현
      efficientnetEmbedding: [] // 추후 구현
    };
  }

  // 이미지를 텐서로 변환
  async imageToTensor(imageBuffer) {
    const { data, info } = await sharp(imageBuffer)
      .resize(224, 224)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    
    // RGB 값을 -1~1로 정규화
    const values = new Float32Array(width * height * 3);
    for (let i = 0; i < data.length; i += channels) {
      const idx = (i / channels) * 3;
      values[idx] = (data[i] / 255.0) * 2 - 1;     // R
      values[idx + 1] = (data[i + 1] / 255.0) * 2 - 1; // G
      values[idx + 2] = (data[i + 2] / 255.0) * 2 - 1; // B
    }
    
    return tf.tensor4d(values, [1, height, width, 3]);
  }

  // 제품 진위 예측
  async predictAuthenticity(imageBuffer, additionalFeatures = {}) {
    if (!this.isModelLoaded) {
      await this.initializeModel();
    }

    try {
      // 이미지 특징 추출
      const imageFeatures = await this.extractImageFeatures(imageBuffer);
      
      // 특징 벡터 생성
      const featureVector = this.createFeatureVector(imageFeatures, additionalFeatures);
      
      // 텐서로 변환
      const inputTensor = tf.tensor2d([featureVector]);
      
      // 예측
      const prediction = this.model.predict(inputTensor);
      const probability = await prediction.array();
      
      // 메모리 정리
      inputTensor.dispose();
      prediction.dispose();
      
      // 신뢰도 점수와 함께 결과 반환
      const authenticityScore = probability[0][0];
      
      return {
        isAuthentic: authenticityScore > 0.5,
        authenticityScore: authenticityScore,
        confidence: Math.abs(authenticityScore - 0.5) * 2, // 0~1 신뢰도
        details: {
          imageQuality: this.assessImageQuality(imageFeatures),
          suspiciousFeatures: this.detectSuspiciousFeatures(imageFeatures),
          recommendation: this.getRecommendation(authenticityScore)
        }
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  // 특징 벡터 생성
  createFeatureVector(imageFeatures, additionalFeatures) {
    const vector = [];
    
    // 이미지 특징 추가
    if (imageFeatures.colorHistogram) {
      vector.push(...imageFeatures.colorHistogram.red);
      vector.push(...imageFeatures.colorHistogram.green);
      vector.push(...imageFeatures.colorHistogram.blue);
    }
    
    if (imageFeatures.textureFeatures) {
      vector.push(
        imageFeatures.textureFeatures.contrast || 0,
        imageFeatures.textureFeatures.dissimilarity || 0,
        imageFeatures.textureFeatures.homogeneity || 0,
        imageFeatures.textureFeatures.energy || 0,
        imageFeatures.textureFeatures.correlation || 0,
        imageFeatures.textureFeatures.entropy || 0
      );
    }
    
    if (imageFeatures.edgeFeatures) {
      vector.push(
        imageFeatures.edgeFeatures.cannyEdgeCount || 0,
        imageFeatures.edgeFeatures.sobelMagnitude || 0,
        imageFeatures.edgeFeatures.laplacianVariance || 0
      );
    }
    
    if (imageFeatures.shapeFeatures) {
      vector.push(
        imageFeatures.shapeFeatures.aspectRatio || 0,
        imageFeatures.shapeFeatures.circularity || 0,
        imageFeatures.shapeFeatures.solidity || 0,
        imageFeatures.shapeFeatures.extent || 0,
        imageFeatures.shapeFeatures.perimeter || 0,
        imageFeatures.shapeFeatures.area || 0
      );
    }
    
    // 딥러닝 특징
    if (imageFeatures.deepFeatures && imageFeatures.deepFeatures.resnetEmbedding) {
      vector.push(...imageFeatures.deepFeatures.resnetEmbedding);
    }
    
    // 패딩 (고정 차원 유지)
    while (vector.length < 8192) {
      vector.push(0);
    }
    
    return vector.slice(0, 8192);
  }

  // 이미지 품질 평가
  assessImageQuality(features) {
    let qualityScore = 0;
    let factors = 0;
    
    // 엣지 선명도
    if (features.edgeFeatures) {
      const sharpness = features.edgeFeatures.laplacianVariance;
      qualityScore += Math.min(sharpness / 1000, 1);
      factors++;
    }
    
    // 엔트로피 (정보량)
    if (features.textureFeatures) {
      const entropy = features.textureFeatures.entropy;
      qualityScore += Math.min(entropy / 7, 1); // 엔트로피는 보통 0~7
      factors++;
    }
    
    return factors > 0 ? qualityScore / factors : 0;
  }

  // 의심스러운 특징 감지
  detectSuspiciousFeatures(features) {
    const suspicious = [];
    
    // 낮은 엔트로피 (단조로운 이미지)
    if (features.textureFeatures && features.textureFeatures.entropy < 2) {
      suspicious.push('Low image complexity detected');
    }
    
    // 비정상적인 색상 분포
    if (features.colorHistogram) {
      const redSum = features.colorHistogram.red.reduce((a, b) => a + b, 0);
      const greenSum = features.colorHistogram.green.reduce((a, b) => a + b, 0);
      const blueSum = features.colorHistogram.blue.reduce((a, b) => a + b, 0);
      
      const colorBalance = Math.abs(redSum - greenSum) + Math.abs(greenSum - blueSum);
      if (colorBalance > 0.5) {
        suspicious.push('Unusual color distribution');
      }
    }
    
    // 낮은 해상도 또는 압축 아티팩트
    if (features.edgeFeatures && features.edgeFeatures.cannyEdgeCount < 100) {
      suspicious.push('Low detail or heavy compression detected');
    }
    
    return suspicious;
  }

  // 추천 사항 생성
  getRecommendation(score) {
    if (score > 0.9) {
      return 'High confidence in authenticity. Product appears genuine.';
    } else if (score > 0.7) {
      return 'Likely authentic, but additional verification recommended.';
    } else if (score > 0.5) {
      return 'Uncertain. Please seek expert verification.';
    } else if (score > 0.3) {
      return 'Likely counterfeit. Exercise caution.';
    } else {
      return 'High probability of counterfeit. Do not purchase.';
    }
  }

  // 모델 학습
  async trainModel(batchSize = 32, epochs = 50) {
    try {
      // 학습 데이터 로드
      const trainingData = await AITrainingData.find({
        'labelInfo.verificationMethod': { $in: ['expert', 'manufacturer'] }
      }).limit(10000);

      if (trainingData.length < 100) {
        throw new Error('Insufficient training data');
      }

      // 데이터를 텐서로 변환
      const { xTrain, yTrain, xVal, yVal } = await this.prepareTrainingData(trainingData);

      // 모델 학습
      const history = await this.model.fit(xTrain, yTrain, {
        batchSize,
        epochs,
        validationData: [xVal, yVal],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${epochs}`);
            console.log(`Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
            console.log(`Val Loss: ${logs.val_loss.toFixed(4)}, Val Accuracy: ${logs.val_acc.toFixed(4)}`);
          }
        }
      });

      // 모델 저장
      await this.model.save('file://./models/authentication_model');

      // 메모리 정리
      xTrain.dispose();
      yTrain.dispose();
      xVal.dispose();
      yVal.dispose();

      return {
        success: true,
        finalAccuracy: history.history.acc[history.history.acc.length - 1],
        finalValAccuracy: history.history.val_acc[history.history.val_acc.length - 1]
      };
    } catch (error) {
      console.error('Training error:', error);
      throw error;
    }
  }

  // 학습 데이터 준비
  async prepareTrainingData(data) {
    const features = [];
    const labels = [];

    for (const item of data) {
      const featureVector = item.extractFeatureVector();
      features.push(featureVector);
      labels.push(item.labelInfo.isAuthentic ? 1 : 0);
    }

    // 80/20 train/validation split
    const splitIndex = Math.floor(features.length * 0.8);
    
    const xTrain = tf.tensor2d(features.slice(0, splitIndex));
    const yTrain = tf.tensor2d(labels.slice(0, splitIndex), [splitIndex, 1]);
    
    const xVal = tf.tensor2d(features.slice(splitIndex));
    const yVal = tf.tensor2d(labels.slice(splitIndex), [features.length - splitIndex, 1]);

    return { xTrain, yTrain, xVal, yVal };
  }

  // 유사 제품 찾기
  async findSimilarProducts(imageBuffer, topK = 5) {
    try {
      // 이미지 특징 추출
      const queryFeatures = await this.extractImageFeatures(imageBuffer);
      const queryVector = this.createFeatureVector(queryFeatures, {});

      // 데이터베이스에서 모든 제품 특징 로드
      const allProducts = await AITrainingData.find({})
        .populate('productId')
        .limit(1000);

      // 유사도 계산
      const similarities = [];
      for (const product of allProducts) {
        const productVector = product.extractFeatureVector();
        const similarity = AITrainingData.calculateSimilarity(queryVector, productVector);
        
        similarities.push({
          product: product.productId,
          similarity,
          authenticityScore: product.labelInfo.authenticityScore
        });
      }

      // 유사도 기준 정렬
      similarities.sort((a, b) => b.similarity - a.similarity);

      return similarities.slice(0, topK);
    } catch (error) {
      console.error('Similar products search error:', error);
      throw error;
    }
  }

  // 학습 데이터 추가
  async addTrainingData(imageBuffer, productId, isAuthentic, additionalInfo = {}) {
    try {
      // 특징 추출
      const imageFeatures = await this.extractImageFeatures(imageBuffer);

      // 학습 데이터 생성
      const trainingData = new AITrainingData({
        productId,
        imageFeatures,
        textFeatures: additionalInfo.textFeatures || {},
        codeFeatures: additionalInfo.codeFeatures || {},
        securityFeatures: additionalInfo.securityFeatures || {},
        materialFeatures: additionalInfo.materialFeatures || {},
        brandSpecificFeatures: additionalInfo.brandSpecificFeatures || {},
        labelInfo: {
          isAuthentic,
          authenticityScore: isAuthentic ? 1.0 : 0.0,
          verificationMethod: additionalInfo.verificationMethod || 'user_report'
        },
        scanConditions: additionalInfo.scanConditions || {},
        metadata: {
          dataSource: additionalInfo.dataSource || 'user_upload',
          tags: additionalInfo.tags || []
        }
      });

      await trainingData.save();

      // 일정 데이터가 쌓이면 자동으로 재학습
      const dataCount = await AITrainingData.countDocuments();
      if (dataCount % 100 === 0) {
        // 백그라운드에서 재학습 시작
        this.trainModel().catch(console.error);
      }

      return { success: true, dataId: trainingData._id };
    } catch (error) {
      console.error('Add training data error:', error);
      throw error;
    }
  }
}

module.exports = new AIMLService();