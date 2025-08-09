import React, { useRef, useEffect, useState } from 'react';
import './CameraView.css';

const CameraView = ({ 
  onCapture, 
  active = true,
  facingMode = 'environment',
  className = '' 
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [active, facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(err.message || 'Failed to access camera');
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    if (!videoRef.current || !onCapture) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          onCapture(base64, blob);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  if (error) {
    return (
      <div className={`camera-view camera-error ${className}`}>
        <div className="error-message">
          <p>Camera Error</p>
          <span>{error}</span>
          <button onClick={startCamera}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`camera-view ${className}`}>
      {isLoading && (
        <div className="camera-loading">
          <div className="loading-spinner" />
          <p>Initializing camera...</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-feed"
        onLoadedMetadata={() => setIsLoading(false)}
      />
      
      {hasPermission && !isLoading && (
        <button 
          className="capture-button"
          onClick={capture}
          aria-label="Capture"
        >
          <div className="capture-icon" />
        </button>
      )}
    </div>
  );
};

export default CameraView;


