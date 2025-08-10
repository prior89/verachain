import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import QRScanner from '../components/QRScanner';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const handleScan = (data: string) => {
    setScanResult(data);
    setScanning(false);
  };

  const resetScan = () => {
    setScanResult(null);
    setScanning(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>QR 스캔</Text>
        <View style={{ width: 40 }} />
      </View>

      {scanning ? (
        <View style={styles.scannerContainer}>
          <QRScanner mode="product" onScanned={handleScan} />
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.scanCorner, styles.topLeft]} />
              <View style={[styles.scanCorner, styles.topRight]} />
              <View style={[styles.scanCorner, styles.bottomLeft]} />
              <View style={[styles.scanCorner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanInstruction}>QR 코드를 프레임 안에 맞춰주세요</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Icon name="checkmark-circle" size={80} color="#28a745" />
          <Text style={styles.resultTitle}>스캔 완료!</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>스캔 결과:</Text>
            <Text style={styles.resultData}>{scanResult}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={resetScan}>
            <Icon name="refresh" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>다시 스캔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => navigation.navigate('Certificates')}
          >
            <Text style={styles.secondaryButtonText}>인증서 보기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#667eea',
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
  scanInstruction: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 30,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 24,
  },
  resultBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  resultData: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});