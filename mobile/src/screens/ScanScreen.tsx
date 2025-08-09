import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

interface ScanResult {
  productBrand: string;
  productModel: string;
  confidence: number;
  certificateId: string;
}

const ScanScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'product' | 'certificate' | 'complete'>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const devices = useCameraDevices();
  const device = devices.back;
  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null);
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkCameraPermission();
  }, []);

  useEffect(() => {
    if (isScanning) {
      startScanAnimation();
    } else {
      stopScanAnimation();
    }
  }, [isScanning]);

  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.getCameraPermissionStatus();
      if (permission === 'not-determined') {
        const newPermission = await Camera.requestCameraPermission();
        setHasPermission(newPermission === 'authorized');
      } else {
        setHasPermission(permission === 'authorized');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setHasPermission(false);
    }
  };

  const startScanAnimation = () => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimation.start();
  };

  const stopScanAnimation = () => {
    scanLineAnimation.stopAnimation();
    scanLineAnimation.setValue(0);
  };

  const simulateAIProcessing = (): Promise<ScanResult> => {
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 20;
        setProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          resolve({
            productBrand: 'Chanel',
            productModel: 'Classic Flap Medium',
            confidence: 92,
            certificateId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          });
        }
      }, 200);
    });
  };

  const startProductScan = async () => {
    setIsScanning(true);
    setScanStep('product');
    setIsProcessing(false);
    
    // 3초 후 자동으로 AI 처리 시작
    setTimeout(async () => {
      setIsProcessing(true);
      setProgress(0);
      
      try {
        const result = await simulateAIProcessing();
        setScanResult(result);
        setScanStep('certificate');
        setIsProcessing(false);
        
        // 3초 후 인증서 스캔으로 자동 전환
        setTimeout(() => {
          completeScan();
        }, 3000);
        
      } catch (error) {
        Alert.alert('스캔 실패', '제품 인식에 실패했습니다. 다시 시도해주세요.');
        resetScan();
      }
    }, 3000);
  };

  const completeScan = () => {
    setIsScanning(false);
    setScanStep('complete');
    
    Alert.alert(
      '인증 완료!',
      `${scanResult?.productBrand} ${scanResult?.productModel}\n인증 신뢰도: ${scanResult?.confidence}%\n인증서 ID: ${scanResult?.certificateId}`,
      [
        {text: '확인', onPress: resetScan},
        {text: '인증서 보기', onPress: () => console.log('View certificate')},
      ]
    );
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanStep('idle');
    setScanResult(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const getStatusMessage = () => {
    switch (scanStep) {
      case 'idle':
        return '제품을 카메라에 맞추고 스캔 버튼을 눌러주세요';
      case 'product':
        return isProcessing ? 'AI가 제품을 분석중입니다...' : '제품을 스캔중입니다...';
      case 'certificate':
        return '제품 인증 완료! 인증서를 생성중입니다...';
      case 'complete':
        return '인증이 완료되었습니다!';
      default:
        return '';
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>카메라 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.button} onPress={checkCameraPermission}>
          <Text style={styles.buttonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>카메라를 사용할 수 없습니다</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 카메라 뷰 */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isFocused && hasPermission}
          photo={true}
        />
        
        {/* 스캔 오버레이 */}
        <View style={styles.overlay}>
          {/* 코너 마커들 */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {/* 스캔 라인 */}
          {isScanning && !isProcessing && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-150, 150],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </View>

        {/* 진행도 표시 */}
        {isProcessing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {width: `${progress}%`}
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>

      {/* 상태 표시 */}
      <View style={styles.statusContainer}>
        <View style={styles.statusContent}>
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          
          {scanResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>인식된 제품:</Text>
              <Text style={styles.resultText}>
                {scanResult.productBrand} {scanResult.productModel}
              </Text>
              <Text style={styles.confidenceText}>
                신뢰도: {scanResult.confidence}%
              </Text>
            </View>
          )}
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.buttonContainer}>
          {scanStep === 'idle' && (
            <TouchableOpacity 
              style={[styles.button, styles.scanButton]} 
              onPress={startProductScan}
            >
              <Text style={styles.scanButtonText}>스캔 시작</Text>
            </TouchableOpacity>
          )}
          
          {(scanStep === 'product' || scanStep === 'certificate') && !isProcessing && (
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={resetScan}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          )}
          
          {scanStep === 'complete' && (
            <TouchableOpacity 
              style={[styles.button, styles.newScanButton]} 
              onPress={resetScan}
            >
              <Text style={styles.newScanButtonText}>새로 스캔</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#8B5CF6',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    width: 280,
    height: 3,
    backgroundColor: '#8B5CF6',
    opacity: 0.8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 200,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  statusContent: {
    flex: 1,
    alignItems: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: '100%',
  },
  resultTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingTop: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  scanButton: {
    backgroundColor: '#8B5CF6',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newScanButton: {
    backgroundColor: '#10B981',
  },
  newScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ScanScreen;