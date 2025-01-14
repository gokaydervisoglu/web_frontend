// Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import '../styles/auth.css';
import Popup from '../components/Popup';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const doRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showPopup('Şifreler eşleşmiyor!', 'error');
      return;
    }

    try {
      await API.post('/api/auth/local/register', {
        username,
        email,
        password,
      });
      showPopup('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      if (error.response?.data?.error?.message) {
        showPopup(`Kayıt başarısız: ${error.response.data.error.message}`, 'error');
      } else {
        showPopup('Kayıt işlemi başarısız! Lütfen bilgilerinizi kontrol edin.', 'error');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Kayıt Ol</h2>
        <form className="auth-form" onSubmit={doRegister}>
          <div className="input-group">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
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
          <div className="input-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Şifreyi Tekrar Girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Kayıt Ol</button>
        </form>
        <p className="auth-redirect">
          Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yap</Link>
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

export default Register;
