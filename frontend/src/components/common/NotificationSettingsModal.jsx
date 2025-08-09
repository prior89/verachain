import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './NotificationSettingsModal.css';

const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    // Email notifications
    emailVerificationResults: true,
    emailNFTUpdates: true,
    emailSecurityAlerts: true,
    emailPromotions: false,
    emailWeeklyReport: true,
    
    // Push notifications
    pushVerificationResults: true,
    pushNFTUpdates: false,
    pushSecurityAlerts: true,
    pushAppUpdates: true,
    
    // SMS notifications
    smsSecurityAlerts: false,
    smsVerificationResults: false,
    
    // App notifications
    inAppSounds: true,
    inAppVibration: true,
    
    // Frequency settings
    digestFrequency: 'daily', // daily, weekly, monthly, never
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load saved settings from localStorage or API
      const savedSettings = localStorage.getItem('notificationSettings');
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

  const handleNestedToggle = (parent, child) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: !prev[parent][child]
      }
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTimeChange = (timeType, value) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [timeType]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // TODO: Save to backend API
      // await api.post('/api/user/notification-settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      emailVerificationResults: true,
      emailNFTUpdates: true,
      emailSecurityAlerts: true,
      emailPromotions: false,
      emailWeeklyReport: true,
      pushVerificationResults: true,
      pushNFTUpdates: false,
      pushSecurityAlerts: true,
      pushAppUpdates: true,
      smsSecurityAlerts: false,
      smsVerificationResults: false,
      inAppSounds: true,
      inAppVibration: true,
      digestFrequency: 'daily',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Settings">
      <div className="notification-settings">
        {/* Email Notifications */}
        <div className="settings-section">
          <h3>Email Notifications</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Verification Results</span>
              <span className="setting-description">Get notified when product verification is complete</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailVerificationResults}
                onChange={() => handleToggle('emailVerificationResults')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">NFT Updates</span>
              <span className="setting-description">Updates about your NFT certificates</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNFTUpdates}
                onChange={() => handleToggle('emailNFTUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Security Alerts</span>
              <span className="setting-description">Important security notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailSecurityAlerts}
                onChange={() => handleToggle('emailSecurityAlerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Promotions & News</span>
              <span className="setting-description">Special offers and product updates</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailPromotions}
                onChange={() => handleToggle('emailPromotions')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Weekly Report</span>
              <span className="setting-description">Summary of your weekly activity</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailWeeklyReport}
                onChange={() => handleToggle('emailWeeklyReport')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="settings-section">
          <h3>Push Notifications</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Verification Results</span>
              <span className="setting-description">Real-time verification notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushVerificationResults}
                onChange={() => handleToggle('pushVerificationResults')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">NFT Updates</span>
              <span className="setting-description">NFT certificate notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushNFTUpdates}
                onChange={() => handleToggle('pushNFTUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Security Alerts</span>
              <span className="setting-description">Immediate security notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushSecurityAlerts}
                onChange={() => handleToggle('pushSecurityAlerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">App Updates</span>
              <span className="setting-description">New features and app updates</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushAppUpdates}
                onChange={() => handleToggle('pushAppUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="settings-section">
          <h3>SMS Notifications</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Security Alerts</span>
              <span className="setting-description">Critical security SMS alerts</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsSecurityAlerts}
                onChange={() => handleToggle('smsSecurityAlerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Verification Results</span>
              <span className="setting-description">SMS verification confirmations</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsVerificationResults}
                onChange={() => handleToggle('smsVerificationResults')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* App Settings */}
        <div className="settings-section">
          <h3>App Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Notification Sounds</span>
              <span className="setting-description">Play sounds for notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.inAppSounds}
                onChange={() => handleToggle('inAppSounds')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Vibration</span>
              <span className="setting-description">Vibrate for notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.inAppVibration}
                onChange={() => handleToggle('inAppVibration')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Digest Settings */}
        <div className="settings-section">
          <h3>Digest Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Digest Frequency</span>
              <span className="setting-description">How often to receive activity summaries</span>
            </div>
            <select
              value={settings.digestFrequency}
              onChange={(e) => handleSelectChange('digestFrequency', e.target.value)}
              className="setting-select"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="settings-section">
          <h3>Quiet Hours</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Enable Quiet Hours</span>
              <span className="setting-description">Mute notifications during specific hours</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={() => handleNestedToggle('quietHours', 'enabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="quiet-hours-times">
              <div className="time-setting">
                <label>Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                />
              </div>
              <div className="time-setting">
                <label>End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={resetToDefaults}
            className="reset-button"
            disabled={loading}
          >
            Reset to Defaults
          </button>
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

export default NotificationSettingsModal;