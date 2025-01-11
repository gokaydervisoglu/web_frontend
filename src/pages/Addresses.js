import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles/Addresses.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faHome,
  faCity,
  faGlobe,
  faMapPin,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const Addresses = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [addressIdToEdit, setAddressIdToEdit] = useState(null);
  const [addressTitle, setAddressTitle] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/api/user-addresses?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses(response.data.data || []);
    } catch (err) {
      console.error('Adresler alınırken hata:', err);
    }
  };

  const resetForm = () => {
    setAddressTitle('');
    setCountry('');
    setCity('');
    setDistrict('');
    setStreet('');
    setPostalCode('');
    setAddressIdToEdit(null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = addressIdToEdit
        ? `/api/user-addresses/${addressIdToEdit}`
        : '/api/user-addresses';

      const method = addressIdToEdit ? 'put' : 'post';

      await API[method](
        endpoint,
        {
          data: {
            address_title: addressTitle,
            country,
            city,
            district,
            street,
            postal_code: postalCode,
            users_permissions_user: userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      resetForm();
      setIsPopupOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Adres işlemi sırasında hata:', err);
    }
  };

  const handleDeleteAddress = async (documentId) => {
    if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/api/user-addresses/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAddresses((prev) => prev.filter((addr) => addr.documentId !== documentId));
      } catch (err) {
        console.error('Adres silme sırasında hata:', err);
      }
    }
  };

  const handleEditAddress = async (documentId) => {
    const addressToEdit = addresses.find(addr => addr.documentId === documentId);
    
    if (addressToEdit) {
      setAddressIdToEdit(documentId);
      setAddressTitle(addressToEdit.address_title);
      setCountry(addressToEdit.country);
      setCity(addressToEdit.city);
      setDistrict(addressToEdit.district);
      setStreet(addressToEdit.street);
      setPostalCode(addressToEdit.postal_code);
      setIsPopupOpen(true);
    }
  };

  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h1>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="header-icon" />
          Adreslerim
        </h1>
        <button className="add-address-btn" onClick={() => setIsPopupOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Yeni Adres Ekle
        </button>
      </div>

      <div className="addresses-grid">
        {addresses.map((addr) => (
          <div className="address-card" key={addr.documentId}>
            <div className="address-header">
              <h3>
                <FontAwesomeIcon icon={faHome} className="address-icon" />
                {addr.address_title}
              </h3>
              <div className="address-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditAddress(addr.documentId)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteAddress(addr.documentId)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            
            <div className="address-details">
              <p>
                <FontAwesomeIcon icon={faGlobe} className="detail-icon" />
                {addr.country}
              </p>
              <p>
                <FontAwesomeIcon icon={faCity} className="detail-icon" />
                {addr.city}
              </p>
              <p>
                <FontAwesomeIcon icon={faMapPin} className="detail-icon" />
                {addr.district}
              </p>
              <p>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
                {addr.street}
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                {addr.postal_code}
              </p>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="no-addresses">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="no-addresses-icon" />
            <p>Henüz adres eklemediniz.</p>
          </div>
        )}
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>{addressIdToEdit ? 'Adresi Güncelle' : 'Yeni Adres Ekle'}</h2>
              <button className="close-btn" onClick={() => {
                setIsPopupOpen(false);
                resetForm();
              }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="address-form">
              <div className="form-group">
                <FontAwesomeIcon icon={faHome} className="input-icon" />
                <input
                  type="text"
                  placeholder="Adres Başlığı"
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <FontAwesomeIcon icon={faGlobe} className="input-icon" />
                <input
                  type="text"
                  placeholder="Ülke"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FontAwesomeIcon icon={faCity} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Şehir"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <FontAwesomeIcon icon={faMapPin} className="input-icon" />
                  <input
                    type="text"
                    placeholder="İlçe"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                <input
                  type="text"
                  placeholder="Sokak / Cadde"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="text"
                  placeholder="Posta Kodu"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                {addressIdToEdit ? 'Adresi Güncelle' : 'Adresi Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
