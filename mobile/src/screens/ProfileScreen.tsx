import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import {useAuth} from '../context/AuthContext';

interface ProfileStats {
  totalAuthentications: number;
  nftsOwned: number;
  memberSince: string;
  tier: string;
}

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // 샘플 통계 데이터
  const profileStats: ProfileStats = {
    totalAuthentications: 12,
    nftsOwned: 8,
    memberSince: '2024년 1월',
    tier: 'Standard',
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {text: '로그아웃', style: 'destructive', onPress: logout},
      ]
    );
  };

  const handleSetting = (settingName: string) => {
    Alert.alert('설정', `${settingName} 설정이 곧 제공될 예정입니다.`);
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
    destructive?: boolean;
  }> = ({title, subtitle, hasSwitch, switchValue, onSwitchChange, onPress, destructive}) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={hasSwitch}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{false: '#D1D5DB', true: '#C7D2FE'}}
          thumbColor={switchValue ? '#8B5CF6' : '#FFFFFF'}
        />
      )}
      {!hasSwitch && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>프로필</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || '사용자'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{profileStats.tier}</Text>
            </View>
          </View>
        </View>

        {/* 통계 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>활동 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileStats.totalAuthentications}</Text>
              <Text style={styles.statLabel}>총 인증</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileStats.nftsOwned}</Text>
              <Text style={styles.statLabel}>보유 NFT</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileStats.memberSince}</Text>
              <Text style={styles.statLabel}>가입일</Text>
            </View>
          </View>
        </View>

        {/* 계정 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 설정</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="개인정보 수정"
              subtitle="이름, 이메일 등 개인정보를 수정합니다"
              onPress={() => handleSetting('개인정보 수정')}
            />
            <SettingItem
              title="비밀번호 변경"
              subtitle="계정 보안을 위해 주기적으로 변경하세요"
              onPress={() => handleSetting('비밀번호 변경')}
            />
            <SettingItem
              title="생체인증"
              subtitle="지문 또는 얼굴인식으로 로그인"
              hasSwitch
              switchValue={biometricEnabled}
              onSwitchChange={setBiometricEnabled}
            />
          </View>
        </View>

        {/* 앱 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="푸시 알림"
              subtitle="인증 완료, 업데이트 등 알림 받기"
              hasSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            <SettingItem
              title="다크 모드"
              subtitle="어두운 테마로 앱을 사용합니다"
              hasSwitch
              switchValue={darkModeEnabled}
              onSwitchChange={setDarkModeEnabled}
            />
            <SettingItem
              title="언어 설정"
              subtitle="한국어"
              onPress={() => handleSetting('언어 설정')}
            />
          </View>
        </View>

        {/* 지원 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="도움말"
              subtitle="자주 묻는 질문과 사용법"
              onPress={() => handleSetting('도움말')}
            />
            <SettingItem
              title="고객지원"
              subtitle="문제신고 및 문의사항"
              onPress={() => handleSetting('고객지원')}
            />
            <SettingItem
              title="서비스 약관"
              onPress={() => handleSetting('서비스 약관')}
            />
            <SettingItem
              title="개인정보 처리방침"
              onPress={() => handleSetting('개인정보 처리방침')}
            />
          </View>
        </View>

        {/* 앱 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="버전"
              subtitle="1.0.0"
              onPress={() => handleSetting('앱 정보')}
            />
            <SettingItem
              title="오픈소스 라이선스"
              onPress={() => handleSetting('라이선스')}
            />
          </View>
        </View>

        {/* 로그아웃 */}
        <View style={styles.section}>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="로그아웃"
              destructive
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  statsSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  destructiveText: {
    color: '#EF4444',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  bottomPadding: {
    height: 32,
  },
});

export default ProfileScreen;