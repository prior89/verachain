import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons as Icon } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Certificates: undefined;
  Scan: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person-circle" size={32} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.brandSection}>
          <Icon name="shield-checkmark" size={64} color="#667eea" />
          <Text style={styles.appName}>VeraChain</Text>
          <Text style={styles.subtitle}>블록체인 인증서 검증</Text>
        </View>

        <View style={styles.mainActions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <Icon name="qr-code" size={24} color="#ffffff" />
            <Text style={styles.primaryButtonText}>QR 스캔</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Certificates')}
          >
            <Icon name="document-text" size={24} color="#667eea" />
            <Text style={styles.secondaryButtonText}>인증서 목록</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.authButtonOutline}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.authButtonOutlineText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  brandSection: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 8,
  },
  mainActions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  authSection: {
    gap: 12,
  },
  authButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonOutline: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  authButtonOutlineText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;