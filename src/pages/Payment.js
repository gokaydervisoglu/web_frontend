import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import './Payment.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faMapMarkerAlt,
  faMoneyBill,
  faCheck,
  faArrowLeft,
  faShoppingCart,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../components/Toast';

const Payment = ({ userId }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cart = state?.cart || [];

  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        setError('Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedCards = async () => {
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
      setTotalAmount(total);
    };

    if (userId) {
      fetchData();
      fetchSavedCards();
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePayment = async () => {
    if (!selectedCard || !selectedAddress) {
      showToast('Lütfen kart ve adres seçimi yapınız.', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const paymentResponse = await API.get(
        `/api/payment-methods?filters[card_number][$eq]=${selectedCard.card_number}&filters[cvv][$eq]=${selectedCard.cvv}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentMethod = paymentResponse.data.data[0];
      if (!paymentMethod) {
        showToast('Geçersiz kart bilgileri!', 'error');
        return;
      }

      if (paymentMethod.unit_price < totalAmount) {
        showToast('Kart bakiyesi yetersiz!', 'error');
        return;
      }

      // Kart bakiyesi güncelleme
      await API.put(
        `/api/payment-methods/${paymentMethod.documentId}`,
        {
          data: {
            unit_price: paymentMethod.unit_price - totalAmount,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sipariş oluşturma
      const newOrderId = await createOrder(token);
      await createOrderItems(newOrderId, token);

      showToast('Siparişiniz başarıyla oluşturuldu!', 'success');
      
      // 2 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Ödeme işlemi sırasında hata:', err);
      showToast('Ödeme işlemi sırasında bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>
          <FontAwesomeIcon icon={faCreditCard} className="header-icon" />
          Ödeme İşlemi
        </h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Geri Dön
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {error}
        </div>
      )}

      <div className="payment-content">
        <div className="payment-details">
          <section className="payment-section">
            <h2>
              <FontAwesomeIcon icon={faCreditCard} />
              Kayıtlı Kartlar
            </h2>
            <div className="cards-grid">
              {savedCards.length > 0 ? (
                savedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-info">
                      <span className="card-number">
                        **** **** **** {card.card_number.slice(-4)}
                      </span>
                      <span className="card-name">{card.card_holder_name}</span>
                    </div>
                    {selectedCard?.id === card.id && (
                      <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">Kayıtlı kart bulunamadı.</p>
              )}
            </div>
          </section>

          <section className="payment-section">
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Teslimat Adresi
            </h2>
            <div className="addresses-grid">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-item ${selectedAddress === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr.id)}
                  >
                    <div className="address-info">
                      <h3>{addr.address_title}</h3>
                      <p>{addr.city} / {addr.district}</p>
                      <p>{addr.street}</p>
                    </div>
                    {selectedAddress === addr.id && (
                      <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">Kayıtlı adres bulunamadı.</p>
              )}
            </div>
          </section>
        </div>

        <div className="order-summary">
          <h2>
            <FontAwesomeIcon icon={faShoppingCart} />
            Sipariş Özeti
          </h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div key={item.id} className="summary-item">
                <span>{item.product_name} x {item.quantity}</span>
                <span>₺{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="total-amount">
            <FontAwesomeIcon icon={faMoneyBill} />
            <span>Toplam Tutar:</span>
            <span className="amount">₺{totalAmount}</span>
          </div>
          <button
            className="pay-btn"
            onClick={handlePayment}
            disabled={!selectedCard || !selectedAddress}
          >
            <FontAwesomeIcon icon={faCreditCard} />
            Ödemeyi Tamamla
          </button>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>İşleminiz gerçekleştiriliyor...</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
