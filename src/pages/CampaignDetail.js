import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './CampaignDetail.css';

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaignDetail = async () => {
      try {
        const token = localStorage.getItem('token');

        // API İsteği
        const response = await API.get(
          `/api/campaigns?filters[documentId][$eq]=${campaignId}&populate=*`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Yanıt Verisini İncele
        console.log('API Response:', response.data);

        const campaignData = response?.data?.data?.[0];
        if (!campaignData) {
          setError('Kampanya verisi bulunamadı.');
          return;
        }

        setCampaign(campaignData);
      } catch (err) {
        console.error('Kampanya detayı alınırken hata:', err);
        setError('Kampanya detayı alınırken bir hata oluştu.');
      }
    };

    if (campaignId) fetchCampaignDetail();
  }, [campaignId]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!campaign) {
    return <p>Yükleniyor...</p>;
  }

  // Kampanya Verisini İşle
  const { campaign_image, campaign_description } = campaign;
  const imageUrl = campaign_image?.url
    ? `http://localhost:1337${campaign_image.url}`
    : null;

  return (
    <div className="campaign-detail-container">
    
      <div className="campaign-detail-content">
        {/* Resim */}
        {imageUrl && (
          <img src={imageUrl} alt="Kampanya Resmi" className="campaign-image" />
        )}

        {/* Açıklama */}
        <p className="campaign-description">
          {campaign_description || 'Açıklama mevcut değil.'}
        </p>
        
        {/* Geri Butonu */}
        <button onClick={() => navigate(-1)} className="campaign-back-button">
          Geri
        </button>

      </div>

    </div>
  );
};

export default CampaignDetail;
