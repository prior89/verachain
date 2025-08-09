import React from 'react';
import './ScanOverlay.css';

const ScanOverlay = ({ 
  scanning = false, 
  state = 'idle',
  message = '',
  progress = 0 
}) => {
  const getStateIcon = () => {
    switch (state) {
      case 'success':
        return [✓];
      case 'error':
        return <AlertCircle size={48} className="state-icon error" />;
      default:
        return null;
    }
  };

  const getStateMessage = () => {
    if (message) return message;
    
    switch (state) {
      case 'scanning_product':
        return 'Scanning product...';
      case 'product_verified':
        return 'Product verified ??;
      case 'scanning_certificate':
        return 'Scanning certificate...';
      case 'complete':
        return 'Authentication complete ??;
      case 'error':
        return 'Scan failed. Please try again.';
      default:
        return 'Position item in frame';
    }
  };

  return (
    <div className="scan-overlay">
      {/* Corner brackets */}
      <div className="scan-frame">
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
      </div>

      {/* Scanning line animation */}
      {scanning && (
        <div className="scan-line" />
      )}

      {/* Center reticle */}
      <div className="scan-reticle">
        <div className="reticle-dot" />
        {scanning && (
          <>
            <div className="reticle-ring ring-1" />
            <div className="reticle-ring ring-2" />
            <div className="reticle-ring ring-3" />
          </>
        )}
      </div>

      {/* State indicator */}
      <div className="scan-state">
        {getStateIcon()}
        <p className="state-message">{getStateMessage()}</p>
        
        {progress > 0 && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Grid pattern */}
      <svg className="scan-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path 
              d="M 10 0 L 0 0 0 10" 
              fill="none" 
              stroke="rgba(212, 175, 55, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export default ScanOverlay;


