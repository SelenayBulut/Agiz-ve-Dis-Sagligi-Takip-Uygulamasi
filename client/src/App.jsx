import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import Profile from './components/Profile';
import DentalHealth from './components/DentalHealth';
import './App.css';

function App() {
  // Hangi sayfanın aktif olduğunu tutuyoruz
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="app-container">
      {/* Giriş, Kayıt ve Şifre Unuttum sayfalarında üstteki test header'ını gizliyoruz 
          Çünkü bu sayfalar zaten kendi içlerinde geçiş butonlarına (Kayıt ol, Giriş yap vb.) sahip. */}
      {activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'forgot' && (
        <header style={{ textAlign: 'center', padding: '15px', backgroundColor: '#0c594c', color: '#fff', borderBottom: '1px solid #11826d' }}>
          <h2>Ağız ve Diş Sağlığı Takip Uygulaması</h2>
          
          {/* İstersen buraya ana sayfa içi menü butonlarını koyabilirsin */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button 
              onClick={() => setActiveTab('home')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}
            >
              Ana Sayfa
            </button>
            <button 
              onClick={() => setActiveTab('dental-health')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: activeTab === 'dental-health' ? 'bold' : 'normal' }}
            >
              Diş Sağlığım
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}
            >
              Profil
            </button>
            <button 
              onClick={() => setActiveTab('login')}
              style={{ background: 'none', border: 'none', color: '#ffdd57', cursor: 'pointer' }}
            >
              Çıkış Yap
            </button>
          </div>
        </header>
      )}

      {/* Ana içerik alanı */}
      <main>
        {activeTab === 'login' && <Login setActiveTab={setActiveTab} />}
        {activeTab === 'register' && <Register setActiveTab={setActiveTab} />}
        {activeTab === 'forgot' && <ForgotPassword setActiveTab={setActiveTab} />}
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'profile' && <Profile setActiveTab={setActiveTab} />}
        {activeTab === 'dental-health' && <DentalHealth setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
}

export default App;