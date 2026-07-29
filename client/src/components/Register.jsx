import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  // Input değişikliklerini yakalama
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // genel uyarı mesajını temizle
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // 1. Önce parolalar birbiriyle uyuşuyor mu kontrol edelim
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Parolalar birbiriyle uyuşmuyor.', type: 'error' });
      return;
    }

    try {
      // 2. Eşleşme tamamsa istek atıyoruz. 
      // Kontroller için backend bize hatayı dönecek.
      const response = await axios.post('http://localhost:5019/api/Users/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate
      });

      setMessage({ text: response.data.message || 'Kayıt işlemi başarıyla gerçekleşti!', type: 'success' });
    } catch (error) {
      // Backend'den gelen tüm hatalar burada yakalanır
      const errorMsg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Kayıt Ol</h2>
      
      {/* Backend'den veya eşleşmeme kontrolünden gelen tüm mesajlar burada görünür */}
      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', color: '#fff', backgroundColor: message.type === 'error' ? '#ff4d4d' : '#28a745', borderRadius: '4px' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Ad Soyad:</label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label>Mail Adresi:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label>Doğum Tarihi:</label>
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
          <label>Parola:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label>Parola Tekrar:</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}