import React, { useState } from 'react';
import axios from 'axios';

// DİKKAT: Buraya setActiveTab prop'unu ekledik
export default function Login({ setActiveTab }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      // Backend'deki giriş (login) endpointine istek atıyoruz
      const response = await axios.post('http://localhost:5019/api/Users/login', {
        email: formData.email,
        password: formData.password
      });

      setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' });
      
      // Kullanıcı bilgilerini veya ID'sini tarayıcıda saklıyoruz
      if (response.data.user) {
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.fullName);
      }

      // 1 saniye sonra App.jsx içerisindeki state'i değiştirerek Home sayfasına geçiyoruz
      setTimeout(() => {
        setActiveTab('home'); 
      }, 1000);
    } catch (error) {
      // Backend'den gelen özel hata mesajı yakalanır.
      const errorMsg = error.response?.data?.message || 'Giriş yapılırken bir hata oluştu.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Giriş Yap</h2>
      
      {/* Backend mesajları burada görünecek */}
      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', color: '#fff', backgroundColor: message.type === 'error' ? '#ff4d4d' : '#28a745', borderRadius: '4px' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Mail Alanı */}
        <div>
          <label>Mail Adresi:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderColor: '#ccc' }} 
          />
        </div>

        {/* Parola Alanı */}
        <div>
          <label>Parola:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderColor: '#ccc' }} 
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Giriş Yap
        </button>
      </form>
    </div>
  );
}