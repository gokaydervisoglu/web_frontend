import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import API from '../api';
import './Addresses.css';

const Addresses = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [addressIdToEdit, setAddressIdToEdit] = useState(null); // Güncellenecek adresin documentId'si
  const [addressTitle, setAddressTitle] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
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

    fetchAddresses();
  }, [userId]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = addressIdToEdit
        ? `/api/user-addresses/${addressIdToEdit}` // Güncelleme için
        : '/api/user-addresses'; // Yeni ekleme için

      const method = addressIdToEdit ? 'put' : 'post';

      const response = await API[method](
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

      if (response.status === 200 || response.status === 201) {
        alert(addressIdToEdit ? 'Adres başarıyla güncellendi!' : 'Adres başarıyla eklendi!');
        setAddressTitle('');
        setCountry('');
        setCity('');
        setDistrict('');
        setStreet('');
        setPostalCode('');
        setIsPopupOpen(false);
        setAddressIdToEdit(null);

        // Adresleri yeniden yükle
        setAddresses((prev) =>
          addressIdToEdit
            ? prev.map((addr) =>
                addr.documentId === addressIdToEdit ? response.data.data : addr
              )
            : [...prev, response.data.data]
        );
      }
    } catch (err) {
      console.error('Adres işlemi sırasında hata:', err);
      alert('Adres işlemi sırasında bir hata oluştu.');
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

        alert('Adres başarıyla silindi!');
        setAddresses((prev) => prev.filter((addr) => addr.documentId !== documentId));
      } catch (err) {
        console.error('Adres silme sırasında hata:', err);
        alert('Adres silme sırasında bir hata oluştu.');
      }
    }
  };

  const handleEditAddress = (address) => {
    setAddressIdToEdit(address.documentId); // documentId'yi kullan
    setAddressTitle(address.address_title);
    setCountry(address.country);
    setCity(address.city);
    setDistrict(address.district);
    setStreet(address.street);
    setPostalCode(address.postal_code);
    setIsPopupOpen(true);
  };

  return (
    <div className="addresses-container">
      <h1 className="section-title">
        <FontAwesomeIcon icon={faMapMarkerAlt} /> Adreslerim
      </h1>

      <button className="add-button" onClick={() => setIsPopupOpen(true)}>
        <FontAwesomeIcon icon={faPlus} /> Yeni Adres Ekle
      </button>

      <div className="addresses-list">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div className="address-card" key={addr.documentId}>
              <div className="address-content">
                <h3 className="address-title">{addr.address_title}</h3>
                <div className="address-details">
                  <p><strong>Ülke:</strong> {addr.country}</p>
                  <p><strong>Şehir:</strong> {addr.city}</p>
                  <p><strong>İlçe:</strong> {addr.district}</p>
                  <p><strong>Sokak:</strong> {addr.street}</p>
                  <p><strong>Posta Kodu:</strong> {addr.postal_code}</p>
                </div>
              </div>
              
              <div className="button-group">
                <button 
                  className="edit-button"
                  onClick={() => handleEditAddress(addr)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Düzenle
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteAddress(addr.documentId)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Sil
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-address">Henüz adres eklemediniz.</p>
        )}
      </div>

      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>{addressIdToEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Adres Başlığı"
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Ülke"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Şehir"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="İlçe"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Sokak / Cadde"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Posta Kodu"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div className="popup-buttons">
                <button type="submit" className="save-button">
                  {addressIdToEdit ? 'Güncelle' : 'Kaydet'}
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
    </div>
  );
};

export default Addresses;
