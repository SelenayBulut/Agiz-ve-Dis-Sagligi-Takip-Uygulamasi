import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile({ setActiveTab }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthDate: '',
    password: ''
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
            password: ''
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

    // Frontend tarafında hızlı ön kontrol (Hangi alan eksikse direkt söyleyelim)
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

    try {
      const response = await axios.put(`http://localhost:5019/api/Users/update-profile/${userId}`, formData);
      setMessage({ text: response.data.message, type: 'success' });
      if (response.data.user) {
        localStorage.setItem('userName', response.data.user.fullName);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Profil Bilgilerini Güncelle</h2>
      
      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', color: '#fff', backgroundColor: message.type === 'error' ? '#ff4d4d' : '#28a745', borderRadius: '4px' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Ad Soyad:</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label>Mail Adresi:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label>Doğum Tarihi:</label>
          {/* Sadece takvimden seçilmesini sağlayan ve klavye girişini engelleyen input */}
          <input 
            type="date" 
            name="birthDate" 
            value={formData.birthDate} 
            onChange={handleChange} 
            onKeyDown={(e) => e.preventDefault()} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>
        <div>
          <label>Yeni Parola (Değiştirmek istemiyorsanız boş bırakın):</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Güncelle
        </button>
        <button type="button" onClick={() => setActiveTab('home')} style={{ padding: '8px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ana Sayfaya Dön
        </button>
      </form>
    </div>
  );
}