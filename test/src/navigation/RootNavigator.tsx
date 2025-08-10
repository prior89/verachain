
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import CertificatesScreen from '../screens/CertificatesScreen';
import CertificateDetailScreen from '../screens/CertificateDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BackHeader from '../components/BackHeader';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsRoot() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: 'Scan' }} />
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="Certificates" component={CertificatesScreen} options={{ tabBarLabel: 'Certificates' }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <BackHeader {...props} />
      }}
    >
      <Stack.Screen name="Tabs" component={TabsRoot} options={{ headerShown: false }} />
      <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} options={{ title: 'Certificate' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Info' }} />
    </Stack.Navigator>
  );
}
