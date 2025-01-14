// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import '../styles/auth.css';
import Popup from '../components/Popup';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const doLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/auth/local', {
        identifier: email,
        password,
      });
      onLogin(response.data.jwt);
      showPopup('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      if (error.response?.data?.error?.message) {
        showPopup(`Giriş başarısız: ${error.response.data.error.message}`, 'error');
      } else {
        showPopup('Giriş işlemi başarısız! Lütfen bilgilerinizi kontrol edin.', 'error');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Giriş Yap</h2>
        <form className="auth-form" onSubmit={doLogin}>
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

      <Popup
        isOpen={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </div>
  );
};

export default Login;
