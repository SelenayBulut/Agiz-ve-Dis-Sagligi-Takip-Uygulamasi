import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

export default function Login({ setActiveTab }) {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState({
    text: '',
    type: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (message.text) {
      setMessage({
        text: '',
        type: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      text: '',
      type: ''
    });

    try {
      const response = await axios.post(
        'http://localhost:5019/api/Users/login',
        {
          email: formData.email,
          password: formData.password
        }
      );

      setMessage({
        text: 'Giriş başarılı! Yönlendiriliyorsunuz...',
        type: 'success'
      });

      if (response.data.user) {
        localStorage.setItem(
          'userId',
          response.data.user.id
        );

        localStorage.setItem(
          'userName',
          response.data.user.fullName
        );
      }

      setTimeout(() => {
        setActiveTab('home');
      }, 1000);

    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Giriş yapılırken bir hata oluştu.';

      setMessage({
        text: errorMsg,
        type: 'error'
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content-wrapper">
        
        {/* SOL TARAF: İkinci görseldeki kusursuz hizalanmış yapı */}
        <div className="auth-left-info">
          <div className="brand-logo-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6l1.5 2.5h12l1.5-2.5C21 16.5 22 14.5 22 12c0-5.5-4.5-10-10-10z"></path>
            </svg>
          </div>

          <h1>DişKlinik</h1>
          <p>Ağız ve diş sağlığınızı takip edin, hedeflerinize ulaşın.</p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <span>Kişisel diş sağlığı hedefleri belirleyin</span>
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <span>Günlük bakım rutininizi takip edin</span>
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <span>Uzman önerileri ile bilgilenin</span>
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Giriş Form Kartı */}
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

            <h2>Hoş Geldiniz</h2>
            <p className="sub-text">Hesabınıza giriş yapın</p>

            {message.text && (
              <div className={`alert-box ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                <label>Parola</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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

              <button type="submit" className="auth-btn">
                Giriş Yap
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className="text-link"
                style={{ fontSize: '0.875rem' }}
              >
                Şifremi unuttum
              </button>
            </div>

            <div className="card-footer-link">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-link"
              >
                Kayıt olun
              </button>
            </div>

          </div>
        </div>

      </div>

      <button className="help-button">
        ?
      </button>
    </div>
  );
}