import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../layout/Layout';
import AdDisplay from '../common/AdDisplay';
import { adsService } from '../../services/adsService';
import './MainScreen.css';

const MainScreen = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({
    verifications: 0,
    certificates: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch ads based on current time slot
  const fetchAds = useCallback(async () => {
    try {
      const result = await adsService.getCurrentAds();
      if (result.success) {
        setAds(result.ads);
      } else {
        // Use default ads if API fails
        setAds(getDefaultAds());
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setAds(getDefaultAds());
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch platform stats (anonymous)
  const fetchStats = useCallback(async () => {
    // Simulate fetching anonymous platform stats
    setStats({
      verifications: Math.floor(Math.random() * 10000) + 5000,
      certificates: Math.floor(Math.random() * 5000) + 2000,
      activeUsers: Math.floor(Math.random() * 1000) + 500
    });
  }, []);
  
  useEffect(() => {
    fetchAds();
    fetchStats();
    
    // Refresh ads every minute to check for new time slot
    const adsInterval = setInterval(fetchAds, 60000);
    
    // Update stats every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);
    
    return () => {
      clearInterval(adsInterval);
      clearInterval(statsInterval);
    };
  }, [fetchAds, fetchStats]);
  
  const getDefaultAds = () => [
    {
      id: '1',
      brand: 'Chanel',
      title: 'Timeless Elegance',
      mediaUrl: '/assets/ads/chanel_ad.mp4',
      mediaType: 'video',
      cta: 'Discover Collection'
    },
    {
      id: '2',
      brand: 'Herm챔s',
      title: 'Crafted Excellence',
      mediaUrl: '/assets/ads/hermes_ad.mp4',
      mediaType: 'video',
      cta: 'Explore Heritage'
    },
    {
      id: '3',
      brand: 'Rolex',
      title: 'Perpetual Innovation',
      mediaUrl: '/assets/ads/rolex_ad.mp4',
      mediaType: 'video',
      cta: 'View Timepieces'
    }
  ];
  
  const handleAdClick = (adId, link) => {
    // Track ad click (anonymous)
    adsService.trackClick(adId);
    if (link) {
      window.open(link, '_blank');
    }
  };
  
  const handleAdImpression = (adId) => {
    // Track ad impression (anonymous)
    adsService.trackImpression(adId);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };
  
  return (
    <Layout 
      showHeader={false}
      className="main-screen-layout"
    >
      <div className="main-screen">
        {/* Advertisement Section */}
        <div className="ad-section">
          {!isLoading && ads.length > 0 && (
            <AdDisplay 
              ads={ads}
              autoPlay={true}
              interval={30000}
              onAdClick={handleAdClick}
              onAdImpression={handleAdImpression}
            />
          )}
          
          {/* Floating Particles Effect */}
          <div className="particles-container">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100
                }}
                animate={{ 
                  y: -100,
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: 15 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Hero Section */}
        <motion.div 
          className="hero-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="hero-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
          >
            <span>VERIFIED AUTHENTIC</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            variants={itemVariants}
          >
            VERACHAIN
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            variants={itemVariants}
          >
            Authentication Redefined
          </motion.p>
          
          {/* Live Stats */}
          <motion.div 
            className="stats-row"
            variants={containerVariants}
          >
            <motion.div 
              className="stat-card"
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{stats.verifications.toLocaleString()}</span>
              <span className="stat-label">Verifications</span>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{stats.certificates.toLocaleString()}</span>
              <span className="stat-label">Certificates</span>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{stats.activeUsers.toLocaleString()}</span>
              <span className="stat-label">Active Now</span>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Features Grid */}
        <motion.div 
          className="features-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="feature-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }}
          >
            <div className="feature-icon-wrapper">
              <span className="feature-text">DUAL</span>
            </div>
            <h3>Dual Verification</h3>
            <p>AI-powered product scanning combined with OCR certificate verification</p>
            <div className="feature-badge">
              <span>99.9% Accuracy</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }}
          >
            <div className="feature-icon-wrapper">
              <span className="feature-text">NFT</span>
            </div>
            <h3>NFT Certificates</h3>
            <p>Blockchain-secured digital certificates on Polygon Amoy network</p>
            <div className="feature-badge">
              <span>Immutable</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }}
          >
            <div className="feature-icon-wrapper">
              <span className="feature-text">SAFE</span>
            </div>
            <h3>Privacy First</h3>
            <p>No transaction history exposed, always fresh certificate IDs</p>
            <div className="feature-badge">
              <span>100% Private</span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div 
          className="cta-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button 
            className="primary-cta"
            onClick={() => navigate('/scan')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Verification</span>
          </motion.button>
          
          <motion.button 
            className="secondary-cta"
            onClick={() => navigate('/certificates')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>My Certificates</span>
          </motion.button>
        </motion.div>
        
        {/* Ticker */}
        <motion.div 
          className="ticker-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="ticker-content">
            <span className="ticker-item">
              Real-time Verification
            </span>
            <span className="ticker-separator">•</span>
            <span className="ticker-item">
              Polygon Amoy Network
            </span>
            <span className="ticker-separator">•</span>
            <span className="ticker-item">
              TensorFlow AI
            </span>
            <span className="ticker-separator">•</span>
            <span className="ticker-item">
              Zero Knowledge Privacy
            </span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default MainScreen;


