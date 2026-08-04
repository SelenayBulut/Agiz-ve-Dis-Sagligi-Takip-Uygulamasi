import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Auth.css';

const API_BASE_URL = "http://localhost:5019/api";

export default function DentalHealth({ setActiveTab }) {
    const [activeTabName, setActiveTabName] = useState('durum');
    const [dailySuggestion, setDailySuggestion] = useState('Öneri yükleniyor...');
    const [targets, setTargets] = useState([]);
    const [records, setRecords] = useState([]);
    const [userInfo, setUserInfo] = useState({ fullName: '' });

    // Durum Formu State'leri
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
    const [recordTime, setRecordTime] = useState('12:00');
    const [recordDuration, setRecordDuration] = useState('');
    const [recordIsApplied, setRecordIsApplied] = useState(true);

    // Not ve Görsel Formu State'leri
    const [noteTargetId, setNoteTargetId] = useState('');
    const [noteDescription, setNoteDescription] = useState('');
    const [noteImage, setNoteImage] = useState('');

    // Yeni Hedef Formu State'leri
    const [targetTitle, setTargetTitle] = useState('');
    const [targetDescription, setTargetDescription] = useState('');
    const [targetPeriod, setTargetPeriod] = useState('');
    const [targetPriority, setTargetPriority] = useState('Orta');

    // Silme Onay Modalı State'leri
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState('');
    const [targetIdToDelete, setTargetIdToDelete] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const userId = localStorage.getItem('userId');
        const headers = userId ? { Authorization: `Bearer ${userId}` } : {};

        try {
            // 1. Kullanıcı Bilgileri
            const userResponse = await axios.get(`${API_BASE_URL}/Users`, { headers });
            const currentUser = userResponse.data.find(u => u.id.toString() === userId);
            if (currentUser) setUserInfo(currentUser);

            // 2. Rastgele Öneri
            const suggestionResponse = await axios.get(`${API_BASE_URL}/Suggestions/random`);
            setDailySuggestion(suggestionResponse.data.suggestion || suggestionResponse.data.Suggestion);

            // 3. Hedefler
            const targetResponse = await axios.get(`${API_BASE_URL}/Targets`, { headers });
            setTargets(targetResponse.data);

            // 4. Son 7 Günlük Kayıtlar
            if (userId) {
                const trackingResponse = await axios.get(`${API_BASE_URL}/TrackingRecords/user/${userId}/last7days`, { headers });
                setRecords(trackingResponse.data);
            }
        } catch (err) {
            console.error("Veriler yüklenirken hata oluştu:", err);
        }
    };

    const loadTargets = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/Targets`);
            setTargets(res.data);
        } catch (err) {
            console.error("Hedefler yüklenemedi:", err);
        }
    };

    const loadLast7DaysRecords = async () => {
        const userId = localStorage.getItem('userId') || 1;
        try {
            const res = await axios.get(`${API_BASE_URL}/TrackingRecords/user/${userId}/last7days`);
            setRecords(res.data);
        } catch (err) {
            console.error("Kayıtlar yüklenemedi:", err);
        }
    };

    const handleRecordSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId') || 1;

        const newRecord = {
            userId: parseInt(userId),
            targetId: parseInt(selectedTargetId),
            date: `${recordDate}T${recordTime}:00`,
            duration: parseInt(recordDuration),
            isApplied: recordIsApplied,
            noteText: "",
            imagePath: ""
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/TrackingRecords`, newRecord);
            if (res.status === 200 || res.status === 201) {
                Swal.fire('Başarılı', 'Takip kaydı eklendi!', 'success');
                setRecordDuration('');
                loadLast7DaysRecords();
            }
        } catch (err) {
            Swal.fire('Hata', 'Kayıt eklenirken hata oluştu.', 'error');
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId') || 1;

        const recordWithNote = {
            userId: parseInt(userId),
            targetId: parseInt(noteTargetId),
            date: `${recordDate}T${recordTime}:00`,
            duration: 0,
            isApplied: false,
            noteText: noteDescription,
            imagePath: noteImage || "ornek_gorsel.png"
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/TrackingRecords`, recordWithNote);
            if (res.status === 200 || res.status === 201) {
                Swal.fire('Başarılı', 'Notunuz ve görseliniz başarıyla kaydedildi!', 'success');
                setNoteDescription('');
                setNoteImage('');
                setNoteTargetId('');
                loadLast7DaysRecords();
            }
        } catch (err) {
            Swal.fire('Hata', 'Not kaydedilirken hata oluştu.', 'error');
        }
    };

    const handleTargetSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId') || 1;

        const newTarget = {
            userId: parseInt(userId),
            title: targetTitle,
            description: targetDescription,
            period: targetPeriod,
            priority: targetPriority,
            trackingRecords: []
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/Targets`, newTarget);
            if (res.status === 200 || res.status === 201) {
                Swal.fire('Başarılı', 'Hedef başarıyla eklendi!', 'success');
                setTargetTitle('');
                setTargetDescription('');
                setTargetPeriod('');
                loadTargets();
            }
        } catch (err) {
            Swal.fire('Hata', 'Hedef eklenirken hata oluştu.', 'error');
        }
    };

    const tryDeleteTarget = async (id) => {
        setTargetIdToDelete(id);
        try {
            const res = await axios.delete(`${API_BASE_URL}/Targets/${id}?confirmed=false`);
            if (res.data && res.data.requiresConfirmation) {
                setDeleteModalMessage(res.data.message);
                setShowDeleteModal(true);
            } else {
                Swal.fire('Silindi', 'Hedef başarıyla silindi.', 'success');
                loadTargets();
                loadLast7DaysRecords();
            }
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.requiresConfirmation) {
                setDeleteModalMessage(err.response.data.message);
                setShowDeleteModal(true);
            } else {
                Swal.fire('Hata', 'Silme işlemi başarısız.', 'error');
            }
        }
    };

    const confirmDelete = async () => {
        if (!targetIdToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/Targets/${targetIdToDelete}?confirmed=true`);
            setShowDeleteModal(false);
            Swal.fire('Silindi', 'Hedef başarıyla silindi.', 'success');
            loadTargets();
            loadLast7DaysRecords();
        } catch (err) {
            Swal.fire('Hata', 'Silme işlemi gerçekleştirilemedi.', 'error');
        }
        setTargetIdToDelete(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setActiveTab('login');
    };

    const displayName = userInfo.fullName || localStorage.getItem('userName') || 'Kullanıcı';
    const displayEmail = userInfo.email || 'bulutselenay06@gmail.com';
    const initialLetter = displayName.charAt(0).toUpperCase();

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
                    <button onClick={() => setActiveTab('dental-health')} style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#085f4f', cursor: 'pointer' }}>Diş Sağlığı</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Profil</button>
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

            {/* ANA İÇERİK ALANI */}
            <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* Sayfa Başlığı ve Sekme Seçiciler */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px 30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#111827' }}>Ağız ve Diş Sağlığı Takibi</h2>
                    <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '0.9rem' }}>Sağlık hedeflerinizi belirleyin, kaydedin ve düzenli olarak takip edin.</p>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setActiveTabName('durum')} 
                            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTabName === 'durum' ? '#085f4f' : '#f3f4f6', color: activeTabName === 'durum' ? '#fff' : '#4b5563' }}
                        >
                            Durum 
                        </button>
                        <button 
                            onClick={() => setActiveTabName('hedef')} 
                            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTabName === 'hedef' ? '#085f4f' : '#f3f4f6', color: activeTabName === 'hedef' ? '#fff' : '#4b5563' }}
                        >
                            Hedef 
                        </button>
                    </div>
                </div>

                {/* 1. DURUM SEKMESİ */}
                {activeTabName === 'durum' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        
                        {/* Sol Kolon: Son 7 Günlük Kayıtlar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111827' }}>Son 7 Günlük Aktiviteler (Özet)</h3>
                                {records.length === 0 ? (
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Son 7 günde kayıt bulunmuyor.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                                        {records.map((rec, idx) => (
                                            <div key={idx} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111827' }}>{rec.target?.title || 'Hedef'}</span>
                                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: rec.isApplied ? '#e6f4f1' : '#f3f4f6', color: rec.isApplied ? '#085f4f' : '#4b5563', borderRadius: '10px', fontWeight: 'bold' }}>
                                                        {rec.isApplied ? 'Uygulandı' : 'Not Girildi'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tarih: {new Date(rec.date).toLocaleDateString('tr-TR')} - Saat: {new Date(rec.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} {rec.duration > 0 ? `| Süre: ${rec.duration} dk` : ''}</div>
                                                {rec.noteText && <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: '6px', fontStyle: 'italic' }}>Not: "{rec.noteText}"</div>}
                                                {rec.imagePath && <div style={{ fontSize: '0.75rem', color: '#085f4f', marginTop: '4px' }}>Görsel: {rec.imagePath}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Günün Önerisi Küçük Kart */}
                            {/* Günün Önerisi Küçük Kart */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ width: '36px', height: '36px', backgroundColor: '#085f4f', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        💡
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#085f4f', letterSpacing: '0.5px' }}>GÜNÜN ÖNERİSİ</div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: '#374151', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {dailySuggestion}
                                </p>
                                </div>
                            </div>

                        {/* Sağ Kolon: Durum Kaydı Ekleme & Not Ekleme */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            
                            {/* Kayıt / Durum Girişi */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111827' }}>Yeni Takip Kaydı Ekle</h3>
                                <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Hedef Seçin</label>
                                        <select 
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={selectedTargetId} 
                                            onChange={(e) => setSelectedTargetId(e.target.value)} 
                                            required
                                        >
                                            <option value="">Hedef seçin...</option>
                                            {targets.map(t => (
                                                <option key={t.id || t.Id} value={t.id || t.Id}>{t.title || t.Title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Tarih</label>
                                            <input 
                                                type="date" 
                                                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                                value={recordDate} 
                                                onChange={(e) => setRecordDate(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Saat</label>
                                            <input 
                                                type="time" 
                                                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                                value={recordTime} 
                                                onChange={(e) => setRecordTime(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Süre (dk)</label>
                                        <input 
                                            type="number" 
                                            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            placeholder="Örn: 3" 
                                            value={recordDuration} 
                                            onChange={(e) => setRecordDuration(e.target.value)} 
                                            required 
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                                        <input 
                                            type="checkbox" 
                                            id="appliedCheck" 
                                            checked={recordIsApplied} 
                                            onChange={(e) => setRecordIsApplied(e.target.checked)} 
                                            style={{ width: '16px', height: '16px', accentColor: '#085f4f', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="appliedCheck" style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>Bu hedefi uyguladım / tamamladım</label>
                                    </div>

                                    <button type="submit" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#085f4f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Kaydı Kaydet
                                    </button>
                                </form>
                            </div>

                            {/* Not Ekleme Formu */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111827' }}>Not ve Görsel Ekle</h3>
                                <form onSubmit={handleNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Hedef Seçin</label>
                                        <select 
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                                            value={noteTargetId} 
                                            onChange={(e) => setNoteTargetId(e.target.value)} 
                                            required
                                        >
                                            <option value="">Hedef seçin...</option>
                                            {targets.map(t => (
                                                <option key={t.id || t.Id} value={t.id || t.Id}>{t.title || t.Title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Tarih</label>
                                            <input 
                                                type="date" 
                                                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                                value={recordDate} 
                                                onChange={(e) => setRecordDate(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Saat</label>
                                            <input 
                                                type="time" 
                                                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                                value={recordTime} 
                                                onChange={(e) => setRecordTime(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Açıklama / Not</label>
                                        <textarea 
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            rows="2" 
                                            placeholder="Diş sağlığınızla ilgili notlar..." 
                                            value={noteDescription} 
                                            onChange={(e) => setNoteDescription(e.target.value)} 
                                            required 
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Görsel Seç (.jpeg, .png vb.)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', cursor: 'pointer' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setNoteImage(file.name);
                                                }
                                            }} 
                                        />
                                    </div>
                                    <button type="submit" style={{ padding: '10px', backgroundColor: '#085f4f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Notu Kaydet
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                )}

                {/* 2. HEDEF SEKMESİ */}
                {activeTabName === 'hedef' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
                        
                        {/* Hedef Listesi */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Mevcut Hedeflerim</h3>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{targets.length} hedef</span>
                            </div>

                            {targets.length === 0 ? (
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Henüz kayıtlı bir hedef bulunmuyor.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                                    {targets.map(target => {
                                        const tId = target.id || target.Id;
                                        return (
                                            <div key={tId} style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#111827' }}>{target.title || target.Title}</span>
                                                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '6px' }}>{target.priority || target.Priority}</span>
                                                    </div>
                                                    <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#4b5563' }}>{target.description || target.Description || 'Açıklama belirtilmemiş'}</p>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Periyot: {target.period || target.Period}</span>
                                                </div>
                                                <button onClick={() => tryDeleteTarget(tId)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.9rem' }} title="Hedefi Sil">
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Yeni Hedef Ekleme Formu */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111827' }}>Yeni Hedef Oluştur</h3>
                            <form onSubmit={handleTargetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Hedef Başlığı *</label>
                                    <input 
                                        type="text" 
                                        style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        placeholder="Örn: Günde 2 kez diş fırçalamak" 
                                        value={targetTitle} 
                                        onChange={(e) => setTargetTitle(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Açıklama</label>
                                    <textarea 
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        rows="2" 
                                        placeholder="Hedefin detayları..." 
                                        value={targetDescription} 
                                        onChange={(e) => setTargetDescription(e.target.value)} 
                                        required 
                                    ></textarea>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Periyot *</label>
                                        <input 
                                            type="text" 
                                            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            placeholder="Örn: Her gün" 
                                            value={targetPeriod} 
                                            onChange={(e) => setTargetPeriod(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Önem Derecesi</label>
                                        <select 
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={targetPriority} 
                                            onChange={(e) => setTargetPriority(e.target.value)}
                                        >
                                            <option value="Düşük">Düşük</option>
                                            <option value="Orta">Orta</option>
                                            <option value="Yüksek">Yüksek</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#085f4f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Hedef Seçimi ve Ekle
                                </button>
                            </form>
                        </div>

                    </div>
                )}

            </main>

            {/* Silme Onay Modalı */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#dc2626' }}>Silme Onayı</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#374151' }}>{deleteModalMessage}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>İptal</button>
                            <button onClick={confirmDelete} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}