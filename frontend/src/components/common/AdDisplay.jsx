import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons removed per CLAUDE.md specifications - text-only UI
import './AdDisplay.css';

const AdDisplay = ({ 
  ads = [], 
  autoPlay = true, 
  interval = 30000, // 30 seconds default
  onAdClick,
  onAdImpression 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressInterval = useRef(null);
  const autoPlayTimeout = useRef(null);

  // Get current ad
  const currentAd = ads[currentIndex] || null;

  // Auto-advance ads
  useEffect(() => {
    if (isPlaying && ads.length > 1) {
      autoPlayTimeout.current = setTimeout(() => {
        handleNext();
      }, interval);
    }

    return () => {
      if (autoPlayTimeout.current) {
        clearTimeout(autoPlayTimeout.current);
      }
    };
  }, [currentIndex, isPlaying, ads.length, interval]);

  // Progress bar animation
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercent = (elapsed / interval) * 100;
        
        if (progressPercent >= 100) {
          setProgress(100);
          clearInterval(progressInterval.current);
        } else {
          setProgress(progressPercent);
        }
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isPlaying, interval]);

  // Track impressions
  useEffect(() => {
    if (currentAd && onAdImpression) {
      onAdImpression(currentAd.id);
    }
  }, [currentIndex, currentAd]);

  const handleNext = () => {
    setProgress(0);
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrevious = () => {
    setProgress(0);
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleAdClick = () => {
    if (currentAd && onAdClick) {
      onAdClick(currentAd.id, currentAd.link);
    }
  };

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  const pageTransition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.3 },
    scale: { duration: 0.3 }
  };

  if (!currentAd) {
    return (
      <div className="ad-display-container">
        <div className="ad-placeholder">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="placeholder-logo"
          >
            <span className="logo-text">V</span>
          </motion.div>
          <p>VeraChain</p>
          <span>Luxury Authentication Redefined</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`ad-display-container ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Main Ad Content */}
      <AnimatePresence mode="wait" custom={currentIndex}>
        <motion.div
          key={currentIndex}
          custom={currentIndex}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
          className="ad-content"
          onClick={handleAdClick}
        >
          {currentAd.mediaType === 'video' ? (
            <div className="video-container">
              <video
                ref={videoRef}
                src={currentAd.mediaUrl}
                autoPlay={autoPlay}
                muted={isMuted}
                loop
                playsInline
                className="ad-video"
                onLoadedData={() => setImageLoaded(true)}
              />
              
              {/* Video Controls Overlay */}
              <div className="video-controls">
                <button 
                  className="control-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                >
                  <span className="control-text">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                
                <button 
                  className="control-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMuteToggle();
                  }}
                >
                  <span className="control-text">{isMuted ? '?뵁' : '?뵄'}</span>
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              className="image-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={currentAd.mediaUrl}
                alt={currentAd.title || 'Advertisement'}
                className="ad-image"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          )}

          {/* Ad Overlay Info */}
          <motion.div 
            className="ad-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="ad-info">
              <h3 className="ad-brand">{currentAd.brand}</h3>
              {currentAd.title && (
                <p className="ad-title">{currentAd.title}</p>
              )}
              {currentAd.cta && (
                <motion.button 
                  className="ad-cta"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentAd.cta}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {ads.length > 1 && (
        <div className="ad-navigation">
          <button 
            className="nav-btn prev"
            onClick={handlePrevious}
            aria-label="Previous ad"
          >
            <span className="nav-text">PREV</span>
          </button>
          
          <button 
            className="nav-btn next"
            onClick={handleNext}
            aria-label="Next ad"
          >
            <span className="nav-text">NEXT</span>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {ads.length > 1 && (
        <div className="ad-progress">
          <motion.div 
            className="progress-track"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.1, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      )}

      {/* Dots Indicator */}
      {ads.length > 1 && (
        <div className="ad-indicators">
          {ads.map((_, index) => (
            <motion.button
              key={index}
              className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                setProgress(0);
                setImageLoaded(false);
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="ad-control-bar">
        <div className="control-group">
          <button 
            className="control-btn"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="control-text">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          
          {ads.length > 1 && (
            <button 
              className="control-btn"
              onClick={handleNext}
              aria-label="Skip"
            >
              <span className="control-text">STOP</span>
            </button>
          )}
        </div>

        <div className="control-group">
          <span className="ad-counter">
            {currentIndex + 1} / {ads.length}
          </span>
        </div>

        <div className="control-group">
          <button 
            className="control-btn"
            onClick={handleFullscreen}
            aria-label="Fullscreen"
          >
            <span className="control-text">{isFullscreen ? 'EXIT' : 'FULL'}</span>
          </button>
        </div>
      </div>

      {/* Floating Brand Badge */}
      <motion.div 
        className="brand-badge"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <span className="badge-text">SPONSORED</span>
      </motion.div>

      {/* Particle Effects */}
      <div className="particle-container">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ 
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: window.innerHeight
            }}
            animate={{ 
              opacity: [0, 0.5, 0],
              y: -100
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdDisplay;


