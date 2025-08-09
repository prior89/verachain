import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import {useAuth} from '../context/AuthContext';

interface Advertisement {
  id: string;
  brand: string;
  title: string;
  description: string;
}

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const {user} = useAuth();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // 샘플 광고 데이터
  const advertisements: Advertisement[] = [
    {
      id: '1',
      brand: 'Chanel',
      title: '샤넬 클래식 플랩백',
      description: '진품 인증으로 안전하게 거래하세요',
    },
    {
      id: '2',
      brand: 'Hermès',
      title: '에르메스 버킨백',
      description: '블록체인 기술로 진품을 보장합니다',
    },
    {
      id: '3',
      brand: 'Rolex',
      title: '롤렉스 서브마리너',
      description: '정확한 진품 인증 시스템',
    },
  ];

  // 자동 광고 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex(current => 
        current >= advertisements.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [advertisements.length]);

  const handleScanPress = () => {
    Alert.alert('스캔 시작', '제품 인증을 시작하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '시작', onPress: () => console.log('Navigate to scan')},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            안녕하세요, {user?.name || '사용자'}님
          </Text>
          <Text style={styles.subtitle}>
            VeraChain으로 진품을 인증하세요
          </Text>
        </View>

        {/* 광고 배너 */}
        <View style={styles.adContainer}>
          <View style={styles.adCard}>
            <View style={styles.adHeader}>
              <Text style={styles.adBrand}>
                {advertisements[currentAdIndex].brand}
              </Text>
              <View style={styles.adIndicators}>
                {advertisements.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentAdIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.adTitle}>
              {advertisements[currentAdIndex].title}
            </Text>
            <Text style={styles.adDescription}>
              {advertisements[currentAdIndex].description}
            </Text>
          </View>
        </View>

        {/* 스캔 버튼 */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Text style={styles.scanButtonText}>제품 스캔하기</Text>
          <Text style={styles.scanButtonSubtext}>
            카메라로 제품을 촬영하여 진품 인증을 시작하세요
          </Text>
        </TouchableOpacity>

        {/* 기능 카드들 */}
        <View style={styles.featuresContainer}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>주요 기능</Text>
          </View>

          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureTitle}>인증서 관리</Text>
              <Text style={styles.featureDescription}>
                내가 보유한 인증서를 확인하고 관리하세요
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureTitle}>QR 코드 생성</Text>
              <Text style={styles.featureDescription}>
                인증된 제품의 QR 코드를 생성하여 공유하세요
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureTitle}>블록체인 확인</Text>
              <Text style={styles.featureDescription}>
                Polygon 네트워크에서 거래 내역을 확인하세요
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureTitle}>프라이버시 보호</Text>
              <Text style={styles.featureDescription}>
                개인정보와 거래 내역이 안전하게 보호됩니다
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 통계 정보 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>VeraChain 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>인증 완료</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>등록된 브랜드</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>99.8%</Text>
              <Text style={styles.statLabel}>정확도</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  adContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  adCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    height: 160,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  adIndicators: {
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  adTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
  },
  scanButton: {
    marginHorizontal: 24,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanButtonSubtext: {
    fontSize: 14,
    color: '#D1FAE5',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresHeader: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen;