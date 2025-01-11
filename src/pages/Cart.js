// Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faTrash,
  faCreditCard,
  faBox,
  faMoneyBill,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const Cart = ({ cart, removeFromCart }) => {
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate('/payment', { state: { cart } });
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>
          <FontAwesomeIcon icon={faShoppingCart} className="header-icon" />
          Alışveriş Sepetim
        </h1>
        <span className="item-count">{cart.length} Ürün</span>
      </div>

      {cart.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="item-details">
                  <div className="item-header">
                    <h2>{item.product_name}</h2>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>

                  <div className="item-info">
                    <div className="info-row">
                      <FontAwesomeIcon icon={faMoneyBill} className="info-icon" />
                      <span className="price">₺{item.price}</span>
                    </div>
                    <div className="info-row">
                      <FontAwesomeIcon icon={faBox} className="info-icon" />
                      <span className="quantity">Adet: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="item-total">
                    <span>Toplam:</span>
                    <span className="total-price">₺{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Sipariş Özeti</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Ara Toplam</span>
                <span>₺{calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Kargo</span>
                <span>Ücretsiz</span>
              </div>
              <div className="summary-total">
                <span>Toplam</span>
                <span>₺{calculateTotal()}</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              <FontAwesomeIcon icon={faCreditCard} />
              Ödemeye Geç
            </button>

            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Alışverişe Devam Et
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <FontAwesomeIcon icon={faShoppingCart} className="empty-cart-icon" />
          <p>Sepetinizde ürün bulunmamaktadır.</p>
          <button className="continue-shopping-btn" onClick={handleContinueShopping}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Alışverişe Başla
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
