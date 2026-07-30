import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

export default function ForgotPassword({ setActiveTab }) {
  const [step, setStep] = useState(1); // 1: Mail Girişi, 2: Yeni Parola Belirleme
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      return;
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
    <div className="auth-container">
      <div className="auth-right-card">
        <div className="card-content">
          <div className="mobile-brand-top">
            <div className="brand-logo-box-small">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6l1.5 2.5h12l1.5-2.5C21 16.5 22 14.5 22 12c0-5.5-4.5-10-10-10z"></path>
              </svg>
            </div>
            <span>DişKlinik</span>
          </div>

          <h2>Parola Hatırlatma</h2>
          <p className="sub-text">
            {step === 1 ? 'Kayıtlı e-posta adresinizi girin' : 'Yeni parolanızı belirleyin'}
          </p>

          {message.text && (
            <div className={`alert-box ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* ADIM 1: Sadece Mail Adresi ve Doğrulama Düğmesi */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label>E-posta Adresi</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="ornek@email.com"
                />
              </div>
              <button type="submit" className="auth-btn">
                Doğrula
              </button>
            </form>
          )}

          {/* ADIM 2: Kullanıcı Kayıtlıysa Parola ve Parola Tekrar Alanları */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Yeni Parola</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.newPassword} 
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                    placeholder="En az 8 karakter"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Yeni Parola (Tekrar)</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={passwords.confirmPassword} 
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                    placeholder="Parolanızı tekrar girin"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showConfirmPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn">
                Parolayı Güncelle
              </button>
            </form>
          )}

          <div className="card-footer-link">
            <button 
              type="button" 
              onClick={() => setActiveTab('login')} 
              className="text-link"
            >
              ← Giriş sayfasına dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}