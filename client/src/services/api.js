import axios from 'axios';

const API_BASE_URL = 'http://localhost:5019/api'; // .NET backend portu

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Kullanıcı / Profil İşlemleri
export const updateProfile = (id, data) => api.put(`/Users/update-profile/${id}`, data);

// Hedef İşlemleri
export const getTargets = () => api.get('/Targets');
export const addTarget = (data) => api.post('/Targets', data);
export const deleteTarget = (id, confirmed = false) => api.delete(`/Targets/${id}?confirmed=${confirmed}`);

export default api;