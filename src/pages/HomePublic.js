// HomePublic.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';

const HomePublic = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
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
        <div className="row">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="home-product" key={product.id}>
                <h2>{product.product_name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p>Fiyat: ₺{product.price}</p>
                </div>
                <button onClick={addToCart}>Sepete Ekle</button>
              </div>
            ))
          ) : (
            <p>Yükleniyor...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePublic;
