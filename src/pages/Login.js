// Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import './auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/auth/local', {
        identifier: email,
        password,
      });
      onLogin(response.data.jwt);
      alert('Giriş Başarılı!');
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      alert('Giriş Başarısız!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Giriş Yap</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Giriş Yap</button>
        </form>
        <p className="auth-redirect">
          Hesabınız yok mu? <Link to="/register" className="auth-link">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
