import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Favorites.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShoppingCart,
  faBoxOpen,
  faMoneyBill,
  faWarehouse,
  faTrash,
  faCheck,
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
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

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleRemoveFavorite = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/favorites/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(prev => prev.filter(fav => fav.documentId !== documentId));
      showAlert('Ürün favorilerden kaldırıldı');
    } catch (err) {
      console.error('Favori silinirken hata:', err);
      showAlert('Favori silinirken bir hata oluştu', 'warning');
    }
  };

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="fav-detail-container">
        <div className="fav-detail-loading">
          <div className="fav-detail-spinner"></div>
          <p>Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fav-detail-container">
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

      <div className="fav-detail-header">
        <h1 className="fav-detail-title">
          <FontAwesomeIcon icon={faHeart} className="fav-detail-icon" />
          Favorilerim
        </h1>
      </div>

      {error && <div className="fav-detail-error">{error}</div>}

      <div className="fav-detail-grid">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div className="fav-detail-card" key={favorite.id}>
              <div className="fav-detail-content" onClick={() => handleNavigateToProduct(favorite.product?.id)}>
                <div className="fav-detail-info">
                  <h2 className="fav-detail-name">{favorite.product?.product_name || 'Ürün bilgisi eksik'}</h2>
                  <button
                    className="fav-detail-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.documentId);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <div className="fav-detail-stats">
                  <div className="fav-detail-stat-item">
                    <FontAwesomeIcon icon={faMoneyBill} className="fav-detail-stat-icon" />
                    <span className="fav-detail-price">
                      {favorite.product?.price ? `₺${favorite.product.price}` : 'Bilgi yok'}
                    </span>
                  </div>

                  <div className="fav-detail-stat-item">
                    <FontAwesomeIcon icon={faWarehouse} className="fav-detail-stat-icon" />
                    <span>
                      Stok: {favorite.product?.stock_quantity ?? 'Bilgi yok'}
                    </span>
                  </div>
                </div>

                <div className="fav-detail-actions">
                  <button className="fav-detail-btn fav-detail-btn-view">
                    <FontAwesomeIcon icon={faBoxOpen} /> Ürün Detayı
                  </button>
                  <button className="fav-detail-btn fav-detail-btn-cart">
                    <FontAwesomeIcon icon={faShoppingCart} /> Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="fav-detail-empty">
            <FontAwesomeIcon icon={faHeart} className="fav-detail-empty-icon" />
            <p className="fav-detail-empty-text">Henüz favori ürününüz bulunmuyor.</p>
            <button className="fav-detail-browse" onClick={() => navigate('/')}>
              Ürünleri Keşfet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
