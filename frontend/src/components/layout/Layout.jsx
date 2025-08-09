import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = ({ 
  children, 
  showHeader = true,
  showBottomNav = true,
  headerProps = {},
  className = '',
  fullScreen = false
}) => {
  return (
    <div className={`layout ${fullScreen ? 'layout-fullscreen' : ''} ${className}`}>
      {showHeader && <Header {...headerProps} />}
      
      <main className={`layout-main ${showHeader ? 'with-header' : ''} ${showBottomNav ? 'with-bottom-nav' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;