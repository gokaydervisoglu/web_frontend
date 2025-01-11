// Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import './Cart.css';

const Cart = ({ cart, removeFromCart }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/payment', { state: { cart } });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                      <p className="total">Toplam: ₺{item.price * item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
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
    </div>
  );
};

export default Cart;
