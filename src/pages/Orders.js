// Orders.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import '../styles/Orders.css';

const Orders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderItems = async (orderId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/order-items?filters[order][id][$eq]=${orderId}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      } catch (err) {
        console.error(`Sipariş detayları alınamadı (Order ID: ${orderId}):`, err);
        return [];
      }
    };

    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const ordersResponse = await API.get(
          `/api/orders?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const orders = ordersResponse.data.data;
        setOrders(orders);

        // Her sipariş için order items'ları al
        const itemsMap = {};
        for (const order of orders) {
          const items = await fetchOrderItems(order.id);
          itemsMap[order.id] = items;
        }
        setOrderItems(itemsMap);
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
            const items = orderItems[order.id] || [];

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span>Sipariş #{order.id}</span>
                  <span className="order-status">{order.order_status}</span>
                </div>

                <div className="order-content">
                  <p>Tarih: {new Date(order.createdAt).toLocaleString()}</p>
                  <p>Adres: {order.user_address?.address_title || 'Adres bilgisi yok'}</p>
                  
                  <div className="order-items">
                    <h4>Sipariş Detayı:</h4>
                    {items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">
                          {item.products[0]?.product_name || 'Ürün adı bulunamadı'}
                        </span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">₺{item.unit_price}</span>
                      </div>
                    ))}
                  </div>

                  <p className="order-total">
                    <FontAwesomeIcon icon={faCreditCard} /> Toplam: ₺{order.total_amount}
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
