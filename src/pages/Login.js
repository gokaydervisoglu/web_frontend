// Login.js
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../components/Toast';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/auth/local', {
        identifier: email,
        password,
      });

      console.log('Login successful:', response.data);
      // Giriş başarılı ise token'i App.js'deki handleLogin'e gönder
      onLogin(response.data.jwt);
      alert('Giriş Başarılı!');

      // Giriş başarılı olduktan sonra Home ("/") sayfasına yönlendir
      navigate('/');
    } catch (error) {
      console.error(
        'Login error:',
        error.response ? error.response.data : error.message
      );
      alert('Giriş Başarısız!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Hoş Geldiniz</h1>
          <p>Hesabınıza giriş yapın</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            <FontAwesomeIcon icon={faSignInAlt} />
            Giriş Yap
          </button>
        </form>

        <p className="auth-redirect">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="auth-link">
            Hemen kayıt olun
          </Link>
        </p>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default Login;
