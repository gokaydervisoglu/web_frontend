import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMapMarkerAlt, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import '../styles/Payment.css';
import Popup from '../components/Popup';

const Payment = ({ userId }) => {
  const { state } = useLocation();
  const cart = state?.cart || [];
  const navigate = useNavigate();

  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/user-addresses?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAddresses(response.data.data || []);
        console.log("Adresler:", response.data.data);
      } catch (err) {
        console.error('Adresler alınırken hata:', err);
      }
    };

    const savedCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/payment-methods?filters[users_permissions_user][id][$eq]=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSavedCards(response.data.data || []);
      } catch (err) {
        setError('Kart bilgileri yüklenirken bir hata oluştu.');
        console.error(err);
      }
    };

    const calculateTotalAmount = () => {
      const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity, 10) || 1;
        return sum + price * qty;
      }, 0);
      setTotalAmount(Number(total.toFixed(2)));
    };

    if (userId) {
      getAddresses();
      savedCards();
      calculateTotalAmount();
    }
  }, [userId, cart]);

  const createOrder = async (token) => {
    try {
      const response = await API.post(
        '/api/orders',
        {
          data: {
            users_permissions_user: userId,
            user_address: selectedAddress,
            order_status: 'Pending',
            total_amount: totalAmount,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newOrderId = response.data.data.id;
      return newOrderId;
    } catch (err) {
      console.error('Sipariş oluşturma sırasında hata:', err);
      throw err;
    }
  };

  const createOrderItems = async (orderId, token) => {
    try {
      for (const item of cart) {
        await API.post(
          '/api/order-items',
          {
            data: {
              order: orderId,
              products: item.id,
              quantity: item.quantity,
              unit_price: item.price,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Sipariş kalemleri eklenirken hata:', err);
      throw err;
    }
  };

  const updateProductStock = async (productId, quantity, token) => {
    try {
      // Önce ürünün mevcut stok bilgisini al
      const productResponse = await API.get(`/api/products?filters[id][$eq]=${productId}&populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const product = productResponse.data.data[0];
      const currentStock = product.stock_quantity;
      const newStock = currentStock - quantity;

      // Stok miktarını güncelle
      await API.put(
        `/api/products/${product.documentId}`,
        {
          data: {
            stock_quantity: newStock
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error(`Ürün stok güncellemesi sırasında hata (Ürün ID: ${productId}):`, err);
      throw err;
    }
  };

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const updateCardBalance = async () => {
    if (isProcessing) return;
    
    if (!selectedCard) {
      showPopup('Lütfen bir kart seçin.', 'error');
      return;
    }
    if (!selectedAddress) {
      showPopup('Lütfen bir adres seçin.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const paymentResponse = await API.get(
        `/api/payment-methods?filters[card_number][$eq]=${selectedCard.card_number}&filters[cvv][$eq]=${selectedCard.cvv}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const paymentMethod = paymentResponse.data.data[0];
      if (!paymentMethod) {
        showPopup('Geçersiz kart bilgileri!', 'error');
        return;
      }

      if (paymentMethod.unit_price < totalAmount) {
        showPopup('Kart bakiyesi yetersiz.', 'error');
        return;
      }

      // Kart bakiyesini güncelle
      const updatedBalance = paymentMethod.unit_price - totalAmount;
      await API.put(
        `/api/payment-methods/${paymentMethod.documentId}`,
        {
          data: {
            unit_price: updatedBalance,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sipariş oluştur
      const newOrderId = await createOrder(token);
      await createOrderItems(newOrderId, token);

      // Stok güncellemesi yap
      for (const item of cart) {
        await updateProductStock(item.id, item.quantity, token);
      }

      showPopup('Siparişiniz başarıyla oluşturuldu!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      console.error('İşlem sırasında hata oluştu:', err);
      showPopup('İşlem sırasında bir hata oluştu!', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <h1 className="section-title">Ödeme Sayfası</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="payment-content">
        <div className="payment-section">
          <h2>
            <FontAwesomeIcon icon={faCreditCard} /> Kayıtlı Kartlar
          </h2>
          <div className="cards-list">
            {savedCards.length > 0 ? (
              savedCards.map((card) => (
                <div 
                  key={card.id} 
                  className={`card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="savedCard"
                    value={card.id}
                    onChange={() => setSelectedCard(card)}
                    checked={selectedCard?.id === card.id}
                  />
                  <label>
                    {`${card.card_holder_name}, **** **** **** ${card.card_number.slice(-4)}`}
                  </label>
                </div>
              ))
            ) : (
              <p className="no-data">Kayıtlı kart bulunamadı.</p>
            )}
          </div>
        </div>

        <div className="payment-section">
          <h2>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> Teslimat Adresi
          </h2>
          <div className="address-list">
            {addresses.length > 0 ? (
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="address-select"
              >
                <option value="">Adres Seçiniz</option>
                {addresses.map((addr) => {
                  const { id, address_title, city, district } = addr;
                  return (
                    <option key={id} value={id}>
                      {address_title} / {city || 'Bilinmeyen Şehir'} / {district || 'Bilinmeyen İlçe'}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="no-data">Kayıtlı adres bulunamadı.</p>
            )}
          </div>
        </div>

        <div className="payment-section">
          <h2>
            <FontAwesomeIcon icon={faMoneyBill} /> Sipariş Özeti
          </h2>
          <div className="order-summary">
            <div className="amount-display">
              <span>Toplam Tutar:</span>
              <span className="total-price">₺{totalAmount.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>
            </div>
          </div>
        </div>

        <button
          className="complete-payment-btn"
          onClick={updateCardBalance}
          disabled={!selectedCard || !selectedAddress || isProcessing}
        >
          <FontAwesomeIcon icon={faCreditCard} />
          {isProcessing ? 'İşlem Yapılıyor...' : 'Siparişi Tamamla'}
        </button>
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

export default Payment;
