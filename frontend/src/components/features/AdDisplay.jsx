import React, { useEffect, useRef, useState } from 'react';
import './AdDisplay.css';

const AdDisplay = ({ 
  src, 
  type = 'video', 
  autoPlay = true, 
  muted = true, 
  loop = true, 
  playsInline = true,
  fallbackImage,
  className = ''
}) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (type === 'video' && videoRef.current && autoPlay) {
      videoRef.current.play().catch(err => {
        console.error('Video autoplay failed:', err);
      });
    }
  }, [src, type, autoPlay]);

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (type === 'image' || hasError) {
    return (
      <div className={`ad-display ad-display-image ${className}`}>
        <img 
          src={hasError && fallbackImage ? fallbackImage : src}
          alt="Advertisement"
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
        {isLoading && <div className="ad-loading">Loading...</div>}
      </div>
    );
  }

  return (
    <div className={`ad-display ad-display-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        onLoadedData={handleLoadedData}
        onError={handleError}
        className="ad-video"
      >
        Your browser does not support the video tag.
      </video>
      {isLoading && (
        <div className="ad-loading">
          <div className="ad-spinner" />
        </div>
      )}
      <div className="ad-overlay">
        <div className="ad-gradient" />
      </div>
    </div>
  );
};

export default AdDisplay;

