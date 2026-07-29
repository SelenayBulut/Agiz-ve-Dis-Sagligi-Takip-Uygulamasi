import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home({ setActiveTab }) {
  const [userInfo, setUserInfo] = useState({ fullName: '' });
  const [recentData, setRecentData] = useState([]);
  const [randomTip, setRandomTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const headers = { Authorization: `Bearer ${userId}` };

        // 1. Kullanıcı bilgilerini çekme
        const userResponse = await axios.get('http://localhost:5019/api/Users', { headers });
        const currentUserId = localStorage.getItem('userId');
        const currentUser = userResponse.data.find(u => u.id.toString() === currentUserId);
        if (currentUser) {
          setUserInfo(currentUser);
        }

        // 2. Kullanıcının son 7 günlük kayıtlarını çekme (TrackingRecordsController)
        if (userId) {
          const trackingResponse = await axios.get(`http://localhost:5019/api/TrackingRecords/user/${userId}/last7days`);
          setRecentData(trackingResponse.data);
        }

        // 3. Rastgele öneriyi çekme (SuggestionsController)
        const suggestionResponse = await axios.get('http://localhost:5019/api/Suggestions/random');
        setRandomTip(suggestionResponse.data.suggestion);

      } catch (error) {
        console.error("Ana sayfa verileri yüklenirken bir hata oluştu.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setActiveTab('login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Üst Kısım: Kullanıcı Adı ve Güvenli Çıkış */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Hoş Geldiniz, <span style={{ color: '#007bff' }}>{userInfo.fullName || localStorage.getItem('userName') || 'Kullanıcı'}</span></h2>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Güvenli Çıkış
        </button>
      </div>

      {/* Navigasyon Butonları */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('profile')} // Tıklandığında App.jsx'deki state'i 'profile' yapar
          style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Profil Sayfası
        </button>
        <button 
          onClick={() => setActiveTab('dental-health')} 
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ağız ve Diş Sağlığı Sayfası
        </button>
      </div>

      {/* SuggestionsController'dan Gelen Rastgele Öneri Alanı */}
      <div style={{ backgroundColor: '#e2f0d9', border: '1px solid #c3e6cb', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Günün Sağlık Önerisi</h3>
        <p style={{ margin: 0, color: '#155724', fontStyle: 'italic' }}>{randomTip || "Öneri yükleniyor..."}</p>
      </div>

      {/* TrackingRecordsController'dan Gelen Son 7 Günlük Kayıtlar Alanı */}
      <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Son 7 Günlük Takip Verileriniz</h3>
        {recentData.length > 0 ? (
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {recentData.map((item, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                <strong>{new Date(item.date).toLocaleDateString()}:</strong> {item.note || item.description || item.detail || "Kayıt mevcut"} 
                {item.target ? ` (Hedef: ${item.target.name || item.target.title})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: '#6c757d' }}>Son 7 gün içerisinde girilmiş bir takip kaydı bulunmuyor.</p>
        )}
      </div>

    </div>
  );
}