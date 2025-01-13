// Orders.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import '../styles/Orders.css';

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

  return (
    <div className="orders-container">
      <h1 className="section-title">
        <FontAwesomeIcon icon={faBox} /> Siparişlerim
      </h1>
      {error && <p className="error-message">{error}</p>}

      <div className="orders-grid">
        {orders.length > 0 ? (
          orders.map((order) => {
            const {
              id,
              order_status,
              total_amount,
              createdAt,
              user_address,
              order_items,
            } = order;

            return (
              <div key={id} className="order-card">
                <div className="order-header">
                  <span>Sipariş #{id}</span>
                  <span className="order-status">{order_status}</span>
                </div>

                <div className="order-content">
                  <p>Tarih: {new Date(createdAt).toLocaleString()}</p>
                  <p>Adres: {user_address?.address_title || 'Adres bilgisi yok'}</p>
                  <p>Ürün Sayısı: {order_items?.length || 0}</p>
                  <p className="order-total">
                    <FontAwesomeIcon icon={faCreditCard} /> Toplam: ₺{total_amount}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-orders">Henüz siparişiniz bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
