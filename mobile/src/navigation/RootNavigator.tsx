
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreenV2';
import ScanScreen from '../screens/ScanScreenV2';
import CertificatesScreen from '../screens/CertificatesScreenV2';
import CertificateDetailScreen from '../screens/CertificateDetailScreen';
import ProfileScreen from '../screens/ProfileScreenV2';
import LoginScreen from '../screens/LoginScreenV2';
import RegisterScreen from '../screens/RegisterScreen';
import BackHeader from '../components/BackHeader';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function TabsRoot() {
  return (
    <Tabs.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tabs.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require('@expo/vector-icons');
            return <Ionicons name="home" size={size} color={color} />;
          }
        }} 
      />
      <Tabs.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{ 
          tabBarLabel: '스캔',
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require('@expo/vector-icons');
            return <Ionicons name="scan" size={size} color={color} />;
          }
        }} 
      />
      <Tabs.Screen 
        name="Certificates" 
        component={CertificatesScreen} 
        options={{ 
          tabBarLabel: '인증서',
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require('@expo/vector-icons');
            return <Ionicons name="shield-checkmark" size={size} color={color} />;
          }
        }} 
      />
      <Tabs.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: '프로필',
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require('@expo/vector-icons');
            return <Ionicons name="person" size={size} color={color} />;
          }
        }} 
      />
    </Tabs.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <BackHeader {...props} />
      }}
    >
      <Stack.Screen name="Tabs" component={TabsRoot} options={{ headerShown: false }} />
      <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} options={{ title: 'Certificate' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    // Loading state - you can add a splash screen here
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabsRoot} />
          <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
