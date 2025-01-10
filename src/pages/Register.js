// Register.js
import React, { useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import './Auth.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../components/Toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/auth/local/register', {
        username,
        email,
        password,
      });
      console.log('User registered:', response.data);
      alert('Kayıt Başarılı!');
    } catch (error) {
      console.error(
        'Registration error:',
        error.response ? error.response.data : error.message
      );
      alert('Kayıt Başarısız!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Kayıt Ol</h1>
          <p>Yeni bir hesap oluşturun</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
            <FontAwesomeIcon icon={faUserPlus} />
            Kayıt Ol
          </button>
        </form>

        <p className="auth-redirect">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="auth-link">
            Giriş yapın
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

export default Register;
