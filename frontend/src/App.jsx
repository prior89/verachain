import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import MainScreen from './components/screens/MainScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ScanScreen from './components/screens/ScanScreen';
import CertificatesScreen from './components/screens/CertificatesScreen';
import CertificateDetail from './components/screens/CertificateDetail';
import { initializePrivacy } from './utils/privacyUtils';
import './styles/theme.css';
import './styles/App.css';

function App() {
  useEffect(() => {
    // Initialize privacy protection on app load
    initializePrivacy();
    
    // Disable console in production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <MainScreen />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/scan" 
              element={
                <PrivateRoute>
                  <ScanScreen />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/certificates" 
              element={
                <PrivateRoute>
                  <CertificatesScreen />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/certificate/:id" 
              element={
                <PrivateRoute>
                  <CertificateDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfileScreen />
                </PrivateRoute>
              } 
            />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

