import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import HomePublic from './pages/HomePublic';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import PaymentMethods from './pages/PaymentMethods';
import ProductDetail from './pages/ProductDetail';
import CampaignDetail from './pages/CampaignDetail';
import API from './api';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart, faClipboardList, faMapMarkerAlt, faCreditCard, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserId();
    }
  }, []);

  const fetchUserId = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserId(response.data.id);
      setUsername(response.data.username);
    } catch (err) {
      console.error('Kullanıcı bilgisi alınamadı:', err);
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    fetchUserId();
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserId(null);
      setCart([]);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              e-gokay
            </Link>

            {/* Desktop Menu */}
            <ul className="desktop-nav">
              {!isLoggedIn ? (
                <>
                  <li><Link to="/login">Giriş Yap</Link></li>
                  <li><Link to="/register">Kayıt Ol</Link></li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/favorites" onClick={toggleMenu}>
                      <FontAwesomeIcon icon={faHeart} /> Favoriler
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="cart-link" onClick={toggleMenu}>
                      <FontAwesomeIcon icon={faShoppingCart} /> 
                      Sepet ({cart.length})
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={toggleMenu}>
                      <FontAwesomeIcon icon={faClipboardList} /> Siparişler
                    </Link>
                  </li>
                  <li>
                    <Link to="/addresses" onClick={toggleMenu}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> Adresler
                    </Link>
                  </li>
                  <li>
                    <Link to="/payment-methods" onClick={toggleMenu}>
                      <FontAwesomeIcon icon={faCreditCard} /> Ödeme Yöntemleri
                    </Link>
                  </li>
                  <li className="user-name">
                    <FontAwesomeIcon icon={faUser} /> {username}
                  </li>
                  <li className='logout-li'>
                    <button className="logout-button" onClick={handleLogout}>
                      Çıkış
                    </button>
                  </li>
                </>
              )}
            </ul>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <ul className="mobile-nav">
                {!isLoggedIn ? (
                  <>
                    <li><Link to="/login" onClick={toggleMenu}>Giriş Yap</Link></li>
                    <li><Link to="/register" onClick={toggleMenu}>Kayıt Ol</Link></li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/favorites" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faHeart} /> Favoriler
                      </Link>
                    </li>
                    <li>
                      <Link to="/cart" className="cart-link" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} /> 
                        Sepet ({cart.length})
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faClipboardList} /> Siparişler
                      </Link>
                    </li>
                    <li>
                      <Link to="/addresses" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Adresler
                      </Link>
                    </li>
                    <li>
                      <Link to="/payment-methods" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faCreditCard} /> Ödeme Yöntemleri
                      </Link>
                    </li>
                    <li className="user-name">
                      <FontAwesomeIcon icon={faUser} /> {username}
                    </li>
                    <li className='logout-li'>
                      <button className="logout-button" onClick={handleLogout}>
                        Çıkış
                      </button>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </nav>

        {/* Rotalar */}
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Home userId={userId} addToCart={addToCart} /> : <HomePublic />}
          />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/" /> : <Register />}
          />
          {isLoggedIn && (
            <>
              <Route path="/favorites" element={<Favorites userId={userId} />} />
              <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
              <Route path="/payment" element={<Payment userId={userId} cart={cart} />} />
              <Route path="/orders" element={<Orders userId={userId} />} />
              <Route path="/addresses" element={<Addresses userId={userId} />} />
              <Route path="/payment-methods" element={<PaymentMethods userId={userId} />} />
              <Route
                path="/product/:productId"
                element={<ProductDetail userId={userId} addToCart={addToCart} />}
              />
              <Route path="/campaign/:campaignId" element={<CampaignDetail />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
