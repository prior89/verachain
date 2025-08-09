import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    // 임시 로그인 처리
    console.log('Login:', email, password);
    navigate('/home');
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">V</div>
        <h1>VERACHAIN</h1>
        <p>Luxury Authentication</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">SIGN IN</button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
