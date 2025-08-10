
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import CertificatesScreen from '../screens/CertificatesScreen';
import CertificateDetailScreen from '../screens/CertificateDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BackHeader from '../components/BackHeader';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function TabsRoot() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: 'Scan' }} />
      <Tabs.Screen name="Certificates" component={CertificatesScreen} options={{ tabBarLabel: 'Certificates' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
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
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    // Loading state - you can add a splash screen here
    return null;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}
