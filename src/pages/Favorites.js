import React, { useState, useEffect } from 'react';
import API from '../api';
import './Favorites.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShoppingCart,
  faBoxOpen,
  faMoneyBill,
  faWarehouse,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get(`/api/favorites?populate=*&filters[user][id][$eq]=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(response.data.data);
    } catch (err) {
      console.error('Favoriler alınırken hata:', err);
      setError('Favoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (documentId) => {
    if (window.confirm('Bu ürünü favorilerinizden kaldırmak istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/api/favorites/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(prev => prev.filter(fav => fav.documentId !== documentId));
      } catch (err) {
        console.error('Favori silinirken hata:', err);
        setError('Favori silinirken bir hata oluştu.');
      }
    }
  };

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>
          <FontAwesomeIcon icon={faHeart} className="header-icon" />
          Favorilerim
        </h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div className="favorite-card" key={favorite.id}>
              <div className="favorite-content" onClick={() => handleNavigateToProduct(favorite.product?.id)}>
                <div className="favorite-header">
                  <h2>{favorite.product?.product_name || 'Ürün bilgisi eksik'}</h2>
                  <button
                    className="remove-favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.documentId);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <div className="favorite-details">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faMoneyBill} className="detail-icon" />
                    <span className="price">
                      {favorite.product?.price ? `₺${favorite.product.price}` : 'Bilgi yok'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faWarehouse} className="detail-icon" />
                    <span>
                      Stok: {favorite.product?.stock_quantity ?? 'Bilgi yok'}
                    </span>
                  </div>
                </div>

                <div className="favorite-actions">
                  <button className="action-btn view-btn">
                    <FontAwesomeIcon icon={faBoxOpen} /> Ürün Detayı
                  </button>
                  <button className="action-btn cart-btn">
                    <FontAwesomeIcon icon={faShoppingCart} /> Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-favorites">
            <FontAwesomeIcon icon={faHeart} className="no-favorites-icon" />
            <p>Henüz favori ürününüz bulunmuyor.</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Ürünleri Keşfet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
