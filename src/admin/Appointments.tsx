import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net';

// Swagger.json'a göre API yapıları
interface Appointment {
    randevuID: number;
    musteriID: number;
    musteri: {
        adSoyad: string;
        telefon: string;
    };
    randevuTarihi: string;
    randevuSaati: string;
    randevuZamani: string;
    randevuServisler: { 
        servisID: number;
        servisAdi: string; 
        varsayilanUcret: number | null; 
    }[];
    servisAdlari: string;
    aciklama: string | null;
    ucret: number;
    tamamlandimi: boolean;
    createdAt: string;
}

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [searchDate, setSearchDate] = useState<string>('');
    const [searchTime, setSearchTime] = useState<string>('');

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/Appointments`);
            if (!response.ok) throw new Error('Randevu verileri çekilemedi.');
            const data = await response.json();
            
            console.log('Appointments API Response:', data);
            
            if (Array.isArray(data)) {
                setAppointments(data);
                setFilteredAppointments(data);
            } else {
                console.error('Appointments API`den beklenen dizi formatı gelmedi:', data);
                setAppointments([]);
                setFilteredAppointments([]);
            }
        } catch (err: any) {
            setError(err.message);
            setAppointments([]);
            setFilteredAppointments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Tarih ve saat arama fonksiyonu
    useEffect(() => {
        let filtered = appointments;

        if (searchDate) {
            const searchDateObj = new Date(searchDate);
            filtered = filtered.filter(app => {
                const appDate = new Date(app.randevuZamani);
                return appDate.toDateString() === searchDateObj.toDateString();
            });
        }

        if (searchTime) {
            filtered = filtered.filter(app => {
                const appTime = new Date(app.randevuZamani);
                const appHour = appTime.getHours().toString().padStart(2, '0');
                const appMinute = appTime.getMinutes().toString().padStart(2, '0');
                const appTimeString = `${appHour}:${appMinute}`;
                return appTimeString.includes(searchTime);
            });
        }

        setFilteredAppointments(filtered);
    }, [appointments, searchDate, searchTime]);

    // Tarih formatını düzeltme fonksiyonu
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Geçersiz Tarih';
            }
            return date.toLocaleString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Geçersiz Tarih';
        }
    };

    // Son randevuları alma (son 10 randevu)
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    const handleAction = async (randevuID: number, action: 'complete' | 'delete') => {
        if (action === 'delete' && !window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
            return;
        }
        
        setActionLoading(randevuID);
        try {
            const url = action === 'complete' 
                ? `${API_BASE_URL}/api/Appointments/${randevuID}/complete`
                : `${API_BASE_URL}/api/Appointments/${randevuID}`;
            
            const method = action === 'complete' ? 'PUT' : 'DELETE';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: action === 'complete' ? JSON.stringify(true) : undefined,
            });

            if (!response.ok) {
                throw new Error(`İşlem başarısız: ${action}`);
            }
            
            await fetchAppointments();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Hata: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Randevu Yönetimi</h1>
            
            {/* Arama Bölümü */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Randevu Arama</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Ara</label>
                        <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Saat Ara</label>
                        <input
                            type="time"
                            value={searchTime}
                            onChange={(e) => setSearchTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => { setSearchDate(''); setSearchTime(''); }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Temizle
                        </button>
                    </div>
                </div>
            </div>

            {/* Son Randevular */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Son Randevular</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAppointments.slice(0, 6).map((app) => (
                        <div key={app.randevuID} className={`border rounded-lg p-4 ${app.tamamlandimi ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">{app.musteri?.adSoyad || 'Bilinmeyen'}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${app.tamamlandimi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {app.tamamlandimi ? 'Tamamlandı' : 'Bekliyor'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{app.randevuTarihi} {app.randevuSaati}</p>
                            <p className="text-sm text-gray-500">{app.musteri?.telefon}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tüm Randevular */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Tüm Randevular ({filteredAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => (
                            <div key={app.randevuID} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${app.tamamlandimi ? 'opacity-60' : ''}`}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{app.musteri?.adSoyad || 'Bilinmeyen'}</p>
                                            <p className="text-sm text-gray-500">{app.musteri?.telefon}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${app.tamamlandimi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {app.tamamlandimi ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-gray-600">Randevu Tarihi:</p>
                                        <p className="text-gray-800">{app.randevuTarihi} {app.randevuSaati}</p>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-gray-600">İstenen Servisler:</p>
                                        <p className="text-gray-700">{app.servisAdlari || 'Servis bilgisi yok'}</p>
                                    </div>

                                    {app.aciklama && <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-600 italic">{app.aciklama}</p>
                                    </div>}
                                </div>
                                <div className="px-5 py-3 bg-gray-50 flex justify-end gap-3">
                                    {!app.tamamlandimi && (
                                        <button
                                            onClick={() => handleAction(app.randevuID, 'complete')}
                                            disabled={actionLoading === app.randevuID}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            {actionLoading === app.randevuID ? '...' : 'Onayla'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction(app.randevuID, 'delete')}
                                        disabled={actionLoading === app.randevuID}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {actionLoading === app.randevuID ? '...' : 'Sil'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {searchDate || searchTime ? 'Arama kriterlerine uygun randevu bulunamadı.' : 'Henüz randevu kaydı bulunmuyor.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Appointments; 