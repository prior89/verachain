import React, { createContext, useState, useContext, useEffect } from 'react';
import { nftService } from '../services/nftService';
import { useAuth } from './AuthContext';

const CertificateContext = createContext(null);

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within CertificateProvider');
  }
  return context;
};

export const CertificateProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserCertificates();
    } else {
      setCertificates([]);
    }
  }, [isAuthenticated, user]);

  const fetchUserCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await nftService.getUserCertificates(user.id);
      setCertificates(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch certificates');
      console.error('Fetch certificates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateById = async (certificateId) => {
    try {
      setLoading(true);
      const response = await nftService.getCertificate(certificateId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const mintCertificate = async (verificationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const mintData = {
        productId: verificationData.productData.id,
        brand: verificationData.productData.brand,
        model: verificationData.productData.model,
        serial: verificationData.productData.serial,
        certNumber: verificationData.certificateData.certNumber,
        verificationData: {
          productScan: {
            timestamp: new Date().toISOString(),
            confidence: verificationData.productData.confidence
          },
          certificateScan: {
            timestamp: new Date().toISOString(),
            ocrConfidence: verificationData.certificateData.confidence
          }
        }
      };

      const response = await nftService.mintCertificate(mintData);
      const newCertificate = response.data;
      
      setCertificates(prev => [newCertificate, ...prev]);
      
      return newCertificate;
    } catch (err) {
      setError(err.message || 'Failed to mint certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transferCertificate = async (certificateId, toAddress) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await nftService.transferCertificate(certificateId, toAddress);
      
      // Update local state
      setCertificates(prev => 
        prev.filter(cert => cert.id !== certificateId)
      );
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to transfer certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const burnCertificate = async (certificateId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await nftService.burnCertificate(certificateId);
      
      // Update local state
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, status: 'burned' } 
            : cert
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to burn certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificateOwnership = async (certificateId, address) => {
    try {
      const response = await nftService.verifyOwnership(certificateId, address);
      return response.data.isOwner;
    } catch (err) {
      console.error('Ownership verification error:', err);
      return false;
    }
  };

  const value = {
    certificates,
    loading,
    error,
    selectedCertificate,
    setSelectedCertificate,
    fetchUserCertificates,
    getCertificateById,
    mintCertificate,
    transferCertificate,
    burnCertificate,
    verifyCertificateOwnership
  };

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};


