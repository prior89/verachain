import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface Certificate {
  id: string;
  productName: string;
  brand: string;
  verifiedDate: string;
  serialNumber: string;
  status: 'active' | 'expired' | 'pending';
  image?: string;
}

export default function CertificatesScreenV2() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');

  const certificates: Certificate[] = [
    {
      id: '1',
      productName: 'Air Max 270',
      brand: 'Nike',
      verifiedDate: '2024-01-15',
      serialNumber: 'NK-AM270-2024-001',
      status: 'active',
    },
    {
      id: '2',
      productName: 'Classic Leather',
      brand: 'Reebok',
      verifiedDate: '2024-01-10',
      serialNumber: 'RB-CL-2024-002',
      status: 'active',
    },
    {
      id: '3',
      productName: 'Ultra Boost 22',
      brand: 'Adidas',
      verifiedDate: '2023-12-20',
      serialNumber: 'AD-UB22-2023-003',
      status: 'expired',
    },
  ];

  const filters = [
    { id: 'all', label: '전체', count: certificates.length },
    { id: 'active', label: '활성', count: 2 },
    { id: 'expired', label: '만료', count: 1 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'expired':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '인증됨';
      case 'expired':
        return '만료됨';
      case 'pending':
        return '대기중';
      default:
        return status;
    }
  };

  const renderCertificate = ({ item }: { item: Certificate }) => (
    <TouchableOpacity style={styles.certificateCard} activeOpacity={0.9}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandInitial}>{item.brand[0]}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.brandName}>{item.brand}</Text>
            <Text style={styles.productName}>{item.productName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="barcode-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailLabel}>시리얼 번호</Text>
            <Text style={styles.detailValue}>{item.serialNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailLabel}>인증 날짜</Text>
            <Text style={styles.detailValue}>{item.verifiedDate}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>QR 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>공유</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>다운로드</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 인증서</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{certificates.length}</Text>
            <Text style={styles.statLabel}>전체 인증서</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>활성 인증서</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>신뢰도</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Certificates List */}
      <FlatList
        data={certificates}
        renderItem={renderCertificate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.textInverse,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.textInverse,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.buttonSmall,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  certificateCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandInitial: {
    ...typography.h4,
    color: colors.textInverse,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  brandName: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 2,
  },
  productName: {
    ...typography.h5,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    ...typography.buttonSmall,
    color: colors.primary,
    marginLeft: 6,
  },
});