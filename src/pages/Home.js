// Home.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as solidHeart, 
  faShoppingCart, 
  faTags, 
  faListAlt,
  faImage,
  faStar,
  faCrown
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
  const [quantities, setQuantities] = useState(() => {
    // Sayfa yüklendiğinde localStorage'dan quantities'i al
    const savedQuantities = localStorage.getItem('productQuantities');
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topFavoriteProducts, setTopFavoriteProducts] = useState([]);

  const navigate = useNavigate();

  // quantities değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('productQuantities', JSON.stringify(quantities));
  }, [quantities]);

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
          ? `/api/products?filters[categories][id][$eq]=${selectedCategory}&populate=*`
          : '/api/products?populate=*';
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

  const toggleFavorite = async (productId) => {
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

  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/api/products?filters[id][$eq]=${productId}&populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const currentStock = response.data.data[0].stock_quantity;
      const cartItem = cart.find(item => item.id === productId);
      const currentCartQuantity = cartItem ? cartItem.quantity : 0;
      const remainingStock = currentStock - currentCartQuantity;

      if (remainingStock <= 0) {
        showPopup(`Bu ürün için sepetinizde maksimum adete (${currentStock}) ulaştınız.`, 'error');
        setQuantities((prev) => {
          const newQuantities = { ...prev, [productId]: 0 };
          localStorage.setItem('productQuantities', JSON.stringify(newQuantities));
          return newQuantities;
        });
        return;
      }

      const maxAllowedQuantity = Math.min(remainingStock, 10);
      const newQuantity = Math.min(Math.max(1, quantity), maxAllowedQuantity);

      if (quantity > maxAllowedQuantity) {
        showPopup(`Sepetinizde ${currentCartQuantity} adet var. En fazla ${maxAllowedQuantity} adet daha ekleyebilirsiniz.`, 'info');
      }

      setQuantities((prev) => {
        const newQuantities = { ...prev, [productId]: newQuantity };
        localStorage.setItem('productQuantities', JSON.stringify(newQuantities));
        return newQuantities;
      });
    } catch (err) {
      console.error('Stok kontrolü sırasında hata:', err);
      showPopup('Stok kontrolü sırasında bir hata oluştu.', 'error');
    }
  };

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const addToCartItem = async (product) => {
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

  const goToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Kampanya Detayına Git
  const goToCampaignDetail = (campaignDocumentId) => {
    navigate(`/campaign/${campaignDocumentId}`);
  };

  // En çok satan ürünleri bulma fonksiyonu
  const fetchTopSellingProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/api/order-items?populate=*', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ürün satış sayılarını ve toplam satış miktarını hesapla
      const productStats = {};
      response.data.data.forEach(orderItem => {
        if (orderItem.products && orderItem.products[0]) {
          const productId = orderItem.products[0].id;
          if (!productStats[productId]) {
            productStats[productId] = {
              totalQuantity: 0,  // Toplam satış miktarı
              orderCount: 0,     // Kaç farklı siparişte satıldı
              totalAmount: 0     // Toplam kazanç
            };
          }
          productStats[productId].totalQuantity += orderItem.quantity;
          productStats[productId].orderCount += 1;
          productStats[productId].totalAmount += orderItem.quantity * orderItem.unit_price;
        }
      });

      // Popülerlik skorunu hesapla
      // (toplam satış miktarı * 0.4) + (sipariş sayısı * 0.4) + (toplam kazanç * 0.2)
      const popularityScores = Object.entries(productStats).map(([id, stats]) => ({
        id: parseInt(id),
        score: (stats.totalQuantity * 0.4) + 
               (stats.orderCount * 0.4) + 
               ((stats.totalAmount / 1000) * 0.2) 
      }));

      // En yüksek skora sahip 2 ürünü seç
      const topProducts = popularityScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(product => product.id);

      // Eğer yeterli veri yoksa boş array döndür
      if (topProducts.length === 0) {
        console.log('Henüz yeterli satış verisi yok');
        setTopSellingProducts([]);
        return;
      }

      console.log('En popüler ürünler:', topProducts);
      console.log('Popülerlik istatistikleri:', productStats);
      
      setTopSellingProducts(topProducts);
    } catch (err) {
      console.error('En çok satan ürünler alınırken hata:', err);
      setTopSellingProducts([]);
    }
  };

  // En çok favorilenen ürünleri bulma fonksiyonu
  const fetchTopFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      // Tüm kullanıcıların favorilerini al
      const response = await API.get('/api/favorites?populate=*', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ürünlerin favori sayılarını hesapla
      const favoriteCounts = {};
      response.data.data.forEach(favorite => {
        if (favorite.product?.id) {
          const productId = favorite.product.id;
          if (!favoriteCounts[productId]) {
            favoriteCounts[productId] = {
              count: 0,
              name: favorite.product.product_name 
            };
          }
          favoriteCounts[productId].count += 1;
        }
      });

      // Favori sayılarına göre sırala ve en çok favorilenen 2 ürünü al
      const sortedProducts = Object.entries(favoriteCounts)
        .sort(([, a], [, b]) => b.count - a.count) 
        .slice(0, 2)
        .map(([id, data]) => ({
          id: parseInt(id),
          count: data.count,
          name: data.name
        }));

      console.log('En çok favorilenen ürünler:', sortedProducts);

      if (sortedProducts.length === 0) {
        console.log('Henüz favori ürün yok');
        setTopFavoriteProducts([]);
        return;
      }

      setTopFavoriteProducts(sortedProducts.map(product => product.id));
    } catch (err) {
      console.error('En çok favorilenen ürünler alınırken hata:', err);
      setTopFavoriteProducts([]);
    }
  };

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  useEffect(() => {
    fetchTopFavorites();
  }, []);

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
              const imageUrl = `${process.env.REACT_APP_API_URL}${thumbnail}`;
              const description = campaign_description || 'Kampanya';

              return (
                <div
                  key={documentId}
                  className="campaign-item-home"
                  onClick={() => goToCampaignDetail(documentId)}

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
            <div 
              className={`home-product ${
                topSellingProducts.includes(product.id) && topFavoriteProducts.includes(product.id)
                  ? 'super-product'
                  : topSellingProducts.includes(product.id)
                  ? 'top-selling'
                  : topFavoriteProducts.includes(product.id)
                  ? 'top-favorite'
                  : ''
              }`} 
              key={product.id}
            >
              {topSellingProducts.includes(product.id) && topFavoriteProducts.includes(product.id) ? (
                <div className="super-product-badge">
                  <FontAwesomeIcon icon={faCrown} /> Popüler Ürün
                </div>
              ) : (
                <>
                  {topSellingProducts.includes(product.id) && (
                    <div className="top-selling-badge">
                      <FontAwesomeIcon icon={faStar} /> En Çok Satan
                    </div>
                  )}
                  {topFavoriteProducts.includes(product.id) && (
                    <div className="top-favorite-badge">
                      <FontAwesomeIcon icon={solidHeart} /> En Çok Favorilenen
                    </div>
                  )}
                </>
              )}
              <button
                className="favorite-btn"
                onClick={() => toggleFavorite(product.id)}
              >
                <FontAwesomeIcon
                  icon={favorites.includes(product.id) ? solidHeart : regularHeart}
                  color={favorites.includes(product.id) ? 'red' : 'grey'}
                  size="lg"
                />
              </button>

              <div className="product-image" onClick={() => goToDetail(product.id)}>
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

              <h2 onClick={() => goToDetail(product.id)}>
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
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value, 10))}
                    className="quantity-input"
                  />
                </div>
              </div>

              <button 
                className="add-to-cart-btn"
                onClick={() => addToCartItem(product)}
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