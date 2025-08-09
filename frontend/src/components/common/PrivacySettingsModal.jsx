import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './PrivacySettingsModal.css';

const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    // Profile Privacy
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    showLocation: false,
    
    // Activity Privacy
    showVerificationHistory: false,
    showNFTCollection: true,
    showActivityStatus: true,
    
    // Data Sharing
    allowAnalytics: true,
    allowPerformanceData: true,
    allowMarketingData: false,
    shareWithPartners: false,
    
    // Search & Discovery
    searchableByEmail: false,
    searchableByPhone: false,
    appearInSuggestions: true,
    
    // Location Services
    useLocationForVerification: true,
    saveLocationHistory: false,
    shareLocationWithFriends: false,
    
    // Data Retention
    autoDeleteHistory: false,
    historyRetentionDays: 365,
    
    // Two-Factor Authentication
    twoFactorEnabled: false,
    twoFactorMethod: 'app', // app, sms, email
    
    // Blockchain Privacy
    hideTransactionAmounts: false,
    usePrivateTransactions: false,
    anonymizePublicData: true
  });
  const [loading, setLoading] = useState(false);
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [dataDeleteLoading, setDataDeleteLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load saved settings
      const savedSettings = localStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [isOpen]);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleNumberChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: parseInt(value, 10)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(settings));
      
      // TODO: Save to backend API
      // await api.post('/api/user/privacy-settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setDataExportLoading(true);
    
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock export data
      const exportData = {
        profile: {
          email: 'user@example.com',
          name: 'User Name',
          joinDate: new Date().toISOString()
        },
        verifications: [],
        nfts: [],
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verachain-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setDataExportLoading(false);
    }
  };

  const deleteAllData = async () => {
    if (!window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }
    
    setDataDeleteLoading(true);
    
    try {
      // TODO: Call backend API to delete all user data
      // await api.delete('/api/user/delete-all-data');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Your data deletion request has been submitted. It may take up to 30 days to complete.');
      
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setDataDeleteLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Settings">
      <div className="privacy-settings">
        {/* Profile Privacy */}
        <div className="settings-section">
          <h3>Profile Privacy</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Profile Visibility</span>
              <span className="setting-description">Who can see your profile</span>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
              className="setting-select"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Email</span>
              <span className="setting-description">Display email in your profile</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showEmail}
                onChange={() => handleToggle('showEmail')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Phone</span>
              <span className="setting-description">Display phone number in your profile</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showPhone}
                onChange={() => handleToggle('showPhone')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Location</span>
              <span className="setting-description">Display your location</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showLocation}
                onChange={() => handleToggle('showLocation')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Activity Privacy */}
        <div className="settings-section">
          <h3>Activity Privacy</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Verification History</span>
              <span className="setting-description">Others can see your verification activity</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showVerificationHistory}
                onChange={() => handleToggle('showVerificationHistory')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show NFT Collection</span>
              <span className="setting-description">Display your NFT certificates publicly</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showNFTCollection}
                onChange={() => handleToggle('showNFTCollection')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Activity Status</span>
              <span className="setting-description">Show when you're online/active</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showActivityStatus}
                onChange={() => handleToggle('showActivityStatus')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Data Sharing */}
        <div className="settings-section">
          <h3>Data Sharing</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Analytics Data</span>
              <span className="setting-description">Share anonymized usage data to improve the app</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.allowAnalytics}
                onChange={() => handleToggle('allowAnalytics')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Performance Data</span>
              <span className="setting-description">Share performance metrics</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.allowPerformanceData}
                onChange={() => handleToggle('allowPerformanceData')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Marketing Data</span>
              <span className="setting-description">Use data for personalized marketing</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.allowMarketingData}
                onChange={() => handleToggle('allowMarketingData')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Share with Partners</span>
              <span className="setting-description">Share data with trusted partners</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.shareWithPartners}
                onChange={() => handleToggle('shareWithPartners')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="settings-section">
          <h3>Security</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Two-Factor Authentication</span>
              <span className="setting-description">Add extra security to your account</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={() => handleToggle('twoFactorEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.twoFactorEnabled && (
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">2FA Method</span>
                <span className="setting-description">Choose your preferred method</span>
              </div>
              <select
                value={settings.twoFactorMethod}
                onChange={(e) => handleSelectChange('twoFactorMethod', e.target.value)}
                className="setting-select"
              >
                <option value="app">Authenticator App</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
          )}
        </div>

        {/* Data Retention */}
        <div className="settings-section">
          <h3>Data Retention</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Auto-Delete History</span>
              <span className="setting-description">Automatically delete old verification history</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoDeleteHistory}
                onChange={() => handleToggle('autoDeleteHistory')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.autoDeleteHistory && (
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Retention Period</span>
                <span className="setting-description">Keep history for this many days</span>
              </div>
              <select
                value={settings.historyRetentionDays}
                onChange={(e) => handleNumberChange('historyRetentionDays', e.target.value)}
                className="setting-select"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
              </select>
            </div>
          )}
        </div>

        {/* Data Export & Deletion */}
        <div className="settings-section">
          <h3>Data Rights</h3>
          
          <div className="data-action-item">
            <div className="setting-info">
              <span className="setting-label">Export My Data</span>
              <span className="setting-description">Download a copy of all your data</span>
            </div>
            <button
              onClick={exportData}
              disabled={dataExportLoading}
              className="action-button export-button"
            >
              {dataExportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div className="data-action-item">
            <div className="setting-info">
              <span className="setting-label">Delete All Data</span>
              <span className="setting-description">Permanently delete your account and all data</span>
            </div>
            <button
              onClick={deleteAllData}
              disabled={dataDeleteLoading}
              className="action-button delete-button"
            >
              {dataDeleteLoading ? 'Processing...' : 'Delete All Data'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrivacySettingsModal;