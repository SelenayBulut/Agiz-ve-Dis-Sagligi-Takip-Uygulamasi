import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css'; // Auth.css içindeki genel stil ve renk uyumu korunur

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

        // 2. Kullanıcının son 7 günlük kayıtlarını çekme
        if (userId) {
          const trackingResponse = await axios.get(`http://localhost:5019/api/TrackingRecords/user/${userId}/last7days`);
          setRecentData(trackingResponse.data);
        }

        // 3. Rastgele öneriyi çekme
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
    return <div style={{ textAlign: 'center', marginTop: '50px', color: '#085f4f', fontWeight: 'bold' }}>Yükleniyor...</div>;
  }

  const displayName = userInfo.fullName || localStorage.getItem('userName') || 'Kullanıcı';
  const displayEmail = userInfo.email || 'bulutselenay06@gmail.com';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="home-page-container" style={{ backgroundColor: '#f4f6f5', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ÜST NAVBAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#085f4f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6l1.5 2.5h12l1.5-2.5C21 16.5 22 14.5 22 12c0-5.5-4.5-10-10-10z"></path>
            </svg>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>DişKlinik</span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', backgroundColor: '#f3f4f6', padding: '6px 16px', borderRadius: '20px' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#085f4f', cursor: 'pointer' }}>Ana Sayfa</button>
          <button onClick={() => setActiveTab('dental-health')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Diş Sağlığı</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Profil</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#111827' }}>{displayName}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{displayEmail}</div>
          </div>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#085f4f', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {initialLetter}
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
            Çıkış
          </button>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Banner Alanı */}
        <div style={{ backgroundColor: '#085f4f', borderRadius: '16px', padding: '35px 40px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(8, 95, 79, 0.15)' }}>
          <div style={{ fontSize: '0.95rem', opacity: '0.9', marginBottom: '8px' }}>Hoş geldiniz</div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', fontWeight: '700' }}>Merhaba, {displayName}!</h1>
          <p style={{ fontSize: '1rem', margin: 0, opacity: '0.9' }}>Bugün ağız sağlığınız için ne yapacaksınız?</p>
        </div>

        {/* İstatistik Kartları (Üst Sıra) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>1</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Aktif Hedef</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{recentData.length}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>7 Günde Uygulanan</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{recentData.length}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>7 Günde Kayıt</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📝</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{recentData.length}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>7 Günde Not</div>
          </div>
        </div>

        {/* Alt Bölüm: Son Aktiviteler ve Günün Önerisi Yan Yana */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          
          {/* Son Aktiviteler Listesi */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Son Aktiviteler</h3>
              <button onClick={() => setActiveTab('dental-health')} style={{ background: 'none', border: 'none', color: '#085f4f', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Tümünü gör →</button>
            </div>

            {recentData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentData.slice(0, 3).map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', backgroundColor: '#e6f4f1', color: '#085f4f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        ✓
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{item.note || item.description || item.detail || "Diş fırçalama"}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(item.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Son 7 gün içerisinde girilmiş bir aktivite bulunmuyor.</p>
            )}
          </div>

          {/* Günün Sağlık Önerisi Kartı */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#085f4f', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                💡
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#085f4f', letterSpacing: '0.5px' }}>GÜNÜN ÖNERİSİ</div>
              </div>
            </div>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {randomTip || "Öneri yükleniyor..."}
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}