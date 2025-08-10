import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { register } from '../lib/api';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { name, email, password } = formData;
    
    if (!name || !email || !password) {
      Alert.alert('오류', '모든 필드를 입력해주세요');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);
    try {
      const response = await register({ name, email, password });
      if (response.ok && response.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        Alert.alert('성공', '계정이 생성되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          }
        ]);
      } else {
        Alert.alert('가입 실패', response.error || '계정 생성에 실패했습니다');
      }
    } catch (error) {
      Alert.alert('오류', '서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Icon name="person-add" size={64} color="#667eea" />
          <Text style={styles.title}>회원가입</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="이름"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                editable={!loading}
                placeholderTextColor="#adb5bd"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="이메일"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                placeholderTextColor="#adb5bd"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (6자 이상)"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry
                editable={!loading}
                placeholderTextColor="#adb5bd"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>가입하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                이미 계정이 있으신가요? <Text style={styles.linkTextBold}>로그인</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
  },
  linkText: {
    color: '#6c757d',
    textAlign: 'center',
    fontSize: 15,
  },
  linkTextBold: {
    color: '#667eea',
    fontWeight: '600',
  },
});