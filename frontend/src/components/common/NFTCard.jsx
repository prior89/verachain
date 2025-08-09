import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NFTCard.css';

const NFTCard = ({ certificate, onClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const cardVariants = {
    initial: { 
      rotateY: 0,
      scale: 1
    },
    flipped: { 
      rotateY: 180,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 60px rgba(212, 175, 55, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "linear"
      }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut"
      }
    }
  };

  if (!certificate) return null;

  return (
    <motion.div
      className="nft-card-container"
      initial="initial"
      animate={isFlipped ? "flipped" : "initial"}
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFlip}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Front Side */}
      <motion.div 
        className="card-face card-front"
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* Holographic Background */}
        <div className="holographic-bg" />
        
        {/* Shimmer Effect */}
        <motion.div 
          className="shimmer-effect"
          variants={shimmerVariants}
          initial="initial"
          animate={isHovered ? "animate" : "initial"}
        />

        {/* Card Header */}
        <div className="card-header">
          <motion.div 
            className="brand-logo"
            variants={floatingVariants}
            initial="initial"
            animate="animate"
          >
            <span className="brand-name">{certificate.brand}</span>
          </motion.div>
          
          <motion.div 
            className="verified-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            [Shield]
            <span>VERIFIED</span>
          </motion.div>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <motion.h2 
            className="product-name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {certificate.productName || certificate.model}
          </motion.h2>
          
          <motion.p 
            className="product-category"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {certificate.category}
          </motion.p>

          {/* Confidence Score */}
          <motion.div 
            className="confidence-meter"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="confidence-label">
              <span>Authentication Score</span>
              <span className="confidence-value">{certificate.confidence}%</span>
            </div>
            <div className="confidence-bar">
              <motion.div 
                className="confidence-fill"
                initial={{ width: 0 }}
                animate={{ width: `${certificate.confidence}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                style={{
                  background: certificate.confidence > 90 
                    ? 'linear-gradient(90deg, #00C896, #00F5B8)' 
                    : certificate.confidence > 80 
                    ? 'linear-gradient(90deg, #FFB800, #FFD700)'
                    : 'linear-gradient(90deg, #FF6B60, #FF3B30)'
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <motion.div 
            className="cert-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="info-item">
              <Award size={14} />
              <span className="info-label">Certificate</span>
              <span className="info-value">#{certificate.displayId}</span>
            </div>
            <div className="info-item">
              <Calendar size={14} />
              <span className="info-label">Issued</span>
              <span className="info-value">{new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-particle"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back Side */}
      <motion.div 
        className="card-face card-back"
        style={{ 
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)"
        }}
      >
        <div className="holographic-bg" />
        
        <div className="blockchain-header">
          <h3>Blockchain Certificate</h3>
          <div className="network-badge">
            <Network size={16} />
            <span>Polygon Amoy</span>
          </div>
        </div>

        <div className="blockchain-info">
          <motion.div 
            className="info-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Cpu size={16} />
            <span className="label">Block</span>
            <span className="value">#{certificate.blockNumber || '000000'}</span>
          </motion.div>

          <motion.div 
            className="info-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Hash size={16} />
            <span className="label">Token ID</span>
            <span className="value">#{certificate.tokenId || 'PENDING'}</span>
          </motion.div>

          <motion.div 
            className="info-row tx-hash"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="label">Transaction</span>
            <span className="value">
              {certificate.txHash 
                ? `${certificate.txHash.substring(0, 6)}...${certificate.txHash.slice(-4)}`
                : 'PENDING'}
            </span>
          </motion.div>
        </div>

        {/* QR Code Section */}
        <motion.div 
          className="qr-section"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="qr-placeholder">
            {certificate.qrCode ? (
              <img src={certificate.qrCode} alt="NFT QR" />
            ) : (
              <div className="qr-generating">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Hash size={32} />
                </motion.div>
                <span>Generating QR...</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.button 
          className="view-blockchain-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            if (certificate.txHash) {
              window.open(`https://amoy.polygonscan.com/tx/${certificate.txHash}`, '_blank');
            }
          }}
        >
          View on Blockchain
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default NFTCard;

