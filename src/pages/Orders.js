// Orders.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Orders.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faUser, 
  faMoneyBill, 
  faShippingFast, 
  faCreditCard,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const Orders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/orders?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data.data);
      } catch (err) {
        console.error('Siparişler alınırken hata:', err);
        setError('Siparişler yüklenirken bir hata oluştu.');
      }
    };

    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'beklemede':
        return 'status-pending';
      case 'onaylandı':
        return 'status-approved';
      case 'kargoda':
        return 'status-shipping';
      case 'tamamlandı':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>
          <FontAwesomeIcon icon={faBox} className="header-icon" />
          Siparişlerim
        </h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => {
            const {
              id,
              order_status,
              total_amount,
              createdAt,
              users_permissions_user,
              user_address,
              order_items,
            } = order;

            const alici = users_permissions_user?.username || users_permissions_user?.email || 'Alıcı bilgisi yok';
            const teslimat = user_address
              ? `${user_address.address_title}, ${user_address.city}/${user_address.district}`
              : 'Teslimat bilgisi yok';

            return (
              <div className="order-card" key={id}>
                <div className="order-header">
                  <div className="order-id">Sipariş #{id}</div>
                  <div className={`order-status ${getStatusColor(order_status)}`}>
                    {order_status}
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Sipariş Tarihi</span>
                      <span className="detail-value">{new Date(createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faUser} className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Alıcı</span>
                      <span className="detail-value">{alici}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faMoneyBill} className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Toplam Tutar</span>
                      <span className="detail-value price">₺{total_amount}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faShippingFast} className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Teslimat Adresi</span>
                      <span className="detail-value">{teslimat}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faCreditCard} className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Ödeme Yöntemi</span>
                      <span className="detail-value">Kredi Kartı</span>
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  <h3>Sipariş Detayı</h3>
                  {order_items && order_items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <span className="item-name">Ürün ID: {item.id}</span>
                      <span className="item-price">₺{item.unit_price}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-orders">
            <FontAwesomeIcon icon={faBox} className="no-orders-icon" />
            <p>Henüz siparişiniz bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
