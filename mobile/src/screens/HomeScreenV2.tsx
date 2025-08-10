import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreenV2() {
  const navigation = useNavigation();

  const quickActions = [
    {
      id: 'scan',
      title: '제품 스캔',
      subtitle: 'QR/바코드 스캔',
      icon: 'scan-outline',
      color: colors.primary,
      gradient: [colors.primary, colors.primaryDark],
      onPress: () => navigation.navigate('Scan' as never),
    },
    {
      id: 'certificates',
      title: '인증서 관리',
      subtitle: '보유 인증서 확인',
      icon: 'shield-checkmark-outline',
      color: colors.secondary,
      gradient: [colors.secondary, colors.secondaryDark],
      onPress: () => navigation.navigate('Certificates' as never),
    },
    {
      id: 'history',
      title: '스캔 기록',
      subtitle: '최근 검증 내역',
      icon: 'time-outline',
      color: colors.accent,
      gradient: [colors.accent, colors.accentDark],
      onPress: () => {},
    },
    {
      id: 'profile',
      title: '내 정보',
      subtitle: '프로필 관리',
      icon: 'person-outline',
      color: colors.info,
      gradient: [colors.info, '#2563EB'],
      onPress: () => navigation.navigate('Profile' as never),
    },
  ];

  const stats = [
    { label: '검증 완료', value: '128', icon: 'checkmark-circle' },
    { label: '보유 NFT', value: '24', icon: 'cube' },
    { label: '신뢰도', value: '98%', icon: 'star' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>안녕하세요!</Text>
            <Text style={styles.headerTitle}>VeraChain</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={20} color={colors.primaryLight} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Quick Actions Grid */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.sectionTitle}>빠른 메뉴</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.actionCardGradient}
              >
                <Ionicons name={action.icon as any} size={32} color="white" />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>정품 인증 완료</Text>
              <Text style={styles.activityDescription}>
                Nike Air Max 270 - 2분 전
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </View>
        </View>
      </ScrollView>
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
  greeting: {
    ...typography.body2,
    color: colors.primaryLight,
    marginBottom: 4,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textInverse,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    ...typography.h4,
    color: colors.textInverse,
    marginTop: 8,
  },
  statLabel: {
    ...typography.caption,
    color: colors.primaryLight,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.9,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    ...typography.button,
    color: colors.textInverse,
    marginTop: 12,
  },
  actionSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  recentSection: {
    marginBottom: 24,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body1,
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
});