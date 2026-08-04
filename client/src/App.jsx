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