import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';

interface Certificate {
  id: string;
  displayId: string;
  brand: string;
  model: string;
  category: string;
  confidence: number;
  verifiedDate: string;
  status: 'verified' | 'pending' | 'failed';
}

const CertificatesScreen: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 목업 인증서 데이터
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Chanel',
          model: 'Classic Flap Medium',
          category: 'handbag',
          confidence: 95,
          verifiedDate: new Date().toISOString(),
          status: 'verified',
        },
        {
          id: '2',
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Hermès',
          model: 'Birkin 30',
          category: 'handbag',
          confidence: 98,
          verifiedDate: new Date().toISOString(),
          status: 'verified',
        },
        {
          id: '3',
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Rolex',
          model: 'Submariner',
          category: 'watch',
          confidence: 92,
          verifiedDate: new Date().toISOString(),
          status: 'verified',
        },
      ];
      
      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Failed to load certificates:', error);
      Alert.alert('오류', '인증서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCertificates();
    setRefreshing(false);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesBrand = filterBrand === 'all' || cert.brand === filterBrand;
    const matchesSearch = searchQuery === '' || 
      cert.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const brands = ['all', ...new Set(certificates.map(cert => cert.brand))];

  const handleCertificatePress = (certificate: Certificate) => {
    Alert.alert(
      '인증서 상세',
      `브랜드: ${certificate.brand}\n모델: ${certificate.model}\n인증 ID: ${certificate.displayId}\n신뢰도: ${certificate.confidence}%`,
      [
        {text: '확인'},
        {text: 'QR 코드 생성', onPress: () => generateQR(certificate)},
      ]
    );
  };

  const generateQR = (certificate: Certificate) => {
    Alert.alert('QR 코드 생성', `${certificate.displayId}의 QR 코드가 생성되었습니다.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return '인증 완료';
      case 'pending':
        return '인증 중';
      case 'failed':
        return '인증 실패';
      default:
        return '알 수 없음';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>내 인증서</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.refreshButton}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{certificates.length}</Text>
          <Text style={styles.statLabel}>전체</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {certificates.filter(c => c.status === 'verified').length}
          </Text>
          <Text style={styles.statLabel}>인증 완료</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>비공개</Text>
          <Text style={styles.statLabel}>가치</Text>
        </View>
      </View>

      {/* 검색 및 필터 */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="인증서 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 인증서 목록 */}
      <ScrollView
        style={styles.certificatesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>인증서를 불러오는 중...</Text>
          </View>
        ) : filteredCertificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>인증서가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              제품을 스캔하여 첫 번째 인증서를 생성해보세요
            </Text>
          </View>
        ) : (
          filteredCertificates.map((certificate) => (
            <TouchableOpacity
              key={certificate.id}
              style={styles.certificateCard}
              onPress={() => handleCertificatePress(certificate)}>
              
              <View style={styles.cardHeader}>
                <View style={styles.brandContainer}>
                  <Text style={styles.brandText}>{certificate.brand}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor(certificate.status)}
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(certificate.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.modelText}>{certificate.model}</Text>
                <Text style={styles.categoryText}>{certificate.category}</Text>
                <Text style={styles.idText}>ID: {certificate.displayId}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>신뢰도</Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${certificate.confidence}%`,
                          backgroundColor: certificate.confidence > 90 
                            ? '#10B981' 
                            : certificate.confidence > 80 
                            ? '#F59E0B' 
                            : '#EF4444'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceValue}>{certificate.confidence}%</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(certificate.verifiedDate).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshButton: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  controlsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  certificatesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  certificateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 16,
  },
  modelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  idText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6B7280',
    width: 60,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    width: 40,
    textAlign: 'right',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});

export default CertificatesScreen;