import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home'; //ana sayfa bileşeni
import Profile from './components/Profile';
import './App.css';

function App() {
  // Hangi sayfanın aktif olduğunu tutuyoruz ('login', 'register', 'forgot', 'home')
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', paddingBottom: '50px' }}>
      
      {/* Eğer kullanıcı 'home' (Ana Sayfa) sekmesindeyse üst header'ı gizleyebilir veya değiştirebiliriz */}
      {activeTab !== 'home' && (
        <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
          <h1>Ağız ve Diş Sağlığı Takip Uygulaması</h1>
          
          {/* Sayfalar arası geçiş butonları */}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('login')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'login' ? '#28a745' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Giriş Yap
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'register' ? '#007bff' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Kayıt Ol
            </button>
            <button 
              onClick={() => setActiveTab('forgot')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'forgot' ? '#ffc107' : '#ccc',
                color: activeTab === 'forgot' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Şifremi Unuttum
            </button>
          </div>
        </header>
      )}

      <main>
        {activeTab === 'login' && <Login setActiveTab={setActiveTab} />}
        {activeTab === 'register' && <Register />}
        {activeTab === 'forgot' && <ForgotPassword />}
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'profile' && <Profile setActiveTab={setActiveTab} />} {/* 2. Profil sekmesini buraya ekledik */}
      </main>
    </div>
  );
}

export default App;