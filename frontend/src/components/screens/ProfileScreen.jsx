import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    email: '',
    memberSince: '',
    membershipTier: 'Basic',
    totalAuthentications: 0,
    totalNFTs: 0,
    lastActivity: ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: true
  });

  useEffect(() => {
    // Fetch user profile data
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (user) {
      console.log('Current user data:', user);
      
      setProfileData({
        email: user.email || 'No email available',
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                     new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        membershipTier: (user.membershipTier || 'basic').toUpperCase(),
        totalAuthentications: user.stats?.totalVerifications || 0,
        totalNFTs: user.stats?.successfulVerifications || 0,
        lastActivity: new Date().toLocaleDateString()
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    console.log('Change password');
  };

  const handleToggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
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
    <Layout showHeader={true} showBottomNav={true}>
      <div className="profile-screen">
        <motion.div 
          className="profile-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header */}
          <motion.div className="profile-header" variants={itemVariants}>
            <h1>Profile</h1>
          </motion.div>

          {/* User Information Section */}
          <motion.div className="profile-section" variants={itemVariants}>
            <h2 className="section-title">User Information</h2>
            
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profileData.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{profileData.memberSince}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Membership Tier</span>
              <span className="info-value tier-badge">
                {profileData.membershipTier.toUpperCase()}
              </span>
            </div>
          </motion.div>

          {/* Activity Statistics */}
          <motion.div className="profile-section" variants={itemVariants}>
            <h2 className="section-title">Activity</h2>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{profileData.totalAuthentications}</span>
                <span className="stat-label">Total Authentications</span>
              </div>

              <div className="stat-box">
                <span className="stat-value">{profileData.totalNFTs}</span>
                <span className="stat-label">Total NFTs Owned</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-label">Last Activity</span>
              <span className="info-value">{profileData.lastActivity}</span>
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div className="profile-section" variants={itemVariants}>
            <h2 className="section-title">Settings</h2>
            
            <button 
              className="settings-button"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>

            <button 
              className="settings-button"
              onClick={handleChangePassword}
            >
              Change Password
            </button>

            <div className="toggle-setting">
              <span className="setting-label">Notification Settings</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggleSetting('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-setting">
              <span className="setting-label">Privacy Settings</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.privacy}
                  onChange={() => handleToggleSetting('privacy')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div className="logout-section" variants={itemVariants}>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfileScreen;


