
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ScanFlowProvider } from './src/state/ScanFlowContext';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#6B4FE3', background: '#FFFFFF' }
};

export default function App() {
  return (
    <ScanFlowProvider>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </ScanFlowProvider>
  );
}
