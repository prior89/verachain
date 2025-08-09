import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import './ScanView.css';

const SCAN_STATES = {
  IDLE: 'IDLE',
  SCANNING_PRODUCT: 'SCANNING_PRODUCT',
  PRODUCT_VERIFIED: 'PRODUCT_VERIFIED',
  PRODUCT_FAILED: 'PRODUCT_FAILED',
  SCANNING_CERTIFICATE: 'SCANNING_CERTIFICATE',
  CERTIFICATE_VERIFIED: 'CERTIFICATE_VERIFIED',
  CERTIFICATE_FAILED: 'CERTIFICATE_FAILED',
  COMPLETE: 'COMPLETE'
};

const ScanView = ({ onScanComplete, onError }) => {
  const webcamRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [cameraError, setCameraError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanData, setScanData] = useState({
    product: null,
    certificate: null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-capture timer
  useEffect(() => {
    let captureInterval;
    
    if (scanState === SCAN_STATES.SCANNING_PRODUCT || 
        scanState === SCAN_STATES.SCANNING_CERTIFICATE) {
      captureInterval = setInterval(() => {
        capture();
      }, 1000); // Capture every second
    }
    
    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [scanState]);

  // Progress animation
  useEffect(() => {
    let progressInterval;
    
    if (isProcessing) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isProcessing]);

  const capture = useCallback(async () => {
    if (isProcessing || !webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (scanState === SCAN_STATES.SCANNING_PRODUCT) {
        // Mock product verification
        const verified = Math.random() > 0.2;
        
        if (verified) {
          setScanData(prev => ({
            ...prev,
            product: {
              brand: 'Chanel',
              model: 'Classic Flap',
              confidence: 92
            }
          }));
          setScanState(SCAN_STATES.PRODUCT_VERIFIED);
          
          // Auto-proceed to certificate scan after 3 seconds
          setTimeout(() => {
            setScanState(SCAN_STATES.SCANNING_CERTIFICATE);
          }, 3000);
        } else {
          setScanState(SCAN_STATES.PRODUCT_FAILED);
        }
      } else if (scanState === SCAN_STATES.SCANNING_CERTIFICATE) {
        // Mock certificate verification
        const verified = Math.random() > 0.2;
        
        if (verified) {
          setScanData(prev => ({
            ...prev,
            certificate: {
              id: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              confidence: 95
            }
          }));
          setScanState(SCAN_STATES.CERTIFICATE_VERIFIED);
          
          // Complete after 2 seconds
          setTimeout(() => {
            setScanState(SCAN_STATES.COMPLETE);
            if (onScanComplete) {
              onScanComplete(scanData);
            }
          }, 2000);
        } else {
          setScanState(SCAN_STATES.CERTIFICATE_FAILED);
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [scanState, isProcessing, scanData, onScanComplete, onError]);

  const startScan = () => {
    setScanState(SCAN_STATES.SCANNING_PRODUCT);
    setScanData({ product: null, certificate: null });
  };

  const resetScan = () => {
    setScanState(SCAN_STATES.IDLE);
    setScanData({ product: null, certificate: null });
    setProgress(0);
  };

  const getStatusMessage = () => {
    switch (scanState) {
      case SCAN_STATES.IDLE:
        return 'Position product in frame and tap to start';
      case SCAN_STATES.SCANNING_PRODUCT:
        return 'Scanning product...';
      case SCAN_STATES.PRODUCT_VERIFIED:
        return 'Product verified! Preparing certificate scan...';
      case SCAN_STATES.PRODUCT_FAILED:
        return 'Product verification failed';
      case SCAN_STATES.SCANNING_CERTIFICATE:
        return 'Now scan the certificate';
      case SCAN_STATES.CERTIFICATE_VERIFIED:
        return 'Certificate verified!';
      case SCAN_STATES.CERTIFICATE_FAILED:
        return 'Certificate verification failed';
      case SCAN_STATES.COMPLETE:
        return 'Authentication complete!';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (scanState) {
      case SCAN_STATES.SCANNING_PRODUCT:
        return <Package className="status-icon scanning" />;
      case SCAN_STATES.PRODUCT_VERIFIED:
        return [✓];
      case SCAN_STATES.PRODUCT_FAILED:
        return [X];
      case SCAN_STATES.SCANNING_CERTIFICATE:
        return <FileText className="status-icon scanning" />;
      case SCAN_STATES.CERTIFICATE_VERIFIED:
        return [✓];
      case SCAN_STATES.CERTIFICATE_FAILED:
        return [X];
      case SCAN_STATES.COMPLETE:
        return [✓];
      default:
        return <Scan className="status-icon" />;
    }
  };

  return (
    <div className="scan-view-container">
      {/* Camera View */}
      <div className="camera-container">
        {!cameraError ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="camera-feed"
            videoConstraints={{
              facingMode: 'environment',
              width: 1280,
              height: 720
            }}
            onUserMediaError={() => setCameraError(true)}
          />
        ) : (
          <div className="camera-error">
            <CameraOff size={48} />
            <p>Camera access denied</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* Scan Overlay */}
        <AnimatePresence>
          <motion.div 
            className="scan-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Corner Markers */}
            <svg className="scan-frame" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--luxury-gold)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--luxury-gold-light)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Top Left Corner */}
              <motion.path
                d="M 20 60 L 20 20 L 60 20"
                stroke="url(#scanGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              
              {/* Top Right Corner */}
              <motion.path
                d="M 240 20 L 280 20 L 280 60"
                stroke="url(#scanGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              />
              
              {/* Bottom Right Corner */}
              <motion.path
                d="M 280 240 L 280 280 L 240 280"
                stroke="url(#scanGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
              />
              
              {/* Bottom Left Corner */}
              <motion.path
                d="M 60 280 L 20 280 L 20 240"
                stroke="url(#scanGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
              />
            </svg>

            {/* Scanning Line Animation */}
            {(scanState === SCAN_STATES.SCANNING_PRODUCT || 
              scanState === SCAN_STATES.SCANNING_CERTIFICATE) && (
              <motion.div
                className="scan-line"
                initial={{ y: -150 }}
                animate={{ y: 150 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }}
              />
            )}

            {/* Center Focus */}
            <motion.div 
              className="center-focus"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              className="progress-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="progress-text">{progress}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Display */}
      <motion.div 
        className="scan-status"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="status-content">
          {getStatusIcon()}
          <p className="status-message">{getStatusMessage()}</p>
          
          {isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="loading-icon" />
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {scanState === SCAN_STATES.IDLE && (
            <motion.button
              className="scan-button primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startScan}
            >
              <Camera size={20} />
              Start Scan
            </motion.button>
          )}
          
          {(scanState === SCAN_STATES.PRODUCT_FAILED || 
            scanState === SCAN_STATES.CERTIFICATE_FAILED) && (
            <motion.button
              className="scan-button secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetScan}
            >
              Retry Scan
            </motion.button>
          )}
          
          {scanState === SCAN_STATES.COMPLETE && (
            <motion.button
              className="scan-button success"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onScanComplete && onScanComplete(scanData)}
            >
              View Certificate
            </motion.button>
          )}
        </div>

        {/* Scan Results */}
        <AnimatePresence>
          {scanData.product && (
            <motion.div 
              className="scan-result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h4>Product Details</h4>
              <div className="result-info">
                <span>Brand: {scanData.product.brand}</span>
                <span>Model: {scanData.product.model}</span>
                <span>Confidence: {scanData.product.confidence}%</span>
              </div>
            </motion.div>
          )}
          
          {scanData.certificate && (
            <motion.div 
              className="scan-result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h4>Certificate</h4>
              <div className="result-info">
                <span>ID: {scanData.certificate.id}</span>
                <span>Confidence: {scanData.certificate.confidence}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ScanView;


