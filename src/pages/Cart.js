// Cart.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import './Cart.css';
import Popup from '../components/Popup';
import API from '../api';

const Cart = ({ cart, removeFromCart }) => {
  const navigate = useNavigate();
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Önce sepetteki ürünleri ürün ID'lerine göre gruplayalım
      const groupedCartItems = cart.reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = {
            product_name: item.product_name,
            totalQuantity: 0
          };
        }
        acc[item.id].totalQuantity += item.quantity;
        return acc;
      }, {});

      // Her ürün için toplam miktar kontrolü yapalım
      for (const productId in groupedCartItems) {
        const response = await API.get(`/api/products?filters[id][$eq]=${productId}&populate=*`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const currentStock = response.data.data[0].stock_quantity;
        const totalCartQuantity = groupedCartItems[productId].totalQuantity;
        
        if (totalCartQuantity > currentStock) {
          showPopup(
            `"${groupedCartItems[productId].product_name}" için toplam miktar stoktan fazla! ` +
            `Sepetteki: ${totalCartQuantity}, Stok: ${currentStock}`, 
            'error'
          );
          return;
        }
      }

      // Tüm kontroller başarılıysa ödeme sayfasına yönlendir
      navigate('/payment', { state: { cart } });
    } catch (err) {
      console.error('Stok kontrolü sırasında hata:', err);
      showPopup('Stok kontrolü sırasında bir hata oluştu.', 'error');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    showPopup('Ürün sepetten kaldırıldı.', 'success');
  };

  return (
    <div className="cart-container">
      <h1 className="section-title">Sepetim</h1>
      
      <div className="cart-content">
        {cart.length > 0 ? (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-details">
                    <h2>{item.product_name}</h2>
                    <div className="item-info">
                      <p className="price">Fiyat: ₺{item.price}</p>
                      <p className="quantity">Adet: {item.quantity}</p>
                      <p className="total">Toplam: ₺{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="total-amount">
                <h3>Toplam Tutar:</h3>
                <p>₺{totalAmount}</p>
              </div>
              <button 
                className="checkout-button"
                onClick={handleCheckout}
              >
                <FontAwesomeIcon icon={faCreditCard} /> Ödeme Yap
              </button>
            </div>
          </>
        ) : (
          <p className="empty-cart">Sepetiniz boş.</p>
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

export default Cart;
