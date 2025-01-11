// HomePublic.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/HomePublic.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faBoxOpen,
  faTag,
  faExclamationCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../components/Toast';

const HomePublic = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = selectedCategory
          ? `/api/products?filters[categories][id][$eq]=${selectedCategory}`
          : '/api/products';
        const response = await API.get(endpoint);
        setProducts(response.data.data);
      } catch (err) {
        console.error('Ürünler yüklenirken bir hata oluştu:', err);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/api/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.error('Kategoriler alınırken bir hata oluştu:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleAddToCart = () => {
    showToast('Sepete ürün eklemek için giriş yapmalısınız.', 'info');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="public-container">
      <div className="public-categories-section">
        <div className="public-categories-header">
          <FontAwesomeIcon icon={faFilter} className="categories-icon" />
          <h2>Kategoriler</h2>
        </div>
        <div className="categories-list">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
          >
            Tüm Ürünler
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            >
              {category.category_name}
            </button>
          ))}
        </div>
      </div>

      <div className="products-section">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <FontAwesomeIcon icon={faBoxOpen} className="product-icon" />
                </div>
                <div className="product-info">
                  <h3>{product.product_name}</h3>
                  <div className="product-meta">
                    <div className="price">
                      <FontAwesomeIcon icon={faTag} />
                      <span>₺{product.price}</span>
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Sepete Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Ürünler yükleniyor...</p>
          </div>
        )}
      </div>

      {toast.show && <Toast {...toast} onClose={() => setToast({ show: false, message: '', type: 'info' })} />}
    </div>
  );
};

export default HomePublic;
