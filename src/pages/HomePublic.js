// HomePublic.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const HomePublic = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const endpoint = selectedCategory
          ? `/api/products?filters[categories][id][$eq]=${selectedCategory}&populate=*`
          : '/api/products?populate=*';
        const response = await API.get(endpoint);
        setProducts(response.data.data);
      } catch (err) {
        console.error('Ürünler yüklenirken bir hata oluştu:', err);
      }
    };

    getProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await API.get('/api/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.error('Kategoriler alınırken bir hata oluştu:', err);
      }
    };

    getCategories();
  }, []);

  const addToCart = () => {
    alert('Sepete ürün eklemek için giriş yapmalısınız.');
    navigate('/login');
  };

  return (
    <div>
      <div className="category-button">
        <div className="container">
          <div className="category-row">
            <button
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? 'active-category' : ''}
            >
              Tümü
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 'active-category' : ''}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="home-product" key={product.id}>
                <div className="product-image">
                  {product.image_url?.[0] ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${product.image_url[0].formats?.thumbnail?.url || product.image_url[0].url}`}
                      alt={product.product_name}
                      className="product-thumbnail"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <FontAwesomeIcon icon={faImage} size="2x" />
                    </div>
                  )}
                </div>

                <h2>{product.product_name}</h2>
                <div className="price-quantity-container">
                  <p className="price-tag">₺{product.price}</p>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={addToCart}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Sepete Ekle
                </button>
              </div>
            ))
          ) : (
            <p className="loading-text">Yükleniyor...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePublic;
