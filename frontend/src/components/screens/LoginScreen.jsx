import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>VERACHAIN</h1>
          <p className="subtitle">Authentication Redefined</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>

          <button 
            type="button" 
            className="login-button"
            style={{backgroundColor: '#28a745', marginTop: '10px'}}
            onClick={async () => {
              console.log('🔍 Testing API connection...');
              try {
                const testResponse = await fetch('http://localhost:5001/api/health');
                const testData = await testResponse.json();
                console.log('✅ API Health:', testData);
                
                const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'test1@test.com', password: 'password' })
                });
                const loginData = await loginResponse.json();
                console.log('✅ Direct Login Test:', loginData);
                alert('Check console for results');
              } catch (error) {
                console.error('❌ API Test failed:', error);
                alert('API test failed - check console');
              }
            }}
          >
            DEBUG API
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="register-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;


