import React, { createContext, useState, useContext } from 'react';

const ScanContext = createContext(null);

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within ScanProvider');
  }
  return context;
};

export const ScanProvider = ({ children }) => {
  const [scanState, setScanState] = useState({
    isScanning: false,
    scanType: null, // 'product' | 'certificate'
    productData: null,
    certificateData: null,
    verificationResult: null,
    error: null
  });

  const [scanHistory, setScanHistory] = useState([]);

  const startProductScan = () => {
    setScanState(prev => ({
      ...prev,
      isScanning: true,
      scanType: 'product',
      error: null
    }));
  };

  const startCertificateScan = () => {
    setScanState(prev => ({
      ...prev,
      isScanning: true,
      scanType: 'certificate',
      error: null
    }));
  };

  const completeProductScan = (productData) => {
    setScanState(prev => ({
      ...prev,
      isScanning: false,
      productData,
      scanType: null
    }));
  };

  const completeCertificateScan = (certificateData) => {
    setScanState(prev => ({
      ...prev,
      isScanning: false,
      certificateData,
      scanType: null
    }));
  };

  const completeVerification = (result) => {
    const verification = {
      ...result,
      productData: scanState.productData,
      certificateData: scanState.certificateData,
      timestamp: new Date().toISOString()
    };

    setScanState(prev => ({
      ...prev,
      verificationResult: verification
    }));

    setScanHistory(prev => [verification, ...prev]);

    return verification;
  };

  const resetScan = () => {
    setScanState({
      isScanning: false,
      scanType: null,
      productData: null,
      certificateData: null,
      verificationResult: null,
      error: null
    });
  };

  const setScanError = (error) => {
    setScanState(prev => ({
      ...prev,
      isScanning: false,
      error,
      scanType: null
    }));
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  const value = {
    scanState,
    scanHistory,
    startProductScan,
    startCertificateScan,
    completeProductScan,
    completeCertificateScan,
    completeVerification,
    resetScan,
    setScanError,
    clearHistory
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
};