import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ScanView from '../components/common/ScanView';
import { mintNFT } from '../services/nftService';
import './ScanScreen.css';

const ScanScreen = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleScanComplete = useCallback(async (scanData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Store scan result
      setScanResult(scanData);
      
      // Process verification
      if (scanData.product && scanData.certificate) {
        // Create NFT certificate
        const nftResult = await mintNFT({
          productData: scanData.product,
          certificateData: scanData.certificate
        });
        
        // Navigate to result screen with NFT data
        navigate('/result', {
          state: {
            product: scanData.product,
            certificate: scanData.certificate,
            nft: nftResult
          }
        });
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      setError('Failed to process scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleError = useCallback((error) => {
    console.error('Scan error:', error);
    setError('Scanning failed. Please ensure good lighting and try again.');
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div 
      className="scan-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="scan-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-text">??/span>
        </button>
        
        <h1 className="screen-title">Authenticate</h1>
        
        <button 
          className="info-button"
          onClick={() => setShowInfo(!showInfo)}
        >
          <span className="info-text">?</span>
        </button>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            className="info-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="info-content">
              <h3>How it works</h3>
              <div className="info-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Scan Product</h4>
                    <p>Position the product barcode or QR code in the frame</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Scan Certificate</h4>
                    <p>Scan the paper certificate for OCR verification</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Get NFT</h4>
                    <p>Receive your blockchain-verified digital certificate</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scan View */}
      <div className="scan-container">
        <ScanView 
          onScanComplete={handleScanComplete}
          onError={handleError}
        />
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="loading-spinner"
              >
                <span className="loading-text">?뵏</span>
              </motion.div>
              <p>Creating your certificate...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Indicators */}
      {scanResult && (
        <motion.div 
          className="scan-progress-indicators"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={`indicator ${scanResult.product ? 'complete' : ''}`}>
            <span className="indicator-symbol">P</span>
            <span>Product</span>
          </div>
          <div className="indicator-line" />
          <div className={`indicator ${scanResult.certificate ? 'complete' : ''}`}>
            <span className="indicator-symbol">C</span>
            <span>Certificate</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScanScreen;
