import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_BASE_URL = "http://localhost:5019/api"; // Kendi portuna göre ayarladın

export default function DentalHealth() {
    const [activeTab, setActiveTab] = useState('durum');
    const [dailySuggestion, setDailySuggestion] = useState('Öneri yükleniyor...');
    const [targets, setTargets] = useState([]);
    const [records, setRecords] = useState([]);

    // Durum Formu State'leri
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
    const [recordTime, setRecordTime] = useState('12:00');
    const [recordDuration, setRecordDuration] = useState('');
    const [recordIsApplied, setRecordIsApplied] = useState(true);

    // Not ve Görsel Formu State'leri (TrackingRecord modelindeki NoteText ve ImagePath için)
    const [noteTargetId, setNoteTargetId] = useState('');
    const [noteDescription, setNoteDescription] = useState('');
    const [noteImage, setNoteImage] = useState(''); // Şimdilik dosya yolu veya string

    // Yeni Hedef Formu State'leri (UserId, Title, Description, Period, Priority)
    const [targetTitle, setTargetTitle] = useState('');
    const [targetDescription, setTargetDescription] = useState('');
    const [targetPeriod, setTargetPeriod] = useState('');
    const [targetPriority, setTargetPriority] = useState('Orta');

    // Silme Onay Modalı State'leri
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState('');
    const [targetIdToDelete, setTargetIdToDelete] = useState(null);

    useEffect(() => {
        loadRandomSuggestion();
        loadTargets();
        loadLast7DaysRecords();
    }, []);

    // 1. SuggestionsController'dan Rastgele Öneri Çekme
    const loadRandomSuggestion = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/Suggestions/random`);
            if (!res.ok) throw new Error("Öneri alınamadı");
            const data = await res.json();
            setDailySuggestion(data.suggestion || data.Suggestion);
        } catch (err) {
            console.error("Öneri yüklenirken hata:", err);
            setDailySuggestion("Sağlık önerisi yüklenemedi.");
        }
    };

    // 2. Hedefleri Çek
    const loadTargets = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/Targets`);
            if (!res.ok) throw new Error("Hedefler alınamadı");
            const data = await res.json();
            setTargets(data);
        } catch (err) {
            console.error("Hedefler yüklenemedi:", err);
        }
    };

    // 3. Son 7 Günlük Kayıtları Çek
    const loadLast7DaysRecords = async () => {
        const currentUserId = localStorage.getItem('userId') || 1;
        try {
            const res = await fetch(`${API_BASE_URL}/TrackingRecords/user/${currentUserId}/last7days`);
            if (!res.ok) throw new Error("Kayıtlar alınamadı");
            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.error("Kayıtlar yüklenemedi:", err);
        }
    };

    // Takip Kaydı Ekle
    const handleRecordSubmit = async (e) => {
        e.preventDefault();
        const currentUserId = localStorage.getItem('userId') || 1;

        const newRecord = {
            userId: parseInt(currentUserId),
            targetId: parseInt(selectedTargetId),
            date: `${recordDate}T${recordTime}:00`,
            duration: parseInt(recordDuration),
            isApplied: recordIsApplied,
            noteText: "",
            imagePath: ""
        };

        try {
            const res = await fetch(`${API_BASE_URL}/TrackingRecords`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });

            if (res.ok) {
                Swal.fire('Başarılı', 'Takip kaydı eklendi!', 'success');
                setRecordDuration('');
                loadLast7DaysRecords();
            } else {
                Swal.fire('Hata', 'Kayıt eklenirken hata oluştu.', 'error');
            }
        } catch (err) {
            Swal.fire('Hata', 'Sunucu bağlantı hatası.', 'error');
        }
    };

    // Not ve Görsel İçeren TrackingRecord Ekleme
    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        const currentUserId = localStorage.getItem('userId') || 1;

        const recordWithNote = {
            userId: parseInt(currentUserId),
            targetId: parseInt(noteTargetId),
            date: new Date().toISOString(),
            duration: 0,
            isApplied: false,
            noteText: noteDescription,
            imagePath: noteImage || "ornek_gorsel.png"
        };

        try {
            const res = await fetch(`${API_BASE_URL}/TrackingRecords`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recordWithNote)
            });

            if (res.ok) {
                Swal.fire('Başarılı', 'Notunuz ve görseliniz başarıyla kaydedildi!', 'success');
                setNoteDescription('');
                setNoteImage('');
                loadLast7DaysRecords();
            } else {
                Swal.fire('Hata', 'Not kaydedilirken hata oluştu.', 'error');
            }
        } catch (err) {
            Swal.fire('Hata', 'Sunucu bağlantı hatası.', 'error');
        }
    };

    const handleTargetSubmit = async (e) => {
        e.preventDefault();
        const currentUserId = localStorage.getItem('userId') || 1;

        const newTarget = {
            userId: parseInt(currentUserId),
            title: targetTitle,
            description: targetDescription,
            period: targetPeriod,
            priority: targetPriority,
            trackingRecords: [] // Navigasyon koleksiyonunu boş dizi olarak gönderiyoruz
        };

        try {
            const res = await fetch(`${API_BASE_URL}/Targets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTarget)
            });

            if (res.ok) {
                Swal.fire('Başarılı', 'Hedef başarıyla eklendi!', 'success');
                setTargetTitle('');
                setTargetDescription('');
                setTargetPeriod('');
                loadTargets();
            } else {
                const errData = await res.json();
                console.error("Hata detayı (Validation errors):", errData.errors || errData);
                Swal.fire('Hata', 'Hedef eklenirken hata oluştu.', 'error');
            }
        } catch (err) {
            Swal.fire('Hata', 'Sunucu bağlantı hatası.', 'error');
        }
    };

    // Hedef Silme Kontrolü
    const tryDeleteTarget = async (id) => {
        setTargetIdToDelete(id);
        try {
            const res = await fetch(`${API_BASE_URL}/Targets/${id}?confirmed=false`, {
                method: 'DELETE'
            });
            const result = await res.json();

            if (res.status === 400 && result.requiresConfirmation) {
                setDeleteModalMessage(result.message);
                setShowDeleteModal(true);
            } else if (res.ok) {
                Swal.fire('Silindi', result.message || 'Hedef başarıyla silindi.', 'success');
                loadTargets();
                loadLast7DaysRecords();
            } else {
                Swal.fire('Hata', result.message || 'Silme işlemi başarısız.', 'error');
            }
        } catch (err) {
            Swal.fire('Hata', 'Sunucu bağlantı hatası.', 'error');
        }
    };

    // Onaylı Silme İşlemi
    const confirmDelete = async () => {
        if (!targetIdToDelete) return;

        try {
            const res = await fetch(`${API_BASE_URL}/Targets/${targetIdToDelete}?confirmed=true`, {
                method: 'DELETE'
            });
            const result = await res.json();

            setShowDeleteModal(false);
            if (res.ok) {
                Swal.fire('Silindi', result.message || 'Hedef başarıyla silindi.', 'success');
                loadTargets();
                loadLast7DaysRecords();
            } else {
                Swal.fire('Hata', 'Silme işlemi gerçekleştirilemedi.', 'error');
            }
        } catch (err) {
            Swal.fire('Hata', 'Sunucu bağlantı hatası.', 'error');
        }
        setTargetIdToDelete(null);
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center fw-bold text-primary">
                <i className="fa-solid fa-tooth me-2"></i>Ağız ve Diş Sağlığı Takip Paneli
            </h2>

            {/* Sekmeler */}
            <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'durum' ? 'active fw-bold' : ''}`}
                        onClick={() => setActiveTab('durum')}
                    >
                        Durum
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'hedef' ? 'active fw-bold' : ''}`}
                        onClick={() => setActiveTab('hedef')}
                    >
                        Hedef
                    </button>
                </li>
            </ul>

            <div className="tab-content">
                {/* 1. DURUM SEKMESİ */}
                {activeTab === 'durum' && (
                    <div>
                        {/* Günün Önerisi */}
                        <div className="card p-3 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', borderLeft: '5px solid #2196f3' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5><i className="fa-solid fa-lightbulb text-warning me-2"></i>Günün Sağlık Önerisi</h5>
                                <button className="btn btn-sm btn-outline-primary" onClick={loadRandomSuggestion} title="Yeni Öneri Getir">
                                    <i className="fa-solid fa-rotate-right"></i> Yenile
                                </button>
                            </div>
                            <p className="mb-0 text-dark fst-italic mt-2">{dailySuggestion}</p>
                        </div>

                        <div className="row">
                            {/* Son 7 Günlük Özet */}
                            <div className="col-lg-5 mb-4">
                                <div className="card p-4 h-100 shadow-sm">
                                    <h4 className="mb-3 text-secondary"><i className="fa-solid fa-chart-line me-2"></i>Son 7 Günlük Özet</h4>
                                    <div className="overflow-auto" style={{ maxHeight: '450px' }}>
                                        {records.length === 0 ? (
                                            <p className="text-muted">Son 7 güne ait kayıt bulunamadı.</p>
                                        ) : (
                                            <ul className="list-group">
                                                {records.map((rec, idx) => (
                                                    <li className="list-group-item mb-2 rounded shadow-sm" key={idx}>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="fw-bold">{rec.target?.title || 'Hedef'}</span>
                                                            <span className="badge bg-success">{rec.isApplied ? 'Uygulandı' : 'Not Girildi'}</span>
                                                        </div>
                                                        <small className="text-muted d-block mt-1">
                                                            Tarih: {new Date(rec.date).toLocaleDateString('tr-TR')} {rec.duration > 0 ? `| Süre: ${rec.duration} dk` : ''}
                                                        </small>
                                                        {rec.noteText && <p className="small text-dark mt-1 mb-0 fst-italic">Not: {rec.noteText}</p>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sağ Kolon: Formlar */}
                            <div className="col-lg-7">
                                {/* Hedef Durum Girişi */}
                                <div className="card p-4 mb-4 shadow-sm">
                                    <h4 className="mb-3 text-secondary"><i className="fa-solid fa-clipboard-check me-2"></i>Hedef Durumu Girişi</h4>
                                    <form onSubmit={handleRecordSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Hedef Seçin</label>
                                            <select 
                                                className="form-select" 
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
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Tarih</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    value={recordDate} 
                                                    onChange={(e) => setRecordDate(e.target.value)} 
                                                    required 
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Saat</label>
                                                <input 
                                                    type="time" 
                                                    className="form-control" 
                                                    value={recordTime} 
                                                    onChange={(e) => setRecordTime(e.target.value)} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Süre (Dakika)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                placeholder="Örn: 3" 
                                                value={recordDuration} 
                                                onChange={(e) => setRecordDuration(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="mb-3 form-check">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id="appliedCheck" 
                                                checked={recordIsApplied} 
                                                onChange={(e) => setRecordIsApplied(e.target.checked)} 
                                            />
                                            <label className="form-check-label" htmlFor="appliedCheck">Uygulandı</label>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100">Kayıt Ekle</button>
                                    </form>
                                </div>

                                {/* Not ve Görsel Girişi */}
                                <div className="card p-4 shadow-sm">
                                    <h4 className="mb-3 text-secondary"><i className="fa-solid fa-camera-retro me-2"></i>Görsel ve Açıklama Notu</h4>
                                    <form onSubmit={handleNoteSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">İlgili Hedef</label>
                                            <select 
                                                className="form-select" 
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
                                        <div className="mb-3">
                                            <label className="form-label">Açıklama Metni</label>
                                            <textarea 
                                                className="form-control" 
                                                rows="2" 
                                                placeholder="Diş sağlığınızla ilgili notunuzu yazın..." 
                                                value={noteDescription} 
                                                onChange={(e) => setNoteDescription(e.target.value)} 
                                                required 
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Görsel Seç (.jpeg, .png vb.)</label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                accept="image/*" 
                                                onChange={(e) => setNoteImage(e.target.files[0]?.name || '')} 
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-secondary w-100">Notu Kaydet</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. HEDEF SEKMESİ */}
                {activeTab === 'hedef' && (
                    <div className="row">
                        {/* Hedef Ekleme Formu */}
                        <div className="col-lg-5 mb-4">
                            <div className="card p-4 shadow-sm">
                                <h4 className="mb-3 text-secondary"><i className="fa-solid fa-plus-circle me-2"></i>Yeni Hedef Kaydet</h4>
                                <form onSubmit={handleTargetSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Başlık</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Örn: Diş İpi Kullanımı" 
                                            value={targetTitle} 
                                            onChange={(e) => setTargetTitle(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Açıklama</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="2" 
                                            placeholder="Hedef detayları..." 
                                            value={targetDescription} 
                                            onChange={(e) => setTargetDescription(e.target.value)} 
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Periyot (Zaman ve Sıklık)</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Örn: Günde bir, Altı ayda bir" 
                                            value={targetPeriod} 
                                            onChange={(e) => setTargetPeriod(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Önem Derecesi (Priority)</label>
                                        <select 
                                            className="form-select" 
                                            value={targetPriority} 
                                            onChange={(e) => setTargetPriority(e.target.value)} 
                                            required
                                        >
                                            <option value="Düşük">Düşük</option>
                                            <option value="Orta">Orta</option>
                                            <option value="Yüksek">Yüksek</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100">Hedef Ekle</button>
                                </form>
                            </div>
                        </div>

                        {/* Hedefler Listesi */}
                        <div className="col-lg-7">
                            <div className="card p-4 shadow-sm">
                                <h4 className="mb-3 text-secondary"><i className="fa-solid fa-list-check me-2"></i>Kayıtlı Hedeflerim</h4>
                                {targets.length === 0 ? (
                                    <p className="text-muted">Henüz kayıtlı bir hedef bulunmuyor.</p>
                                ) : (
                                    <div className="list-group">
                                        {targets.map(target => {
                                            const tId = target.id || target.Id;
                                            return (
                                                <div key={tId} className="list-group-item d-flex justify-content-between align-items-center py-3 mb-2 rounded shadow-sm">
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">{target.title || target.Title}</h6>
                                                        <p className="mb-1 text-muted small">{target.description || target.Description || 'Açıklama yok'}</p>
                                                        <span className="badge bg-info text-dark me-2">Periyot: {target.period || target.Period}</span>
                                                        <span className="badge bg-warning text-dark">Önem: {target.priority || target.Priority}</span>
                                                    </div>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => tryDeleteTarget(tId)}>
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Silme Onay Modalı */}
            {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title"><i className="fa-solid fa-triangle-exclamation me-2"></i>Silme Onayı</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {deleteModalMessage}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>İptal</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Evet, Sil</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}