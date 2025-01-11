import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/ProductDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faArrowLeft,
  faBox,
  faTag,
  faInfoCircle,
  faWarehouse
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../components/Toast';

const ProductDetail = ({ addToCart }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get(
          `/api/products?filters[id][$eq]=${productId}&populate=*`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const items = response.data.data;
        if (!items || items.length === 0) {
          setError('Bu ID ile ürün bulunamadı.');
          return;
        }
        setProduct(items[0]);
      } catch (err) {
        console.error('Ürün detayı alınırken hata:', err);
        setError('Ürün detayı getirilirken hata oluştu.');
      }
    };

    if (productId) fetchProductDetail();
  }, [productId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddToCartDetail = () => {
    const item = {
      id,
      product_name,
      price,
      quantity: 1,
    };
    addToCart(item);
    showToast('Ürün sepete eklendi!', 'success');
  };

  if (error) {
    return (
      <div className="error-container">
        <FontAwesomeIcon icon={faInfoCircle} className="error-icon" />
        <p>{error}</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Geri Dön
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Ürün bilgileri yükleniyor...</p>
      </div>
    );
  }

  const {
    id,
    product_name,
    product_desc,
    price,
    stock_quantity,
    categories,
    order_items,
  } = product;

  const renderDescription = (description) => {
    if (!description) return 'Açıklama yok';
    if (Array.isArray(description)) {
      return description.map((item, index) => (
        <p key={index}>{item.children?.map((child) => child.text).join(' ')}</p>
      ));
    }
    return typeof description === 'string' ? description : 'Açıklama formatı desteklenmiyor';
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Geri Dön
        </button>
      </div>

      <div className="product-detail-content">
        <div className="product-image">
          <div className="placeholder-image">
            <FontAwesomeIcon icon={faBox} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product_name}</h1>

          <div className="product-meta">
            <div className="meta-item">
              <FontAwesomeIcon icon={faTag} />
              <span className="price">₺{price}</span>
            </div>

            <div className="meta-item">
              <FontAwesomeIcon icon={faWarehouse} />
              <span className="stock">Stok: {stock_quantity}</span>
            </div>

            {categories && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faTag} />
                <span className="category">{categories.category_name || 'Kategori bilgisi yok'}</span>
              </div>
            )}
          </div>

          <div className="product-description">
            <h2>Ürün Açıklaması</h2>
            <div className="description-content">
              {renderDescription(product_desc)}
            </div>
          </div>

          <div className="product-actions">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCartDetail}
              disabled={stock_quantity === 0}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {stock_quantity === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default ProductDetail;
