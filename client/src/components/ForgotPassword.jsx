import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Mail Girişi, 2: Yeni Parola Belirleme
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Adım: Mail Adresini Arayüzde ve Backend'de Kontrol Etme
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Mail alanının boş olup olmadığı arayüzde kontrol ediliyor
    if (!email) {
      setMessage({ text: 'Mail adresi alanı boş bırakılamaz.', type: 'error' });
      return;
    }

    try {
      // Veritabanında mailin kayıtlı olup olmadığı kontrol ediliyor
      await axios.post('http://localhost:5019/api/Users/check-email', { email });
      
      // Kullanıcı kayıtlı ise parola alanları gösteriliyor (2. Adım)
      setStep(2);
      setMessage({ text: 'Mail adresi doğrulandı. Yeni parolanızı belirleyebilirsiniz.', type: 'success' });
    } catch (error) {
      // Kayıtlı değilse sadece kullanıcı bilgisinin bulunmadığı mesajı gösteriliyor
      const errorMsg = error.response?.data?.message || 'Bu mail adresine kayıtlı kullanıcı bulunamadı.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  // 2. Adım: Yeni Parolayı Güncelleme
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ text: 'Lütfen tüm parola alanlarını doldurunuz.', type: 'error' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: 'Parolalar birbiriyle eşleşmiyor.', type: 'error' });
    }

    // Kayıt sayfasındaki parola kriterleri kontrolü (En az 8 karakter, büyük harf, küçük harf, rakam)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      setMessage({ 
        text: 'Parola en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir.', 
        type: 'error' 
      });
      return;
    }

    try {
      await axios.post('http://localhost:5019/api/Users/reset-password', {
        email: email,
        newPassword: passwords.newPassword
      });

      setMessage({ text: 'Parolanız başarıyla güncellendi! Giriş yapabilirsiniz.', type: 'success' });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Parola güncellenirken hata oluştu.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Parola Hatırlatma</h2>

      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', color: '#fff', backgroundColor: message.type === 'error' ? '#ff4d4d' : '#28a745', borderRadius: '4px', fontSize: '14px' }}>
          {message.text}
        </div>
      )}

      {/* ADIM 1: Sadece Mail Adresi ve Doğrulama Düğmesi */}
      {step === 1 && (
        <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Mail Adresi:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} 
              placeholder="Mail adresinizi giriniz"
            />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Doğrula
          </button>
        </form>
      )}

      {/* ADIM 2: Kullanıcı Kayıtlıysa Parola ve Parola Tekrar Alanları */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Yeni Parola:</label>
            <input 
              type="password" 
              value={passwords.newPassword} 
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} 
              placeholder="En az 8 karakter, büyük/küçük harf, rakam"
            />
          </div>
          <div>
            <label>Yeni Parola (Tekrar):</label>
            <input 
              type="password" 
              value={passwords.confirmPassword} 
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} 
              placeholder="Parolanızı tekrar giriniz"
            />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Parolayı Güncelle
          </button>
        </form>
      )}
    </div>
  );
}