// Home.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as solidHeart, 
  faShoppingCart, 
  faTags, 
  faListAlt 
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import Popup from '../components/Popup';

const Home = ({ userId, addToCart, cart }) => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Kategorileri al
        const categoriesResponse = await API.get('/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(categoriesResponse.data.data);

        // Favorileri al
        if (userId) {
          const favoritesResponse = await API.get(
            `/api/favorites?populate=*&filters[user][id][$eq]=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const favoriteProductIds = favoritesResponse.data.data
            .map((fav) => fav.product?.id)
            .filter(Boolean);
          setFavorites(favoriteProductIds);
        }

        // Kampanyaları al
        const campaignsResponse = await API.get('/api/campaigns?populate=*', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns(campaignsResponse.data.data);

      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
      }
    };

    fetchData();
  }, [userId]);

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
  }, [selectedCategory]);

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
          showPopup('Ürün favorilerden kaldırıldı!', 'info');
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
          showPopup('Ürün favorilere eklendi!', 'success');
        }
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata:', err);
      showPopup('Favori işlemi sırasında bir hata oluştu.', 'error');
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    // Limit quantity between 1 and 10
    const limitedQuantity = Math.min(Math.max(1, quantity), 10);
    setQuantities((prev) => ({ ...prev, [productId]: limitedQuantity }));
  };

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const handleAddToCart = async (product) => {
    if (!userId) {
      showPopup("Sepete ürün eklemek için giriş yapmalısınız.", "error");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/api/products?filters[id][$eq]=${product.id}&populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const currentStock = response.data.data[0].stock_quantity;
      const requestedQuantity = quantities[product.id] || 1;
      const cartItem = cart.find(item => item.id === product.id);
      const currentCartQuantity = cartItem ? cartItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

      if (totalRequestedQuantity > currentStock) {
        showPopup(`Stok yetersiz! (Mevcut: ${currentStock}, Sepette: ${currentCartQuantity})`, "error");
        return;
      }

      const productWithQuantity = { ...product, quantity: requestedQuantity };
      addToCart(productWithQuantity);
      showPopup(`${requestedQuantity} adet ${product.product_name} sepete eklendi.`, "success");
    } catch (err) {
      console.error('Sepete ekleme sırasında hata:', err);
      showPopup('Ürün sepete eklenirken bir hata oluştu.', "error");
    }
  };

  const handleGoToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Kampanya Detayına Git
  const handleGoToCampaignDetail = (campaignDocumentId) => {
    navigate(`/campaign/${campaignDocumentId}`);
  };
  

  return (
    <div className="container">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faTags} className="section-icon" /> Kampanyalar
      </h2>
      
      {/* Kampanyalar bölümü */}
      <div className="campaigns-container">
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
                  className="campaign-item-home"
                  onClick={() => handleGoToCampaignDetail(documentId)}

                >
                  <img src={imageUrl} alt={description} className="campaign-image-home" />
                </div>
              );
            })
          ) : (
            <p>Kampanya bulunmamaktadır.</p>
          )}
        </div>
      </div>

      <h2 className="section-title">
        <FontAwesomeIcon icon={faListAlt} className="section-icon" /> Kategoriler
      </h2>
      
      {/* Kategoriler bölümü */}
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

      <h2 className="section-title">Ürünlerimiz</h2>
      
      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="home-product" key={product.id}>
              <button
                className="favorite-btn"
                onClick={() => handleToggleFavorite(product.id)}
              >
                <FontAwesomeIcon
                  icon={favorites.includes(product.id) ? solidHeart : regularHeart}
                  color={favorites.includes(product.id) ? 'red' : 'grey'}
                  size="lg"
                />
              </button>

              <h2 onClick={() => handleGoToDetail(product.id)}>
                {product.product_name}
              </h2>

              <div className="price-quantity-container">
                <p className="price-tag">₺{product.price}</p>
                <div className="quantity-wrapper">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value, 10))}
                    className="quantity-input"
                  />
                </div>
              </div>

              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
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

      <Popup
        isOpen={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </div>
  );
};

export default Home;