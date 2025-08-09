import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './ScanScreen.css';

const SCAN_STATES = {
  SCANNING_PRODUCT: 'SCANNING_PRODUCT',
  PRODUCT_VERIFIED: 'PRODUCT_VERIFIED',
  SCANNING_CERTIFICATE: 'SCANNING_CERTIFICATE',
  COMPLETE: 'COMPLETE'
};

const ScanScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATES.SCANNING_PRODUCT);
  const [stream, setStream] = useState(null);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleScan = useCallback(() => {
    // Simulate scanning process
    if (scanState === SCAN_STATES.SCANNING_PRODUCT) {
      setTimeout(() => {
        setScanState(SCAN_STATES.PRODUCT_VERIFIED);
        setTimeout(() => {
          setScanState(SCAN_STATES.SCANNING_CERTIFICATE);
        }, 2000);
      }, 3000);
    } else if (scanState === SCAN_STATES.SCANNING_CERTIFICATE) {
      setTimeout(() => {
        setScanState(SCAN_STATES.COMPLETE);
        setTimeout(() => {
          navigate('/certificates');
        }, 2000);
      }, 3000);
    }
  }, [scanState, navigate]);

  const getStatusMessage = () => {
    switch (scanState) {
      case SCAN_STATES.SCANNING_PRODUCT:
        return "Scan product barcode";
      case SCAN_STATES.PRODUCT_VERIFIED:
        return "Product verified ✓ Now scan certificate";
      case SCAN_STATES.SCANNING_CERTIFICATE:
        return "Scanning certificate...";
      case SCAN_STATES.COMPLETE:
        return "Authentication complete ✓";
      default:
        return "";
    }
  };

  const getStatusClass = () => {
    switch (scanState) {
      case SCAN_STATES.PRODUCT_VERIFIED:
      case SCAN_STATES.COMPLETE:
        return 'status-success';
      default:
        return '';
    }
  };

  return (
    <div className="scan-container">
      <div className="scan-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <span className="scan-title">AUTHENTICATION</span>
      </div>

      <div className="camera-view">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-feed"
        />
        
        <div className="scan-overlay">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>
          
          <div className="scan-ring" onClick={handleScan}></div>
        </div>
      </div>

      <div className={`scan-status ${getStatusClass()}`}>
        <p className="status-text">{getStatusMessage()}</p>
      </div>
    </div>
  );
};

export default ScanScreen;