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
import './styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faUserPlus, 
  faHeart, 
  faShoppingCart, 
  faUser, 
  faChevronDown,
  faBox,
  faMapMarkerAlt,
  faCreditCard,
  faSignOutAlt,
  faBars
} from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [cart, setCart] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setActiveDropdown(!activeDropdown);
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              <span className="brand-text">E-Gokay</span>
            </Link>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              <FontAwesomeIcon icon={faBars} />
            </button>

            <div className={`navbar-content ${isMobileMenuOpen ? 'active' : ''}`}>
              {!isLoggedIn ? (
                <div className="auth-buttons">
                  <Link to="/login" className="nav-button">
                    <i className="fas fa-sign-in-alt"></i> Giriş
                  </Link>
                  <Link to="/register" className="nav-button">
                    <i className="fas fa-user-plus"></i> Kayıt
                  </Link>
                </div>
              ) : (
                <div className="nav-items">
                  <Link to="/favorites" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faHeart} />
                    <span className="nav-text">Favoriler</span>
                  </Link>
                  
                  <Link to="/cart" className="nav-item cart-item" onClick={() => setIsMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <span className="nav-text">Sepet</span>
                    {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                  </Link>
                  
                  <div className={`nav-dropdown ${activeDropdown ? 'active' : ''}`}>
                    <button className="nav-dropdown-btn" onClick={toggleDropdown}>
                      <FontAwesomeIcon icon={faUser} />
                      <span className="nav-text">{username}</span>
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                    <div className="dropdown-content">
                      <Link to="/orders" className="dropdown-item">
                        <i className="fas fa-box"></i> Siparişlerim
                      </Link>
                      <Link to="/addresses" className="dropdown-item">
                        <i className="fas fa-map-marker-alt"></i> Adreslerim
                      </Link>
                      <Link to="/payment-methods" className="dropdown-item">
                        <i className="fas fa-credit-card"></i> Ödeme Yöntemlerim
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item logout-btn">
                        <i className="fas fa-sign-out-alt"></i> Çıkış
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

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
