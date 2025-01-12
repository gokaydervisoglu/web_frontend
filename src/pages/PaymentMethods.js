import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import './PaymentMethods.css';
import Popup from '../components/Popup';

const PaymentMethods = ({ userId }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newCard, setNewCard] = useState({
    card_holder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
  });
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
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
        showNotification('Ödeme yöntemleri alınırken bir hata oluştu.', 'error');
      }
    };

    if (userId) fetchPaymentMethods();
  }, [userId]);

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
            unit_price: 10000
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        showNotification('Kart başarıyla eklendi! Başlangıç bakiyesi: 10000 TL', 'success');
        setPaymentMethods((prev) => [...prev, response.data.data]);
        setNewCard({
          card_holder_name: '',
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
        });
        setIsPopupOpen(false);
      }
    } catch (err) {
      console.error('Kart eklenirken hata:', err.response?.data || err.message);
      showNotification('Kart eklenirken bir hata oluştu.', 'error');
    }
  };

  const handleDeletePaymentMethod = async (documentId) => {
    if (window.confirm('Bu ödeme yöntemini silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/api/payment-methods/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        showNotification('Kart başarıyla silindi!', 'success');
        setPaymentMethods((prev) => prev.filter((method) => method.documentId !== documentId));
      } catch (err) {
        console.error('Kart silinirken hata:', err);
        showNotification('Kart silinirken bir hata oluştu.', 'error');
      }
    }
  };

  return (
    <div className="payment-methods-container">
      <h1 className="section-title">
        <FontAwesomeIcon icon={faCreditCard} /> Kayıtlı Kartlarım
      </h1>
      {error && <p className="error-message">{error}</p>}

      <button className="add-button" onClick={() => setIsPopupOpen(true)}>
        <FontAwesomeIcon icon={faPlus} /> Yeni Kart Ekle
      </button>

      <div className="cards-list">
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div key={method.documentId} className="card-item">
              <div className="card-info">
                <FontAwesomeIcon icon={faCreditCard} className="card-icon" />
                <div className="card-details">
                  <h3>{method.card_holder_name}</h3>
                  <p>**** **** **** {method.card_number.slice(-4)}</p>
                  <p className="expiry">Son Kullanma: {method.expiry_month}/{method.expiry_year}</p>
                  <p className="balance">Bakiye: ₺{method.unit_price?.toLocaleString('tr-TR') || '0'}</p>
                </div>
              </div>
              <button
                className="pay-delete-button"
                onClick={() => handleDeletePaymentMethod(method.documentId)}
              >
                <FontAwesomeIcon icon={faTrash} /> Sil
              </button>
            </div>
          ))
        ) : (
          <p className="no-cards">Henüz kayıtlı bir kart bulunmamaktadır.</p>
        )}
      </div>

      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Yeni Kart Ekle</h2>
            <form onSubmit={handleAddPaymentMethod}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Kart Sahibinin Adı"
                  value={newCard.card_holder_name}
                  onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
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
                  <input
                    type="text"
                    placeholder="Ay (MM)"
                    value={newCard.expiry_month}
                    onChange={(e) => setNewCard({ ...newCard, expiry_month: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Yıl (YY)"
                    value={newCard.expiry_year}
                    onChange={(e) => setNewCard({ ...newCard, expiry_year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="CVV"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="popup-buttons">
                <button type="submit" className="save-button">
                  Kaydet
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsPopupOpen(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Popup
        isOpen={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default PaymentMethods;
