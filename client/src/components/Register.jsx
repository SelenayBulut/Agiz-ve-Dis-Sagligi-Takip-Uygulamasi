import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

export default function Register({ setActiveTab }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setMessage({ text: 'Lütfen Ad Soyad alanını doldurunuz.', type: 'error' });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ text: 'Lütfen Mail Adresi alanını doldurunuz.', type: 'error' });
      return;
    }

    if (!formData.birthDate) {
      setMessage({ text: 'Lütfen Doğum Tarihi alanını doldurunuz.', type: 'error' });
      return;
    }

    if (!formData.password) {
      setMessage({ text: 'Parola alanı boş bırakılamaz.', type: 'error' });
      return;
    }

    if (!formData.confirmPassword) {
      setMessage({ text: 'Parola tekrar alanı boş bırakılamaz.', type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Parolalar birbiriyle uyuşmuyor.', type: 'error' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setMessage({ text: 'Parola en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir.', type: 'error' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5019/api/Users/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate
      });

      setMessage({ text: response.data.message || 'Kayıt işlemi başarıyla gerçekleşti!', type: 'success' });
    } catch (error) {
      const errorData = error.response?.data;
      let errorMsg = 'Kayıt sırasında bir hata oluştu.';

      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        const firstKey = Object.keys(errorData.errors)[0];
        if (firstKey && errorData.errors[firstKey].length > 0) {
          errorMsg = errorData.errors[firstKey][0];
        }
      }

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

          <h2>Yeni Hesap Oluştur</h2>
          <p className="sub-text">Bilgilerinizi eksiksiz doldurun</p>

          {message.text && (
            <div className={`alert-box ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ad Soyad</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div className="form-group">
              <label>E-posta</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="ornek@email.com"
              />
            </div>

            <div className="form-group">
              <label>Doğum Tarihi</label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                onKeyDown={(e) => e.preventDefault()} 
              />
            </div>

            <div className="form-group">
              <label>Parola</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
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
              <label>Parola Tekrar</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
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
              Kayıt Ol
            </button>
          </form>

          <div className="card-footer-link">
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-link"
            >
              Giriş yapın
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}