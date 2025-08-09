import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', label: 'HOME' },
    { id: 'certificates', path: '/certificates', label: 'CERTIFICATES' },
    { id: 'profile', path: '/profile', label: 'PROFILE' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

