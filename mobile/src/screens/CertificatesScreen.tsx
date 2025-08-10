import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';

type Cert = { 
  id: string; 
  productName: string; 
  owner: string; 
  status: 'active' | 'burned'; 
  date?: string;
};

const MOCK: Cert[] = [
  { id: 'VC-001', productName: 'Bag A', owner: '0xBuyer', status: 'active', date: '2024-01-15' },
  { id: 'VC-002', productName: 'Watch B', owner: '0xSeller', status: 'burned', date: '2024-01-10' },
  { id: 'VC-003', productName: 'Shoes C', owner: '0xUser1', status: 'active', date: '2024-01-08' },
  { id: 'VC-004', productName: 'Wallet D', owner: '0xUser2', status: 'active', date: '2024-01-05' },
];

export default function CertificatesScreen() {
  const nav = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'burned'>('all');

  const filteredData = useMemo(() => 
    MOCK.filter(cert =>
      (selectedStatus === 'all' || cert.status === selectedStatus) &&
      (searchQuery === '' || 
       cert.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
       cert.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [searchQuery, selectedStatus]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>인증서 목록</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="ID 또는 제품명 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#adb5bd"
          />
        </View>

        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'all' && styles.filterActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'active' && styles.filterActive]}
            onPress={() => setSelectedStatus('active')}
          >
            <Text style={[styles.filterText, selectedStatus === 'active' && styles.filterTextActive]}>
              활성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'burned' && styles.filterActive]}
            onPress={() => setSelectedStatus('burned')}
          >
            <Text style={[styles.filterText, selectedStatus === 'burned' && styles.filterTextActive]}>
              소각
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={64} color="#dee2e6" />
          <Text style={styles.emptyTitle}>인증서가 없습니다</Text>
          <Text style={styles.emptySubtitle}>다른 검색어나 필터를 시도해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.certCard}
              onPress={() => nav.navigate('CertificateDetail', { id: item.id })}
            >
              <View style={styles.certHeader}>
                <Text style={styles.certId}>{item.id}</Text>
                <View style={[styles.statusBadge, item.status === 'burned' && styles.statusBurned]}>
                  <Text style={[styles.statusText, item.status === 'burned' && styles.statusTextBurned]}>
                    {item.status === 'active' ? '활성' : '소각'}
                  </Text>
                </View>
              </View>
              <Text style={styles.certProduct}>{item.productName}</Text>
              <Text style={styles.certOwner}>{item.owner}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  filterActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
  },
  certCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#d4edda',
  },
  statusBurned: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  statusTextBurned: {
    color: '#721c24',
  },
  certProduct: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 4,
  },
  certOwner: {
    fontSize: 13,
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
});