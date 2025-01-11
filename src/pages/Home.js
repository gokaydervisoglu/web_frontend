// Home.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import { faCheck, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const Home = ({ userId, addToCart }) => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = selectedCategory
          ? `/api/products?filters[categories][id][$eq]=${selectedCategory}`
          : '/api/products';
        const response = await API.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data.data);
      } catch (err) {
        console.error('Ürünler yüklenirken bir hata oluştu:', err);
      }
    };

    fetchProducts();
  }, [userId, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data.data);
      } catch (err) {
        console.error('Kategoriler alınırken bir hata oluştu:', err);
      }
    };

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/favorites?populate=*&filters[user][id][$eq]=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const favoriteProductIds = response.data.data
          .map((fav) => fav.product?.id)
          .filter(Boolean);
        setFavorites(favoriteProductIds);
      } catch (err) {
        console.error('Favoriler alınırken hata:', err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/api/campaigns?populate=*', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns(response.data.data);
      } catch (err) {
        console.error('Kampanyalar yüklenirken bir hata oluştu:', err);
      }
    };

    fetchCategories();
    fetchFavorites();
    fetchCampaigns();
  }, [userId]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleToggleFavorite = async (productId) => {
    const isFavorite = favorites.includes(productId);

    try {
      const token = localStorage.getItem('token');

      if (isFavorite) {
        const favoriteToRemove = await API.get(
          `/api/favorites?filters[user][id][$eq]=${userId}&filters[product][id][$eq]=${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (favoriteToRemove.data.data.length > 0) {
          const favoriteDocumentId = favoriteToRemove.data.data[0].documentId;
          await API.delete(`/api/favorites/${favoriteDocumentId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setFavorites((prev) => prev.filter((id) => id !== productId));
          showAlert('Ürün favorilerden kaldırıldı!');
        }
      } else {
        const response = await API.post(
          '/api/favorites',
          {
            data: {
              user: userId,
              product: productId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          setFavorites((prev) => [...prev, productId]);
          showAlert('Ürün favorilere eklendi!');
        }
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata:', err);
      showAlert('Favori işlemi sırasında bir hata oluştu.', 'warning');
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  /*DUZELTME*/
  const handleAddToCart = (product) => {
    if (!userId) {
      showAlert("Sepete ürün eklemek için giriş yapmalısınız.", "warning");
      navigate("/login");
      return;
    }
  
    const quantity = quantities[product.id] || 1;
    const productWithQuantity = { ...product, quantity };
    addToCart(productWithQuantity);
    showAlert(`${quantity} adet ${product.product_name} sepete eklendi.`);
  };

  const handleGoToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Kampanya Detayına Git
  const handleGoToCampaignDetail = (campaignDocumentId) => {
    navigate(`/campaign/${campaignDocumentId}`);
  };
  

  return (
    <div>
      {/* Alert komponenti */}
      {alert && (
        <div className="alert-overlay">
          <div className={`alert ${alert.type}`}>
            <FontAwesomeIcon 
              icon={alert.type === 'success' ? faCheck : faExclamationTriangle} 
              className="alert-icon"
            />
            <div className="alert-content">
              <p className="alert-message">{alert.message}</p>
            </div>
            <button 
              className="alert-close"
              onClick={() => setAlert(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      {/* Kampanyalar */}
      <div className="campaigns-container">
        <h2 className="section-title">Kampanyalar</h2>
        <div className="campaigns-row">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => {
              const { campaign_image, campaign_description, documentId } = campaign;
              const imageFormats = campaign_image?.formats || {};
              const thumbnail = imageFormats.thumbnail?.url || campaign_image?.url;
              const imageUrl = `http://localhost:1337${thumbnail}`;
              const description = campaign_description || 'Kampanya';

              return (
                <div
                  key={documentId}
                  className="campaign-item"
                  onClick={() => handleGoToCampaignDetail(documentId)}
                >
                  <div className="campaign-card">
                    <img src={imageUrl} alt={description} className="campaign-image" />
                    <div className="campaign-overlay">
                      <h3 className="campaign-title">{description}</h3>
                      <span className="campaign-details">Detaylar için tıklayın</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">Kampanya bulunmamaktadır.</p>
          )}
        </div>
      </div>

      {/* Kategoriler bölümü güncellemesi */}
      <div className="categories-section">
        <div className="container">
          <h2 className="section-title">Kategoriler</h2>
          <div className="categories-row">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            >
              Tümü
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
      </div>

      {/* Ürünler bölümü güncellemesi */}
      <div className="products-section">
        <div className="container">
          <h2 className="section-title">Ürünler</h2>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-header">
                    <h3 
                      className="product-title"
                      onClick={() => handleGoToDetail(product.id)}
                    >
                      {product.product_name}
                    </h3>
                    <button
                      className="favorite-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={favorites.includes(product.id) ? solidHeart : regularHeart}
                        className={favorites.includes(product.id) ? 'favorite-active' : ''}
                      />
                    </button>
                  </div>
                  
                  <div className="product-content" onClick={() => handleGoToDetail(product.id)}>
                    <div className="product-price">₺{product.price}</div>
                    
                    <div className="product-actions">
                      <div className="quantity-control">
                        <input
                          type="number"
                          min="1"
                          value={quantities[product.id] || 1}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value, 10))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <button 
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Yükleniyor...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;