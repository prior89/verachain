import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CertificateDetail.css';

const CertificateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFlipped, setIsFlipped] = useState(false);

  // Mock data - replace with API call
  const certificate = {
    id: id,
    brand: 'LOUIS VUITTON',
    productName: 'Neverfull MM',
    certNumber: 'LV2024001',
    date: '2024-01-15',
    status: 'VERIFIED',
    blockchain: {
      block: '#123456',
      tokenId: '#789',
      contract: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
      network: 'Polygon'
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="certificate-detail-container">
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/certificates')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="detail-title">NFT CERTIFICATE</h1>
      </div>

      <div className="card-container">
        <div className="nft-card" onClick={flipCard}>
          <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <div className="card-logo">
                <span className="brand-logo">{certificate.brand}</span>
              </div>
              
              <div className="card-content">
                <h2 className="product-name">{certificate.productName}</h2>
                <p className="cert-number">Certificate #{certificate.certNumber}</p>
              </div>
              
              <div className="verified-badge">
                <Shield size={20} />
                <span>VERIFIED</span>
              </div>
              
              <div className="card-shimmer"></div>
            </div>
            
            <div className="card-back">
              <div className="blockchain-header">
                <Link size={20} />
                <span>BLOCKCHAIN DATA</span>
              </div>
              
              <div className="blockchain-info">
                <div className="info-row">
                  <span className="label">Block:</span>
                  <span className="value">{certificate.blockchain.block}</span>
                </div>
                <div className="info-row">
                  <span className="label">Token ID:</span>
                  <span className="value">{certificate.blockchain.tokenId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Contract:</span>
                  <span className="value truncate">
                    {certificate.blockchain.contract.slice(0, 6)}...{certificate.blockchain.contract.slice(-4)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Network:</span>
                  <span className="value">{certificate.blockchain.network}</span>
                </div>
              </div>
              
              <div className="card-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-button transfer">
          Transfer Ownership
        </button>
        <button className="action-button view">
          View on Explorer
        </button>
      </div>
    </div>
  );
};

export default CertificateDetail;
