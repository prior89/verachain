import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// All icons removed per CLAUDE.md specifications
import NFTCard from '../common/NFTCard';
import { nftService } from '../../services/nftService';
import './CertificatesScreen.css';

const CertificatesScreen = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterBrand, setFilterBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user's NFTs (with fresh display IDs)
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await nftService.getUserNFTs();
      
      if (result.success) {
        // Each certificate has a fresh display ID
        setCertificates(result.nfts.map(nft => ({
          ...nft,
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Always fresh
          verifiedDate: new Date().toISOString() // Always current
        })));
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
      setError('Failed to load certificates');
      
      // Use mock data for development
      setCertificates([
        {
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Chanel',
          model: 'Classic Flap Medium',
          category: 'handbag',
          tokenId: '123456',
          status: 'verified',
          confidence: 95,
          verifiedDate: new Date().toISOString()
        },
        {
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Herm챔s',
          model: 'Birkin 30',
          category: 'handbag',
          tokenId: '789012',
          status: 'verified',
          confidence: 98,
          verifiedDate: new Date().toISOString()
        },
        {
          displayId: `VERA-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          brand: 'Rolex',
          model: 'Submariner',
          category: 'watch',
          tokenId: '345678',
          status: 'verified',
          confidence: 92,
          verifiedDate: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Refresh with new display IDs
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCertificates();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Filter certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesBrand = filterBrand === 'all' || cert.brand === filterBrand;
    const matchesSearch = searchQuery === '' || 
      cert.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Get unique brands for filter
  const brands = ['all', ...new Set(certificates.map(cert => cert.brand))];

  const handleCertificateClick = (cert) => {
    setSelectedCert(cert);
  };

  const handleTransfer = async (tokenId) => {
    // Navigate to transfer screen
    navigate('/transfer', { state: { tokenId } });
  };

  const handleBurn = async (tokenId) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      const result = await nftService.burnNFT(tokenId);
      if (result.success) {
        await fetchCertificates(); // Refresh list
      }
    }
  };

  const handleGenerateQR = async (cert) => {
    const result = await nftService.generateQR(cert.displayId);
    if (result.success) {
      // Show QR in modal
      alert('QR Code generated with fresh ID: ' + result.displayId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  return (
    <div className="certificates-screen">
      {/* Header */}
      <div className="certificates-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-text">??/span>
        </button>
        
        <h1 className="screen-title">
          [Shield]
          My Certificates
        </h1>
        
        <motion.button 
          className="refresh-button"
          onClick={handleRefresh}
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={{ duration: 1, ease: "linear" }}
        >
          [Refresh]
        </motion.button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{certificates.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Verified</span>
          <span className="stat-value">{certificates.filter(c => c.status === 'verified').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Value</span>
          <span className="stat-value">Private</span> {/* Never show value */}
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        {/* Search */}
        <div className="search-box">
          [Search]
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Brand Filter */}
        <div className="filter-dropdown">
          [Filter]
          <select 
            value={filterBrand} 
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'all' ? 'All Brands' : brand}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            [Grid]
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            [List]
          </button>
        </div>
      </div>

      {/* Certificates Display */}
      {loading ? (
        <div className="loading-state">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            Loading...
          </motion.div>
          <p>Loading certificates...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchCertificates}>Retry</button>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="empty-state">
          [Shield]
          <h3>No Certificates Found</h3>
          <p>Start by scanning a product to create your first certificate</p>
          <button onClick={() => navigate('/scan')} className="scan-button">
            Start Scanning
          </button>
        </div>
      ) : (
        <motion.div 
          className={`certificates-container ${viewMode}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredCertificates.map((cert) => (
              <motion.div
                key={cert.displayId} // Use display ID as key
                variants={itemVariants}
                layout
                className="certificate-item"
              >
                {viewMode === 'grid' ? (
                  <NFTCard 
                    certificate={cert}
                    onClick={() => handleCertificateClick(cert)}
                  />
                ) : (
                  <div className="list-item" onClick={() => handleCertificateClick(cert)}>
                    <div className="list-item-left">
                      <div className="brand-badge">
                        <span>{cert.brand}</span>
                      </div>
                      <div className="item-details">
                        <h3>{cert.model}</h3>
                        <p>ID: {cert.displayId}</p>
                        <p>Verified: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="list-item-right">
                      <div className="confidence-score">
                        <span>{cert.confidence}%</span>
                        <span className="label">Confidence</span>
                      </div>
                      <div className="action-buttons">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateQR(cert);
                          }}
                          className="action-btn qr"
                        >
                          [QR]
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransfer(cert.tokenId);
                          }}
                          className="action-btn transfer"
                        >
                          [Send]
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBurn(cert.tokenId);
                          }}
                          className="action-btn burn"
                        >
                          [Burn]
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Selected Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            className="certificate-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <NFTCard certificate={selectedCert} />
              <div className="modal-actions">
                <button onClick={() => handleGenerateQR(selectedCert)}>
                  [QR]
                  Generate QR
                </button>
                <button onClick={() => handleTransfer(selectedCert.tokenId)}>
                  [Send]
                  Transfer
                </button>
                <button onClick={() => setSelectedCert(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificatesScreen;




