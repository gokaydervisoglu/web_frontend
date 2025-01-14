import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/Favorites.css';
import Popup from '../components/Popup';

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(`/api/favorites?populate=*&filters[user][id][$eq]=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(response.data.data);
      } catch (err) {
        console.error('Favoriler alınırken hata:', err);
        showPopup('Favoriler yüklenirken bir hata oluştu.', 'error');
      }
    };

    getFavorites();
  }, [userId]);

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
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

        setFavorites(prevFavorites => 
          prevFavorites.filter(favorite => favorite.product.id !== productId)
        );
        
        showPopup('Ürün favorilerden kaldırıldı!', 'success');
      }
    } catch (err) {
      console.error('Favori silme işlemi sırasında hata:', err);
      showPopup('Favori silme işlemi sırasında bir hata oluştu.', 'error');
    }
  };

  const goToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="favorites-container">
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <h1>Favorilerim</h1>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-card">
              <h2 
                onClick={() => goToDetail(favorite.product?.id)}
                style={{ cursor: 'pointer' }}
                className="product-title"
              >
                {favorite.product?.product_name || 'Ürün bilgisi eksik'}
              </h2>
              <div className="favorite-info">
                <p className="price">
                  Fiyat: {favorite.product?.price ? `₺${favorite.product.price}` : 'Bilgi yok'}
                </p>
                <p className="stock">
                  Stok: {favorite.product?.stock_quantity ?? 'Bilgi yok'}
                </p>
              </div>
              <button 
                onClick={() => removeFavorite(favorite.product?.id)}
                className="fav-remove-button"
              >
                Favorilerden Kaldır
              </button>
            </div>
          ))
        ) : (
          <p className="no-favorites">Favori ürününüz bulunmamaktadır.</p>
        )}
      </div>

      <Popup
        isOpen={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </div>
  );
};

export default Favorites;
