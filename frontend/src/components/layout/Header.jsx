import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  title, 
  showBack = false, 
  showNotifications = false, 
  showSettings = false,
  transparent = false,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className={`header ${transparent ? 'header-transparent' : ''} ${className}`}>
      <div className="header-container">
        <div className="header-left">
          {showBack && (
            <button className="header-btn" onClick={handleBack}>
              [Back]
            </button>
          )}
        </div>

        <div className="header-center">
          {title && (
            <h1 className="header-title">{title}</h1>
          )}
          {!title && (
            <div className="header-logo">
              <span className="logo-text">VERACHAIN</span>
            </div>
          )}
        </div>

        <div className="header-right">
          {showNotifications && (
            <button className="header-btn">
              [Alert]
              <span className="notification-badge">3</span>
            </button>
          )}
          {showSettings && (
            <button className="header-btn" onClick={() => navigate('/settings')}>
              [Settings]
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;


