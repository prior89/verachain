import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (result.success) {
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        onClose();
      } else {
        setErrors({ general: result.message || 'Failed to change password' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: 'Enter password', color: '#ccc' };
    
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 12
    ];
    
    score = checks.filter(Boolean).length;
    
    if (score < 3) return { strength: 1, text: 'Weak', color: '#ff4757' };
    if (score < 4) return { strength: 2, text: 'Fair', color: '#ffa502' };
    if (score < 5) return { strength: 3, text: 'Good', color: '#2ed573' };
    return { strength: 4, text: 'Strong', color: '#5352ed' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="change-password-form">
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password *</label>
          <div className="password-input-container">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={errors.currentPassword ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password *</label>
          <div className="password-input-container">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{ 
                    width: `${(passwordStrength.strength / 4) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <span 
                className="strength-text"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.text}
              </span>
            </div>
          )}
          
          {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
          
          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'met' : ''}>
                At least 8 characters
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'met' : ''}>
                One lowercase letter
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
                One uppercase letter
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'met' : ''}>
                One number
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password *</label>
          <div className="password-input-container">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;