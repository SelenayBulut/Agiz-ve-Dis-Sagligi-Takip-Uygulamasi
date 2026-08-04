import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css';

export default function Profile({ setActiveTab }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '' // Parola tekrar alanı eklendi
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5019/api/Users');
        const currentUser = response.data.find(u => u.id.toString() === userId);
        if (currentUser) {
          setFormData({
            fullName: currentUser.fullName || '',
            email: currentUser.email || '',
            birthDate: currentUser.birthDate ? currentUser.birthDate.split('T')[0] : '',
            password: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error("Bilgiler yüklenemedi", error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!formData.fullName) {
      setMessage({ text: 'Lütfen Ad Soyad alanını doldurunuz.', type: 'error' });
      return;
    }
    if (!formData.email) {
      setMessage({ text: 'Lütfen Mail Adresi alanını doldurunuz.', type: 'error' });
      return;
    }
    if (!formData.birthDate) {
      setMessage({ text: 'Lütfen Doğum Tarihi alanını seçiniz.', type: 'error' });
      return;
    }

    // Parola eşleşme kontrolü
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Girdiğiniz yeni parolalar birbiriyle eşleşmiyor.', type: 'error' });
      return;
    }

    try {
      // Backend'e gönderilecek veri (confirmPassword hariç tutulabilir veya backend modeline göre ayarlanabilir)
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        birthDate: formData.birthDate,
        password: formData.password
      };

      const response = await axios.put(`http://localhost:5019/api/Users/update-profile/${userId}`, updateData);
      setMessage({ text: response.data.message, type: 'success' });
      if (response.data.user) {
        localStorage.setItem('userName', response.data.user.fullName);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setActiveTab('login');
  };

  const displayName = formData.fullName || localStorage.getItem('userName') || 'Kullanıcı';
  const displayEmail = formData.email || 'bulutselenay06@gmail.com';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const formatBirthDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('tr-TR', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f5', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
      
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
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Ana Sayfa</button>
          <button onClick={() => setActiveTab('dental-health')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Diş Sağlığı</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#085f4f', cursor: 'pointer' }}>Profil</button>
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

      {/* ANA İÇERİK */}
      <main style={{ maxWidth: '680px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827', margin: '0 0 5px 0' }}>Profil Ayarları</h1>
          <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: 0 }}>Hesap bilgilerinizi güncelleyin</p>
        </div>

        {/* Kullanıcı Özet Kartı */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#085f4f', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {initialLetter}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{displayName}</div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{displayEmail}</div>
            {formData.birthDate && (
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Doğum: {formatBirthDate(formData.birthDate)}</div>
            )}
          </div>
        </div>

        {/* Uyarı Mesajı */}
        {message.text && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#b91c1c' : '#065f46' }}>
            {message.text}
          </div>
        )}

        {/* Form Kartı */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Ad Soyad</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>E-posta</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Doğum Tarihi</label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                onKeyDown={(e) => e.preventDefault()} 
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>

            {/* Parola Değiştirme Bölümü (Parola Tekrar eklendi) */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '15px', marginTop: '5px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '12px' }}>
                Parola Değiştir <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(opsiyonel)</span>
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Yeni Parola</label>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                    value={formData.password} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Parola Tekrar</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Yeni parolanızı tekrar girin"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', backgroundColor: '#085f4f', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
            >
              Değişiklikleri Kaydet
            </button>

          </form>
        </div>

      </main>
    </div>
  );
}