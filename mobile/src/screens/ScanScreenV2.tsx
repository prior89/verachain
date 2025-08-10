import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreenV2() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanResult({
      type: 'success',
      productName: 'Nike Air Max 270',
      serialNumber: data,
      verificationDate: new Date().toLocaleDateString('ko-KR'),
      authenticity: true,
    });
    setShowResult(true);
  };

  const resetScan = () => {
    setScanned(false);
    setShowResult(false);
    setScanResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한을 요청중입니다...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>권한 설정하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
        }}
        enableTorch={flashOn}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>제품 스캔</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanHint}>QR 코드 또는 바코드를 스캔하세요</Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="images-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>갤러리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="keypad-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>직접 입력</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={resetScan}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={scanResult?.authenticity 
                ? [colors.success, colors.secondaryDark]
                : [colors.error, '#DC2626']
              }
              style={styles.modalHeader}
            >
              <Ionicons
                name={scanResult?.authenticity ? 'checkmark-circle' : 'close-circle'}
                size={64}
                color="white"
              />
              <Text style={styles.modalTitle}>
                {scanResult?.authenticity ? '정품 인증 완료' : '인증 실패'}
              </Text>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>제품명</Text>
                <Text style={styles.resultValue}>{scanResult?.productName}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>시리얼 번호</Text>
                <Text style={styles.resultValue}>{scanResult?.serialNumber}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>검증 일시</Text>
                <Text style={styles.resultValue}>{scanResult?.verificationDate}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={resetScan}
              >
                <Text style={styles.secondaryButtonText}>다시 스캔</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => {
                  resetScan();
                  navigation.navigate('Certificates' as never);
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>인증서 보기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    ...typography.body1,
    color: colors.textInverse,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.textInverse,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
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
  scanHint: {
    ...typography.body2,
    color: colors.textInverse,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.textInverse,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.textInverse,
    marginTop: 16,
  },
  modalBody: {
    padding: 24,
  },
  resultItem: {
    marginBottom: 20,
  },
  resultLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 4,
  },
  resultValue: {
    ...typography.body1,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
  },
  primaryButton: {
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
});