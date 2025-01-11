import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import './ProductDetail.css';

const ProductDetail = ({ addToCart }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const renderDescription = (description) => {
    if (!description) return 'Açıklama yok';
    if (Array.isArray(description)) {
      return description.map((item, index) => (
        <p key={index}>{item.children?.map((child) => child.text).join(' ')}</p>
      ));
    }
    return typeof description === 'string' ? description : 'Açıklama formatı desteklenmiyor';
  };

  const handleAddToCartDetail = () => {
    const item = {
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
    };
    addToCart(item);
    alert('Ürün sepete eklendi!');
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!product) {
    return <p className="loading-message">Yükleniyor...</p>;
  }

  const { product_name, price, stock_quantity, categories, product_desc } = product;

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        <div className="product-header">
          <h1>{product_name}</h1>
          <button className="back-button" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} /> Geri
          </button>
        </div>

        <div className="product-content">
          <div className="product-info">
            <p className="price">₺{price}</p>
            <p className="stock">Stok: {stock_quantity} adet</p>
            <p>Kategori: {categories?.category_name || 'Kategori bilgisi yok'}</p>
          </div>

          <div className="product-description">
            {renderDescription(product_desc)}
          </div>

          <button 
            className="add-cart-button"
            onClick={handleAddToCartDetail}
            disabled={stock_quantity <= 0}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {stock_quantity > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
