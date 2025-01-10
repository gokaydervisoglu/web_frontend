import React, { useState, useEffect } from 'react';
import API from '../api';
import './PaymentMethods.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faPlus,
  faTrash,
  faTimes,
  faUser,
  faCalendarAlt,
  faLock
} from '@fortawesome/free-solid-svg-icons';

const PaymentMethods = ({ userId }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newCard, setNewCard] = useState({
    card_holder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    unit_price: 10000, // Varsayılan bakiye
  });
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [userId]);

  const fetchPaymentMethods = async () => {
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
      setPaymentMethods(response.data.data);
    } catch (err) {
      console.error('Ödeme yöntemleri alınırken hata:', err);
      setError('Ödeme yöntemleri alınırken bir hata oluştu.');
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await API.post(
        '/api/payment-methods',
        {
          data: {
            ...newCard,
            users_permissions_user: userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Kart başarıyla eklendi!');
        setPaymentMethods((prev) => [...prev, response.data.data]);
        setNewCard({
          card_holder_name: '',
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          unit_price: 10000,
        });
        setIsPopupOpen(false);
      }
    } catch (err) {
      console.error('Kart eklenirken hata:', err.response?.data || err.message);
      alert('Kart eklenirken bir hata oluştu.');
    }
  };

  const handleDeletePaymentMethod = async (documentId) => {
    if (window.confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/api/payment-methods/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Kart başarıyla silindi!');
        setPaymentMethods((prev) => prev.filter((method) => method.documentId !== documentId));
      } catch (err) {
        console.error('Kart silinirken hata:', err);
        alert('Kart silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="payment-methods-container">
      <div className="payment-methods-header">
        <h1>
          <FontAwesomeIcon icon={faCreditCard} className="header-icon" />
          Kayıtlı Kartlar
        </h1>
        <button className="add-card-btn" onClick={() => setIsPopupOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Yeni Kart Ekle
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cards-grid">
        {paymentMethods.map((method) => (
          <div className="card-item" key={method.id}>
            <div className="card-content">
              <div className="card-type">
                <FontAwesomeIcon icon={faCreditCard} className="card-icon" />
              </div>
              <div className="card-number">
                **** **** **** {method.card_number.slice(-4)}
              </div>
              <div className="card-details">
                <div className="card-holder">
                  <span className="label">Kart Sahibi</span>
                  <span className="value">{method.card_holder_name}</span>
                </div>
                <div className="card-expiry">
                  <span className="label">Son Kullanma</span>
                  <span className="value">{method.expiry_month}/{method.expiry_year}</span>
                </div>
              </div>
              <div className="card-balance">
                <span className="label">Bakiye</span>
                <span className="value">₺{method.unit_price}</span>
              </div>
            </div>
            <button
              className="delete-card-btn"
              onClick={() => handleDeletePaymentMethod(method.documentId)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="no-cards">
          <FontAwesomeIcon icon={faCreditCard} className="no-cards-icon" />
          <p>Henüz kayıtlı bir kart bulunmuyor.</p>
        </div>
      )}

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Yeni Kart Ekle</h2>
              <button className="close-btn" onClick={() => setIsPopupOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleAddPaymentMethod} className="card-form">
              <div className="form-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  placeholder="Kart Sahibinin Adı"
                  value={newCard.card_holder_name}
                  onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <FontAwesomeIcon icon={faCreditCard} className="input-icon" />
                <input
                  type="text"
                  placeholder="Kart Numarası"
                  value={newCard.card_number}
                  onChange={(e) => setNewCard({ ...newCard, card_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Ay (MM)"
                    value={newCard.expiry_month}
                    onChange={(e) => setNewCard({ ...newCard, expiry_month: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Yıl (YY)"
                    value={newCard.expiry_year}
                    onChange={(e) => setNewCard({ ...newCard, expiry_year: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Kartı Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
