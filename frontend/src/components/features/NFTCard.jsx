import React, { useState } from 'react';
import './NFTCard.css';

const NFTCard = ({ certificate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  return (
    <div className="nft-card-container" onClick={handleFlip}>
      <div className={`nft-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side */}
        <div className="card-face card-front">
          <div className="card-header">
            <div className="brand-logo">
              {certificate.brand}
            </div>
            <div className="verified-badge">
              <Shield size={20} />
              VERIFIED
            </div>
          </div>
          
          <div className="card-body">
            <h2 className="product-name">{certificate.productName}</h2>
            <p className="product-model">{certificate.model}</p>
          </div>
          
          <div className="card-footer">
            <div className="cert-number">
              <span className="label">Certificate</span>
              <span className="value">#{certificate.certNumber}</span>
            </div>
            <div className="cert-date">
              <span className="label">Issued</span>
              <span className="value">{certificate.date}</span>
            </div>
          </div>
          
          <div className="card-shimmer" />
        </div>
        
        {/* Back Side */}
        <div className="card-face card-back">
          <div className="blockchain-info">
            <h3>Blockchain Details</h3>
            
            <div className="info-item">
              <Cpu size={16} />
              <span className="label">Block</span>
              <span className="value">#{certificate.blockNumber}</span>
            </div>
            
            <div className="info-item">
              <Hash size={16} />
              <span className="label">Token ID</span>
              <span className="value">#{certificate.tokenId}</span>
            </div>
            
            <div className="info-item">
              <Network size={16} />
              <span className="label">Network</span>
              <span className="value">Polygon</span>
            </div>
            
            <div className="info-item">
              <span className="label">TX</span>
              <span className="value tx-hash">
                0x{certificate.txHash?.substring(0, 6)}...{certificate.txHash?.slice(-4)}
              </span>
            </div>
          </div>
          
          <div className="qr-code">
            <img src={certificate.qrCode || '/api/placeholder/150/150'} alt="NFT QR" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
