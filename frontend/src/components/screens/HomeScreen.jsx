import React from 'react';
import './HomeScreen.css';

const HomeScreen = () => {
  return (
    <div className="home-container">
      <h1>Welcome to VeraChain</h1>
      <p>Luxury Authentication Platform</p>
      
      <div className="features">
        <div className="feature-card">
          <h3>제품 인증</h3>
          <p>QR 코드로 정품 인증</p>
        </div>
        <div className="feature-card">
          <h3>NFT 인증서</h3>
          <p>블록체인 기반 소유권 증명</p>
        </div>
        <div className="feature-card">
          <h3>거래 내역</h3>
          <p>투명한 거래 기록</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
